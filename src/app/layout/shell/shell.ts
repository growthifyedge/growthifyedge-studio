import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Sidebar } from '../sidebar/sidebar';
import { Topbar } from '../topbar/topbar';
import { PresentationService } from '../../core/services/presentation.service';

/**
 * Persistent application shell: dark sidebar + sticky topbar around a clean
 * white content area. Collapses to an off-canvas drawer on mobile and hides
 * its chrome entirely in Client Presentation Mode.
 */
@Component({
  selector: 'ge-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, Sidebar, Topbar],
  templateUrl: './shell.html'
})
export class Shell {
  protected readonly presentation = inject(PresentationService);
  protected readonly mobileOpen = signal(false);

  protected toggleMobile(): void {
    this.mobileOpen.update((v) => !v);
  }

  protected closeMobile(): void {
    this.mobileOpen.set(false);
  }
}
