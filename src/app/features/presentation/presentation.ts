import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  computed,
  effect,
  inject,
  input,
  signal
} from '@angular/core';
import { Router } from '@angular/router';

import { SoftwareService } from '../../core/services/software.service';
import { PresentationService } from '../../core/services/presentation.service';
import { Icon } from '../../shared/components/icon/icon';
import { StatusBadge } from '../../shared/components/status-badge/status-badge';

/**
 * Distraction-free, keyboard-driven slide deck for live client pitches.
 * Arrow keys / Space navigate; Esc exits back to the dashboard.
 */
@Component({
  selector: 'ge-presentation',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, StatusBadge],
  templateUrl: './presentation.html'
})
export class Presentation {
  private readonly svc = inject(SoftwareService);
  private readonly router = inject(Router);
  protected readonly presentation = inject(PresentationService);

  /** Featured first, then everything else, so the strongest work leads. */
  protected readonly slides = computed(() => {
    const list = this.svc.visibleSoftware();
    return [...list.filter((s) => s.featured), ...list.filter((s) => !s.featured)];
  });

  /** Optional `?slug=` query param to open the deck on a specific project. */
  readonly slug = input<string>();

  protected readonly index = signal(0);
  protected readonly current = computed(() => this.slides()[this.index()]);
  protected readonly total = computed(() => this.slides().length);

  constructor() {
    this.presentation.enter();
    effect(() => {
      const slug = this.slug();
      if (!slug) return;
      const i = this.slides().findIndex((s) => s.slug === slug);
      if (i >= 0) this.index.set(i);
    });
  }

  @HostListener('document:keydown.arrowright')
  @HostListener('document:keydown.space')
  protected next(): void {
    this.index.update((i) => Math.min(i + 1, this.total() - 1));
  }

  @HostListener('document:keydown.arrowleft')
  protected prev(): void {
    this.index.update((i) => Math.max(i - 1, 0));
  }

  protected goto(i: number): void {
    this.index.set(i);
  }

  @HostListener('document:keydown.escape')
  protected exit(): void {
    this.presentation.exit();
    this.router.navigate(['/']);
  }
}
