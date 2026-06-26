import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal
} from '@angular/core';
import {
  FormControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { SoftwareService } from '../../core/services/software.service';
import { PageHeader } from '../../shared/components/page-header/page-header';
import { Icon } from '../../shared/components/icon/icon';

interface ContactFormModel {
  name: FormControl<string>;
  email: FormControl<string>;
  company: FormControl<string>;
  interest: FormControl<string>;
  budget: FormControl<string>;
  message: FormControl<string>;
}

@Component({
  selector: 'ge-contact',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, PageHeader, Icon],
  templateUrl: './contact.html'
})
export class Contact {
  /** Optional `?interest=` query param (e.g. from a “Request custom” button). */
  readonly interest = input<string>();

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly svc = inject(SoftwareService);

  protected readonly products = computed(() => this.svc.software());
  protected readonly budgets = ['< $5k', '$5k – $20k', '$20k – $50k', '$50k+', 'Not sure yet'];

  protected readonly submitted = signal(false);

  protected readonly form = this.fb.group<ContactFormModel>({
    name: this.fb.control('', { validators: [Validators.required] }),
    email: this.fb.control('', { validators: [Validators.required, Validators.email] }),
    company: this.fb.control(''),
    interest: this.fb.control(''),
    budget: this.fb.control('Not sure yet'),
    message: this.fb.control('', { validators: [Validators.required, Validators.minLength(10)] })
  });

  constructor() {
    effect(() => {
      const interest = this.interest();
      if (interest) this.form.controls.interest.setValue(interest);
    });
  }

  protected invalid(name: keyof ContactFormModel): boolean {
    const c = this.form.controls[name];
    return c.invalid && (c.dirty || c.touched);
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    // Backend-ready: this is where an HTTP POST to /api/demo-requests would go.
    console.log('Demo request submitted:', this.form.getRawValue());
    this.submitted.set(true);
  }

  protected reset(): void {
    this.form.reset();
    this.submitted.set(false);
  }
}
