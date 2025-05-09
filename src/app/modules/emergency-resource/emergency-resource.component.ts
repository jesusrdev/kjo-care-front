import { Component, inject } from '@angular/core';
import { ModalOpenButtonComponent } from '../../shared/components/modal-open-button/modal-open-button.component';
import {
  EmergencyResourceTableComponent
} from './components/emergency-resource-table/emergency-resource-table.component';
import { ResourceStatsComponent } from './components/resource-stats/resource-stats.component';
import { EmergencyResourceService } from '../../core/services/emergency-resource.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { ResourceDetailComponent } from './components/resource-detail/resource-detail.component';
import { DialogComponent } from '../../shared/components/dialog/dialog.component';
import {
  EmergencyResourceModalComponent
} from './components/emergency-resource-modal/emergency-resource-modal.component';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-emergency-resource',
  templateUrl: './emergency-resource.component.html',
  imports: [
    ModalOpenButtonComponent,
    EmergencyResourceTableComponent,
    ResourceStatsComponent,
    ResourceDetailComponent,
    DialogComponent,
    EmergencyResourceModalComponent
  ]
})
export default class EmergencyResourceComponent {
  resourceService = inject(EmergencyResourceService);
  toastService = inject(ToastService);

  resources = rxResource({
    loader: () => this.resourceService.getAll()
  });

  stats = rxResource({
    loader: () => this.resourceService.getStats()
  });

  reload() {
    this.resources.reload();
    this.stats.reload();
  }

  deleteResource() {
    this.resourceService.delete(this.resourceService.selectedResource().id).subscribe({
      next: () => {
        this.toastService.addToast({
          message: 'Resource deleted successfully',
          type: 'success',
          duration: 4000
        });

        this.reload();
      },
      error: (error) => {
        this.toastService.addToast({
          message: 'Error deleting resource',
          type: 'error',
          duration: 4000
        });
      }
    });
  }

  clearSelectedResource() {
    this.resourceService.selectedResource.set({
      id: 0,
      user: {
        id: '',
        username: '',
        firstName: '',
        lastName: ''
      },
      name: '',
      description: '',
      resourceUrl: '',
      contacts: [],
      links: [],
      status: '',
      accessCount: 0,
      createdDate: '',
      modifiedDate: ''
    });
  }
}
