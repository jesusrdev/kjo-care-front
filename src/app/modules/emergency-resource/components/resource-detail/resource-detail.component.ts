import { Component, computed, inject } from '@angular/core';
import { ModalOpenButtonComponent } from '../../../../shared/components/modal-open-button/modal-open-button.component';
import { EmergencyResourceService } from '../../../../core/services/emergency-resource.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'resource-detail',
  templateUrl: './resource-detail.component.html',
  imports: [
    ModalOpenButtonComponent,
    DatePipe
  ]
})
export class ResourceDetailComponent {
  resourceService = inject(EmergencyResourceService);

  resource = computed(() => this.resourceService.selectedResource());

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }
}
