import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Injector,
  input,
  OnInit,
  signal,
  Signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { from, map } from 'rxjs';
import { Order } from './model';
import { SupabaseService } from './supabase.service';

@Component({
  selector: 'app-receipt',
  standalone: true,
  imports: [CurrencyPipe, RouterLink],
  template: `<div class="p-8 flex flex-col items-center text-center gap-4">
    <img src="/lykaos-logo.png" alt="Lykaos Logo" />
    <p class="font-semibold text-2xl"># de Pedido {{ order()?.id }}</p>
    <p>Total: {{ order()?.amount | currency }}</p>
    <p>Para: {{ order()?.receiver }}</p>
    <p>Grupo: {{ order()?.classroom?.name }}</p>
    <p>Agrege # de pedido en los comentario de la transferencia</p>
    <p class="font-semibold">Transferencia a:</p>
    <p class=" text-indigo-600">Yappy: 6256-7174</p>
    <p>Cuenta de ahorros Banco General</p>
    <p class=" text-indigo-600">04-96-97-915604-5</p>
    <i class="pi pi-check-circle" style="font-size: 3.5rem; color: green"></i>
    <a routerLink="/" class="p-button font-bold"> Volver </a>
  </div>`,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReceiptComponent implements OnInit {
  private supabase = inject(SupabaseService);
  private injector = inject(Injector);
  public orderId = input.required();
  order: Signal<Order | undefined> = signal(undefined);

  ngOnInit(): void {
    this.order = toSignal(
      from(
        this.supabase.client
          .from('orders')
          .select('*, items(*), classroom:classrooms(*), order_items(*)')
          .eq('id', this.orderId())
          .single()
      ).pipe(map(({ data }) => data)),
      { injector: this.injector }
    );
  }
}
