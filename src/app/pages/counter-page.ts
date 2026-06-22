import { Component, inject } from '@angular/core';
import { Counter } from './counter';

@Component({
  selector: 'app-counter-page',
  templateUrl: './counter-page.html',
  providers: [Counter],
})
export class CounterPage {
  protected readonly counter = inject(Counter);
}
