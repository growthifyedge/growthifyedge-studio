import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { TechStackItem } from '../../../core/models/software.model';

@Component({
  selector: 'ge-tech-chip',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="ge-chip">
      @if (tech().icon) {
        <span aria-hidden="true">{{ tech().icon }}</span>
      }
      {{ tech().name }}
    </span>
  `
})
export class TechChip {
  readonly tech = input.required<TechStackItem>();
}
