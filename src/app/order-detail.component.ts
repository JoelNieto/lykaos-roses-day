import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  Injector,
  input,
  OnInit,
  Signal,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { from, map } from 'rxjs';
import { Order } from './model';
import { SupabaseService } from './supabase.service';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [
    ButtonModule,
    RouterLink,
    CurrencyPipe,
    ConfirmDialogModule,
    ToastModule,
  ],
  providers: [ConfirmationService, MessageService],
  template: `<p-confirmDialog />
    <p-toast />
    <div class="p-4 h-screen mb-12 flex justify-center items-center">
      <div class="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
        <h2 class="text-2xl font-bold mb-4">Pedido #{{ order()?.id }}</h2>
        <div class="mb-4">
          <p class="text-lg">
            <span class="font-semibold">Total:</span>
            {{ order()?.amount | currency }}
          </p>
          <p class="text-lg">
            <span class="font-semibold">Para:</span> {{ order()?.receiver }}
          </p>
          <p class="text-lg">
            <span class="font-semibold">Grupo:</span>
            {{ order()?.classroom?.name }}
          </p>
          <p class="text-lg">
            <span class="font-semibold">Dedicatoria:</span>
            {{ order()?.message }}
          </p>
        </div>
        <div class="mb-4">
          <p class="text-lg font-semibold">Items:</p>
          <div class="flex flex-col gap-2">
            @for(item of order()?.items ?? []; track $index) {
            <p>{{ item.quantity }}x {{ item.item.name }}</p>
            }
          </div>
        </div>
        <div class="mb-4">
          <p class="text-lg font-semibold">Comprobante</p>
          @if(receiptUrl()) {
          <img
            [src]="receiptUrl()"
            alt="Comprobante"
            class="w-full h-auto rounded-md"
          />
          } @else {
          <p class="text-red-500">Sin comprobante</p>
          }
        </div>
        <div class="flex justify-center mb-4">
          <a
            routerLink="/orders-list"
            class="p-button font-bold p-button-secondary p-button-outlined"
            >Volver</a
          >
        </div>
        @if(!order()?.delivered) {
        <div class="flex justify-center text-center mb-4">
          <p-button
            label="Marcar como entregado"
            (onClick)="markAsDelivered()"
          />
        </div>
        } @else {
        <p class="text-green-500 font-semibold">Entregado</p>
        }
        <div class="flex justify-center">
          <img class="h-36 w-36" src="/lykaos-logo.png" alt="Lykaos Logo" />
        </div>
      </div>
    </div> `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderDetailComponent implements OnInit {
  private supabase = inject(SupabaseService);
  private injector = inject(Injector);
  private dom = inject(DomSanitizer);
  private confirmationService = inject(ConfirmationService);
  public orderId = input.required();
  protected receiptUrl = signal<SafeResourceUrl | undefined>(undefined);
  order: Signal<Order | undefined> = signal(undefined);
  private messageService = inject(MessageService);

  ngOnInit(): void {
    this.loadOrder();
    effect(
      () => {
        const receiptUrl = this.order()?.receipt_url;
        if (typeof receiptUrl === 'string') {
          this.downloadImage(receiptUrl);
        }
      },
      { injector: this.injector }
    );
  }

  loadOrder() {
    this.order = toSignal(
      from(
        this.supabase.client
          .from('orders')
          .select(
            '*, classroom:classrooms(*), items:order_items(*, item:items(*))'
          )
          .eq('id', this.orderId())
          .single()
      ).pipe(map(({ data }) => data)),
      { injector: this.injector }
    );
  }

  async downloadImage(path: string) {
    try {
      const { data } = await this.supabase.downloadFile(path);
      if (data instanceof Blob) {
        this.receiptUrl.set(
          this.dom.bypassSecurityTrustResourceUrl(URL.createObjectURL(data))
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error downloading image: ', error.message);
      }
    }
  }

  async markAsDelivered() {
    this.confirmationService.confirm({
      header: 'Pedido entregado',
      message: '¿Estás seguro de marcar este pedido como entregado?',
      rejectButtonStyleClass: 'p-button-text',
      rejectLabel: 'Cancelar',
      acceptLabel: 'Aceptar',
      accept: async () => {
        const { error } = await this.supabase.client
          .from('orders')
          .update({ delivered: true })
          .eq('id', this.orderId());

        if (error) {
          console.error('Error marking order as delivered: ', error.message);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al marcar el pedido como entregado',
          });
          return;
        }
        this.messageService.add({
          severity: 'success',
          summary: 'Pedido entregado',
          detail: 'El pedido ha sido marcado como entregado',
        });
        this.loadOrder();
      },
    });
  }
}
