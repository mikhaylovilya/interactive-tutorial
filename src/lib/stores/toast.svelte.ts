/** Tiny toast queue for copy confirmations and other short feedback. */

export type ToastTone = 'ok' | 'warn';

export interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
}

class ToastStore {
  items = $state<ToastItem[]>([]);
  #nextId = 1;

  push(message: string, tone: ToastTone = 'ok'): void {
    const id = this.#nextId++;
    this.items = [...this.items, { id, message, tone }];
    setTimeout(() => this.dismiss(id), 2600);
  }

  dismiss(id: number): void {
    this.items = this.items.filter((item) => item.id !== id);
  }
}

export const toast = new ToastStore();
