import { inject, provideExperimentalWebMcpTools } from '@angular/core';
import { Routes } from '@angular/router';
import { CounterPage } from './pages/counter-page';
import { SignupPage } from './pages/signup-page';
import { ProductsPage } from './pages/products-page';
import { Product, ProductsPageStore } from './pages/products-page-store';

const describe = (p: Product) => `${p.name} (${p.category}) — $${p.price} [id: ${p.id}]`;

export const routes: Routes = [
  { path: '', component: SignupPage },
  { path: 'counter', component: CounterPage },
  {
    path: 'products',
    component: ProductsPage,
    providers: [
      ProductsPageStore,
      provideExperimentalWebMcpTools([
        {
          name: 'searchProducts',
          description:
            'Filters the product grid by a free-text query (matched against name and ' +
            'category) and returns the products that match. Call with an empty query to ' +
            'list the whole catalog.',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'Text to search for. Empty lists everything.' },
            },
            additionalProperties: false,
          },
          execute: (args: unknown) => {
            const { query } = args as { query?: string };
            const store = inject(ProductsPageStore);
            store.setQuery(query ?? '');
            const matches = store.visibleProducts();
            if (matches.length === 0) {
              return `No products match "${query ?? ''}".`;
            }
            return `Found ${matches.length} product(s):\n${matches.map(describe).join('\n')}`;
          },
        },
        {
          name: 'filterByCategory',
          description:
            'Filters the product grid to a single category. Pass "all" to clear the filter.',
          inputSchema: {
            type: 'object',
            properties: {
              category: {
                type: 'string',
                description: 'Category name (e.g. Laptops, Phones, Audio, Accessories) or "all".',
              },
            },
            required: ['category'],
            additionalProperties: false,
          },
          execute: (args: unknown) => {
            const { category } = args as { category: string };
            const store = inject(ProductsPageStore);
            if (category.trim().toLowerCase() === 'all') {
              store.setCategory(null);
              return 'Cleared the category filter.';
            }
            const match = store.allProducts.find(
              (p) => p.category.toLowerCase() === category.trim().toLowerCase(),
            );
            if (!match) {
              const known = [...new Set(store.allProducts.map((p) => p.category))].join(', ');
              return `Refused: unknown category "${category}". Known categories: ${known}.`;
            }
            store.setCategory(match.category);
            const visible = store.visibleProducts();
            return `Showing ${visible.length} product(s) in ${match.category}:\n${visible
              .map(describe)
              .join('\n')}`;
          },
        },
        {
          name: 'addToCart',
          description:
            'Adds a product to the cart by id or name and returns the updated cart total.',
          inputSchema: {
            type: 'object',
            properties: {
              product: { type: 'string', description: 'Product id or (partial) name.' },
              quantity: { type: 'number', description: 'How many to add. Defaults to 1.' },
            },
            required: ['product'],
            additionalProperties: false,
          },
          execute: (args: unknown) => {
            const { product, quantity } = args as { product: string; quantity?: number };
            const store = inject(ProductsPageStore);
            const qty = quantity ?? 1;
            // The schema documents the shape, but always validate inputs yourself.
            if (!Number.isInteger(qty) || qty < 1) {
              return 'Refused: quantity must be a positive whole number.';
            }
            const match = store.resolve(product);
            if (!match) {
              const ids = store.allProducts.map((p) => p.id).join(', ');
              return `Refused: no product matches "${product}". Available ids: ${ids}.`;
            }
            store.addToCart(match.id, qty);
            return `Added ${qty}× ${match.name} to the cart. Cart now has ${store.cartCount()} item(s), total $${store.cartTotal()}.`;
          },
        },
        {
          name: 'getCart',
          description: 'Returns the current contents of the cart and the total price.',
          inputSchema: { type: 'object', properties: {} },
          execute: () => {
            const store = inject(ProductsPageStore);
            const lines = store.cartLines();
            if (lines.length === 0) {
              return 'The cart is empty.';
            }
            const body = lines
              .map((l) => `${l.qty}× ${l.product.name} — $${l.lineTotal}`)
              .join('\n');
            return `Cart (${store.cartCount()} item(s)):\n${body}\nTotal: $${store.cartTotal()}.`;
          },
        },
        {
          name: 'clearCart',
          description: 'Removes everything from the cart.',
          inputSchema: { type: 'object', properties: {} },
          execute: () => {
            const store = inject(ProductsPageStore);
            store.clearCart();
            return 'Cart cleared.';
          },
        },
      ]),
    ],
  },
];
