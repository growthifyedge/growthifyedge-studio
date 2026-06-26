import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { PresentationService } from '../../core/services/presentation.service';
import { Icon, IconName } from '../../shared/components/icon/icon';

interface NavItem {
  readonly label: string;
  readonly path: string;
  readonly icon: IconName;
  readonly exact?: boolean;
}

@Component({
  selector: 'ge-sidebar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, Icon],
  templateUrl: './sidebar.html'
})
export class Sidebar {
  readonly mobileOpen = input(false);
  readonly navigate = output<void>();

  private readonly router = inject(Router);
  protected readonly presentation = inject(PresentationService);

  protected readonly showcaseNav: readonly NavItem[] = [
    { label: 'Executive Dashboard', path: '/', icon: 'home', exact: true },
    { label: 'Software Gallery', path: '/gallery', icon: 'grid' },
    { label: 'AI Automation Gallery', path: '/automations', icon: 'robot' },
    { label: 'Mini Software Lab', path: '/lab', icon: 'beaker' },
    { label: 'Demo Theatre', path: '/theatre', icon: 'film' },
    { label: 'Case Studies', path: '/case-studies', icon: 'document' },
    { label: 'Roadmap', path: '/roadmap', icon: 'map' }
  ];

  protected readonly workspaceNav: readonly NavItem[] = [
    { label: 'Admin Studio', path: '/studio', icon: 'settings' },
    { label: 'Request a Demo', path: '/contact', icon: 'mail' }
  ];

  protected onNavigate(): void {
    this.navigate.emit();
  }

  protected startPresentation(): void {
    this.presentation.enter();
    this.router.navigate(['/present']);
    this.navigate.emit();
  }
}
