import { Component } from '@angular/core';
import { ModalOpenButtonComponent } from '../../shared/components/modal-open-button/modal-open-button.component';
import {
  EmergencyResourceTableComponent
} from './components/emergency-resource-table/emergency-resource-table.component';
import { ResourceStatsComponent } from './components/resource-stats/resource-stats.component';

@Component({
  selector: 'app-emergency-resource',
  templateUrl: './emergency-resource.component.html',
  imports: [
    ModalOpenButtonComponent,
    EmergencyResourceTableComponent,
    ResourceStatsComponent
  ]
})
export default class EmergencyResourceComponent {
}
