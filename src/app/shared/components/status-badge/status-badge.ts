import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { SoftwareStatus } from '../../../core/models/software.model';

@Component({
  selector: 'ge-status-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
      [class]="classes()"
    >
      <span class="h-1.5 w-1.5 rounded-full" [class]="dotClass()"></span>
      {{ status() }}
    </span>
  `
})
export class StatusBadge {
  readonly status = input.required<SoftwareStatus>();

  protected readonly classes = computed(() => {
    switch (this.status()) {
      case 'Live':
        return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200';
      case 'Beta':
        return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200';
      case 'In Development':
        return 'bg-brand-50 text-brand-700 ring-1 ring-brand-200';
      case 'Concept':
        return 'bg-violet-50 text-violet-700 ring-1 ring-violet-200';
      case 'Archived':
      default:
        return 'bg-slate-100 text-slate-500 ring-1 ring-slate-200';
    }
  });

  protected readonly dotClass = computed(() => {
    switch (this.status()) {
      case 'Live':
        return 'bg-emerald-500 animate-pulse';
      case 'Beta':
        return 'bg-amber-500';
      case 'In Development':
        return 'bg-brand-500';
      case 'Concept':
        return 'bg-violet-500';
      default:
        return 'bg-slate-400';
    }
  });
}
