import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { SoftwareService } from '../../../core/services/software.service';
import {
  CATEGORY_OPTIONS,
  SORT_OPTIONS,
  STATUS_OPTIONS
} from '../../../core/models/filters.model';
import { Icon } from '../icon/icon';

/**
 * Category pills + status / technology / sort selects + featured toggle, bound
 * directly to the shared `SoftwareService.filters` signal so it stays in sync
 * with the topbar search.
 */
@Component({
  selector: 'ge-filter-bar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  templateUrl: './filter-bar.html'
})
export class FilterBar {
  protected readonly svc = inject(SoftwareService);

  protected readonly categories = CATEGORY_OPTIONS;
  protected readonly statuses = STATUS_OPTIONS;
  protected readonly sorts = SORT_OPTIONS;
  protected readonly techs = this.svc.technologies;

  protected get filters() {
    return this.svc.filters();
  }

  protected setCategory(category: (typeof CATEGORY_OPTIONS)[number]): void {
    this.svc.patchFilters({ category });
  }

  protected setStatus(value: string): void {
    this.svc.patchFilters({ status: value as (typeof STATUS_OPTIONS)[number] });
  }

  protected setTech(value: string): void {
    this.svc.patchFilters({ tech: value });
  }

  protected setSort(value: string): void {
    this.svc.patchFilters({ sort: value as (typeof SORT_OPTIONS)[number]['value'] });
  }

  protected toggleFeatured(): void {
    this.svc.patchFilters({ featuredOnly: !this.filters.featuredOnly });
  }

  protected reset(): void {
    this.svc.resetFilters();
  }
}
