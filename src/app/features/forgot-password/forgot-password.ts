import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { Icon } from '../../shared/components/icon/icon';

interface ForgotForm {
  email: FormControl<string>;
}

/**
 * "Forgot Password?" screen. Sends a Supabase password-recovery email to the
 * entered address. For security we always show the same neutral confirmation,
 * so this never reveals whether an account exists. Built with the existing
 * design tokens — no new visual language.
 */
@Component({
  selector: 'ge-forgot-password',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, Icon],
  templateUrl: './forgot-password.html'
})
export class ForgotPassword {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly auth = inject(AuthService);

  protected readonly usesSupabase = this.auth.usesSupabase;
  protected readonly loading = signal(false);
  protected readonly sent = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form: FormGroup<ForgotForm> = this.fb.group<ForgotForm>({
    email: this.fb.control('', { validators: [Validators.required, Validators.email] })
  });

  protected async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    const { email } = this.form.getRawValue();
    const redirectTo =
      typeof window !== 'undefined' ? `${window.location.origin}/reset-password` : '/reset-password';
    try {
      await this.auth.requestPasswordReset(email, redirectTo);
      this.sent.set(true);
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Could not send the reset email.');
    } finally {
      this.loading.set(false);
    }
  }
}
