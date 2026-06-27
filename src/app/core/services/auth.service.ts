import { Injectable, computed, inject } from '@angular/core';

import { environment } from '../../../environments/environment';
import { SupabaseClientService } from './supabase-client.service';
import { AuthSession, SessionStore } from './session-store.service';

/**
 * Admin authentication.
 *
 *  - **Production (Supabase enabled):** real email/password login via Supabase
 *    Auth (GoTrue). The returned JWT is stored in {@link SessionStore} and used
 *    to authorize writes/uploads (so RLS `authenticated` policies apply once
 *    they're tightened).
 *  - **Demo (Supabase disabled):** a lightweight local password gate so the
 *    admin guard still works offline. This is demo-grade, not real security.
 *
 * The service never stores credentials and never uses the service_role key.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly client = inject(SupabaseClientService);
  private readonly store = inject(SessionStore);

  /** True when Supabase Auth is the active mode (else the local demo gate). */
  readonly usesSupabase = this.client.enabled;

  readonly email = computed(() => this.store.session()?.email ?? null);

  readonly isAuthenticated = computed(() => {
    const s = this.store.session();
    if (!s) return false;
    if (s.mode === 'local') return true;
    // Supabase: require a token that hasn't expired.
    return !!s.accessToken && Date.now() < s.expiresAt;
  });

  constructor() {
    // Best-effort: if a stored Supabase session is expired but refreshable,
    // refresh it on startup so the admin stays logged in across reloads.
    const s = this.store.session();
    if (s?.mode === 'supabase' && s.refreshToken && Date.now() >= s.expiresAt) {
      void this.tryRefresh(s.refreshToken);
    }
  }

  async login(email: string, password: string): Promise<void> {
    if (this.client.enabled) {
      const res = await this.client.signInWithPassword(email.trim(), password);
      this.store.set(this.toSession('supabase', res, email));
    } else {
      const expected = environment.adminLocalPassword;
      if (!expected || password !== expected) {
        throw new Error('Invalid password.');
      }
      this.store.set({
        mode: 'local',
        email: email.trim() || 'admin',
        accessToken: null,
        refreshToken: null,
        expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7
      });
    }
  }

  async logout(): Promise<void> {
    const s = this.store.session();
    if (s?.mode === 'supabase' && s.accessToken && this.client.enabled) {
      await this.client.signOut(s.accessToken).catch(() => {});
    }
    this.store.clear();
  }

  private async tryRefresh(refreshToken: string): Promise<void> {
    try {
      const res = await this.client.refreshSession(refreshToken);
      this.store.set(this.toSession('supabase', res, this.email() ?? ''));
    } catch {
      this.store.clear();
    }
  }

  private toSession(
    mode: 'supabase',
    res: { access_token: string; refresh_token: string; expires_in: number; user?: { email?: string } },
    fallbackEmail: string
  ): AuthSession {
    return {
      mode,
      email: res.user?.email ?? fallbackEmail.trim() ?? null,
      accessToken: res.access_token,
      refreshToken: res.refresh_token,
      expiresAt: Date.now() + res.expires_in * 1000
    };
  }
}
