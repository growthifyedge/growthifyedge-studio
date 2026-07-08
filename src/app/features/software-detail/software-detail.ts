import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  signal
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { SoftwareService } from '../../core/services/software.service';
import { PresentationService } from '../../core/services/presentation.service';
import { SeoService } from '../../core/services/seo.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { DemoVideo } from '../../core/models/software.model';
import { isDirectVideo, toEmbedUrl } from '../../core/utils/video-embed';
import { Icon, IconName } from '../../shared/components/icon/icon';
import { StatusBadge } from '../../shared/components/status-badge/status-badge';
import { TechChip } from '../../shared/components/tech-chip/tech-chip';
import { ImpactStat } from '../../shared/components/impact-stat/impact-stat';
import { ScreenshotGallery } from '../../shared/components/screenshot-gallery/screenshot-gallery';
import { VideoModal } from '../../shared/components/video-modal/video-modal';
import { SoftwareCard } from '../../shared/components/software-card/software-card';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { InquiryCta } from '../../shared/components/inquiry-cta/inquiry-cta';

@Component({
  selector: 'ge-software-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    Icon,
    StatusBadge,
    TechChip,
    ImpactStat,
    ScreenshotGallery,
    VideoModal,
    SoftwareCard,
    EmptyState,
    InquiryCta
  ],
  templateUrl: './software-detail.html'
})
export class SoftwareDetail {
  /** Bound from the `:slug` route param via withComponentInputBinding(). */
  readonly slug = input.required<string>();

  private readonly svc = inject(SoftwareService);
  private readonly router = inject(Router);
  private readonly presentation = inject(PresentationService);
  private readonly seo = inject(SeoService);
  private readonly analytics = inject(AnalyticsService);

  protected readonly software = computed(() => this.svc.bySlugForViewer(this.slug()));

  constructor() {
    let viewTracked = false;
    effect(() => {
      const sw = this.software();
      if (!sw) return;
      this.seo.setProject(sw);
      if (!viewTracked) {
        viewTracked = true;
        this.analytics.track(sw.id, 'view');
      }
    });
    inject(DestroyRef).onDestroy(() => this.seo.reset());
  }

  protected trackDemo(id: string): void {
    this.analytics.track(id, 'demo');
  }
  protected trackCaseStudy(id: string): void {
    this.analytics.track(id, 'case_study');
  }

  protected readonly caseStudies = computed(() => {
    const sw = this.software();
    return sw ? this.svc.getCaseStudiesFor(sw.id) : [];
  });

  protected readonly similar = computed(() => this.svc.similarTo(this.slug(), 3));

  /** Available video CTAs — only those with a URL are surfaced. */
  protected readonly videoLinks = computed<readonly { label: string; url: string; icon: IconName }[]>(() => {
    const sw = this.software();
    if (!sw) return [];
    const links: { label: string; url: string; icon: IconName }[] = [];
    const demo = sw.demoVideoUrl ?? sw.videos[0]?.url;
    if (demo) links.push({ label: 'Watch Demo', url: demo, icon: 'play' });
    if (sw.teaserVideoUrl) links.push({ label: 'Watch Teaser', url: sw.teaserVideoUrl, icon: 'film' });
    if (sw.walkthroughVideoUrl) links.push({ label: 'Full Walkthrough', url: sw.walkthroughVideoUrl, icon: 'presentation' });
    return links;
  });

  protected readonly activeVideo = signal<DemoVideo | null>(null);

  protected openVideo(video: DemoVideo): void {
    this.activeVideo.set(video);
  }

  /**
   * YouTube/Vimeo → sanitized iframe modal; a direct video file (e.g. an .mp4
   * from Supabase Storage) → native <video> modal; anything else → new tab.
   */
  protected launch(link: { label: string; url: string }): void {
    const sw = this.software();
    const embed = toEmbedUrl(link.url);
    if (embed || isDirectVideo(link.url)) {
      this.activeVideo.set({
        id: 'live-' + link.label,
        title: `${sw?.name ?? 'Demo'} — ${link.label}`,
        url: embed ?? link.url,
        thumbnail: sw?.coverImage ?? '',
        durationSeconds: 0
      });
    } else {
      window.open(link.url, '_blank', 'noopener,noreferrer');
    }
  }

  protected closeVideo(): void {
    this.activeVideo.set(null);
  }

  protected present(): void {
    this.presentation.enter();
    this.router.navigate(['/present', this.slug()]);
  }
}
