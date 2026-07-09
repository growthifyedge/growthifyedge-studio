import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { Icon } from '../../shared/components/icon/icon';

interface ResetForm {
  password: FormControl<string>;
  confirm: FormControl<string>;
}

/** Cross-field validator: confirm must match password. */
function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const pw = group.get('password')?.value;
  const confirm = group.get('confirm')?.value;
  return pw && confirm && pw !== confirm ? { mismatch: true } : null;
}

/**
 * Reset Password screen — the landing page for Supabase recovery links.
 *
 * Supabase's implicit recovery flow returns the tokens in the URL *fragment*
 * (`#access_token=…&type=recovery`). We read `location.hash` directly (as the
 * Supabase SDK itself does) and extract the recovery access token, which
 * authorizes the password update. The token stays only in the URL fragment
 * (never sent to any server) and is single-use — consumed the moment the
 * password is changed.
 */
@Component({
  selector: 'ge-reset-password',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, Icon],
  templateUrl: './reset-password.html'
})
export class ResetPassword {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly loading = signal(false);
  protected readonly done = signal(false);
  protected readonly error = signal<string | null>(null);

  /** Recovery token parsed from the link fragment (null → invalid/missing). */
  private readonly accessToken = signal<string | null>(null);
  /** True once we've parsed the link and confirmed a usable recovery token. */
  protected readonly hasToken = signal(false);

  protected readonly form: FormGroup<ResetForm> = this.fb.group<ResetForm>(
    {
      password: this.fb.control('', {
        validators: [Validators.required, Validators.minLength(8)]
      }),
      confirm: this.fb.control('', { validators: [Validators.required] })
    },
    { validators: passwordsMatch }
  );

  constructor() {
    this.parseRecoveryLink();
  }

  /** Read `#access_token=…&type=recovery` (or an `error_description`) from the URL. */
  private parseRecoveryLink(): void {
    const hash = typeof location !== 'undefined' ? location.hash.replace(/^#/, '') : '';
    const params = new URLSearchParams(hash);

    const errorDescription = params.get('error_description');
    if (errorDescription) {
      this.error.set(errorDescription.replace(/\+/g, ' '));
      return;
    }

    const token = params.get('access_token');
    const type = params.get('type');
    if (token && type === 'recovery') {
      this.accessToken.set(token);
      this.hasToken.set(true);
      return;
    }

    this.error.set(
      'This reset link is invalid or has expired. Please request a new one from the Forgot Password page.'
    );
  }

  protected async submit(): Promise<void> {
    const token = this.accessToken();
    if (!token) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    const { password } = this.form.getRawValue();
    try {
      await this.auth.completePasswordReset(token, password);
      this.done.set(true);
      setTimeout(() => void this.router.navigateByUrl('/login'), 2200);
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Could not reset your password.');
    } finally {
      this.loading.set(false);
    }
  }
}
