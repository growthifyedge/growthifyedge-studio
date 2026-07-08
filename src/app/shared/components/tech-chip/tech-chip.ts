import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';

import { TechStackItem } from '../../../core/models/software.model';
import { TechnologyService } from '../../../core/services/technology.service';

@Component({
  selector: 'ge-tech-chip',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="ge-chip">
      <span aria-hidden="true">{{ icon() }}</span>
      {{ tech().name }}
    </span>
  `
})
export class TechChip {
  readonly tech = input.required<TechStackItem>();

  private readonly techCatalog = inject(TechnologyService);
  protected readonly icon = computed(() => this.techCatalog.iconFor(this.tech()));
}
