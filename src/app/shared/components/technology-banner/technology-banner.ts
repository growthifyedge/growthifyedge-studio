import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProjectInquiryModalService } from '../../../core/services/project-inquiry-modal.service';

@Component({
  selector: 'ge-technology-banner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './technology-banner.html',
  styleUrl: './technology-banner.css'
})
export class TechnologyBanner {
  private readonly projectInquiry = inject(ProjectInquiryModalService);

  protected openProjectInquiry(): void { this.projectInquiry.open(); }

  protected updateTilt(event: PointerEvent): void {
    const visual = event.currentTarget as HTMLElement | null;
    if (!visual || event.pointerType === 'touch') return;
    const bounds = visual.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    visual.style.setProperty('--tilt-x', `${-y * 3}deg`);
    visual.style.setProperty('--tilt-y', `${x * 4}deg`);
  }

  protected resetTilt(event: PointerEvent): void {
    const visual = event.currentTarget as HTMLElement | null;
    visual?.style.setProperty('--tilt-x', '0deg');
    visual?.style.setProperty('--tilt-y', '0deg');
  }
}
