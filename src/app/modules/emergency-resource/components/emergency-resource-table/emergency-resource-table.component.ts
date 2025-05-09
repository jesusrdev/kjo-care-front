import { Component, computed, inject, input, ResourceRef, signal } from '@angular/core';
import { ModalOpenButtonComponent } from '../../../../shared/components/modal-open-button/modal-open-button.component';
import { EmergencyResourceService } from '../../../../core/services/emergency-resource.service';
import { EmergencyResourceResponse } from '../../../../core/interfaces/emergency-resource-http.interface';

@Component({
  selector: 'emergency-resource-table',
  templateUrl: './emergency-resource-table.component.html',
  imports: [
    ModalOpenButtonComponent
  ]
})
export class EmergencyResourceTableComponent {
  resourceService = inject(EmergencyResourceService);

  search = signal('');
  orderBy = signal('newest');

  filteredResources = computed<EmergencyResourceResponse[]>(() => {
    let temporal = this.resources().value() ?? [];
    const orderBy = this.orderBy();

    if (orderBy === 'newest') {
      temporal = temporal.sort((a, b) => b.createdDate.localeCompare(a.createdDate));
    } else if (orderBy === 'oldest') {
      temporal = temporal.sort((a, b) => a.createdDate.localeCompare(b.createdDate));
    } else if (orderBy === '+access') {
      temporal = temporal.sort((a, b) => b.accessCount - a.accessCount);
    } else if (orderBy === '-access') {
      temporal = temporal.sort((a, b) => a.accessCount - b.accessCount);
    }

    if (this.search().length > 0) {
      temporal = temporal.filter(resource => resource.name.toLowerCase().includes(this.search().toLowerCase()));
    }

    return temporal;
  });

  resources = input.required<ResourceRef<EmergencyResourceResponse[] | undefined>>();

  reload() {
    this.resources().reload();
  }
}
