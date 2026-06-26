import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'ge-page-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        @if (eyebrow()) {
          <p class="ge-eyebrow mb-1.5">{{ eyebrow() }}</p>
        }
        <h1 class="font-display text-2xl font-bold tracking-tightest text-slate-900 sm:text-[32px]">
          {{ title() }}
        </h1>
        @if (subtitle()) {
          <p class="mt-1.5 max-w-2xl text-sm text-slate-500">{{ subtitle() }}</p>
        }
      </div>
      <div class="flex shrink-0 items-center gap-2">
        <ng-content select="[actions]" />
      </div>
    </div>
  `
})
export class PageHeader {
  readonly title = input.required<string>();
  readonly subtitle = input<string>('');
  readonly eyebrow = input<string>('');
}
