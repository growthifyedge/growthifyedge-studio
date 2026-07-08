/**
 * Analytics domain types (Phase 6.2).
 *
 * Events are the source of truth (append-only); aggregates are derived. This
 * shape maps 1:1 to the future `project_analytics_events` table + the
 * `project_analytics` aggregate, so cloud mode is a drop-in later.
 */
export type AnalyticsEventType = 'view' | 'presentation' | 'demo' | 'case_study';

export interface AnalyticsEvent {
  readonly projectId: string;
  readonly type: AnalyticsEventType;
  /** ISO timestamp. */
  readonly at: string;
}

/** Per-project aggregate derived from the event log. */
export interface ProjectAnalytics {
  readonly projectId: string;
  readonly totalViews: number;
  readonly presentationViews: number;
  readonly demoClicks: number;
  readonly caseStudyClicks: number;
  readonly lastViewedAt: string | null;
}

export interface MonthlyPoint {
  /** `YYYY-MM`. */
  readonly month: string;
  readonly views: number;
}
