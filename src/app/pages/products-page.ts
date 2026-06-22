import { Component, inject } from '@angular/core';
import { CATEGORIES, ProductsPageStore } from './products-page-store';

@Component({
  selector: 'app-products-page',
  templateUrl: './products-page.html',
})
export class ProductsPage {
  protected readonly store = inject(ProductsPageStore);
  protected readonly categories = CATEGORIES;
}
