import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Campaign face 3 artwork: Automation & AI. Presentational only: no inputs, outputs or listeners; renders inside the cube's `.face-art` box. */
@Component({
  selector: 'ge-face-automation',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './face-automation.html',
  styleUrl: './face-automation.css'
})
export class FaceAutomation {}
