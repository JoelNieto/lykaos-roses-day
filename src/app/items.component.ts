import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { from, map } from 'rxjs';
import { SupabaseService } from './supabase.service';

@Component({
  selector: 'app-items',
  standalone: true,
  imports: [],
  template: ` <div
      class=" p-4 fixed top-0 w-full bg-emerald-400 flex gap-4 items-center z-20"
    >
      <img src="/lykaos-logo.png" alt="Lykaos Logo" class="h-10" />
      <span class="text-slate-50 mb-0">Listado</span>
    </div>
    <div class="flex flex-col px-4 mt-20">
      @for(item of items() ?? []; track $index) {
      <div class="flex justify-between p-4 border-b border-slate-300">
        <span>{{ item.item.name }}</span>
        <span>x{{ item.sum }}</span>
      </div>
      }
    </div>`,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemsComponent {
  private supabase = inject(SupabaseService);
  items = toSignal(
    from(
      this.supabase.client
        .from('order_items')
        .select('item:items(*), quantity.sum()')
    ).pipe(
      map(
        ({ data }) =>
          data as unknown as { item: { name: string }; sum: number }[]
      )
    )
  );
}
