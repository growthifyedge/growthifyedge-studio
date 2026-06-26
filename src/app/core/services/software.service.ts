import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Observable, delay, of } from 'rxjs';

import { CaseStudy, RoadmapItem, Software } from '../models/software.model';
import { DEFAULT_FILTERS, SoftwareFilters } from '../models/filters.model';
import { MOCK_CASE_STUDIES, MOCK_ROADMAP } from '../data/mock-software';
import { SoftwareStorageService } from './software-storage.service';
import { SoftwareCloudService } from './software-cloud.service';

/**
 * Single source of truth for showcase data, built on Angular signals.
 *
 * Storage strategy:
 *  - The in-memory signal drives every page (Dashboard, Gallery, Mini Lab,
 *    Detail, Presentation, Admin) and is mutated optimistically.
 *  - localStorage is ALWAYS written as a cache/fallback, so the app works
 *    fully offline and demo mode never breaks.
 *  - When the optional Supabase backend is enabled, projects are loaded from
 *    the cloud on startup and every mutation is mirrored there best-effort.
 *
 * Case studies and the roadmap remain static seed data for now.
 */
@Injectable({ providedIn: 'root' })
export class SoftwareService {
  private readonly storage = inject(SoftwareStorageService);
  private readonly cloud = inject(SoftwareCloudService);

  private readonly _software = signal<readonly Software[]>(this.storage.load());
  private readonly _caseStudies = signal<readonly CaseStudy[]>(MOCK_CASE_STUDIES);
  private readonly _roadmap = signal<readonly RoadmapItem[]>(MOCK_ROADMAP);

  /** Reflects whether the Supabase backend is active (else localStorage demo). */
  readonly cloudEnabled = this.cloud.enabled;
  readonly syncState = signal<'idle' | 'syncing' | 'error'>('idle');

  constructor() {
    // localStorage cache/fallback — written on every change to the list.
    effect(() => this.storage.save(this._software()));

    // When the cloud is configured, hydrate from it (localStorage already gave
    // us instant data); on any failure we silently keep the local copy.
    if (this.cloud.enabled) void this.refreshFromCloud();
  }

  /** Pull the authoritative list from Supabase, replacing the local copy. */
  async refreshFromCloud(): Promise<void> {
    if (!this.cloud.enabled) return;
    this.syncState.set('syncing');
    try {
      const list = await this.cloud.list();
      if (list.length) this._software.set(list);
      this.syncState.set('idle');
    } catch (err) {
      console.warn('[GrowthifyEdge] Supabase load failed — using local data.', err);
      this.syncState.set('error');
    }
  }

  /** Fire a cloud write without blocking the optimistic UI update. */
  private mirror(op: () => Promise<void>): void {
    if (!this.cloud.enabled) return;
    op().catch((err) => {
      console.warn('[GrowthifyEdge] Supabase write failed — change kept locally.', err);
      this.syncState.set('error');
    });
  }

  /** Global filter/search state shared by the gallery and topbar search. */
  readonly filters = signal<SoftwareFilters>({ ...DEFAULT_FILTERS });

  readonly software = this._software.asReadonly();
  readonly caseStudies = this._caseStudies.asReadonly();
  readonly roadmap = this._roadmap.asReadonly();

  readonly total = computed(() => this._software().length);
  readonly featured = computed(() => this._software().filter((s) => s.featured));

  /** All distinct technologies — powers the technology filter. */
  readonly technologies = computed<readonly string[]>(() => {
    const set = new Set<string>();
    for (const s of this._software()) {
      for (const t of s.techStack) set.add(t.name);
    }
    return [...set].sort((a, b) => a.localeCompare(b));
  });

  /** Reactive, filtered + sorted result set driven by `filters`. */
  readonly filtered = computed<readonly Software[]>(() => {
    const f = this.filters();
    const term = f.search.trim().toLowerCase();

    let result = this._software().filter((s) => {
      const matchesTerm =
        !term ||
        s.name.toLowerCase().includes(term) ||
        s.tagline.toLowerCase().includes(term) ||
        s.description.toLowerCase().includes(term) ||
        s.tags.some((t) => t.toLowerCase().includes(term)) ||
        s.techStack.some((t) => t.name.toLowerCase().includes(term));

      const matchesCategory = f.category === 'All' || s.category === f.category;
      const matchesStatus = f.status === 'All' || s.status === f.status;
      const matchesTech =
        f.tech === 'All' || s.techStack.some((t) => t.name === f.tech);
      const matchesFeatured = !f.featuredOnly || s.featured;

      return matchesTerm && matchesCategory && matchesStatus && matchesTech && matchesFeatured;
    });

    result = [...result].sort((a, b) => {
      switch (f.sort) {
        case 'featured':
          return Number(b.featured) - Number(a.featured) || b.impactScore - a.impactScore;
        case 'impact':
          return b.impactScore - a.impactScore;
        case 'rating':
          return b.rating - a.rating;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'newest':
        default:
          return +new Date(b.updatedAt) - +new Date(a.updatedAt);
      }
    });

    return result;
  });

  readonly resultCount = computed(() => this.filtered().length);

  /** Aggregate stats for the executive dashboard hero tiles. */
  readonly stats = computed(() => {
    const list = this._software();
    const live = list.filter((s) => s.status === 'Live').length;
    const clients = list.reduce((sum, s) => sum + s.clients, 0);
    const avgRating =
      list.reduce((sum, s) => sum + s.rating, 0) / Math.max(list.length, 1);
    const automations = list.filter(
      (s) => s.category === 'Automation' || s.category === 'AI Tool'
    ).length;
    const videos = list.reduce((sum, s) => sum + s.videos.length, 0);
    return {
      total: list.length,
      live,
      clients,
      automations,
      videos,
      caseStudies: this._caseStudies().length,
      avgRating: Math.round(avgRating * 10) / 10
    };
  });

  // --- Reads (Observable API mirrors a future HTTP service) ---------------

  getAll(): Observable<readonly Software[]> {
    return of(this._software()).pipe(delay(120));
  }

  getBySlug(slug: string): Observable<Software | undefined> {
    return of(this._software().find((s) => s.slug === slug)).pipe(delay(120));
  }

  getById(id: string): Software | undefined {
    return this._software().find((s) => s.id === id);
  }

  bySlug(slug: string): Software | undefined {
    return this._software().find((s) => s.slug === slug);
  }

  getCaseStudiesFor(softwareId: string): readonly CaseStudy[] {
    return this._caseStudies().filter((c) => c.softwareId === softwareId);
  }

  /** Up to `limit` projects in the same category, excluding `slug`. */
  similarTo(slug: string, limit = 3): readonly Software[] {
    const current = this.bySlug(slug);
    if (!current) return [];
    return this._software()
      .filter((s) => s.slug !== slug && s.category === current.category)
      .concat(
        this._software().filter(
          (s) => s.slug !== slug && s.category !== current.category
        )
      )
      .slice(0, limit);
  }

  // --- Filter mutations ---------------------------------------------------

  patchFilters(patch: Partial<SoftwareFilters>): void {
    this.filters.update((f) => ({ ...f, ...patch }));
  }

  resetFilters(): void {
    this.filters.set({ ...DEFAULT_FILTERS });
  }

  // --- Admin CRUD ---------------------------------------------------------
  // Each mutation updates the signal optimistically (the effect caches it to
  // localStorage), then mirrors to Supabase best-effort when enabled.

  create(software: Software): void {
    this._software.update((list) => [software, ...list]);
    this.mirror(() => this.cloud.create(software));
  }

  update(id: string, patch: Partial<Software>): void {
    this._software.update((list) =>
      list.map((s) => (s.id === id ? { ...s, ...patch, id } : s))
    );
    const updated = this.getById(id);
    if (updated) this.mirror(() => this.cloud.update(updated));
  }

  remove(id: string): void {
    this._software.update((list) => list.filter((s) => s.id !== id));
    this.mirror(() => this.cloud.remove(id));
  }

  toggleFeatured(id: string): void {
    this._software.update((list) =>
      list.map((s) => (s.id === id ? { ...s, featured: !s.featured } : s))
    );
    const next = this.getById(id);
    if (next) this.mirror(() => this.cloud.patchFlags(id, { featured: next.featured }));
  }

  toggleMini(id: string): void {
    this._software.update((list) =>
      list.map((s) => (s.id === id ? { ...s, isMini: !this.isMini(s) } : s))
    );
    const next = this.getById(id);
    if (next) this.mirror(() => this.cloud.patchFlags(id, { is_mini: !!next.isMini }));
  }

  /** Restore the default seed projects (local demo data; clears localStorage). */
  resetToSeed(): void {
    this._software.set(this.storage.reset());
  }

  /** Replace the entire project list (used by JSON import); persists via effect. */
  replaceAll(list: readonly Software[]): void {
    this._software.set([...list]);
    this.mirror(() => this.cloud.replaceAll(list));
  }

  /** Pretty-printed JSON snapshot of every project for export/backup. */
  exportJson(): string {
    return JSON.stringify(this._software(), null, 2);
  }

  /** A project counts as "mini" via the explicit flag, its category or an I/O example. */
  isMini(s: Software): boolean {
    return !!s.isMini || s.category === 'Mini Software' || !!s.ioExample;
  }
}
