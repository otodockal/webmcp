import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideExperimentalWebMcpTools,
} from '@angular/core';
import { provideRouter, withExperimentalAutoCleanupInjectors } from '@angular/router';
import { provideExperimentalWebMcpForms } from '@angular/forms/signals';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withExperimentalAutoCleanupInjectors()),
    // Enables implicit WebMCP tools generated from Signal Forms (see Signup).
    provideExperimentalWebMcpForms(),
    // Application-level tools: registered at bootstrap, available everywhere.
    provideExperimentalWebMcpTools([
      {
        name: 'getAppInfo',
        description: 'Returns a short description of what this application does.',
        inputSchema: { type: 'object', properties: {} },
        execute: () =>
          'Angular WebMCP demo with three pages: a Counter that declares service-level ' +
          'tools to read, increment, set and reset the value plus an async timer; a ' +
          'Signup form that derives an implicit signupUser tool from a Signal Form; ' +
          'and a Shop at /products whose tools (search, filter by category, and cart ' +
          'add/get/clear) are registered only while that route is active (route-level tools).',
      },
    ]),
  ],
};
