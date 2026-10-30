<script>
  import { linePath, areaPath, series } from '../../utils/format.js';

  const db = series(7, 48, 3.1, 0.5);
  const wal = [4, 6, 9, 14, 22, 31, 38, 12, 5, 4, 3, 8, 17, 26, 35, 9, 4, 3, 6, 13, 25, 36, 11, 5, 3, 4, 9, 19, 30, 37, 14, 6, 4, 3, 8, 16, 27, 34, 10, 4, 3, 7, 15, 24, 33, 12, 5, 4];
  const latency = series(21, 48, 12, 7).map((v) => Math.max(4, v));
  const errors = series(33, 48, 0.04, 0.05).map((v) => Math.max(0, v));

  const stats = [
    { label: 'Размер базы', value: '3.3 MB', delta: '+1.2% / 24ч', tone: 'ok' },
    { label: 'WAL', value: '32 KB', delta: 'сброшен 2 мин назад', tone: 'ok' },
    { label: 'Ошибки busy', value: '0.02 /с', delta: 'в пределах нормы', tone: 'ok' },
    { label: 'p95 запроса', value: '12 ms', delta: '+3 ms к вчера', tone: 'warn' }
  ];

  const charts = [
    {
      title: 'Размер базы, MB',
      values: db,
      color: '#a78bfa',
      min: 2.4,
      max: 3.8,
      unit: 'MB',
      last: '3.3 MB'
    },
    {
      title: 'WAL, KB',
      values: wal,
      color: '#fbbf24',
      min: 0,
      max: 40,
      unit: 'KB',
      last: '32 KB'
    },
    {
      title: 'p95 latency, ms',
      values: latency,
      color: '#5eead4',
      min: 0,
      max: 24,
      unit: 'ms',
      last: '12 ms'
    },
    {
      title: 'Ошибки busy, /с',
      values: errors,
      color: '#fb7185',
      min: 0,
      max: 0.12,
      unit: '/с',
      last: '0.02'
    }
  ];
</script>

<div class="dash">
  <div class="dash__bar">
    <span class="dash__title">SQLite / production overview</span>
    <span class="dash__badge">реконструкция, не скриншот</span>
    <span class="dash__range">6h · refresh 30s</span>
  </div>

  <div class="dash__stats">
    {#each stats as stat}
      <div class="stat">
        <span class="stat__label">{stat.label}</span>
        <strong class="stat__value">{stat.value}</strong>
        <span class="stat__delta" class:warn={stat.tone === 'warn'}>{stat.delta}</span>
      </div>
    {/each}
  </div>

  <div class="dash__grid">
    {#each charts as chart}
      <figure class="chart">
        <figcaption>
          <span>{chart.title}</span>
          <strong>{chart.last}</strong>
        </figcaption>
        <svg viewBox="0 0 600 170" preserveAspectRatio="none" role="img" aria-label={`График: ${chart.title}`}>
          <defs>
            <linearGradient id={`fill-${chart.title.replace(/[^a-zа-я0-9]/gi, '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color={chart.color} stop-opacity="0.28" />
              <stop offset="100%" stop-color={chart.color} stop-opacity="0" />
            </linearGradient>
          </defs>
          {#each [0, 1, 2, 3, 4] as line}
            <line
              x1="10"
              x2="590"
              y1={12 + line * 36}
              y2={12 + line * 36}
              stroke="currentColor"
              stroke-opacity="0.09"
              stroke-width="1"
            />
          {/each}
          <path
            d={areaPath(chart.values, { width: 600, height: 170, pad: 12, min: chart.min, max: chart.max })}
            fill={`url(#fill-${chart.title.replace(/[^a-zа-я0-9]/gi, '')})`}
          />
          <path
            d={linePath(chart.values, { width: 600, height: 170, pad: 12, min: chart.min, max: chart.max })}
            fill="none"
            stroke={chart.color}
            stroke-width="2.2"
            stroke-linejoin="round"
            stroke-linecap="round"
          />
        </svg>
        <div class="chart__axis">
          <span>6h</span><span>4h</span><span>2h</span><span>now</span>
        </div>
      </figure>
    {/each}
  </div>
</div>

<style>
  .dash {
    border-radius: 14px;
    border: 1px solid var(--border);
    background: #0a111e;
    overflow: hidden;
    box-shadow: var(--shadow);
  }

  .dash__bar {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 16px;
    border-bottom: 1px solid rgba(147, 170, 196, 0.12);
    background: #0d1626;
  }

  .dash__title {
    font-size: 0.78rem;
    font-weight: 600;
    color: #d7e6f7;
    font-family: var(--font-mono);
  }

  .dash__badge {
    font-size: 0.6rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #fbbf24;
    border: 1px solid rgba(251, 191, 36, 0.3);
    background: rgba(251, 191, 36, 0.08);
    padding: 2px 7px;
    border-radius: 999px;
    white-space: nowrap;
  }

  .dash__range {
    margin-left: auto;
    font-size: 0.66rem;
    color: #7f93ad;
    font-family: var(--font-mono);
    white-space: nowrap;
  }

  .dash__stats {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 1px;
    background: rgba(147, 170, 196, 0.1);
  }

  .stat {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 13px 15px;
    background: #0a111e;
  }

  .stat__label {
    font-size: 0.64rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #7f93ad;
  }

  .stat__value {
    font-size: 1.28rem;
    letter-spacing: -0.02em;
    color: #e9f0fb;
    font-variant-numeric: tabular-nums;
  }

  .stat__delta {
    font-size: 0.66rem;
    color: #5eead4;
    font-family: var(--font-mono);
  }

  .stat__delta.warn {
    color: #fbbf24;
  }

  .dash__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1px;
    background: rgba(147, 170, 196, 0.1);
    padding: 1px 0 0;
  }

  .chart {
    margin: 0;
    padding: 12px 14px 10px;
    background: #0a111e;
    color: #e9f0fb;
  }

  .chart figcaption {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 10px;
    font-size: 0.7rem;
    color: #8fa3bd;
    margin-bottom: 4px;
  }

  .chart figcaption strong {
    font-size: 0.78rem;
    color: #d7e6f7;
    font-variant-numeric: tabular-nums;
  }

  .chart svg {
    width: 100%;
    height: 116px;
    display: block;
  }

  .chart__axis {
    display: flex;
    justify-content: space-between;
    font-size: 0.58rem;
    color: #5d7088;
    font-family: var(--font-mono);
    padding: 2px 2px 0;
  }

  @media (max-width: 760px) {
    .dash__stats {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .dash__grid {
      grid-template-columns: 1fr;
    }

    .dash__bar {
      flex-wrap: wrap;
      gap: 6px;
    }

    .dash__range {
      margin-left: 0;
      width: 100%;
    }
  }
</style>
