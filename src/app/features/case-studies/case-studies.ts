import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SoftwareService } from '../../core/services/software.service';
import { TestimonialService } from '../../core/services/testimonial.service';
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
  private readonly testimonialSvc = inject(TestimonialService);

  protected readonly studies = this.svc.caseStudies;
  protected readonly testimonials = this.testimonialSvc.featured;

  protected slugFor(softwareId: string): string {
    return this.svc.getById(softwareId)?.slug ?? '';
  }

  protected stars(n: number): readonly number[] {
    return Array.from({ length: Math.max(1, Math.min(5, n)) });
  }
}
