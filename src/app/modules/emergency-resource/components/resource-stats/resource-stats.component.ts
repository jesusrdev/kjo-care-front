import { Component, inject, input, ResourceRef } from '@angular/core';
import { EmergencyResourceService } from '../../../../core/services/emergency-resource.service';
import { EmergencyResourceStats } from '../../../../core/interfaces/emergency-resource-http.interface';

@Component({
  selector: 'resource-stats',
  templateUrl: './resource-stats.component.html',
  imports: []
})
export class ResourceStatsComponent {

  emergencyResourceService = inject(EmergencyResourceService);

  stats = input.required<ResourceRef<EmergencyResourceStats | undefined>>();

  reload() {
    this.stats().reload();
  }

}
