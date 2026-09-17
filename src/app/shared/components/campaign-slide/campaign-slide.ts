import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, HostListener, OnDestroy, ViewChild, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

interface CampaignFace {
  readonly eyebrow: string;
  readonly title: readonly [string, string];
  readonly copy: string;
  readonly action: string;
  readonly route?: string;
  readonly word: string;
}

/** A single scroll-scrubbed 3D campaign cube. */
@Component({
  selector: 'ge-campaign-slide',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './campaign-slide.html',
  styleUrl: './campaign-slide.css'
})
export class CampaignSlide implements AfterViewInit, OnDestroy {
  @ViewChild('scene', { static: true }) private readonly scene?: ElementRef<HTMLElement>;
  @ViewChild('stage', { static: true }) private readonly stage?: ElementRef<HTMLElement>;
  private frame: number | undefined;
  private cubeTweenFrame: number | undefined;
  private scrollSyncFrame: number | undefined;
  /** True while the controlled cube tween is running (independent of the scroll-sync guard). */
  private cubeTransitionActive = false;
  /** Physical wheel gesture state. Its lifecycle is bounded only by the quiet-period timer, never by a cube transition. */
  private wheelGestureActive = false;
  private wheelDirection = 0;
  private wheelAccumulated = 0;
  private wheelGestureConsumed = false;
  private wheelLastEventAt = 0;
  private wheelGestureEndTimer: ReturnType<typeof setTimeout> | undefined;
  private static readonly WHEEL_QUIET_PERIOD_MS = 120;

  protected readonly faces: readonly CampaignFace[] = [
    { eyebrow: 'Digital Experiences', title: ['Websites & Software', 'Built Around Your Business.'], copy: 'From customer-facing experiences to internal systems, built around real workflows.', action: 'View My Work', route: '/work', word: 'GROWTHIFYEDGE' },
    { eyebrow: 'Build • Manage • Scale', title: ['Apps & Dashboards', 'That Keep Work Moving.'], copy: 'Purpose-built interfaces and operational systems designed to make daily work clearer and faster.', action: 'Explore Capabilities', route: '/capabilities', word: 'BUILD' },
    { eyebrow: 'Connected Systems', title: ['Automation & AI', 'Working Behind the Scenes.'], copy: 'Connect tools, automate repetitive work and bring AI into practical business workflows.', action: 'Start a Project', route: '/contact', word: 'AUTOMATE' }
  ];
  protected readonly progress = signal(0);
  protected readonly cubeAngle = signal(0);
  protected readonly isProgrammaticTransition = signal(false);
  protected readonly activeIndex = computed(() => Math.max(0, Math.min(this.faces.length - 1, Math.round(this.cubeAngle() / 90))));
  protected readonly isSettled = computed(() => [0, 90, 180].some((angle) => Math.abs(this.cubeAngle() - angle) < .01));
  protected readonly activeWord = computed(() => this.faces[this.activeIndex()].word);

  ngAfterViewInit(): void { this.updateProgress(); }

  ngOnDestroy(): void {
    this.cancelPendingScrollProgressUpdate();
    if (this.cubeTweenFrame !== undefined) cancelAnimationFrame(this.cubeTweenFrame);
    this.cancelScrollSync();
    if (this.wheelGestureEndTimer) clearTimeout(this.wheelGestureEndTimer);
    this.wheelGestureEndTimer = undefined;
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  protected scheduleProgressUpdate(): void {
    if (this.isProgrammaticTransition() || this.frame !== undefined) return;
    this.frame = requestAnimationFrame(() => {
      this.frame = undefined;
      // Re-check at execution time: a transition may have started after this frame was queued.
      if (this.cubeTransitionActive || this.isProgrammaticTransition()) return;
      this.updateProgress();
    });
  }

  @HostListener('wheel', ['$event'])
  protected handleWheel(event: WheelEvent): false | void {
    if (!this.isSceneActive() || event.deltaY === 0) return;

    // Every wheel event extends the physical gesture, regardless of whether a cube transition is running.
    this.markWheelGestureEvent();

    if (this.isProgrammaticTransition()) {
      event.preventDefault();
      return false;
    }

    const direction = Math.sign(event.deltaY);
    const boundaryTarget = this.wheelTargetFace(direction);
    if (boundaryTarget === null) {
      this.clearWheelGestureState();
      return;
    }
    if (this.wheelGestureActive && this.wheelGestureConsumed) {
      event.preventDefault();
      return false;
    }

    if (this.wheelDirection && this.wheelDirection !== direction) this.clearWheelGestureState();
    this.wheelDirection = direction;
    this.wheelAccumulated += Math.abs(event.deltaY);
    if (this.wheelAccumulated < 24) {
      event.preventDefault();
      return false;
    }

    event.preventDefault();
    this.wheelGestureConsumed = true;
    this.transitionToFace(boundaryTarget, 520);
    return false;
  }

  /** Lighting is based on each face normal's angle to the camera, not a separate animation state. */
  protected faceSurfaceIntensity(index: number): number {
    const angleFromCamera = Math.abs(this.cubeAngle() - index * 90) * Math.PI / 180;
    return Math.max(0, Math.cos(angleFromCamera));
  }

  protected faceContentIntensity(index: number): number {
    return Math.pow(this.faceSurfaceIntensity(index), 8);
  }

  protected faceDarkness(index: number): number {
    return 1 - Math.pow(this.faceSurfaceIntensity(index), 2.6);
  }

  protected goToFace(targetIndex: number): void {
    this.transitionToFace(targetIndex, 250);
  }

  private transitionToFace(targetIndex: number, duration: number): void {
    if (!this.scene || !this.stage || this.isProgrammaticTransition() || targetIndex < 0 || targetIndex >= this.faces.length) return;
    const startAngle = this.cubeAngle();
    const targetAngle = targetIndex * 90;
    if (Math.abs(startAngle - targetAngle) < .01) return;

    // TRANSITION_START: drop any queued scroll-derived update and raise both guards before the cube moves.
    this.cancelPendingScrollProgressUpdate();
    this.cancelScrollSync();
    this.cubeTransitionActive = true;
    this.isProgrammaticTransition.set(true);
    const startedAt = performance.now();
    const tick = (now: number): void => {
      const elapsed = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - elapsed, 3);
      this.cubeAngle.set(startAngle + (targetAngle - startAngle) * eased);

      if (elapsed < 1) {
        this.cubeTweenFrame = requestAnimationFrame(tick);
      } else {
        this.cubeAngle.set(targetAngle);
        this.progress.set(targetAngle / 180);
        this.cubeTweenFrame = undefined;
        this.cubeTransitionActive = false;
        this.syncScrollToSettledFace(targetAngle / 180);
      }
    };

    this.cubeTweenFrame = requestAnimationFrame(tick);
  }

  private isSceneActive(): boolean {
    if (!this.scene) return false;
    const rect = this.scene.nativeElement.getBoundingClientRect();
    return rect.top <= 1 && rect.bottom >= window.innerHeight - 1;
  }

  private wheelTargetFace(direction: number): number | null {
    const angle = this.cubeAngle();
    const nearest = Math.round(angle / 90);
    const isAtFace = Math.abs(angle - nearest * 90) < .01;
    const target = isAtFace
      ? nearest + direction
      : direction > 0 ? Math.ceil(angle / 90) : Math.floor(angle / 90);
    return target >= 0 && target < this.faces.length ? target : null;
  }

  /**
   * Aligns window.scrollY with the settled face while the programmatic guard is still held, so the scroll
   * events produced by the sync can never feed scroll-derived progress back into the cube. The guard is
   * released only once the scroll position has stopped changing and at least two frames have elapsed.
   */
  private syncScrollToSettledFace(progress: number): void {
    this.cancelPendingScrollProgressUpdate();
    this.cancelScrollSync();
    window.scrollTo(0, this.scrollYForProgress(progress));
    let previousY = window.scrollY;
    let framesWaited = 0;
    const settle = (): void => {
      framesWaited++;
      const currentY = window.scrollY;
      const scrollStopped = Math.abs(currentY - previousY) < .5;
      previousY = currentY;
      if (framesWaited >= 2 && (scrollStopped || framesWaited >= 12)) {
        this.scrollSyncFrame = undefined;
        this.cancelPendingScrollProgressUpdate();
        this.isProgrammaticTransition.set(false);
        return;
      }
      this.scrollSyncFrame = requestAnimationFrame(settle);
    };
    this.scrollSyncFrame = requestAnimationFrame(settle);
  }

  private cancelScrollSync(): void {
    if (this.scrollSyncFrame === undefined) return;
    cancelAnimationFrame(this.scrollSyncFrame);
    this.scrollSyncFrame = undefined;
  }

  /** Records a wheel event and (re)starts the quiet-period timer that ends the physical gesture. */
  private markWheelGestureEvent(): void {
    this.wheelLastEventAt = performance.now();
    this.wheelGestureActive = true;
    this.scheduleWheelGestureEnd(CampaignSlide.WHEEL_QUIET_PERIOD_MS);
  }

  private scheduleWheelGestureEnd(delay: number): void {
    if (this.wheelGestureEndTimer) clearTimeout(this.wheelGestureEndTimer);
    this.wheelGestureEndTimer = setTimeout(() => {
      this.wheelGestureEndTimer = undefined;
      // Only the time since the last physical wheel event matters here, never the cube transition state.
      const remaining = CampaignSlide.WHEEL_QUIET_PERIOD_MS - (performance.now() - this.wheelLastEventAt);
      if (remaining > 1) {
        this.scheduleWheelGestureEnd(remaining);
        return;
      }
      this.endWheelGesture();
    }, delay);
  }

  /** Quiet period elapsed: the physical gesture is over, even if a cube transition is still running. */
  private endWheelGesture(): void {
    this.wheelGestureActive = false;
    this.clearWheelGestureState();
  }

  /** Resets the per-gesture accumulators without touching the quiet-period timer. */
  private clearWheelGestureState(): void {
    this.wheelDirection = 0;
    this.wheelAccumulated = 0;
    this.wheelGestureConsumed = false;
  }

  private cancelPendingScrollProgressUpdate(): void {
    if (this.frame === undefined) return;
    cancelAnimationFrame(this.frame);
    this.frame = undefined;
  }

  private updateProgress(): void {
    if (!this.scene || !this.stage) return;
    const scene = this.scene.nativeElement;
    const sceneTop = window.scrollY + scene.getBoundingClientRect().top;
    const travel = Math.max(scene.offsetHeight - this.stage.nativeElement.offsetHeight, 1);
    const nextProgress = this.clamp((window.scrollY - sceneTop) / travel);
    this.progress.set(nextProgress);
    this.cubeAngle.set(nextProgress * 180);
  }

  private scrollYForProgress(progress: number): number {
    if (!this.scene || !this.stage) return window.scrollY;
    const scene = this.scene.nativeElement;
    const sceneTop = window.scrollY + scene.getBoundingClientRect().top;
    const travel = Math.max(scene.offsetHeight - this.stage.nativeElement.offsetHeight, 1);
    return sceneTop + travel * this.clamp(progress);
  }

  private clamp(value: number): number { return Math.max(0, Math.min(1, value)); }
}
