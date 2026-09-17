import { ChangeDetectionStrategy, Component, HostListener, Input, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ProjectInquiryModalService } from '../../core/services/project-inquiry-modal.service';

@Component({
  selector: 'ge-public-navbar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './public-navbar.html',
  styleUrl: './public-navbar.css'
})
export class PublicNavbar {
  @Input() homeOverlay = false;
  private readonly projectInquiry = inject(ProjectInquiryModalService);
  protected readonly mobileOpen = signal(false);
  protected readonly links = [
    { label: 'Home', path: '/' }, { label: 'Work', path: '/work' },
    { label: 'Capabilities', path: '/capabilities' }, { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' }
  ];

  protected toggleMobile(): void { this.mobileOpen.update((open) => !open); }
  protected closeMobile(): void { this.mobileOpen.set(false); }
  protected startProject(): void { this.projectInquiry.open(); this.closeMobile(); }

  @HostListener('document:keydown.escape')
  protected onEscape(): void { this.closeMobile(); }
}
