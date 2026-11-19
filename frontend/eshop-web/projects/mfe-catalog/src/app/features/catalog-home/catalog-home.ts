import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-catalog-home',
  templateUrl: './catalog-home.html',
  styleUrl: './catalog-home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogHome {}
