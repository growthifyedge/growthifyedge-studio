import { Injectable, computed, effect, signal } from '@angular/core';

import {
  AnalyticsEvent,
  AnalyticsEventType,
  MonthlyPoint,
  ProjectAnalytics
} from '../models/analytics.model';

/**
 * Project analytics (Phase 6.2).
 *
 * localStorage-first: an append-only event log is persisted and aggregates are
 * derived reactively. Anonymous visitors record views/clicks — so unlike
 * project CRUD, analytics writes are NOT admin-gated. Cloud mode (a Supabase
 * RPC writing to `project_analytics_events`) is prepared in
 * `supabase/analytics.sql` and can be wired later without changing callers.
 */
@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private static readonly KEY = 'growthifyedge.analytics.v1';
  /** Cap the local log so it can't grow unbounded. */
  private static readonly CAP = 3000;

  private readonly _events = signal<AnalyticsEvent[]>(this.load());
  readonly events = this._events.asReadonly();

  constructor() {
    effect(() => this.save(this._events()));
  }

  /** Record one analytics event. Safe to call from anonymous visitors. */
  track(projectId: string, type: AnalyticsEventType): void {
    if (!projectId) return;
    const now = Date.now();

    // Dedupe rapid duplicates (e.g. a component re-instantiated by an aborted
    // route/view-transition) so a single visit counts once.
    const list = this._events();
    const last = list[list.length - 1];
    if (last && last.projectId === projectId && last.type === type && now - Date.parse(last.at) < 1500) {
      return;
    }

    const event: AnalyticsEvent = { projectId, type, at: new Date(now).toISOString() };
    this._events.update((prev) => {
      const next = [...prev, event];
      return next.length > AnalyticsService.CAP
        ? next.slice(next.length - AnalyticsService.CAP)
        : next;
    });
  }

  /** Aggregates keyed by projectId. */
  readonly byProject = computed<ReadonlyMap<string, ProjectAnalytics>>(() => {
    const map = new Map<string, ProjectAnalytics>();
    for (const e of this._events()) {
      const a =
        map.get(e.projectId) ??
        ({
          projectId: e.projectId,
          totalViews: 0,
          presentationViews: 0,
          demoClicks: 0,
          caseStudyClicks: 0,
          lastViewedAt: null
        } as ProjectAnalytics);
      const next: ProjectAnalytics = {
        ...a,
        totalViews: a.totalViews + (e.type === 'view' ? 1 : 0),
        presentationViews: a.presentationViews + (e.type === 'presentation' ? 1 : 0),
        demoClicks: a.demoClicks + (e.type === 'demo' ? 1 : 0),
        caseStudyClicks: a.caseStudyClicks + (e.type === 'case_study' ? 1 : 0),
        lastViewedAt:
          e.type === 'view' || e.type === 'presentation'
            ? this.maxDate(a.lastViewedAt, e.at)
            : a.lastViewedAt
      };
      map.set(e.projectId, next);
    }
    return map;
  });

  statsFor(projectId: string): ProjectAnalytics {
    return (
      this.byProject().get(projectId) ?? {
        projectId,
        totalViews: 0,
        presentationViews: 0,
        demoClicks: 0,
        caseStudyClicks: 0,
        lastViewedAt: null
      }
    );
  }

  /** Site-wide totals. */
  readonly totals = computed(() => {
    let views = 0,
      presentationViews = 0,
      demoClicks = 0,
      caseStudyClicks = 0;
    for (const e of this._events()) {
      if (e.type === 'view') views++;
      else if (e.type === 'presentation') presentationViews++;
      else if (e.type === 'demo') demoClicks++;
      else if (e.type === 'case_study') caseStudyClicks++;
    }
    return {
      views,
      presentationViews,
      demoClicks,
      caseStudyClicks,
      events: this._events().length
    };
  });

  /** Views grouped by month (`YYYY-MM`), chronological. */
  readonly monthlyTrend = computed<readonly MonthlyPoint[]>(() => {
    const counts = new Map<string, number>();
    for (const e of this._events()) {
      if (e.type !== 'view' && e.type !== 'presentation') continue;
      const month = e.at.slice(0, 7);
      counts.set(month, (counts.get(month) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([month, views]) => ({ month, views }))
      .sort((a, b) => a.month.localeCompare(b.month));
  });

  /** Most recent events (newest first). */
  recentActivity(limit = 12): readonly AnalyticsEvent[] {
    const all = this._events();
    return all.slice(Math.max(0, all.length - limit)).reverse();
  }

  /** Clear all recorded analytics (admin maintenance). */
  reset(): void {
    this._events.set([]);
  }

  // --- persistence --------------------------------------------------------

  private load(): AnalyticsEvent[] {
    try {
      const raw = typeof localStorage !== 'undefined' && localStorage.getItem(AnalyticsService.KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as AnalyticsEvent[]) : [];
    } catch {
      return [];
    }
  }

  private save(list: readonly AnalyticsEvent[]): void {
    try {
      localStorage.setItem(AnalyticsService.KEY, JSON.stringify(list));
    } catch {
      /* quota / privacy mode */
    }
  }

  private maxDate(a: string | null, b: string): string {
    return !a || b > a ? b : a;
  }
}
