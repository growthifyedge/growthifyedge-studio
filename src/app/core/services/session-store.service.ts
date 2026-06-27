import { Injectable, computed, signal } from '@angular/core';

export type AuthMode = 'supabase' | 'local';

export interface AuthSession {
  readonly mode: AuthMode;
  readonly email: string | null;
  /** Supabase access JWT (null in local demo mode). */
  readonly accessToken: string | null;
  readonly refreshToken: string | null;
  /** Epoch ms when the access token expires. */
  readonly expiresAt: number;
}

/**
 * Persists the admin session and exposes the current access token as a signal.
 *
 * Kept dependency-free so it can be injected by BOTH {@link AuthService} (which
 * writes it) and the Supabase client (which reads the token for authenticated
 * requests) without creating a circular dependency.
 */
@Injectable({ providedIn: 'root' })
export class SessionStore {
  private static readonly KEY = 'growthifyedge.auth.v1';

  readonly session = signal<AuthSession | null>(this.restore());

  /** Bearer token for Supabase requests, or null when not signed in / local. */
  readonly accessToken = computed(() => this.session()?.accessToken ?? null);

  set(session: AuthSession): void {
    this.session.set(session);
    try {
      localStorage.setItem(SessionStore.KEY, JSON.stringify(session));
    } catch {
      /* private mode / quota — keep in-memory session only */
    }
  }

  clear(): void {
    this.session.set(null);
    try {
      localStorage.removeItem(SessionStore.KEY);
    } catch {
      /* ignore */
    }
  }

  private restore(): AuthSession | null {
    try {
      const raw = typeof localStorage !== 'undefined' && localStorage.getItem(SessionStore.KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as AuthSession;
      if (parsed && (parsed.mode === 'supabase' || parsed.mode === 'local')) return parsed;
    } catch {
      /* corrupt payload */
    }
    return null;
  }
}
