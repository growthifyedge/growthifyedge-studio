import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
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

@Component({
  selector: 'ge-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, SoftwareCard, VideoCard, VideoModal, CategoryCard, Icon],
  templateUrl: './dashboard.html'
})
export class Dashboard {
  private readonly svc = inject(SoftwareService);

  protected readonly stats = this.svc.stats;
  protected readonly featured = this.svc.featured;

  /** Lead featured project that has a demo video — drives the hero video card. */
  protected readonly spotlight = computed(
    () => this.featured().find((s) => s.videos.length > 0) ?? this.svc.software()[0]
  );

  protected readonly bento = computed(() => this.featured().slice(0, 5));

  protected readonly recentDemos = computed(() =>
    this.svc
      .software()
      .filter((s) => s.videos.length > 0)
      .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
      .flatMap((s) => s.videos.map((v) => ({ video: v, name: s.name })))
      .slice(0, 4)
  );

  protected readonly statTiles = computed(() => {
    const s = this.stats();
    return [
      { label: 'Projects shipped', value: `${s.total}`, icon: 'layers' as const, tint: '#6d49ff' },
      { label: 'Live in production', value: `${s.live}`, icon: 'bolt' as const, tint: '#10c5ac' },
      { label: 'Demo videos', value: `${s.videos}`, icon: 'film' as const, tint: '#f43bb8' },
      { label: 'Client case studies', value: `${s.caseStudies}`, icon: 'document' as const, tint: '#f59e0b' }
    ];
  });

  /** Headline business-impact figures for the cinematic impact band. */
  protected readonly impact = computed(() => {
    const list = this.svc.software();
    const hours = list.reduce((sum, s) => {
      const m = /(\d+)/.exec(s.timeSaved);
      return sum + (m ? Number(m[1]) : 0);
    }, 0);
    const s = this.stats();
    return [
      { value: `${hours}h+`, label: 'Saved every week', sub: 'across all deployments' },
      { value: `${s.clients}+`, label: 'Clients served', sub: 'and counting' },
      { value: `${s.automations}`, label: 'AI & automations', sub: 'shipped to production' },
      { value: `${s.avgRating}★`, label: 'Average rating', sub: 'from client teams' }
    ];
  });

  /** Distinct technologies for the marquee strip. */
  protected readonly techMarquee = computed(() => {
    const set = new Set<string>();
    for (const s of this.svc.software()) for (const t of s.techStack) set.add(`${t.icon ?? '•'} ${t.name}`);
    return [...set];
  });

  protected readonly categories = computed<readonly CategoryCardData[]>(() => {
    const list = this.svc.software();
    const count = (pred: (c: string) => boolean) =>
      list.filter((s) => pred(s.category)).length;
    return [
      { label: 'AI Tools', description: 'Copilots and assistants that think alongside your team.', icon: 'robot', count: count((c) => c === 'AI Tool'), link: '/gallery', queryParams: { category: 'AI Tool' }, gradient: 'linear-gradient(135deg,#6d49ff,#f43bb8)' },
      { label: 'Automations', description: 'Workflows that run the busywork on autopilot.', icon: 'flow', count: count((c) => c === 'Automation'), link: '/automations', gradient: 'linear-gradient(135deg,#f43bb8,#36e0c8)' },
      { label: 'Dashboards', description: 'Live cockpits that turn data into decisions.', icon: 'chart', count: count((c) => c === 'Dashboard'), link: '/gallery', queryParams: { category: 'Dashboard' }, gradient: 'linear-gradient(135deg,#36e0c8,#6d49ff)' },
      { label: 'Mini Software', description: 'Sharp, focused tools that deliver quick wins.', icon: 'beaker', count: count((c) => c === 'Mini Software'), link: '/lab', gradient: 'linear-gradient(135deg,#6d49ff,#10c5ac)' }
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
