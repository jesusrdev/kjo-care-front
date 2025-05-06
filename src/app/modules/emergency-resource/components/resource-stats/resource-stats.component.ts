import { Component, inject } from '@angular/core';
import { EmergencyResourceService } from '../../../../core/services/emergency-resource.service';
import { rxResource } from '@angular/core/rxjs-interop';

@Component({
  selector: 'resource-stats',
  templateUrl: './resource-stats.component.html',
  imports: []
})
export class ResourceStatsComponent {

  emergencyResourceService = inject(EmergencyResourceService);

  stats = rxResource({
    loader: () => this.emergencyResourceService.getStats()
  });

  reload() {
    this.stats.reload();
  }

}
