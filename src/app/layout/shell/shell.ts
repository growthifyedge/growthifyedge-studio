import { ChangeDetectionStrategy, Component, afterNextRender, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs/operators';

import { Sidebar } from '../sidebar/sidebar';
import { Topbar } from '../topbar/topbar';
import { ProjectInquiryModal } from '../../shared/components/project-inquiry-modal/project-inquiry-modal';
import { AuthService } from '../../core/services/auth.service';
import { ProjectInquiryModalService } from '../../core/services/project-inquiry-modal.service';
import { PublicNavbar } from '../public-navbar/public-navbar';

/**
 * Persistent application shell: dark sidebar + sticky topbar around a clean
 * white content area. Collapses to an off-canvas drawer on mobile and hides
 * its chrome entirely in Client Presentation Mode.
 *
 * Chrome visibility is derived from the CURRENT ROUTE (not a mutable flag), so
 * it can never desync: only the full-bleed presentation routes (`/present` and
 * `/present/:slug`) hide the navigation. Public portfolio routes also omit the
 * workspace topbar, while login and admin routes retain their controls.
 */
@Component({
  selector: 'ge-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, Sidebar, Topbar, ProjectInquiryModal, PublicNavbar],
  templateUrl: './shell.html'
})
export class Shell {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly projectInquiry = inject(ProjectInquiryModalService);
  protected readonly mobileOpen = signal(false);
  protected readonly projectModalOpen = this.projectInquiry.isOpen;
  private popupTimer: ReturnType<typeof setTimeout> | undefined;

  /** True only on the full-bleed presentation routes — drives chrome-less layout. */
  protected readonly chromeless = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => this.isPresentationUrl(e.urlAfterRedirects))
    ),
    { initialValue: this.isPresentationUrl(this.router.url) }
  );

  /** Public portfolio routes have their own full-width website shell. */
  protected readonly publicLayout = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => this.isPublicPortfolioUrl(e.urlAfterRedirects))
    ),
    { initialValue: this.isPublicPortfolioUrl(this.router.url) }
  );

  /** The campaign canvas is only overlaid by the navbar on the public Home route. */
  protected readonly homeRoute = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => this.isHomeUrl(e.urlAfterRedirects))
    ),
    { initialValue: this.isHomeUrl(this.router.url) }
  );

  constructor() {
    afterNextRender(() => this.scheduleProjectModal(this.router.url));
    this.router.events.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd)).subscribe((e) =>
      this.scheduleProjectModal(e.urlAfterRedirects)
    );
  }

  protected toggleMobile(): void {
    this.mobileOpen.update((v) => !v);
  }

  protected closeMobile(): void {
    this.mobileOpen.set(false);
  }

  protected markProjectModalSeen(): void {
    this.projectInquiry.close();
    this.persistProjectModalSeen();
  }

  protected markProjectModalSubmitted(): void {
    this.persistProjectModalSeen();
  }

  private scheduleProjectModal(url: string): void {
    if (this.popupTimer) clearTimeout(this.popupTimer);
    this.projectInquiry.close();
    if (!this.isEligibleForProjectModal(url) || this.projectModalSeen()) return;
    this.popupTimer = setTimeout(() => this.projectInquiry.open(), 2500);
  }

  private isEligibleForProjectModal(url: string): boolean {
    const path = url.split('#')[0].split('?')[0];
    return path === '/' && !this.auth.isAuthenticated();
  }

  private projectModalSeen(): boolean {
    try { return localStorage.getItem('growthifyedge_project_modal_seen') === 'true'; } catch { return true; }
  }

  private persistProjectModalSeen(): void {
    try { localStorage.setItem('growthifyedge_project_modal_seen', 'true'); } catch { /* privacy mode */ }
  }

  /** `/present` and `/present/:slug` are the only chrome-less routes. */
  private isPresentationUrl(url: string): boolean {
    const path = url.split('#')[0].split('?')[0];
    return path === '/present' || path.startsWith('/present/');
  }

  private isPublicPortfolioUrl(url: string): boolean {
    const path = url.split('#')[0].split('?')[0];
    return path === '/' || path === '/work' || path === '/capabilities' || path === '/about' || path === '/contact';
  }

  private isHomeUrl(url: string): boolean {
    return url.split('#')[0].split('?')[0] === '/';
  }
}
