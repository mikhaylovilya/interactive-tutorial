<script lang="ts">
  import CmdBlock from './CmdBlock.svelte';

  interface Props {
    title?: string;
    tag?: string;
    code?: string;
    lang?: string;
    live?: boolean;
  }

  let { title = '', tag = 'пример вывода', code = '', lang = 'text', live = false }: Props =
    $props();
</script>

<div class="term">
  <div class="term__bar">
    <span class="term__dots" aria-hidden="true">
      <span></span><span></span><span></span>
    </span>
    <span class="term__title">{title}</span>
    {#if tag}<span class="term__tag" class:live>{tag}</span>{/if}
  </div>
  <CmdBlock bare {code} {lang} />
</div>

<style>
  .term {
    border-radius: 14px;
    border: 1px solid var(--code-border);
    background: var(--code-bg);
    overflow: hidden;
    box-shadow: var(--shadow-soft);
  }

  .term__bar {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    background: #0a1220;
    border-bottom: 1px solid var(--code-border);
  }

  .term__dots {
    display: inline-flex;
    gap: 5px;
    flex: none;
  }

  .term__dots span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #33445d;
  }

  .term__dots span:first-child {
    background: #e05c6e;
  }

  .term__dots span:nth-child(2) {
    background: #d9a13b;
  }

  .term__dots span:last-child {
    background: #3fb27f;
  }

  .term__title {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.76rem;
    color: #93a7c0;
    font-family: var(--font-mono);
  }

  .term__tag {
    margin-left: auto;
    flex: none;
    font-size: 0.65rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #7f93ad;
    border: 1px solid rgba(147, 170, 196, 0.18);
    border-radius: 999px;
    padding: 2px 8px;
  }

  .term__tag.live {
    color: #5eead4;
    border-color: rgba(94, 234, 212, 0.28);
    background: rgba(94, 234, 212, 0.07);
  }
</style>
