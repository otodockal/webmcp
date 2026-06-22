import { Injectable, computed, signal } from '@angular/core';

export interface Product {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly price: number;
}

export interface CartLine {
  readonly product: Product;
  readonly qty: number;
  readonly lineTotal: number;
}

const CATALOG: readonly Product[] = [
  { id: 'aurora-14', name: 'Aurora 14 Laptop', category: 'Laptops', price: 1299 },
  { id: 'nimbus-pro', name: 'Nimbus Pro Phone', category: 'Phones', price: 899 },
  { id: 'echobuds', name: 'EchoBuds Wireless Earbuds', category: 'Audio', price: 149 },
  { id: 'soundwave', name: 'SoundWave Headphones', category: 'Audio', price: 249 },
  { id: 'pixelview-27', name: 'PixelView 27" Monitor', category: 'Accessories', price: 399 },
  { id: 'swifttype', name: 'SwiftType Mechanical Keyboard', category: 'Accessories', price: 89 },
];

export const CATEGORIES: readonly string[] = [...new Set(CATALOG.map((p) => p.category))];

/**
 * Holds the product catalog and shopping cart for the shop page.
 *
 * This service is plain state + logic with no WebMCP imports. It is provided at
 * the route level (see `app.routes.ts`), so the same instance is shared by the
 * page component and by the route-level WebMCP tools, and it is destroyed when
 * the user navigates away from the route.
 */
@Injectable()
export class ProductStore {
  /** Free-text filter applied to the visible grid. */
  readonly query = signal('');
  /** Category filter; `null` means "all categories". */
  readonly category = signal<string | null>(null);

  readonly #cart = signal<ReadonlyArray<{ id: string; qty: number }>>([]);

  readonly allProducts = CATALOG;

  /** Products shown in the grid after applying the query and category filters. */
  readonly visibleProducts = computed(() => {
    const q = this.query().trim().toLowerCase();
    const cat = this.category();
    return CATALOG.filter((p) => {
      const matchesQuery =
        !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
      const matchesCategory = !cat || p.category === cat;
      return matchesQuery && matchesCategory;
    });
  });

  readonly cartLines = computed<CartLine[]>(() =>
    this.#cart().map(({ id, qty }) => {
      const product = CATALOG.find((p) => p.id === id)!;
      return { product, qty, lineTotal: product.price * qty };
    }),
  );

  readonly cartCount = computed(() => this.#cart().reduce((n, line) => n + line.qty, 0));
  readonly cartTotal = computed(() =>
    this.cartLines().reduce((sum, line) => sum + line.lineTotal, 0),
  );

  setQuery(query: string): void {
    this.query.set(query);
  }

  setCategory(category: string | null): void {
    this.category.set(category);
  }

  /** Resolves a product by exact id, exact name, or partial name match. */
  resolve(idOrName: string): Product | undefined {
    const needle = idOrName.trim().toLowerCase();
    return (
      CATALOG.find((p) => p.id === needle || p.name.toLowerCase() === needle) ??
      CATALOG.find((p) => p.name.toLowerCase().includes(needle))
    );
  }

  addToCart(id: string, qty: number): void {
    this.#cart.update((lines) => {
      const existing = lines.find((line) => line.id === id);
      if (existing) {
        return lines.map((line) => (line.id === id ? { ...line, qty: line.qty + qty } : line));
      }
      return [...lines, { id, qty }];
    });
  }

  removeFromCart(id: string): void {
    this.#cart.update((lines) => lines.filter((line) => line.id !== id));
  }

  clearCart(): void {
    this.#cart.set([]);
  }
}
