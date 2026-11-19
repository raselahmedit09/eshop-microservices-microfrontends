import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CatalogHome } from './catalog-home';

describe('CatalogHome', () => {
  let component: CatalogHome;
  let fixture: ComponentFixture<CatalogHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogHome],
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogHome);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
