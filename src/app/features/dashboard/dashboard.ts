import { ChangeDetectionStrategy, Component, ElementRef, afterNextRender, computed, inject, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SoftwareService } from '../../core/services/software.service';
import { DemoVideo } from '../../core/models/software.model';
import { SoftwareCard } from '../../shared/components/software-card/software-card';
import { VideoCard } from '../../shared/components/video-card/video-card';
import { VideoModal } from '../../shared/components/video-modal/video-modal';
import {
  CategoryCard,
  CategoryCardData
} from '../../shared/components/category-card/category-card';
import { Icon } from '../../shared/components/icon/icon';
import { TechnologyBanner } from '../../shared/components/technology-banner/technology-banner';
import { CampaignSlide } from '../../shared/components/campaign-slide/campaign-slide';

@Component({
  selector: 'ge-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, SoftwareCard, VideoCard, VideoModal, CategoryCard, Icon, TechnologyBanner, CampaignSlide],
  templateUrl: './dashboard.html'
})
export class Dashboard {
  private readonly svc = inject(SoftwareService);

  /** True once the process section has scrolled into view; drives its one-shot entrance animation. */
  protected readonly processInView = signal(false);
  private readonly processStepsEl = viewChild<ElementRef<HTMLElement>>('processStepsEl');

  constructor() {
    afterNextRender(() => {
      const el = this.processStepsEl()?.nativeElement;
      if (!el || typeof IntersectionObserver === 'undefined') {
        this.processInView.set(true);
        return;
      }
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            this.processInView.set(true);
            observer.disconnect();
          }
        },
        { threshold: 0.2 }
      );
      observer.observe(el);
    });
  }

  protected readonly stats = this.svc.stats;
  protected readonly featured = this.svc.featured;
  protected readonly hasProjects = computed(() => this.svc.visibleSoftware().length > 0);

  /** Lead featured project that has a demo video — drives the hero video card. */
  protected readonly spotlight = computed(
    () => this.featured().find((s) => s.videos.length > 0) ?? this.svc.visibleSoftware()[0]
  );

  protected readonly bento = computed(() => {
    const highlighted = this.featured();
    return (highlighted.length ? highlighted : this.svc.visibleSoftware()).slice(0, 5);
  });

  protected readonly recentDemos = computed(() =>
    this.svc
      .visibleSoftware()
      .filter((s) => s.videos.length > 0)
      .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
      .flatMap((s) => s.videos.map((v) => ({ video: v, name: s.name })))
      .slice(0, 4)
  );

  protected readonly statTiles = computed(() => {
    const s = this.stats();
    return [
      { label: 'Published Projects', value: `${s.total}`, sub: 'Real work currently showcased', cta: 'View Projects', route: '/work', icon: 'rocket' as const, tint: '#6d49ff' },
      { label: 'Portfolio Projects', value: `${s.total}`, sub: 'Selected digital solutions', cta: 'Explore Work', route: '/work', icon: 'grid' as const, tint: '#10c5ac' },
      { label: 'Technology Stacks', value: `${this.techMarquee().length}`, sub: 'Modern production technologies', cta: 'View Stack', route: '/capabilities', icon: 'layers' as const, tint: '#f43bb8' },
      { label: 'Solution Types', value: '5', sub: 'Web, software, data, automation & AI', cta: 'Explore Solutions', route: '/capabilities', icon: 'flow' as const, tint: '#f59e0b' }
    ];
  });

  /** The 4-step engagement process shown between the metric cards and Featured Projects. */
  protected readonly processSteps = computed(() => {
    return [
      { step: '01', title: 'Discover', sub: 'Understand goals, workflows and real business needs.', icon: 'search' as const, tint: '#6d49ff' },
      { step: '02', title: 'Design', sub: 'Shape the right experience, system and technical direction.', icon: 'wand' as const, tint: '#10c5ac' },
      { step: '03', title: 'Build', sub: 'Develop, integrate and test the solution for real-world use.', icon: 'settings' as const, tint: '#f43bb8' },
      { step: '04', title: 'Scale', sub: 'Improve, automate and expand as the business grows.', icon: 'trend-up' as const, tint: '#f59e0b' }
    ];
  });

  /** Distinct technologies for the marquee strip. */
  protected readonly techMarquee = computed(() => {
    const set = new Set<string>();
    for (const s of this.svc.visibleSoftware()) for (const t of s.techStack) set.add(`${t.icon ?? '•'} ${t.name}`);
    return [...set];
  });

  protected readonly categories = computed<readonly CategoryCardData[]>(() => {
    const list = this.svc.visibleSoftware();
    const count = (pred: (c: string) => boolean) =>
      list.filter((s) => pred(s.category)).length;
    return [
      { label: 'Websites', description: 'Clear, responsive websites built around a business goal.', icon: 'document', count: count((c) => c === 'Website'), link: '/work', queryParams: { category: 'Website' }, gradient: 'linear-gradient(135deg,#6d49ff,#f43bb8)' },
      { label: 'Software', description: 'Focused tools that help teams do useful work.', icon: 'layers', count: count((c) => c === 'Software'), link: '/work', queryParams: { category: 'Software' }, gradient: 'linear-gradient(135deg,#f43bb8,#36e0c8)' },
      { label: 'Dashboards', description: 'Useful reporting views for confident decisions.', icon: 'chart', count: count((c) => c === 'Dashboard'), link: '/work', queryParams: { category: 'Dashboard' }, gradient: 'linear-gradient(135deg,#36e0c8,#6d49ff)' },
      { label: 'Automations', description: 'Reliable workflows that reduce repetitive work.', icon: 'flow', count: count((c) => c === 'Automation'), link: '/work', queryParams: { category: 'Automation' }, gradient: 'linear-gradient(135deg,#6d49ff,#10c5ac)' },
      { label: 'Integrations', description: 'Connected systems that keep information moving.', icon: 'bolt', count: count((c) => c === 'Integration'), link: '/work', queryParams: { category: 'Integration' }, gradient: 'linear-gradient(135deg,#f59e0b,#f43bb8)' }
    ];
  });

  protected readonly activeVideo = signal<DemoVideo | null>(null);

  protected play(video: DemoVideo): void {
    this.activeVideo.set(video);
  }

  protected closeVideo(): void {
    this.activeVideo.set(null);
  }
}
