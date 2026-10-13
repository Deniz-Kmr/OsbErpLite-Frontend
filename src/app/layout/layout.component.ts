import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { SidebarComponent } from './sidebar/sidebar.component';
import { TopbarComponent } from './topbar/topbar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent],
  templateUrl: './layout.component.html',
  host: {
    '(document:keydown.escape)': 'sidebarOpen.set(false)',
  },
})
export class LayoutComponent {
  readonly sidebarOpen = signal(false);
}
