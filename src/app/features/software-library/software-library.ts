import { ChangeDetectionStrategy, Component, effect, inject, input } from '@angular/core';

import { SoftwareService } from '../../core/services/software.service';
import { SoftwareCategory } from '../../core/models/software.model';
import { CATEGORY_OPTIONS } from '../../core/models/filters.model';
import { SoftwareCard } from '../../shared/components/software-card/software-card';
import { FilterBar } from '../../shared/components/filter-bar/filter-bar';
import { EmptyState } from '../../shared/components/empty-state/empty-state';

@Component({
  selector: 'ge-software-library',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SoftwareCard, FilterBar, EmptyState],
  templateUrl: './software-library.html'
})
export class SoftwareLibrary {
  /** Optional `?category=` query param, bound via withComponentInputBinding(). */
  readonly category = input<string>();

  protected readonly svc = inject(SoftwareService);
  protected readonly results = this.svc.filtered;
  protected readonly count = this.svc.resultCount;

  constructor() {
    effect(() => {
      const cat = this.category();
      if (cat && (CATEGORY_OPTIONS as readonly string[]).includes(cat)) {
        this.svc.patchFilters({ category: cat as SoftwareCategory });
      }
    });
  }
}
