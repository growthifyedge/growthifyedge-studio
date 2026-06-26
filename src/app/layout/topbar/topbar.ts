import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  output
} from '@angular/core';
import { Router } from '@angular/router';

import { Icon } from '../../shared/components/icon/icon';
import { SoftwareService } from '../../core/services/software.service';
import { PresentationService } from '../../core/services/presentation.service';

@Component({
  selector: 'ge-topbar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  templateUrl: './topbar.html'
})
export class Topbar {
  readonly toggleMenu = output<void>();

  private readonly software = inject(SoftwareService);
  private readonly router = inject(Router);
  protected readonly presentation = inject(PresentationService);

  protected readonly searchTerm = computed(() => this.software.filters().search);

  protected onSearch(value: string): void {
    this.software.patchFilters({ search: value });
    if (value.trim() && !this.router.url.startsWith('/gallery')) {
      this.router.navigate(['/gallery']);
    }
  }

  protected startPresentation(): void {
    this.presentation.enter();
    this.router.navigate(['/present']);
  }
}
