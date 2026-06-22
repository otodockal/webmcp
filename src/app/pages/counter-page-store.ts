import { Injectable, signal, declareExperimentalWebMcpTool } from '@angular/core';
import { delay } from '../utils';

@Injectable()
export class CounterPageStore {
  readonly count = signal(0);

  constructor() {
    // Read-only tool: no inputs.
    declareExperimentalWebMcpTool({
      name: 'getCounter',
      description: 'Reads the current value of the counter shown on the page.',
      inputSchema: { type: 'object', properties: {} },
      execute: () => `The counter is currently ${this.count()}.`,
    });

    // Tool with an optional argument. `by` is inferred as `number | undefined`.
    declareExperimentalWebMcpTool({
      name: 'incrementCounter',
      description:
        'Increases the counter by a given amount (defaults to 1) and returns the new value.',
      inputSchema: {
        type: 'object',
        properties: {
          by: { type: 'number', description: 'How much to add. Defaults to 1.' },
        },
        additionalProperties: false,
      },
      execute: ({ by }) => {
        const step = by ?? 1;
        this.increment(step);
        return `Counter increased by ${step}. New value: ${this.count()}.`;
      },
    });

    // Tool with a required argument. `value` is inferred as `number`.
    declareExperimentalWebMcpTool({
      name: 'setCounter',
      description: 'Sets the counter to an exact value and returns the new value.',
      inputSchema: {
        type: 'object',
        properties: {
          value: { type: 'number', description: 'The new counter value.' },
        },
        required: ['value'],
        additionalProperties: false,
      },
      execute: ({ value }) => {
        // The schema documents the shape, but always validate inputs yourself.
        if (!Number.isFinite(value)) {
          return 'Refused: value must be a finite number.';
        }
        this.count.set(value);
        return `Counter set to ${value}.`;
      },
    });

    declareExperimentalWebMcpTool({
      name: 'resetCounter',
      description: 'Resets the counter back to zero.',
      inputSchema: { type: 'object', properties: {} },
      execute: () => {
        this.reset();
        return 'Counter reset to 0.';
      },
    });

    // Async tool: slowly increments the counter by 1 every second until the target.
    declareExperimentalWebMcpTool({
      name: 'timer',
      description:
        'Slowly increments the counter by 1 once per second until it reaches the given target value.',
      inputSchema: {
        type: 'object',
        properties: {
          target: {
            type: 'number',
            description: 'The value to count up to, one step per second.',
          },
        },
        required: ['target'],
        additionalProperties: false,
      },
      execute: async ({ target }) => {
        if (target <= this.count()) {
          return `Nothing to do: counter is already at ${this.count()} (>= target ${target}).`;
        }
        while (this.count() < target) {
          await delay(1000);
          this.increment(1);
        }
        // since alert is blocking, we need timeout
        setTimeout(() => alert(`Timer finished. Counter reached ${this.count()}.`));
        return `Timer finished. Counter reached ${this.count()}.`;
      },
    });
  }

  increment(by = 1): void {
    this.count.update((c) => c + by);
  }

  decrement(by = 1): void {
    this.count.update((c) => c - by);
  }

  reset(): void {
    this.count.set(0);
  }
}
