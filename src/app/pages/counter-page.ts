import { Component, inject } from '@angular/core';
import { CounterPageStore } from './counter-page-store';

@Component({
  selector: 'app-counter-page',
  templateUrl: './counter-page.html',
  providers: [CounterPageStore],
})
export class CounterPage {
  protected readonly counter = inject(CounterPageStore);
}
