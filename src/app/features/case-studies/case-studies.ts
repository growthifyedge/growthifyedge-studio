import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SoftwareService } from '../../core/services/software.service';
import { PageHeader } from '../../shared/components/page-header/page-header';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { Icon } from '../../shared/components/icon/icon';

@Component({
  selector: 'ge-case-studies',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, PageHeader, EmptyState, Icon],
  templateUrl: './case-studies.html'
})
export class CaseStudies {
  private readonly svc = inject(SoftwareService);

  protected readonly studies = this.svc.caseStudies;

  protected slugFor(softwareId: string): string {
    return this.svc.getById(softwareId)?.slug ?? '';
  }
}
