import * as CatalogClient from '../api/generated/catalog';

// Product images live in the shell (public/images/product); remotes render inside the shell's origin,
// so the same relative URL works everywhere.
export const productImage = (product: CatalogClient.Product): string => `/images/product/${product.imageFile ?? ''}`;

// Inline grey box, so a missing image never needs another request
const PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="#e9ecef"/>' +
      '<text x="50%" y="50%" fill="#6c757d" font-family="sans-serif" font-size="20" text-anchor="middle">No image</text></svg>',
  );

export function useFallbackImage(event: Event): void {
  const img = event.target as HTMLImageElement;
  if (img.src !== PLACEHOLDER) {
    img.src = PLACEHOLDER;
  }
}
