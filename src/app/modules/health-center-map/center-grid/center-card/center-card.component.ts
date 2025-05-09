import { Component, inject, input } from '@angular/core';
import { ModalOpenButtonComponent } from '../../../../shared/components/modal-open-button/modal-open-button.component';
import { HealthCenterService } from '../../../../core/services/health-center.service';
import { HealthCenterResponse } from '../../../../core/interfaces/health-center-http.interface';
import { OptionsButtonComponent } from './options-button/options-button.component';

@Component({
  selector: 'center-card',
  templateUrl: './center-card.component.html',
  imports: [
    ModalOpenButtonComponent,
    OptionsButtonComponent
  ]
})
export class CenterCardComponent {
  centerService = inject(HealthCenterService);

  center = input.required<HealthCenterResponse>();
}
