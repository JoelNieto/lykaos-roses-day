import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  model,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { from, map } from 'rxjs';
import { SupabaseService } from './supabase.service';

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [CardModule, CurrencyPipe, DropdownModule, FormsModule],
  template: `<div
      class=" p-4 fixed top-0 w-full bg-emerald-400 flex gap-4 items-center z-20"
    >
      <img src="/lykaos-logo.png" alt="Lykaos Logo" class="h-10" />
      <span class="text-slate-50 mb-0">Dia del amor y la amistad 2024</span>
    </div>
    <div class="p-4 mt-16 h-screen mb-12">
      <div class="flex flex-col gap-2">
        <h2>Pedidos</h2>
        <p>Total: {{ currentCount() }}</p>
        <div class="input-group mb-4">
          <label for="group">Grupo</label>
          <p-dropdown
            [options]="groups() ?? []"
            optionLabel="name"
            optionValue="id"
            [(ngModel)]="selectedGroup"
            filter
            showClear
            placeholder="Todos"
          />
        </div>
      </div>
      <div class="flex flex-col gap-4">
        @for(order of orders(); track order.id) { @if(!selectedGroup() ||
        order.classroom_id === selectedGroup()) {

        <p-card header=" #{{ order.id }}" (click)="goToOrder(order.id)">
          <div class="flex flex-col gap-2">
            <p>Comprador: {{ order.name }}</p>
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
          @if(order.delivered) {
          <p class="text-green-600">Entregado</p>
          } @else {
          <p class="text-slate-500">Por entregar</p>
          }
        </p-card>
        } }
      </div>
    </div> `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersListComponent {
  private supabase = inject(SupabaseService);
  private router = inject(Router);
  selectedGroup = model<number>();
  groups = toSignal(
    from(this.supabase.client.from('classrooms').select('*')).pipe(
      map(({ data }) => data)
    )
  );

  currentCount = computed(
    () =>
      this.orders()?.filter((o) =>
        this.selectedGroup() ? this.selectedGroup() === o.classroom_id : true
      ).length ?? 0
  );
  orders = toSignal(
    from(
      this.supabase.client
        .from('orders')
        .select(
          '*, classroom:classrooms(*), items:order_items(*, item:items(*))'
        )
    ).pipe(map(({ data }) => data))
  );

  goToOrder(orderId: string) {
    this.router.navigate(['/order', orderId]);
  }
}
