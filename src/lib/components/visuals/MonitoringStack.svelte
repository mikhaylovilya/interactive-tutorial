<script lang="ts">
  import Icon from '../Icon.svelte';

  const sources = [
    { name: 'Приложение', text: 'latency, busy, ретраи', tone: 'lvl-2' },
    { name: 'SQLite exporter', text: 'page_count, freelist, WAL', tone: 'lvl-2' },
    { name: 'node_exporter', text: 'CPU, диск, память', tone: 'lvl-2' },
    { name: 'Litestream', text: 'sync, errors, WAL', tone: 'lvl-2' }
  ];

  const consumers = [
    { name: 'Grafana', text: 'дашборды и аннотации', icon: 'chart' },
    { name: 'Alertmanager', text: 'маршруты, silences', icon: 'alert' },
    { name: 'Restore-тест', text: 'проверка RPO', icon: 'reset' }
  ];
</script>

<div class="stack">
  <div class="stack__col">
    <span class="stack__label">Источники</span>
    {#each sources as source}
      <div class="stack__node">
        <span class="stack__dot"></span>
        <strong>{source.name}</strong>
        <span>{source.text}</span>
      </div>
    {/each}
  </div>

  <span class="stack__arrow" aria-hidden="true"><Icon name="arrow" size={18} /></span>

  <div class="stack__mid">
    <span class="stack__label">Сбор и хранение</span>
    <div class="stack__core">
      <Icon name="activity" size={22} />
      <strong>Prometheus</strong>
      <span>pull → TSDB → rules</span>
      <div class="stack__mini">
        <code>scrape 30s</code>
        <code>retention 15d</code>
      </div>
    </div>
  </div>

  <span class="stack__arrow" aria-hidden="true"><Icon name="arrow" size={18} /></span>

  <div class="stack__col">
    <span class="stack__label">Потребители</span>
    {#each consumers as item}
      <div class="stack__node">
        <span class="stack__icon"><Icon name={item.icon} size={15} /></span>
        <strong>{item.name}</strong>
        <span>{item.text}</span>
      </div>
    {/each}
  </div>
</div>

<style>
  .stack {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 22px;
    border-radius: var(--radius);
    border: 1px solid var(--border);
    background:
      radial-gradient(100% 120% at 50% 0%, color-mix(in srgb, var(--lvl-2) 12%, transparent), transparent 65%),
      var(--surface);
  }

  .stack__col {
    flex: 1 1 0;
    display: flex;
    flex-direction: column;
    gap: 7px;
  }

  .stack__label {
    font-size: 0.62rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--dim);
    font-weight: 650;
    margin-bottom: 2px;
  }

  .stack__node {
    display: grid;
    grid-template-columns: auto 1fr;
    column-gap: 8px;
    align-items: center;
    padding: 8px 11px;
    border-radius: 10px;
    border: 1px solid var(--border);
    background: color-mix(in srgb, var(--surface-2) 80%, transparent);
  }

  .stack__node strong {
    font-size: 0.78rem;
    font-weight: 600;
  }

  .stack__node span:not(.stack__dot):not(.stack__icon) {
    grid-column: 2;
    font-size: 0.68rem;
    color: var(--muted);
    line-height: 1.3;
  }

  .stack__dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--lvl-2);
    grid-row: 1 / span 2;
    box-shadow: 0 0 10px color-mix(in srgb, var(--lvl-2) 60%, transparent);
  }

  .stack__icon {
    display: inline-flex;
    color: var(--lvl-2);
    grid-row: 1 / span 2;
  }

  .stack__arrow {
    color: var(--border-strong);
    flex: none;
  }

  .stack__mid {
    flex: 1.1 1 0;
    display: flex;
    flex-direction: column;
    gap: 7px;
  }

  .stack__core {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    text-align: center;
    padding: 20px 14px;
    border-radius: 14px;
    border: 1px solid color-mix(in srgb, var(--lvl-2) 40%, var(--border));
    background: color-mix(in srgb, var(--lvl-2) 9%, var(--surface-2));
    box-shadow: 0 0 40px -18px color-mix(in srgb, var(--lvl-2) 55%, transparent);
  }

  .stack__core :global(svg) {
    color: var(--lvl-2);
  }

  .stack__core strong {
    font-size: 0.95rem;
  }

  .stack__core > span {
    font-size: 0.7rem;
    color: var(--muted);
    font-family: var(--font-mono);
  }

  .stack__mini {
    display: flex;
    gap: 5px;
    margin-top: 4px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .stack__mini code {
    font-size: 0.62rem;
    padding: 2px 6px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--lvl-2) 12%, transparent);
    color: color-mix(in srgb, var(--lvl-2) 70%, var(--text));
  }

  @media (max-width: 780px) {
    .stack {
      flex-direction: column;
      padding: 16px;
    }

    .stack__col,
    .stack__mid {
      width: 100%;
    }

    .stack__arrow {
      transform: rotate(90deg);
    }
  }
</style>
