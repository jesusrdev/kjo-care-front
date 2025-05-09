import { Component, inject, input } from '@angular/core';

import {
  ModalOpenButtonComponent
} from '../../../../../shared/components/modal-open-button/modal-open-button.component';
import { BlogService } from '../../../../../core/services/blog.service';
import { BlogResponse } from '../../../../../core/interfaces/blog-http.interface';
import { HealthCenterService } from '../../../../../core/services/health-center.service';
import { HealthCenterResponse } from '../../../../../core/interfaces/health-center-http.interface';

@Component({
  selector: 'center-card-options-button',
  templateUrl: './options-button.component.html',
  imports: [
    ModalOpenButtonComponent
  ]
})
export class OptionsButtonComponent {
  centerService = inject(HealthCenterService);

  center = input.required<HealthCenterResponse>();
}
