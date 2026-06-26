import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal
} from '@angular/core';

import { Screenshot } from '../../../core/models/software.model';
import { Icon } from '../icon/icon';

/** Screenshot gallery with a large active frame + thumbnail strip + lightbox. */
@Component({
  selector: 'ge-screenshot-gallery',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  templateUrl: './screenshot-gallery.html'
})
export class ScreenshotGallery {
  readonly screenshots = input.required<readonly Screenshot[]>();

  protected readonly activeIndex = signal(0);
  protected readonly lightbox = signal(false);

  /** Indices whose image failed to load — rendered with a designed fallback. */
  protected readonly failed = signal<ReadonlySet<number>>(new Set());

  protected readonly active = computed(
    () => this.screenshots()[this.activeIndex()] ?? null
  );

  protected hasFailed(i: number): boolean {
    return this.failed().has(i);
  }

  protected onError(i: number): void {
    this.failed.update((set) => new Set(set).add(i));
  }

  protected select(i: number): void {
    this.activeIndex.set(i);
  }

  protected next(): void {
    this.activeIndex.update((i) => (i + 1) % this.screenshots().length);
  }

  protected prev(): void {
    this.activeIndex.update(
      (i) => (i - 1 + this.screenshots().length) % this.screenshots().length
    );
  }

  protected openLightbox(): void {
    this.lightbox.set(true);
  }

  protected closeLightbox(): void {
    this.lightbox.set(false);
  }
}
