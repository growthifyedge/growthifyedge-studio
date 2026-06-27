import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  afterNextRender,
  computed,
  inject,
  input,
  output
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { DemoVideo } from '../../../core/models/software.model';
import { isDirectVideo, toEmbedUrl } from '../../../core/utils/video-embed';
import { Icon } from '../icon/icon';

/**
 * Full-screen video lightbox.
 *
 * Plays a direct video file (mp4/webm/ogg from Supabase Storage) in a native
 * <video>, or embeds a YouTube/Vimeo URL in a sanitized iframe.
 *
 * The overlay is portalled to <body> on render so its `position: fixed` is
 * always relative to the viewport — never trapped by an ancestor that has a
 * `transform`/`filter` (e.g. the page's fade-in animation), which is what
 * previously pushed the modal below a tall empty area. Body scroll is locked
 * while open; Escape / backdrop click / close button all dismiss it.
 */
@Component({
  selector: 'ge-video-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  template: `
    <div
      class="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-ink-950/85 p-4 backdrop-blur-md animate-fade-in-fast"
      (click)="close.emit()"
      role="dialog"
      aria-modal="true"
      [attr.aria-label]="video().title"
    >
      <!-- ambient glow behind the player -->
      <div class="pointer-events-none absolute left-1/2 top-1/2 h-[60vh] w-[80vw] max-w-5xl -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-600/20 blur-[120px]"></div>

      <div class="relative my-auto w-full max-w-5xl animate-rise" (click)="$event.stopPropagation()">
        <div class="mb-3 flex items-center justify-between gap-4">
          <div class="flex min-w-0 items-center gap-3">
            <span class="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-aurora text-white shadow-glow">
              <ge-icon name="play" [size]="17" />
            </span>
            <div class="min-w-0">
              <p class="ge-eyebrow !text-brand-300">Now playing</p>
              <h3 class="truncate font-display text-base font-bold text-white sm:text-lg">{{ video().title }}</h3>
            </div>
          </div>
          <button
            type="button"
            (click)="close.emit()"
            class="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-white/15 bg-white/10 text-white transition hover:rotate-90 hover:bg-white/20"
            aria-label="Close video"
          >
            <ge-icon name="close" [size]="18" />
          </button>
        </div>

        @if (isFile()) {
          <video
            [src]="video().url"
            class="h-auto max-h-[80vh] w-full rounded-2xl bg-black object-contain shadow-2xl"
            controls
            autoplay
            preload="metadata"
            playsinline
          >
            <p class="p-6 text-center text-sm text-slate-300">
              Your browser can’t play this video.
              <a [href]="video().url" target="_blank" rel="noopener" class="text-brand-300 underline">Open it in a new tab</a>.
            </p>
          </video>
        } @else {
          <div class="ring-aurora aspect-video max-h-[80vh] w-full overflow-hidden rounded-2xl bg-black shadow-2xl">
            <iframe
              [src]="safeUrl()"
              referrerpolicy="strict-origin-when-cross-origin"
              class="h-full w-full"
              title="{{ video().title }}"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            ></iframe>
          </div>
        }

        <p class="mt-3 text-center text-xs text-slate-400">Press Esc or click outside to close</p>
      </div>
    </div>
  `
})
export class VideoModal {
  readonly video = input.required<DemoVideo>();
  readonly close = output<void>();

  private readonly sanitizer = inject(DomSanitizer);
  private readonly doc = inject(DOCUMENT);
  private readonly host = inject(ElementRef).nativeElement as HTMLElement;

  /** Direct video file (mp4/webm/ogg…) → render a native <video> player. */
  protected readonly isFile = computed(() => isDirectVideo(this.video().url));

  /**
   * Iframe `src` lives in a RESOURCE_URL security context, so a raw string is
   * blocked by Angular. We normalize the URL to its YouTube/Vimeo embed form
   * (passing through already-embeddable URLs) and mark it trusted. Memoized so
   * the iframe isn't re-created on every change-detection pass. (Only used for
   * the iframe branch — native <video> uses Angular's safe MEDIA_URL binding.)
   */
  protected readonly safeUrl = computed<SafeResourceUrl>(() => {
    const raw = this.video().url;
    const embed = toEmbedUrl(raw) ?? raw;
    return this.sanitizer.bypassSecurityTrustResourceUrl(embed);
  });

  constructor() {
    const body = this.doc.body;
    const previousOverflow = body.style.overflow;

    afterNextRender(() => {
      // Portal: move the overlay to <body> so `fixed` is viewport-relative.
      body.appendChild(this.host);
      body.style.overflow = 'hidden'; // lock background scroll
    });

    inject(DestroyRef).onDestroy(() => {
      body.style.overflow = previousOverflow;
      this.host.remove();
    });
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.close.emit();
  }
}
