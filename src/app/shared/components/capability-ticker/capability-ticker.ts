import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ge-capability-ticker',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './capability-ticker.html',
  styleUrl: './capability-ticker.css'
})
export class CapabilityTicker {
  protected readonly capabilities = [
    'Web Development', 'App Development', 'Custom Software', 'AI Automation', 'Business Dashboards'
  ];
}
