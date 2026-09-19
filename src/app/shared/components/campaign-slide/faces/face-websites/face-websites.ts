import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Campaign face 1 artwork: Websites & Software. Presentational only: no inputs, outputs or listeners; renders inside the cube's `.face-art` box. */
@Component({
  selector: 'ge-face-websites',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './face-websites.html',
  styleUrl: './face-websites.css'
})
export class FaceWebsites {}
