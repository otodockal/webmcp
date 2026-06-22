import { Component, signal } from '@angular/core';
import { form, required, minLength, FormField, FormRoot } from '@angular/forms/signals';

@Component({
  selector: 'app-signup-page',
  templateUrl: './signup-page.html',
  imports: [FormField, FormRoot],
})
export class SignupPage {
  readonly #model = signal({
    firstName: '',
    lastName: '',
    age: 0,
    hobbies: ['Web Development'],
  });

  readonly lastSubmitted = signal<string | null>(null);

  readonly userForm = form(
    this.#model,
    (f) => {
      required(f.firstName, { message: 'First name is mandatory.' });
      required(f.lastName, { message: 'Last name is mandatory.' });
      minLength(f.lastName, 3, { message: 'Last name is too short.' });
    },
    {
      experimentalWebMcpTool: {
        name: 'signupUser',
        description: 'Signs up a new user with a first name, last name, age and hobbies.',
      },
      submission: {
        action: async (field) => {
          const value = field().value();
          this.lastSubmitted.set(`${value.firstName} ${value.lastName} (age ${value.age})`);
        },
      },
    },
  );
}
