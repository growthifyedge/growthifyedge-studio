import {
  DestroyRef,
  Directive,
  ElementRef,
  afterNextRender,
  inject
} from '@angular/core';
import { DOCUMENT } from '@angular/common';

/**
 * Teleports its host element to <body> on render and removes it on destroy,
 * while locking background scroll.
 *
 * Why: a `position: fixed` overlay is sized relative to the nearest ancestor
 * that has a `transform`/`filter` (e.g. the page's fade-in wrapper) instead of
 * the viewport — which traps the overlay in a tall box and pushes its content
 * down behind an empty band. Portalling the overlay to <body> guarantees it
 * always covers the real viewport. (The video modal uses the same approach
 * inline; this directive shares it with the screenshot lightbox and the admin
 * preview modal.)
 */
@Directive({
  selector: '[geOverlayPortal]',
  standalone: true
})
export class OverlayPortal {
  private readonly host = inject(ElementRef).nativeElement as HTMLElement;
  private readonly doc = inject(DOCUMENT);

  constructor() {
    const body = this.doc.body;
    const previousOverflow = body.style.overflow;

    afterNextRender(() => {
      body.appendChild(this.host);
      body.style.overflow = 'hidden';
    });

    inject(DestroyRef).onDestroy(() => {
      body.style.overflow = previousOverflow;
      this.host.remove();
    });
  }
}
