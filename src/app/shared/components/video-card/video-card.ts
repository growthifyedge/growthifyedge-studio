import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { DemoVideo } from '../../../core/models/software.model';
import { Icon } from '../icon/icon';

/**
 * Embedded video preview card. Emits `play` so the host page can open its
 * shared lightbox (keeps a single modal instance per page).
 */
@Component({
  selector: 'ge-video-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  template: `
    <button
      type="button"
      (click)="play.emit(video())"
      class="group ge-card ge-hover relative w-full overflow-hidden text-left"
    >
      <div class="relative aspect-video overflow-hidden">
        <img
          [src]="video().thumbnail"
          [alt]="video().title"
          loading="lazy"
          class="h-full w-full object-cover transition duration-[900ms] ease-out group-hover:scale-110"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-ink-950/10 to-transparent transition group-hover:from-ink-950/90"></div>

        <!-- Play -->
        <span
          class="play-ring absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-brand-600 shadow-glow-strong backdrop-blur transition duration-300 group-hover:scale-110"
        >
          <ge-icon name="play" [size]="26" />
        </span>

        <span
          class="absolute bottom-3 right-3 rounded-md bg-ink-950/80 px-2 py-0.5 text-xs font-semibold text-white backdrop-blur"
        >
          {{ duration() }}
        </span>

        @if (label(); as l) {
          <span
            class="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-brand-700 backdrop-blur"
          >
            {{ l }}
          </span>
        }
      </div>

      <div class="p-4">
        @if (subtitle(); as s) {
          <p class="text-[11px] font-bold uppercase tracking-wide text-brand-600">{{ s }}</p>
        }
        <p class="mt-1 line-clamp-2 text-sm font-semibold text-slate-800">{{ video().title }}</p>
      </div>
    </button>
  `
})
export class VideoCard {
  readonly video = input.required<DemoVideo>();
  readonly subtitle = input<string>('');
  readonly label = input<string>('');
  readonly play = output<DemoVideo>();

  protected duration(): string {
    const sec = this.video().durationSeconds;
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }
}
