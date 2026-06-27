import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { SoftwareService } from '../../core/services/software.service';
import { AuthService } from '../../core/services/auth.service';
import { Software, Visibility } from '../../core/models/software.model';
import {
  CATEGORY_OPTIONS,
  STATUS_OPTIONS
} from '../../core/models/filters.model';
import { PageHeader } from '../../shared/components/page-header/page-header';
import { StatusBadge } from '../../shared/components/status-badge/status-badge';
import { Icon, IconName } from '../../shared/components/icon/icon';

@Component({
  selector: 'ge-admin',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, PageHeader, StatusBadge, Icon],
  templateUrl: './admin.html'
})
export class Admin {
  protected readonly svc = inject(SoftwareService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly adminEmail = this.auth.email;

  protected readonly stats = this.svc.stats;

  protected readonly categories = CATEGORY_OPTIONS;
  protected readonly statuses = STATUS_OPTIONS;

  // Local admin-only filter state (separate from the public gallery filters).
  protected readonly search = signal('');
  protected readonly category = signal<(typeof CATEGORY_OPTIONS)[number]>('All');
  protected readonly status = signal<(typeof STATUS_OPTIONS)[number]>('All');

  protected readonly list = computed<readonly Software[]>(() => {
    const term = this.search().trim().toLowerCase();
    const cat = this.category();
    const st = this.status();
    return this.svc.software().filter((s) => {
      const matchesTerm =
        !term ||
        s.name.toLowerCase().includes(term) ||
        s.tagline.toLowerCase().includes(term) ||
        s.tags.some((t) => t.toLowerCase().includes(term));
      const matchesCat = cat === 'All' || s.category === cat;
      const matchesStatus = st === 'All' || s.status === st;
      return matchesTerm && matchesCat && matchesStatus;
    });
  });

  protected readonly pendingDelete = signal<string | null>(null);
  protected readonly pendingReset = signal(false);

  protected isMini(s: Software): boolean {
    return this.svc.isMini(s);
  }

  protected visibilityMeta(v: Visibility): { label: string; icon: IconName; cls: string } {
    switch (v) {
      case 'public':
        return { label: 'Public', icon: 'globe', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200' };
      case 'client-only':
        return { label: 'Client-only', icon: 'users', cls: 'bg-brand-50 text-brand-700 ring-brand-200' };
      case 'private':
      default:
        return { label: 'Private', icon: 'lock', cls: 'bg-slate-100 text-slate-600 ring-slate-200' };
    }
  }

  protected setSearch(value: string): void {
    this.search.set(value);
  }
  protected setCategory(value: string): void {
    this.category.set(value as (typeof CATEGORY_OPTIONS)[number]);
  }
  protected setStatus(value: string): void {
    this.status.set(value as (typeof STATUS_OPTIONS)[number]);
  }

  protected toggleFeatured(id: string): void {
    this.svc.toggleFeatured(id);
  }
  protected toggleMini(id: string): void {
    this.svc.toggleMini(id);
  }

  protected askDelete(id: string): void {
    this.pendingDelete.set(id);
  }
  protected cancelDelete(): void {
    this.pendingDelete.set(null);
  }
  protected confirmDelete(id: string): void {
    this.svc.remove(id);
    this.pendingDelete.set(null);
  }

  protected confirmReset(): void {
    this.svc.resetToSeed();
    this.pendingReset.set(false);
  }

  // --- Export / Import JSON ------------------------------------------------

  protected readonly importPreview = signal<{ list: Software[]; count: number } | null>(null);
  protected readonly importError = signal<string | null>(null);

  protected exportJson(): void {
    const blob = new Blob([this.svc.exportJson()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'growthifyedge-software.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  protected onImportFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const valid =
          Array.isArray(parsed) &&
          parsed.length > 0 &&
          parsed.every(
            (p) =>
              p &&
              typeof p.id === 'string' &&
              typeof p.name === 'string' &&
              typeof p.slug === 'string'
          );
        if (!valid) throw new Error('invalid');
        this.importError.set(null);
        this.importPreview.set({ list: parsed as Software[], count: parsed.length });
      } catch {
        this.importPreview.set(null);
        this.importError.set('That file isn’t a valid GrowthifyEdge software export.');
      }
    };
    reader.readAsText(file);
    input.value = ''; // allow re-importing the same file name
  }

  protected confirmImport(): void {
    const preview = this.importPreview();
    if (preview) this.svc.replaceAll(preview.list);
    this.importPreview.set(null);
  }

  protected cancelImport(): void {
    this.importPreview.set(null);
  }

  protected async logout(): Promise<void> {
    await this.auth.logout();
    this.router.navigate(['/']);
  }
}
