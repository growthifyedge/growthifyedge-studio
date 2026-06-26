import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { Icon, IconName } from '../icon/icon';

@Component({
  selector: 'ge-empty-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  template: `
    <div
      class="ge-card-glass flex flex-col items-center justify-center gap-3 px-6 py-16 text-center"
    >
      <div class="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-500">
        <ge-icon [name]="icon()" [size]="26" />
      </div>
      <h3 class="text-base font-bold text-slate-800">{{ title() }}</h3>
      <p class="max-w-sm text-sm text-slate-500">{{ message() }}</p>
      <ng-content />
    </div>
  `
})
export class EmptyState {
  readonly icon = input<IconName>('search');
  readonly title = input.required<string>();
  readonly message = input('');
}
