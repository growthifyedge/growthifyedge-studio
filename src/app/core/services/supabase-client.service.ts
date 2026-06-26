import { Injectable } from '@angular/core';

import { environment } from '../../../environments/environment';

interface SupabaseConfig {
  url: string;
  anonKey: string;
  useSupabase: boolean;
  bucket: string;
}

/**
 * Tiny, dependency-free Supabase client built on the public REST APIs
 * (PostgREST for data, Storage for files). Using `fetch` instead of the
 * `@supabase/supabase-js` SDK keeps the bundle small and adds no npm
 * dependency, while remaining a drop-in swap later if desired.
 *
 * Configuration comes from `environment.ts`, but a `localStorage` override
 * (`growthifyedge.supabase`) can enable/point the backend at runtime — handy
 * for deploys and for testing without a rebuild. When anything required is
 * missing, {@link enabled} is `false` and callers fall back to localStorage.
 */
@Injectable({ providedIn: 'root' })
export class SupabaseClientService {
  private readonly cfg = this.resolveConfig();

  /** True only when a usable URL + anon key are configured and enabled. */
  get enabled(): boolean {
    return !!(this.cfg.useSupabase && this.cfg.url && this.cfg.anonKey);
  }

  get bucket(): string {
    return this.cfg.bucket;
  }

  // --- PostgREST (data) ---------------------------------------------------

  async select<T>(table: string, query = 'select=*'): Promise<T[]> {
    const res = await fetch(`${this.cfg.url}/rest/v1/${table}?${query}`, {
      headers: this.headers()
    });
    if (!res.ok) throw new Error(`Supabase select ${table} failed: ${res.status}`);
    return (await res.json()) as T[];
  }

  async insert<T>(table: string, rows: T[]): Promise<T[]> {
    const res = await fetch(`${this.cfg.url}/rest/v1/${table}`, {
      method: 'POST',
      headers: this.headers({ Prefer: 'return=representation' }),
      body: JSON.stringify(rows)
    });
    if (!res.ok) throw new Error(`Supabase insert ${table} failed: ${res.status}`);
    return (await res.json()) as T[];
  }

  /** Upsert by primary key (used for edits and JSON import). */
  async upsert<T>(table: string, rows: T[]): Promise<T[]> {
    const res = await fetch(`${this.cfg.url}/rest/v1/${table}`, {
      method: 'POST',
      headers: this.headers({
        Prefer: 'resolution=merge-duplicates,return=representation'
      }),
      body: JSON.stringify(rows)
    });
    if (!res.ok) throw new Error(`Supabase upsert ${table} failed: ${res.status}`);
    return (await res.json()) as T[];
  }

  async patch<T>(table: string, idColumn: string, idValue: string, partial: Partial<T>): Promise<void> {
    const res = await fetch(
      `${this.cfg.url}/rest/v1/${table}?${idColumn}=eq.${encodeURIComponent(idValue)}`,
      {
        method: 'PATCH',
        headers: this.headers({ Prefer: 'return=minimal' }),
        body: JSON.stringify(partial)
      }
    );
    if (!res.ok) throw new Error(`Supabase patch ${table} failed: ${res.status}`);
  }

  async remove(table: string, idColumn: string, idValue: string): Promise<void> {
    const res = await fetch(
      `${this.cfg.url}/rest/v1/${table}?${idColumn}=eq.${encodeURIComponent(idValue)}`,
      { method: 'DELETE', headers: this.headers() }
    );
    if (!res.ok) throw new Error(`Supabase delete ${table} failed: ${res.status}`);
  }

  // --- Storage (files) ----------------------------------------------------

  async uploadFile(path: string, file: File): Promise<string> {
    const res = await fetch(
      `${this.cfg.url}/storage/v1/object/${this.cfg.bucket}/${path}`,
      {
        method: 'POST',
        headers: {
          apikey: this.cfg.anonKey,
          Authorization: `Bearer ${this.cfg.anonKey}`,
          'x-upsert': 'true',
          'Content-Type': file.type || 'application/octet-stream'
        },
        body: file
      }
    );
    if (!res.ok) throw new Error(`Supabase upload failed: ${res.status}`);
    return this.publicUrl(path);
  }

  publicUrl(path: string): string {
    return `${this.cfg.url}/storage/v1/object/public/${this.cfg.bucket}/${path}`;
  }

  // --- internals ----------------------------------------------------------

  private headers(extra?: Record<string, string>): Record<string, string> {
    return {
      apikey: this.cfg.anonKey,
      Authorization: `Bearer ${this.cfg.anonKey}`,
      'Content-Type': 'application/json',
      ...extra
    };
  }

  private resolveConfig(): SupabaseConfig {
    let { supabaseUrl: url, supabaseAnonKey: anonKey, useSupabase, supabaseBucket: bucket } =
      environment;

    // Optional runtime override — set localStorage 'growthifyedge.supabase' to
    // { url, anonKey, useSupabase, bucket } to (re)configure without a rebuild.
    try {
      const raw = typeof localStorage !== 'undefined' && localStorage.getItem('growthifyedge.supabase');
      if (raw) {
        const o = JSON.parse(raw);
        url = o.url ?? url;
        anonKey = o.anonKey ?? anonKey;
        bucket = o.bucket ?? bucket;
        useSupabase = o.useSupabase ?? useSupabase;
      }
    } catch {
      /* ignore malformed override */
    }

    return { url: (url || '').replace(/\/+$/, ''), anonKey, useSupabase, bucket };
  }
}
