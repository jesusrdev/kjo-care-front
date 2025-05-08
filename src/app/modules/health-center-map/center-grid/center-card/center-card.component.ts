import { Component, inject, input } from '@angular/core';
import { ModalOpenButtonComponent } from '../../../../shared/components/modal-open-button/modal-open-button.component';
import { HealthCenterService } from '../../../../core/services/health-center.service';
import { HealthCenterResponse } from '../../../../core/interfaces/health-center-http.interface';

@Component({
  selector: 'center-card',
  templateUrl: './center-card.component.html',
  imports: [
    ModalOpenButtonComponent
  ]
})
export class CenterCardComponent {
  centerService = inject(HealthCenterService);

  center = input.required<HealthCenterResponse>();
}
