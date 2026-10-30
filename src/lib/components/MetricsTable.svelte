<script lang="ts">
  import Icon from './Icon.svelte';
  import type { MetricRow } from '../data/types';

  interface Props {
    metrics?: MetricRow[];
  }

  let { metrics = [] }: Props = $props();
</script>

<div class="metrics">
  <table>
    <caption class="visually-hidden">Метрики, источники, нормальные значения и тревожные пороги</caption>
    <thead>
      <tr>
        <th scope="col">Метрика</th>
        <th scope="col">Источник</th>
        <th scope="col">Норма</th>
        <th scope="col">Тревога</th>
        <th scope="col">Комментарий</th>
      </tr>
    </thead>
    <tbody>
      {#each metrics as row}
        <tr>
          <th scope="row" data-label="Метрика">
            <span class="metrics__name">{row.metric}</span>
          </th>
          <td data-label="Источник"><code class="metrics__src">{row.source}</code></td>
          <td data-label="Норма"><span class="metrics__good">{row.good}</span></td>
          <td data-label="Тревога">
            <span class="metrics__alarm">
              <Icon name="alert" size={13} stroke={2} />
              {row.alarm}
            </span>
          </td>
          <td data-label="Комментарий" class="metrics__note">{row.note}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .metrics {
    min-width: 0;
    border: 1px solid var(--border);
    border-radius: 14px;
    overflow: hidden;
    background: var(--surface);
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.83rem;
  }

  thead th {
    text-align: left;
    padding: 11px 14px;
    font-size: 0.66rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--dim);
    font-weight: 650;
    background: var(--surface-2);
    border-bottom: 1px solid var(--border);
    white-space: nowrap;
  }

  tbody th,
  tbody td {
    text-align: left;
    vertical-align: top;
    padding: 11px 14px;
    border-bottom: 1px solid color-mix(in srgb, var(--border) 60%, transparent);
  }

  tbody tr:last-child th,
  tbody tr:last-child td {
    border-bottom: none;
  }

  tbody tr:hover {
    background: color-mix(in srgb, var(--accent) 3.5%, transparent);
  }

  .metrics__name {
    font-family: var(--font-mono);
    font-size: 0.79rem;
    color: var(--text);
    font-weight: 600;
  }

  .metrics__src {
    font-size: 0.73rem;
    color: var(--muted);
    background: none;
    border: none;
    padding: 0;
    white-space: normal;
  }

  .metrics__good {
    color: var(--ok);
    font-size: 0.79rem;
  }

  .metrics__alarm {
    display: inline-flex;
    gap: 5px;
    align-items: flex-start;
    color: var(--warn);
    font-size: 0.79rem;
  }

  .metrics__alarm :global(svg) {
    flex: none;
    margin-top: 2px;
  }

  .metrics__note {
    color: var(--muted);
    font-size: 0.79rem;
    min-width: 200px;
  }

  @media (max-width: 1120px) {
    thead {
      display: none;
    }

    table,
    tbody,
    tr,
    th,
    td {
      display: block;
      width: 100%;
    }

    tbody tr {
      padding: 12px 14px;
      border-bottom: 1px solid var(--border);
    }

    tbody tr:last-child {
      border-bottom: none;
    }

    tbody th,
    tbody td {
      padding: 3px 0;
      border: none;
    }

    td::before {
      content: attr(data-label);
      display: block;
      font-size: 0.62rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--dim);
      margin-bottom: 1px;
    }

    .metrics__note {
      min-width: 0;
    }
  }
</style>
