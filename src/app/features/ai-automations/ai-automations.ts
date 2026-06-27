import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { SoftwareService } from '../../core/services/software.service';
import { SoftwareCard } from '../../shared/components/software-card/software-card';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { Icon } from '../../shared/components/icon/icon';

@Component({
  selector: 'ge-ai-automations',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SoftwareCard, EmptyState, Icon],
  templateUrl: './ai-automations.html'
})
export class AiAutomations {
  private readonly svc = inject(SoftwareService);

  protected readonly items = computed(() =>
    this.svc
      .visibleSoftware()
      .filter((s) => s.category === 'Automation' || s.category === 'AI Tool')
      .sort((a, b) => b.impactScore - a.impactScore)
  );

  protected readonly hoursSaved = computed(() =>
    this.items().reduce((sum, s) => {
      const m = /(\d+)/.exec(s.timeSaved);
      return sum + (m ? Number(m[1]) : 0);
    }, 0)
  );
}
