import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { Icon } from '../../shared/components/icon/icon';

interface LoginForm {
  email: FormControl<string>;
  password: FormControl<string>;
}

/**
 * Admin sign-in screen. Uses Supabase Auth in production; in demo mode (Supabase
 * disabled) it asks only for the local demo password. Built with the existing
 * design tokens — no new visual language.
 */
@Component({
  selector: 'ge-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, Icon],
  templateUrl: './login.html'
})
export class Login {
  /** `?returnUrl=` query param, bound via withComponentInputBinding(). */
  readonly returnUrl = input<string>();

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly usesSupabase = this.auth.usesSupabase;
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form: FormGroup<LoginForm> = this.fb.group<LoginForm>({
    email: this.fb.control('', {
      validators: this.usesSupabase ? [Validators.required, Validators.email] : []
    }),
    password: this.fb.control('', { validators: [Validators.required] })
  });

  protected async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    const { email, password } = this.form.getRawValue();
    try {
      await this.auth.login(this.usesSupabase ? email : 'admin', password);
      await this.router.navigateByUrl(this.returnUrl() || '/studio');
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Sign in failed.');
    } finally {
      this.loading.set(false);
    }
  }
}
