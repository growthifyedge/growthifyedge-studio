import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type IconName =
  | 'home'
  | 'grid'
  | 'beaker'
  | 'play'
  | 'document'
  | 'settings'
  | 'plus'
  | 'mail'
  | 'search'
  | 'menu'
  | 'presentation'
  | 'close'
  | 'star'
  | 'users'
  | 'arrow-right'
  | 'arrow-left'
  | 'arrow-up-right'
  | 'external'
  | 'check'
  | 'trend-up'
  | 'trend-down'
  | 'sparkles'
  | 'edit'
  | 'trash'
  | 'filter'
  | 'bolt'
  | 'bell'
  | 'robot'
  | 'film'
  | 'map'
  | 'rocket'
  | 'layers'
  | 'lock'
  | 'eye'
  | 'eye-off'
  | 'clock'
  | 'chart'
  | 'wand'
  | 'quote'
  | 'globe'
  | 'chevron-down'
  | 'image'
  | 'upload'
  | 'flow';

/**
 * Lightweight inline-SVG icon set (stroke-based, 24×24, currentColor) so the
 * app ships zero icon-font dependencies and icons inherit text color cleanly.
 */
@Component({
  selector: 'ge-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      [attr.stroke-width]="strokeWidth()"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      @switch (name()) {
        @case ('home') { <path d="M3 11.5 12 4l9 7.5" /><path d="M5 10v10h14V10" /> }
        @case ('grid') { <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /> }
        @case ('beaker') { <path d="M9 3h6" /><path d="M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 18l-5-9V3" /><path d="M7.5 14h9" /> }
        @case ('play') { <circle cx="12" cy="12" r="9" /><path d="M10 9l5 3-5 3z" /> }
        @case ('document') { <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /><path d="M9 13h6M9 17h6" /> }
        @case ('settings') { <circle cx="12" cy="12" r="3" /><path d="M19.4 13a7.5 7.5 0 0 0 0-2l2-1.5-2-3.4-2.3 1a7.5 7.5 0 0 0-1.7-1l-.4-2.6h-4l-.4 2.6a7.5 7.5 0 0 0-1.7 1l-2.3-1-2 3.4L4.6 11a7.5 7.5 0 0 0 0 2l-2 1.5 2 3.4 2.3-1a7.5 7.5 0 0 0 1.7 1l.4 2.6h4l.4-2.6a7.5 7.5 0 0 0 1.7-1l2.3 1 2-3.4z" /> }
        @case ('plus') { <path d="M12 5v14M5 12h14" /> }
        @case ('mail') { <rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /> }
        @case ('search') { <circle cx="11" cy="11" r="7" /><path d="m21 21-3.5-3.5" /> }
        @case ('menu') { <path d="M4 6h16M4 12h16M4 18h16" /> }
        @case ('presentation') { <rect x="3" y="4" width="18" height="12" rx="2" /><path d="M12 16v4M9 20h6M8 11l2.5-2.5L13 11l3-3.5" /> }
        @case ('close') { <path d="M6 6l12 12M18 6 6 18" /> }
        @case ('star') { <path d="m12 3 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z" /> }
        @case ('users') { <circle cx="9" cy="8" r="3.5" /><path d="M3 20a6 6 0 0 1 12 0" /><path d="M16 5.5a3.5 3.5 0 0 1 0 6.5M21 20a6 6 0 0 0-4-5.6" /> }
        @case ('arrow-right') { <path d="M5 12h14M13 6l6 6-6 6" /> }
        @case ('arrow-left') { <path d="M19 12H5M11 6l-6 6 6 6" /> }
        @case ('arrow-up-right') { <path d="M7 17 17 7M8 7h9v9" /> }
        @case ('external') { <path d="M14 4h6v6M20 4l-9 9" /><path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" /> }
        @case ('check') { <path d="m5 12 5 5L20 7" /> }
        @case ('trend-up') { <path d="M3 17l6-6 4 4 8-8" /><path d="M21 11V7h-4" /> }
        @case ('trend-down') { <path d="M3 7l6 6 4-4 8 8" /><path d="M21 13v4h-4" /> }
        @case ('sparkles') { <path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8z" /><path d="M18 15l.9 2.1L21 18l-2.1.9L18 21l-.9-2.1L15 18l2.1-.9z" /> }
        @case ('edit') { <path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /> }
        @case ('trash') { <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13h10l1-13" /> }
        @case ('filter') { <path d="M3 5h18l-7 8v6l-4 2v-8z" /> }
        @case ('bolt') { <path d="M13 2 4 14h7l-1 8 9-12h-7z" /> }
        @case ('bell') { <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M10.5 21a1.8 1.8 0 0 0 3 0" /> }
        @case ('robot') { <rect x="4" y="8" width="16" height="12" rx="3" /><path d="M12 8V4M9 4h6" /><circle cx="9" cy="14" r="1.3" /><circle cx="15" cy="14" r="1.3" /><path d="M2 13v3M22 13v3" /> }
        @case ('film') { <rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4" /> }
        @case ('map') { <path d="m9 4-6 2v14l6-2 6 2 6-2V4l-6 2z" /><path d="M9 4v14M15 6v14" /> }
        @case ('rocket') { <path d="M12 3c3.5 1.5 5.5 4.5 5.5 8 0 1.6-.4 3-1 4.2L12 19l-4.5-3.8C6.9 14 6.5 12.6 6.5 11c0-3.5 2-6.5 5.5-8z" /><circle cx="12" cy="10" r="1.6" /><path d="M9 18l-2 3M15 18l2 3" /> }
        @case ('layers') { <path d="m12 3 9 5-9 5-9-5z" /><path d="m3 13 9 5 9-5M3 16l9 5 9-5" /> }
        @case ('lock') { <rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /> }
        @case ('eye') { <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /> }
        @case ('eye-off') { <path d="M3 3l18 18" /><path d="M10.6 6.1A10.6 10.6 0 0 1 12 6c6.5 0 10 6 10 6a17 17 0 0 1-3.3 3.9M6.3 7.6A17 17 0 0 0 2 12s3.5 6 10 6a10 10 0 0 0 3.7-.7" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /> }
        @case ('clock') { <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /> }
        @case ('chart') { <path d="M4 4v16h16" /><rect x="7" y="11" width="3" height="6" rx="1" /><rect x="12.5" y="7" width="3" height="10" rx="1" /><rect x="18" y="13" width="0.1" height="4" /> }
        @case ('wand') { <path d="M15 4V2M15 10V8M11 6H9M21 6h-2M19 2l-1.5 1.5M11 10l-1.5 1.5" /><path d="M4 20l10-10 1.5 1.5L5.5 21.5z" /> }
        @case ('quote') { <path d="M7 7h4v6a4 4 0 0 1-4 4M14 7h4v6a4 4 0 0 1-4 4" /> }
        @case ('globe') { <circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /> }
        @case ('chevron-down') { <path d="m6 9 6 6 6-6" /> }
        @case ('image') { <rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9.5" r="1.5" /><path d="m4 18 5-5 4 4 3-3 4 4" /> }
        @case ('upload') { <path d="M12 16V4M8 8l4-4 4 4" /><path d="M5 16v3a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3" /> }
        @case ('flow') { <rect x="3" y="4" width="6" height="5" rx="1.5" /><rect x="15" y="15" width="6" height="5" rx="1.5" /><path d="M6 9v4a2 2 0 0 0 2 2h7" /> }
      }
    </svg>
  `
})
export class Icon {
  readonly name = input.required<IconName>();
  readonly size = input(20);
  readonly strokeWidth = input(1.8);
}
