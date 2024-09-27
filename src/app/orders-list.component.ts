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
import { ChipModule } from 'primeng/chip';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { from, map } from 'rxjs';
import { SupabaseService } from './supabase.service';

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [
    CardModule,
    CurrencyPipe,
    DropdownModule,
    FormsModule,
    InputNumberModule,
    ChipModule,
  ],
  template: `<div
      class=" p-4 fixed top-0 w-full bg-emerald-400 flex gap-4 items-center z-20"
    >
      <img src="/lykaos-logo.png" alt="Lykaos Logo" class="h-10" />
      <span class="text-slate-50 mb-0">Dia del amor y la amistad 2024</span>
    </div>
    <div class="p-4 mt-16 h-screen mb-12">
      <div class="flex flex-col gap-2">
        <p class="font-medium text-lg text-slate-700">Pedidos</p>
        <p>Total: {{ currentCount() }}</p>
        <div class="input-group">
          <p-dropdown
            [options]="groups() ?? []"
            optionLabel="name"
            optionValue="id"
            [(ngModel)]="selectedGroup"
            filter
            showClear
            placeholder="--Todos los grupos--"
          />
        </div>
        <div class="input-group mb-4">
          <p-inputNumber [(ngModel)]="orderId" placeholder="Buscar pedido" />
        </div>
      </div>
      <div class="flex flex-col gap-4">
        @for(order of filtered(); track order.id) { @if(!orderId() || order.id
        === orderId()) {
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
          } @if(order.receipt_url) {
          <p-chip label="Con comprobante" styleClass="success" />
          } @else {
          <p-chip styleClass="warning" label="Sin comprobante" />
          }
        </p-card>
        }}
      </div>
    </div> `,
  styles: `

  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersListComponent {
  private supabase = inject(SupabaseService);
  private router = inject(Router);
  selectedGroup = model<number>();
  orderId = model<number>();
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
        .order('id', { ascending: true })
    ).pipe(map(({ data }) => data))
  );

  filtered = computed(
    () =>
      this.orders()?.filter((x) =>
        this.selectedGroup() ? x.classroom_id === this.selectedGroup() : true
      ) ?? []
  );

  goToOrder(orderId: string) {
    this.router.navigate(['/order', orderId]);
  }
}
