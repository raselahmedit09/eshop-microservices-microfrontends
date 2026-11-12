# Keycloak realm as code

`eshop-realm.json` is the single source of truth for the `eshop` realm: clients, scopes, audience mappers, roles and security settings. Every environment applies the same file with [keycloak-config-cli](https://github.com/adorsys/keycloak-config-cli). Only the variables differ.

keycloak-config-cli compares the file with the running realm and updates it. It never touches users or sessions, so it is safe to run on every deploy.

## Variables

The file contains `$(env:NAME)` placeholders. A missing variable stops the import with an error.

| Variable | Development | Production |
|---|---|---|
| `SPA_URL` | `http://localhost:4200` | `https://shop.example.com` |
| `POSTMAN_CLIENT_ENABLED` | `true` | `false` |
| `VERIFY_EMAIL` | `false` | `true` (needs SMTP, see below) |
| `SSL_REQUIRED` | `external` | `all` |

The same in both: brute-force protection, password policy `length(8) and notUsername and notEmail and passwordHistory(3)`, 5-minute access tokens.

## Development

`docker-compose` starts `keycloak` (`start-dev`, H2) and then the one-shot `keycloak-config` container, which waits for Keycloak, applies the file and exits with code 0.

After editing the file, apply it again:

```bash
docker compose -f docker-compose.yml -f docker-compose.override.yml up keycloak-config
```

Changed something in the Admin Console that you want to keep? Copy the change into `eshop-realm.json` by hand. Never paste a full export over this file: an export contains real URLs instead of placeholders, and may contain secrets.

## Production

### Keycloak server

| Setting | Value |
|---|---|
| Command | `start --optimized` (image built with `kc.sh build`), not `start-dev` |
| Database | `KC_DB=postgres` with backups. Users exist only here |
| Hostname | `KC_HOSTNAME=https://auth.example.com`, TLS at the ingress, `KC_PROXY_HEADERS=xforwarded` |
| Admin console | Not reachable from the internet (`KC_HOSTNAME_ADMIN` on an internal host, or blocked at the ingress) |
| Bootstrap admin | Used once. Create a real admin, then delete the bootstrap one |
| Health | `KC_HEALTH_ENABLED=true`, `KC_METRICS_ENABLED=true`, probes on port 9000 |
| Replicas | 2 or more |

### Applying the realm: Kubernetes Job

Runs after every Argo CD sync. The realm file comes from a ConfigMap (`kustomize`'s `configMapGenerator` with `files: [eshop-realm.json]`).

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: keycloak-config
  annotations:
    argocd.argoproj.io/hook: PostSync
    argocd.argoproj.io/hook-delete-policy: BeforeHookCreation
spec:
  backoffLimit: 3
  template:
    spec:
      restartPolicy: OnFailure
      containers:
        - name: keycloak-config-cli
          image: adorsys/keycloak-config-cli:6.5.1-26.5.5   # match the Keycloak version
          env:
            - { name: KEYCLOAK_URL, value: http://keycloak:8080 }
            - { name: KEYCLOAK_AVAILABILITYCHECK_ENABLED, value: "true" }
            - { name: KEYCLOAK_AVAILABILITYCHECK_TIMEOUT, value: 300s }
            - { name: IMPORT_FILES_LOCATIONS, value: /config/*.json }
            - { name: IMPORT_VARSUBSTITUTION_ENABLED, value: "true" }
            # Log in with a master-realm service account, not a human admin
            - { name: KEYCLOAK_GRANT_TYPE, value: client_credentials }
            - { name: KEYCLOAK_CLIENT_ID, value: keycloak-config-cli }
            - name: KEYCLOAK_CLIENT_SECRET
              valueFrom: { secretKeyRef: { name: keycloak-secrets, key: config-cli-client-secret } }
            # This environment's values
            - { name: SPA_URL, value: https://shop.example.com }
            - { name: POSTMAN_CLIENT_ENABLED, value: "false" }
            - { name: VERIFY_EMAIL, value: "true" }
            - { name: SSL_REQUIRED, value: all }
          volumeMounts:
            - { name: realm, mountPath: /config, readOnly: true }
      volumes:
        - name: realm
          configMap: { name: keycloak-realm }
```

The `keycloak-config-cli` client in the `master` realm: confidential, service accounts ON, standard flow OFF, service account role `admin`. Create it once by hand.

### Secrets

Nothing secret goes into `eshop-realm.json`. When a confidential client is added (for example `eshop-bff`), its secret is a placeholder too, filled from a Kubernetes Secret:

```json
"secret": "$(env:BFF_CLIENT_SECRET)"
```

SMTP for email verification is added the same way:

```json
"smtpServer": {
  "host": "$(env:SMTP_HOST)", "port": "587", "from": "$(env:SMTP_FROM)",
  "auth": "true", "starttls": "true",
  "user": "$(env:SMTP_USER)", "password": "$(env:SMTP_PASSWORD)"
}
```

## Changing the realm

1. Edit `eshop-realm.json` and run `keycloak-config` locally.
2. Test login and the token (`aud`, `scope`, `roles`) in Postman.
3. Open a PR. After merge, the next deploy applies the same change everywhere.
