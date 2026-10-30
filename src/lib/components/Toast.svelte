<script lang="ts">
  import Icon from './Icon.svelte';
  import { toast } from '../stores/toast.svelte';
</script>

<div class="toasts" aria-live="polite" aria-atomic="false">
  {#each toast.items as item (item.id)}
    <div class="toast" data-tone={item.tone}>
      <span class="toast__icon">
        <Icon name={item.tone === 'warn' ? 'alert' : 'check'} size={14} stroke={2.2} />
      </span>
      <span>{item.message}</span>
      <button type="button" class="toast__close" aria-label="Закрыть" onclick={() => toast.dismiss(item.id)}>
        <Icon name="x" size={12} />
      </button>
    </div>
  {/each}
</div>

<style>
  .toasts {
    position: fixed;
    right: 18px;
    bottom: 18px;
    z-index: 80;
    display: grid;
    gap: 8px;
    pointer-events: none;
    max-width: min(340px, calc(100vw - 36px));
  }

  .toast {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 10px 11px 10px 12px;
    border-radius: 11px;
    border: 1px solid var(--border-strong);
    background: color-mix(in srgb, var(--surface-2) 94%, transparent);
    box-shadow: var(--shadow);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    font-size: 0.79rem;
    color: var(--text-soft);
    pointer-events: auto;
    animation: toast-in 0.24s var(--ease) both;
  }

  .toast[data-tone='warn'] {
    border-color: color-mix(in srgb, var(--warn) 40%, var(--border));
  }

  .toast__icon {
    flex: none;
    display: inline-flex;
    color: var(--ok);
  }

  .toast[data-tone='warn'] .toast__icon {
    color: var(--warn);
  }

  .toast__close {
    flex: none;
    display: inline-flex;
    margin-left: auto;
    color: var(--dim);
    padding: 3px;
    border-radius: 5px;
  }

  .toast__close:hover {
    color: var(--text);
    background: var(--surface-3);
  }

  @keyframes toast-in {
    from {
      opacity: 0;
      transform: translateY(8px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @media (max-width: 560px) {
    .toasts {
      left: 12px;
      right: 12px;
      bottom: 12px;
      max-width: none;
    }
  }
</style>
