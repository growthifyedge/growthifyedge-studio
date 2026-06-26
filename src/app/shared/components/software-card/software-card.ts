import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { DemoVideo, Software } from '../../../core/models/software.model';
import { Icon } from '../icon/icon';
import { StatusBadge } from '../status-badge/status-badge';
import { VideoModal } from '../video-modal/video-modal';

/**
 * The flagship showcase card — large thumbnail, category, status, headline
 * impact metric, short description, tech-stack chips and a self-contained
 * "Watch Demo" lightbox. Reused across the gallery, dashboard bento and more.
 */
@Component({
  selector: 'ge-software-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon, StatusBadge, VideoModal],
  templateUrl: './software-card.html'
})
export class SoftwareCard {
  readonly software = input.required<Software>();
  /** When true the card stretches its media (used as a bento feature tile). */
  readonly feature = input(false);

  protected readonly imgError = signal(false);
  protected readonly activeVideo = signal<DemoVideo | null>(null);

  protected readonly firstVideo = computed<DemoVideo | null>(
    () => this.software().videos[0] ?? null
  );

  protected watch(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    const v = this.firstVideo();
    if (v) this.activeVideo.set(v);
  }

  protected closeVideo(): void {
    this.activeVideo.set(null);
  }
}
