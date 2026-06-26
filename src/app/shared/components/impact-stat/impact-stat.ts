import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { BusinessImpactMetric } from '../../../core/models/software.model';
import { Icon } from '../icon/icon';

@Component({
  selector: 'ge-impact-stat',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  template: `
    <div class="ge-card-glass p-5">
      <div class="flex items-center justify-between">
        <span class="text-2xl" aria-hidden="true">{{ metric().icon || '📈' }}</span>
        @if (metric().trend && metric().trend !== 'neutral') {
          <span
            class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
            [class]="
              metric().trend === 'up'
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-rose-50 text-rose-600'
            "
          >
            <ge-icon [name]="metric().trend === 'up' ? 'trend-up' : 'trend-down'" [size]="13" />
            {{ metric().delta }}
          </span>
        }
      </div>
      <p class="mt-3 text-2xl font-extrabold tracking-tight text-slate-900">{{ metric().value }}</p>
      <p class="mt-0.5 text-sm text-slate-500">{{ metric().label }}</p>
    </div>
  `
})
export class ImpactStat {
  readonly metric = input.required<BusinessImpactMetric>();
}
