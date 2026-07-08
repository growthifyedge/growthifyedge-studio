import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SoftwareService } from '../../core/services/software.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { AnalyticsEventType, ProjectAnalytics } from '../../core/models/analytics.model';
import { PageHeader } from '../../shared/components/page-header/page-header';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { Icon, IconName } from '../../shared/components/icon/icon';

@Component({
  selector: 'ge-admin-analytics',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, PageHeader, EmptyState, Icon],
  templateUrl: './admin-analytics.html'
})
export class AdminAnalytics {
  private readonly svc = inject(SoftwareService);
  private readonly analytics = inject(AnalyticsService);

  protected readonly totals = this.analytics.totals;
  protected readonly hasData = computed(() => this.analytics.events().length > 0);

  private readonly nameById = computed<ReadonlyMap<string, string>>(
    () => new Map(this.svc.software().map((s) => [s.id, s.name]))
  );

  /** Per-project rows (all admin-visible projects), sorted by views desc. */
  protected readonly rows = computed(() => {
    const stats = this.analytics.byProject();
    return this.svc
      .software()
      .map((s) => ({ id: s.id, name: s.name, slug: s.slug, ...this.blankIfMissing(stats.get(s.id)) }))
      .sort((a, b) => b.totalViews - a.totalViews);
  });

  protected readonly mostViewed = computed(() => this.rows().filter((r) => r.totalViews > 0).slice(0, 5));

  protected readonly monthly = computed(() => {
    const trend = this.analytics.monthlyTrend();
    const max = Math.max(1, ...trend.map((m) => m.views));
    return trend.slice(-6).map((m) => ({ ...m, pct: Math.round((m.views / max) * 100) }));
  });

  protected readonly recent = computed(() =>
    this.analytics.recentActivity(14).map((e) => ({
      name: this.nameById().get(e.projectId) ?? 'Unknown project',
      type: e.type,
      label: this.typeLabel(e.type),
      icon: this.typeIcon(e.type),
      when: e.at.slice(0, 16).replace('T', ' ')
    }))
  );

  protected readonly pendingReset = signal(false);

  protected typeLabel(t: AnalyticsEventType): string {
    return t === 'view'
      ? 'View'
      : t === 'presentation'
        ? 'Presentation'
        : t === 'demo'
          ? 'Live demo'
          : 'Case study';
  }
  protected typeIcon(t: AnalyticsEventType): IconName {
    return t === 'view' ? 'eye' : t === 'presentation' ? 'presentation' : t === 'demo' ? 'external' : 'document';
  }

  protected shortDate(iso: string | null): string {
    return iso ? iso.slice(0, 10) : '—';
  }

  protected confirmReset(): void {
    this.analytics.reset();
    this.pendingReset.set(false);
  }

  private blankIfMissing(a: ProjectAnalytics | undefined): Omit<ProjectAnalytics, 'projectId'> {
    return {
      totalViews: a?.totalViews ?? 0,
      presentationViews: a?.presentationViews ?? 0,
      demoClicks: a?.demoClicks ?? 0,
      caseStudyClicks: a?.caseStudyClicks ?? 0,
      lastViewedAt: a?.lastViewedAt ?? null
    };
  }
}
