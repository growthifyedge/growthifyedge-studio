import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Icon, IconName } from '../icon/icon';

export interface CategoryCardData {
  readonly label: string;
  readonly description: string;
  readonly icon: IconName;
  readonly count: number;
  readonly link: string;
  readonly queryParams?: Record<string, string>;
  readonly gradient: string;
}

@Component({
  selector: 'ge-category-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon],
  template: `
    <a
      [routerLink]="data().link"
      [queryParams]="data().queryParams"
      class="group ge-card ge-hover relative flex h-full flex-col overflow-hidden p-5"
    >
      <!-- decorative glow stays strictly behind the content -->
      <div
        class="pointer-events-none absolute -right-8 -top-8 z-0 h-28 w-28 rounded-full opacity-20 blur-2xl transition group-hover:opacity-40"
        [style.background]="data().gradient"
      ></div>

      <div class="relative z-10 flex h-full flex-col">
        <div
          class="grid h-12 w-12 place-items-center rounded-2xl text-white shadow-soft"
          [style.background]="data().gradient"
        >
          <ge-icon [name]="data().icon" [size]="22" />
        </div>
        <div class="mt-4 flex items-center justify-between gap-2">
          <h3 class="font-display text-base font-bold tracking-tight text-slate-900">
            {{ data().label }}
          </h3>
          <span class="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-500">
            {{ data().count }}
          </span>
        </div>
        <p class="mt-1 line-clamp-2 text-sm text-slate-500">{{ data().description }}</p>
        <span
          class="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-600 opacity-0 transition group-hover:opacity-100"
        >
          Explore <ge-icon name="arrow-right" [size]="14" />
        </span>
      </div>
    </a>
  `
})
export class CategoryCard {
  readonly data = input.required<CategoryCardData>();
}
