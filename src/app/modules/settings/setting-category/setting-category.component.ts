import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CategoryTableComponent } from '../components/category-table/category-table.component';

@Component({
  selector: 'setting-category',
  templateUrl: './setting-category.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CategoryTableComponent
  ]
})
export default class SettingCategoryComponent {
}
