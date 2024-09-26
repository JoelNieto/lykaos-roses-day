import { CurrencyPipe, JsonPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  model,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ToastModule } from 'primeng/toast';
import { from, map } from 'rxjs';
import { CounterComponent } from './counter.component';
import { SupabaseService } from './supabase.service';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [
    CardModule,
    CurrencyPipe,
    CounterComponent,
    JsonPipe,
    ButtonModule,
    InputTextModule,
    FormsModule,
    ConfirmDialogModule,
    ToastModule,
    InputTextareaModule,
    DropdownModule,
  ],
  providers: [ConfirmationService, MessageService],
  template: `<p-confirmDialog />
    <p-toast />
    <div
      class=" p-4 fixed top-0 w-full bg-indigo-400 flex gap-4 items-center z-20"
    >
      <img src="/lykaos-logo.png" alt="Lykaos Logo" class="h-10" />
      <span class="text-slate-50 mb-0">Dia del amor y la amistad 2024</span>
    </div>
    <div
      class="p-4 mt-16 h-screen mb-12 g-gradient-to-r from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90%"
    >
      <div class="flex flex-col gap-2">
        <h1>Nuevo pedido</h1>
        <div class="input-group">
          <label for="name">Comprador</label>
          <input pInputText type="text" required [(ngModel)]="name" />
        </div>
        <div class="input-group">
          <label for="group">Grupo</label>
          <p-dropdown
            [options]="groups() ?? []"
            optionValue="id"
            optionLabel="name"
            filter
            placeholder="Selecciona un grupo"
            [(ngModel)]="classroom_id"
          />
        </div>
        <div class="input-group">
          <label for="receiver">Para</label>
          <input pInputText type="text" required [(ngModel)]="receiver" />
        </div>
        <div class="input-group mb-4">
          <label for="description">Dedicatoria</label>
          <textarea
            pInputTextarea
            [(ngModel)]="message"
            placeholder="Escribe algo bonito..."
          ></textarea>
        </div>
        @for(item of items(); track item.id) {
        <p-card [header]="item.name">
          <ng-template pTemplate="content">
            <p>{{ item.description }}</p>
            <div class="flex items-center justify-between">
              <span>{{ item.price | currency }}</span>
              <app-counter (countChange)="clicked($event, item.id!)" />
            </div>
          </ng-template>
        </p-card>
        }
      </div>
      <div class="h-48 block"></div>
    </div>
    @if(selectedItems().length > 0) {
    <div class="fixed bottom-0 bg-white flex flex-col w-full p-8">
      <p class="font-semibold text-indigo-800">Seleccion</p>
      @for(item of selectedItems(); track item.item) {
      <div class="flex justify-between">
        <div>{{ item.item }} ({{ item.count }})</div>
        <div>{{ item.amount | currency }}</div>
      </div>
      }
      <div class="flex gap-4 mt-4 justify-end items-center">
        <div class="font-semibold text-indigo-800">Total</div>
        <div>{{ totalAmount() | currency }}</div>
        <p-button
          label="Enviar"
          class="p-button-success"
          (onClick)="sendOrder()"
        />
      </div>
    </div>
    } `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderComponent {
  private supabase = inject(SupabaseService);
  private confirmationService = inject(ConfirmationService);
  private router = inject(Router);
  private messageService = inject(MessageService);
  items = toSignal(
    from(this.supabase.client.from('items').select('*')).pipe(
      map(({ data }) => data)
    )
  );
  groups = toSignal(
    from(this.supabase.client.from('classrooms').select('*')).pipe(
      map(({ data }) => data)
    )
  );

  name = model('');
  receiver = model('');
  message = model('');
  classroom_id = model<number>();

  selected = signal<{ value: number; id: number }[]>([]);
  selectedItems = computed(() =>
    this.selected().map((x) => ({
      count: x.value,
      item: this.items()?.find((item) => x.id === item.id).name,
      amount: x.value * this.items()?.find((item) => x.id === item.id).price,
    }))
  );

  totalAmount = computed(() =>
    this.selectedItems().reduce((acc, x) => acc + x.amount, 0)
  );

  clicked(value: number, id: number) {
    if (value === 0) {
      this.selected.update((current) =>
        current.filter((item) => item.id !== id)
      );
      return;
    }

    if (this.selected) {
      this.selected.update((current) => {
        if (current.some((item) => item.id === id)) {
          return current.map((item) =>
            item.id === id ? { ...item, value } : item
          );
        }

        return [...current, { value, id }];
      });
    }
  }

  sendOrder() {
    if (!this.name() || !this.receiver() || !this.classroom_id()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Debes llenar todos los campos',
      });
      return;
    }

    this.confirmationService.confirm({
      header: 'Confirmar',
      message: `¿Estás seguro de hacer el pedido por ${this.totalAmount()} ?`,
      acceptIcon: 'none',
      rejectIcon: 'none',
      rejectButtonStyleClass: 'p-button-text',
      rejectLabel: 'Cancelar',
      acceptLabel: 'Enviar',
      accept: () => {
        this.saveOrder();
      },
    });
  }

  async saveOrder() {
    const { data, error } = await this.supabase.client
      .from('orders')
      .insert([
        {
          name: this.name(),
          receiver: this.receiver(),
          amount: this.totalAmount(),
          classroom_id: this.classroom_id(),
          message: this.message(),
        },
      ])
      .select('*')
      .single();

    if (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al guardar la orden',
      });
      return;
    }
    await this.saveItem(data.id);
    this.router.navigate(['/receipt', data.id]);
  }

  async saveItem(orderId: number) {
    const { error } = await this.supabase.client.from('order_items').insert(
      this.selected()?.map((item) => ({
        order_id: orderId,
        item_id: item.id,
        quantity: item.value,
      }))
    );

    if (error) {
      throw new Error('Error saving order items');
    }
  }
}
