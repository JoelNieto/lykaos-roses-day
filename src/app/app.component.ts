import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterModule],
  selector: 'app-root',
  template: `<router-outlet />`,
  styles: ``,
})
export class AppComponent {
  title = 'lykaos-roses-day';
}
