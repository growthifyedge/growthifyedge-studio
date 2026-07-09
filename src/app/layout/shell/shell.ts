import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs/operators';

import { Sidebar } from '../sidebar/sidebar';
import { Topbar } from '../topbar/topbar';

/**
 * Persistent application shell: dark sidebar + sticky topbar around a clean
 * white content area. Collapses to an off-canvas drawer on mobile and hides
 * its chrome entirely in Client Presentation Mode.
 *
 * Chrome visibility is derived from the CURRENT ROUTE (not a mutable flag), so
 * it can never desync: only the full-bleed presentation routes (`/present` and
 * `/present/:slug`) hide the navigation. Every other page — public, login and
 * admin — always shows it, regardless of how the user arrived (link, Back
 * button, mobile back gesture, etc.).
 */
@Component({
  selector: 'ge-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, Sidebar, Topbar],
  templateUrl: './shell.html'
})
export class Shell {
  private readonly router = inject(Router);
  protected readonly mobileOpen = signal(false);

  /** True only on the full-bleed presentation routes — drives chrome-less layout. */
  protected readonly chromeless = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => this.isPresentationUrl(e.urlAfterRedirects))
    ),
    { initialValue: this.isPresentationUrl(this.router.url) }
  );

  protected toggleMobile(): void {
    this.mobileOpen.update((v) => !v);
  }

  protected closeMobile(): void {
    this.mobileOpen.set(false);
  }

  /** `/present` and `/present/:slug` are the only chrome-less routes. */
  private isPresentationUrl(url: string): boolean {
    const path = url.split('#')[0].split('?')[0];
    return path === '/present' || path.startsWith('/present/');
  }
}
