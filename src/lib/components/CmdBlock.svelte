<script lang="ts">
  import { highlight } from '../utils/highlight';
  import { copyText } from '../utils/clipboard';
  import { toast } from '../stores/toast.svelte';
  import Icon from './Icon.svelte';

  interface Props {
    code?: string;
    lang?: string;
    label?: string;
    tag?: string;
    bare?: boolean;
    dense?: boolean;
    copyable?: boolean;
  }

  let {
    code = '',
    lang = 'text',
    label = '',
    tag = '',
    bare = false,
    dense = false,
    copyable = true
  }: Props = $props();

  const html = $derived(highlight(code, lang));
  const showHeader = $derived(!bare && (label || tag || copyable));

  async function copy() {
    const ok = await copyText(code);
    toast.push(ok ? 'Скопировано в буфер обмена' : 'Не удалось скопировать', ok ? 'ok' : 'warn');
  }
</script>

<div class="cmd" class:dense>
  {#if showHeader}
    <div class="cmd__head">
      <span class="cmd__label">{label || lang}</span>
      {#if tag}<span class="cmd__tag">{tag}</span>{/if}
      {#if copyable}
        <button class="cmd__copy" type="button" onclick={copy} aria-label="Скопировать код">
          <Icon name="copy" size={14} />
          <span>Копировать</span>
        </button>
      {/if}
    </div>
  {/if}
  <pre class="cmd__pre"><code>{@html html}</code></pre>
</div>

<style>
  .cmd {
    position: relative;
    background: var(--code-bg);
    border: 1px solid var(--code-border);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
  }

  .cmd__head {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px 8px 14px;
    border-bottom: 1px solid var(--code-border);
    background: rgba(255, 255, 255, 0.025);
  }

  .cmd__label {
    font-family: var(--font-mono);
    font-size: 0.68rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #7f93ad;
    white-space: nowrap;
  }

  .cmd__tag {
    font-family: var(--font-mono);
    font-size: 0.68rem;
    color: #8fa3bd;
    padding: 2px 7px;
    border-radius: 999px;
    border: 1px solid rgba(147, 170, 196, 0.2);
    background: rgba(147, 170, 196, 0.08);
    white-space: nowrap;
  }

  .cmd__copy {
    margin-left: auto;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 8px;
    border-radius: 7px;
    color: #8fa3bd;
    font-size: 0.72rem;
    transition: color 0.15s ease, background 0.15s ease;
  }

  .cmd__copy:hover {
    color: #d7e6f7;
    background: rgba(147, 170, 196, 0.12);
  }

  .cmd__pre {
    margin: 0;
    padding: 14px 16px;
    overflow-x: auto;
    color: #d4e2f2;
    font-size: 0.815rem;
    line-height: 1.62;
    tab-size: 2;
    -webkit-overflow-scrolling: touch;
  }

  .cmd.dense .cmd__pre {
    padding: 9px 12px;
    font-size: 0.78rem;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .cmd__pre code {
    font-family: var(--font-mono);
  }

  @media (max-width: 620px) {
    .cmd__copy span {
      display: none;
    }

    .cmd__pre {
      padding: 12px 13px;
      font-size: 0.76rem;
    }
  }
</style>
