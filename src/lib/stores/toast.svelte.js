/** Tiny toast queue for copy confirmations and other short feedback. */
class ToastStore {
  items = $state([]);
  #nextId = 1;

  push(message, tone = 'ok') {
    const id = this.#nextId++;
    this.items = [...this.items, { id, message, tone }];
    setTimeout(() => this.dismiss(id), 2600);
  }

  dismiss(id) {
    this.items = this.items.filter((item) => item.id !== id);
  }
}

export const toast = new ToastStore();
