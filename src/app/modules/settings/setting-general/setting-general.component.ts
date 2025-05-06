import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

@Component({
  selector: 'setting-general',
  imports: [],
  templateUrl: './setting-general.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SettingGeneralComponent {
  readonly name = signal('KJO Mind Care - Dashboard');
  readonly description = signal('A comprehensive dashboard for managing health microservices, mood tracking, and blog content.');
  readonly isInMaintenance = signal(false);
}
