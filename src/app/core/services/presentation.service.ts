import { Injectable, signal } from '@angular/core';

/**
 * Controls "Client Presentation Mode" — a distraction-free, full-bleed view
 * that hides the admin chrome and emphasizes featured work for live demos.
 */
@Injectable({ providedIn: 'root' })
export class PresentationService {
  readonly active = signal(false);

  toggle(): void {
    this.active.update((v) => !v);
  }

  enter(): void {
    this.active.set(true);
  }

  exit(): void {
    this.active.set(false);
  }
}
