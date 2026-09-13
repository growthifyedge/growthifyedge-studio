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
    { label: 'Home', path: '/', icon: 'home', exact: true },
    { label: 'Work', path: '/work', icon: 'grid' },
    { label: 'Capabilities', path: '/capabilities', icon: 'bolt' },
    { label: 'About', path: '/about', icon: 'users' },
    { label: 'Contact', path: '/contact', icon: 'mail' }
  ];

  protected readonly workspaceNav: readonly NavItem[] = [
    { label: 'Admin Studio', path: '/admin/projects', icon: 'settings' }
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
