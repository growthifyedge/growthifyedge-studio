import { Injectable, signal } from '@angular/core';

/** Coordinates explicit openings of the reusable project-inquiry modal. */
@Injectable({ providedIn: 'root' })
export class ProjectInquiryModalService {
  readonly isOpen = signal(false);

  open(): void { this.isOpen.set(true); }
  close(): void { this.isOpen.set(false); }
}
