import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CardModule } from 'primeng/card';
import { from, map } from 'rxjs';
import { SupabaseService } from './supabase.service';

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [CardModule, CurrencyPipe],
  template: `<div class="p-4">
    <div class="flex flex-col gap-4">
      @for(order of orders(); track order.id) {
      <p-card [header]="order.receiver">
        <div class="flex flex-col gap-2">
          <p>
            Total: {{ order.amount | currency }} | Para: {{ order.receiver }}
          </p>
          <p>Grupo: {{ order.classroom?.name }}</p>
          <div class="flex flex-col gap-2">
            @for(item of order.items; track $index) {
            <p>{{ item.quantity }}x {{ item.item.name }}</p>
            }
          </div>
        </div>
      </p-card>
      }
    </div>
  </div> `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersListComponent {
  private supabase = inject(SupabaseService);
  orders = toSignal(
    from(
      this.supabase.client
        .from('orders')
        .select(
          '*, classroom:classrooms(*), items:order_items(*, item:items(*))'
        )
    ).pipe(map(({ data }) => data))
  );
}
