import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { SoftwareService } from '../../core/services/software.service';
import { DemoCategory, DemoVideo } from '../../core/models/software.model';
import { VideoCard } from '../../shared/components/video-card/video-card';
import { VideoModal } from '../../shared/components/video-modal/video-modal';
import { PageHeader } from '../../shared/components/page-header/page-header';
import { Icon, IconName } from '../../shared/components/icon/icon';

interface TheatreVideo {
  readonly video: DemoVideo;
  readonly name: string;
  readonly slug: string;
  readonly demoCategory: DemoCategory;
}

interface TheatreSection {
  readonly title: string;
  readonly icon: IconName;
  readonly items: readonly TheatreVideo[];
}

@Component({
  selector: 'ge-demo-theatre',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VideoCard, VideoModal, PageHeader, Icon],
  templateUrl: './demo-theatre.html'
})
export class DemoTheatre {
  private readonly svc = inject(SoftwareService);

  private readonly all = computed<readonly TheatreVideo[]>(() =>
    this.svc.visibleSoftware().flatMap((s) =>
      s.videos.map((video) => ({
        video,
        name: s.name,
        slug: s.slug,
        demoCategory: s.demoCategory
      }))
    )
  );

  /** Longest demo from a featured project leads the theatre. */
  protected readonly featured = computed<TheatreVideo | null>(() => {
    const featured = this.svc
      .featured()
      .flatMap((s) => s.videos.map((video) => ({ video, name: s.name, slug: s.slug, demoCategory: s.demoCategory })));
    return (
      [...featured].sort((a, b) => b.video.durationSeconds - a.video.durationSeconds)[0] ??
      this.all()[0] ??
      null
    );
  });

  protected readonly sections = computed<readonly TheatreSection[]>(() => {
    const all = this.all();
    const byCat = (c: DemoCategory) => all.filter((v) => v.demoCategory === c);
    const candidates: readonly TheatreSection[] = [
      { title: '30 Second Mini Demos', icon: 'bolt', items: all.filter((v) => v.video.durationSeconds <= 40) },
      { title: 'AI Automation Demos', icon: 'robot', items: byCat('AI Automation') },
      { title: 'Customer Support Tools', icon: 'mail', items: byCat('Customer Support') },
      { title: 'E-commerce Tools', icon: 'rocket', items: byCat('E-commerce') },
      { title: 'Operations Tools', icon: 'flow', items: byCat('Operations') }
    ];
    return candidates.filter((s) => s.items.length > 0);
  });

  protected readonly activeVideo = signal<DemoVideo | null>(null);

  protected play(video: DemoVideo): void {
    this.activeVideo.set(video);
  }

  protected closeVideo(): void {
    this.activeVideo.set(null);
  }
}
