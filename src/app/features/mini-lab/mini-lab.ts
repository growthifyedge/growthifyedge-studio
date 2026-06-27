import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SoftwareService } from '../../core/services/software.service';
import { DemoVideo } from '../../core/models/software.model';
import { PageHeader } from '../../shared/components/page-header/page-header';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { VideoModal } from '../../shared/components/video-modal/video-modal';
import { Icon } from '../../shared/components/icon/icon';

/**
 * Compact "lab" cards for small, focused tools — each shows the use case, a
 * concrete input→output example, time saved and a Request Custom Version CTA.
 */
@Component({
  selector: 'ge-mini-lab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, PageHeader, EmptyState, VideoModal, Icon],
  templateUrl: './mini-lab.html'
})
export class MiniLab {
  private readonly svc = inject(SoftwareService);

  /** Mini products: explicit flag, the Mini Software category or a concrete I/O example. */
  protected readonly items = computed(() =>
    this.svc.visibleSoftware().filter((s) => this.svc.isMini(s))
  );

  protected readonly activeVideo = signal<DemoVideo | null>(null);

  protected play(video: DemoVideo): void {
    this.activeVideo.set(video);
  }

  protected closeVideo(): void {
    this.activeVideo.set(null);
  }
}
