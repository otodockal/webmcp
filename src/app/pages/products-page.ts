import { Component, inject } from '@angular/core';
import { CATEGORIES, ProductStore } from './product-store';

@Component({
  selector: 'app-products-page',
  templateUrl: './products-page.html',
})
export class ProductsPage {
  protected readonly store = inject(ProductStore);
  protected readonly categories = CATEGORIES;
}
