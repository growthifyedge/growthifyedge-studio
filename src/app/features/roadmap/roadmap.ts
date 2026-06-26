import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { SoftwareService } from '../../core/services/software.service';
import { RoadmapItem, RoadmapStatus } from '../../core/models/software.model';
import { PageHeader } from '../../shared/components/page-header/page-header';
import { Icon } from '../../shared/components/icon/icon';

interface QuarterGroup {
  readonly quarter: string;
  readonly items: readonly RoadmapItem[];
}

@Component({
  selector: 'ge-roadmap',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeader, Icon],
  templateUrl: './roadmap.html'
})
export class Roadmap {
  private readonly svc = inject(SoftwareService);

  protected readonly groups = computed<readonly QuarterGroup[]>(() => {
    const map = new Map<string, RoadmapItem[]>();
    for (const item of this.svc.roadmap()) {
      (map.get(item.quarter) ?? map.set(item.quarter, []).get(item.quarter)!).push(item);
    }
    return [...map.entries()]
      .map(([quarter, items]) => ({ quarter, items }))
      .sort((a, b) => this.order(a.quarter) - this.order(b.quarter));
  });

  protected readonly counts = computed(() => {
    const all = this.svc.roadmap();
    const by = (s: RoadmapStatus) => all.filter((i) => i.status === s).length;
    return { shipped: by('Shipped'), progress: by('In Progress'), planned: by('Planned'), exploring: by('Exploring') };
  });

  protected statusClass(status: RoadmapStatus): string {
    switch (status) {
      case 'Shipped':
        return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
      case 'In Progress':
        return 'bg-brand-50 text-brand-700 ring-brand-200';
      case 'Planned':
        return 'bg-amber-50 text-amber-700 ring-amber-200';
      case 'Exploring':
      default:
        return 'bg-violet-50 text-violet-700 ring-violet-200';
    }
  }

  private order(quarter: string): number {
    const m = /Q(\d)\s+(\d{4})/.exec(quarter);
    if (!m) return 0;
    return Number(m[2]) * 10 + Number(m[1]);
  }
}
