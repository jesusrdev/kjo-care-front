import { Component, input } from '@angular/core';
import { HealthCenterResponse } from '../../../core/interfaces/health-center-http.interface';
import { CenterCardComponent } from './center-card/center-card.component';

@Component({
  selector: '©center-grid',
  templateUrl: './center-grid.component.html',
  imports: [
    CenterCardComponent
  ]
})
export class CenterGridComponent {

  centers = input.required<HealthCenterResponse[]>();
}
