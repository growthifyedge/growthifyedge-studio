import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Campaign face 2 artwork: Apps & Dashboards. Presentational only: no inputs, outputs or listeners; renders inside the cube's `.face-art` box. */
@Component({
  selector: 'ge-face-apps',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './face-apps.html',
  styleUrl: './face-apps.css'
})
export class FaceApps {}
