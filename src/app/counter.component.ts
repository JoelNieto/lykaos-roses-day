import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-counter',
  standalone: true,
  imports: [ButtonModule],
  template: `<div class="flex items-center">
    <p-button
      (click)="subtract()"
      rounded
      outlined
      icon="pi pi-minus"
      [disabled]="count() === 0"
    />
    <span class="mx-4">{{ count() }}</span>
    <p-button (click)="add()" rounded outlined icon="pi pi-plus" />
  </div>`,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CounterComponent {
  count = model(0);
  add() {
    this.count.update((current) => current + 1);
  }

  subtract() {
    this.count.update((current) => current - 1);
  }
}
