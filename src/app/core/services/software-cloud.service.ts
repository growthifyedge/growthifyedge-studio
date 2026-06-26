import { Injectable, inject } from '@angular/core';

import {
  BusinessImpactMetric,
  DemoCategory,
  DemoVideo,
  IoExample,
  PricingModel,
  Screenshot,
  Software,
  SoftwareCategory,
  SoftwareStatus,
  TechStackItem,
  Visibility
} from '../models/software.model';
import { SupabaseClientService } from './supabase-client.service';

/** Shape of a `software_projects` row (snake_case, JSONB for nested arrays). */
interface SoftwareRow {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  short_description: string;
  full_description: string;
  problem: string;
  solution: string;
  manual_pain_points: string[];
  category: SoftwareCategory;
  demo_category: DemoCategory;
  status: SoftwareStatus;
  visibility: Visibility;
  pricing: PricingModel;
  featured: boolean;
  is_mini: boolean;
  cover_image: string;
  accent_color: string;
  accent_color2: string;
  tech_stack: TechStackItem[];
  screenshots: Screenshot[];
  videos: DemoVideo[];
  impact: BusinessImpactMetric[];
  key_features: string[];
  headline_metric: BusinessImpactMetric;
  time_saved: string;
  io_example: IoExample | null;
  demo_video_url: string | null;
  teaser_video_url: string | null;
  walkthrough_video_url: string | null;
  live_url: string | null;
  repo_url: string | null;
  case_study_url: string | null;
  rating: number;
  clients: number;
  impact_score: number;
  launched_at: string;
  updated_at: string;
  tags: string[];
}

const TABLE = 'software_projects';

/**
 * Cloud persistence for projects, backed by Supabase (PostgREST). Translates
 * between the camelCase {@link Software} domain model and the snake_case DB
 * row. Only used when {@link SupabaseClientService.enabled} is true.
 */
@Injectable({ providedIn: 'root' })
export class SoftwareCloudService {
  private readonly client = inject(SupabaseClientService);

  get enabled(): boolean {
    return this.client.enabled;
  }

  async list(): Promise<Software[]> {
    const rows = await this.client.select<SoftwareRow>(
      TABLE,
      'select=*&order=updated_at.desc'
    );
    return rows.map((r) => this.fromRow(r));
  }

  async create(software: Software): Promise<void> {
    await this.client.insert(TABLE, [this.toRow(software)]);
  }

  async update(software: Software): Promise<void> {
    await this.client.upsert(TABLE, [this.toRow(software)]);
  }

  async patchFlags(id: string, flags: { featured?: boolean; is_mini?: boolean }): Promise<void> {
    await this.client.patch<SoftwareRow>(TABLE, 'id', id, flags);
  }

  async remove(id: string): Promise<void> {
    await this.client.remove(TABLE, 'id', id);
  }

  /** Replace the whole table (used by JSON import) via upsert. */
  async replaceAll(list: readonly Software[]): Promise<void> {
    if (!list.length) return;
    await this.client.upsert(TABLE, list.map((s) => this.toRow(s)));
  }

  // --- mapping ------------------------------------------------------------

  private toRow(s: Software): SoftwareRow {
    return {
      id: s.id,
      slug: s.slug,
      name: s.name,
      tagline: s.tagline,
      short_description: s.description,
      full_description: s.longDescription,
      problem: s.problem,
      solution: s.solution,
      manual_pain_points: [...s.manualPainPoints],
      category: s.category,
      demo_category: s.demoCategory,
      status: s.status,
      visibility: s.visibility,
      pricing: s.pricing,
      featured: s.featured,
      is_mini: !!s.isMini,
      cover_image: s.coverImage,
      accent_color: s.accentColor,
      accent_color2: s.accentColor2,
      tech_stack: [...s.techStack],
      screenshots: [...s.screenshots],
      videos: [...s.videos],
      impact: [...s.impact],
      key_features: [...s.keyFeatures],
      headline_metric: s.headlineMetric,
      time_saved: s.timeSaved,
      io_example: s.ioExample ?? null,
      demo_video_url: s.demoVideoUrl ?? null,
      teaser_video_url: s.teaserVideoUrl ?? null,
      walkthrough_video_url: s.walkthroughVideoUrl ?? null,
      live_url: s.liveUrl ?? null,
      repo_url: s.repoUrl ?? null,
      case_study_url: s.caseStudyUrl ?? null,
      rating: s.rating,
      clients: s.clients,
      impact_score: s.impactScore,
      launched_at: s.launchedAt,
      updated_at: s.updatedAt,
      tags: [...s.tags]
    };
  }

  private fromRow(r: SoftwareRow): Software {
    return {
      id: r.id,
      slug: r.slug,
      name: r.name,
      tagline: r.tagline ?? '',
      description: r.short_description ?? '',
      longDescription: r.full_description ?? r.short_description ?? '',
      problem: r.problem ?? '',
      manualPainPoints: r.manual_pain_points ?? [],
      solution: r.solution ?? '',
      category: r.category,
      demoCategory: r.demo_category ?? 'Operations',
      status: r.status,
      visibility: r.visibility ?? 'public',
      featured: !!r.featured,
      isMini: !!r.is_mini,
      coverImage: r.cover_image ?? '',
      accentColor: r.accent_color ?? '#6d49ff',
      accentColor2: r.accent_color2 ?? '#36e0c8',
      techStack: r.tech_stack ?? [],
      screenshots: r.screenshots ?? [],
      videos: r.videos ?? [],
      impact: r.impact ?? [],
      keyFeatures: r.key_features ?? [],
      headlineMetric: r.headline_metric ?? { label: 'impact', value: '—' },
      timeSaved: r.time_saved ?? '',
      ioExample: r.io_example ?? undefined,
      liveUrl: r.live_url ?? undefined,
      repoUrl: r.repo_url ?? undefined,
      caseStudyUrl: r.case_study_url ?? undefined,
      demoVideoUrl: r.demo_video_url ?? undefined,
      teaserVideoUrl: r.teaser_video_url ?? undefined,
      walkthroughVideoUrl: r.walkthrough_video_url ?? undefined,
      pricing: r.pricing ?? 'Custom Quote',
      rating: r.rating ?? 0,
      clients: r.clients ?? 0,
      impactScore: r.impact_score ?? 0,
      launchedAt: r.launched_at ?? r.updated_at ?? '',
      updatedAt: r.updated_at ?? '',
      tags: r.tags ?? []
    };
  }
}
