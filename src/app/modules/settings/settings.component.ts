import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

interface SettingTabs {
  name: string,
  path: string,
  exact?: boolean | undefined,
  icon?: string
}

@Component({
  selector: 'settings',
  imports: [RouterOutlet, RouterLinkActive, RouterLink],
  templateUrl: './settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SettingsComponent {
  settingsTabs = signal<SettingTabs[]>([
    {
      name: 'General',
      path: '/dashboard/settings/general',
      exact: true
    },
    {
      name: 'Estados de Animo',
      path: '/dashboard/settings/mood-states',
    },
    {
      name: 'Categories',
      path: '/dashboard/settings/category',
    }
  ]);
}
