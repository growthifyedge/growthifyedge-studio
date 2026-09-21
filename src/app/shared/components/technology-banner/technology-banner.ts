import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy, inject, signal } from '@angular/core';
import { ProjectInquiryModalService } from '../../../core/services/project-inquiry-modal.service';

interface PromoSlide {
  readonly id: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly sub: string;
  readonly image?: string;
}

/** Left-side premium promo slider: real auto-play carousel, no text hero. See template comment for why. */
@Component({
  selector: 'ge-technology-banner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './technology-banner.html',
  styleUrl: './technology-banner.css'
})
export class TechnologyBanner implements AfterViewInit, OnDestroy {
  private readonly projectInquiry = inject(ProjectInquiryModalService);
  private static readonly AUTOPLAY_MS = 3800;
  private static readonly SWIPE_THRESHOLD_PX = 40;

  protected readonly slides: readonly PromoSlide[] = [
    { id: 'web', eyebrow: 'Websites', title: 'Website Development', sub: 'Fast, modern, conversion-ready.', image: '/asstes/growthifyedge-website-development-banner.png' },
    { id: 'software', eyebrow: 'Business Software', title: 'Business Software', sub: 'Custom systems built for teams.', image: '/asstes/business-software-dashboard-banner.png' },
    { id: 'dashboard', eyebrow: 'Dashboards', title: 'Dashboards', sub: 'Clarity for every metric that matters.', image: '/asstes/dashboard-analytics-banner.png' },
    { id: 'automation', eyebrow: 'Automation', title: 'Automation', sub: 'Workflows that run themselves.', image: '/asstes/automation-workflows-banner.png' },
    { id: 'ai', eyebrow: 'AI / Integrations', title: 'AI & Integrations', sub: 'Connected tools, smarter operations.', image: '/asstes/ai-integrations-banner.png' }
  ];

  protected readonly activeIndex = signal(0);
  protected readonly paused = signal(false);

  private autoplayTimer: ReturnType<typeof setInterval> | undefined;
  private reducedMotion = false;
  private touchStartX = 0;
  private touchStartY = 0;
  private touchAxisLocked: 'x' | 'y' | null = null;

  ngAfterViewInit(): void {
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Auto-advancing content that can't be paused fails WCAG 2.2.2; honouring reduced-motion here means the
    // slider still works fully (dots, swipe), it simply never moves on its own.
    if (!this.reducedMotion) this.startAutoplay();
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
  }

  protected goTo(index: number): void {
    this.activeIndex.set(index);
    this.restartAutoplay();
  }

  protected next(): void {
    this.activeIndex.update((i) => (i + 1) % this.slides.length);
  }

  private previous(): void {
    this.activeIndex.update((i) => (i - 1 + this.slides.length) % this.slides.length);
  }

  protected pause(): void {
    this.paused.set(true);
  }

  protected resume(): void {
    this.paused.set(false);
  }

  private startAutoplay(): void {
    this.stopAutoplay();
    this.autoplayTimer = setInterval(() => {
      if (this.paused()) return;
      this.next();
    }, TechnologyBanner.AUTOPLAY_MS);
  }

  private restartAutoplay(): void {
    if (this.reducedMotion) return;
    this.startAutoplay();
  }

  private stopAutoplay(): void {
    if (this.autoplayTimer === undefined) return;
    clearInterval(this.autoplayTimer);
    this.autoplayTimer = undefined;
  }

  protected handleTouchStart(event: TouchEvent): void {
    const touch = event.touches[0];
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
    this.touchAxisLocked = null;
    this.pause();
  }

  protected handleTouchMove(event: TouchEvent): void {
    const touch = event.touches[0];
    const dx = touch.clientX - this.touchStartX;
    const dy = touch.clientY - this.touchStartY;
    if (!this.touchAxisLocked && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      this.touchAxisLocked = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
    }
    // Only claim the gesture (and stop the page's own vertical scroll) once we're sure this is a horizontal
    // swipe across the slider, exactly the same axis-lock approach as the campaign cube's touch handling.
    if (this.touchAxisLocked === 'x') event.preventDefault();
  }

  protected handleTouchEnd(event: TouchEvent): void {
    const touch = event.changedTouches[0];
    const dx = touch.clientX - this.touchStartX;
    if (this.touchAxisLocked === 'x' && Math.abs(dx) >= TechnologyBanner.SWIPE_THRESHOLD_PX) {
      if (dx < 0) this.next(); else this.previous();
    }
    this.touchAxisLocked = null;
    this.resume();
    this.restartAutoplay();
  }

  protected openProjectInquiry(): void { this.projectInquiry.open(); }

  protected updateTilt(event: PointerEvent): void {
    const visual = event.currentTarget as HTMLElement | null;
    if (!visual || event.pointerType === 'touch') return;
    const bounds = visual.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    visual.style.setProperty('--tilt-x', `${-y * 3}deg`);
    visual.style.setProperty('--tilt-y', `${x * 4}deg`);
  }

  protected resetTilt(event: PointerEvent): void {
    const visual = event.currentTarget as HTMLElement | null;
    visual?.style.setProperty('--tilt-x', '0deg');
    visual?.style.setProperty('--tilt-y', '0deg');
  }
}
