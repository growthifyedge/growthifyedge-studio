import { Injectable, inject } from '@angular/core';

import { SupabaseClientService } from './supabase-client.service';

/**
 * Uploads thumbnails and screenshots to Supabase Storage and returns their
 * public URLs. Only usable when the backend is enabled; URL-based input in the
 * form remains available regardless.
 */
@Injectable({ providedIn: 'root' })
export class MediaUploadService {
  private readonly client = inject(SupabaseClientService);

  get enabled(): boolean {
    return this.client.enabled;
  }

  /** Upload a single image and return its public URL. */
  async uploadImage(file: File, folder = 'thumbnails'): Promise<string> {
    const path = `${folder}/${this.uniqueName(file.name)}`;
    return this.client.uploadFile(path, file);
  }

  /** Upload many files in parallel, returning their public URLs in order. */
  async uploadMany(files: readonly File[], folder = 'screenshots'): Promise<string[]> {
    return Promise.all(files.map((f) => this.uploadImage(f, folder)));
  }

  private uniqueName(name: string): string {
    const safe = name.toLowerCase().replace(/[^a-z0-9.]+/g, '-').replace(/^-+|-+$/g, '');
    const rand = Math.random().toString(36).slice(2, 8);
    return `${Date.now()}-${rand}-${safe || 'file'}`;
  }
}
