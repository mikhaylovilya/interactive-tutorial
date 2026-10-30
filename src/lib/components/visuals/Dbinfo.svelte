<script lang="ts">
  const groups = [
    {
      title: 'Формат файла',
      rows: [
        ['database page size', '4096'],
        ['write format', '2'],
        ['read format', '2'],
        ['reserved bytes', '12'],
        ['text encoding', '1 (utf8)'],
        ['schema format', '4']
      ]
    },
    {
      title: 'Размер и пространство',
      rows: [
        ['database page count', '838'],
        ['freelist page count', '87'],
        ['freelist trunk page', '678'],
        ['autovacuum top root', '0'],
        ['incremental vacuum', '0']
      ]
    },
    {
      title: 'Схема и версия',
      rows: [
        ['schema cookie', '5'],
        ['schema size', '534'],
        ['number of tables', '3'],
        ['number of indexes', '2'],
        ['software version', '3043002'],
        ['data version', '3']
      ]
    }
  ];
</script>

<div class="dbinfo">
  <div class="dbinfo__bar">
    <span class="dbinfo__prompt">$ sqlite3 app.db</span>
    <span class="dbinfo__cmd">.dbinfo</span>
    <span class="dbinfo__tag">реальный вывод</span>
  </div>

  <div class="dbinfo__grid">
    {#each groups as group}
      <div class="dbinfo__group">
        <h4>{group.title}</h4>
        {#each group.rows as [field, value]}
          <div class="dbinfo__row" class:accent={field === 'freelist page count'}>
            <span class="dbinfo__field">{field}</span>
            <span class="dbinfo__dots" aria-hidden="true"></span>
            <span class="dbinfo__value">{value}</span>
          </div>
        {/each}
      </div>
    {/each}
  </div>

  <div class="dbinfo__foot">
    <span>
      <strong>838 × 4096</strong> = 3 432 448 байт ≈ 3.3 МБ логического размера.
    </span>
    <span>
      <strong>87 страниц</strong> во freelist ≈ 356 КБ, которые файл уже не отдаёт, но может переиспользовать.
    </span>
    <span>
      <strong>3043002</strong> = 3 043 002 → SQLite 3.43.2, создавшая файл.
    </span>
  </div>
</div>

<style>
  .dbinfo {
    border-radius: 14px;
    border: 1px solid var(--border);
    background: var(--surface);
    overflow: hidden;
  }

  .dbinfo__bar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    border-bottom: 1px solid var(--border);
    background: var(--surface-2);
    font-family: var(--font-mono);
    font-size: 0.76rem;
    flex-wrap: wrap;
  }

  .dbinfo__prompt {
    color: var(--lvl-3);
  }

  .dbinfo__cmd {
    color: var(--text-soft);
  }

  .dbinfo__tag {
    margin-left: auto;
    font-family: var(--font-sans);
    font-size: 0.6rem;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: var(--lvl-3);
    border: 1px solid color-mix(in srgb, var(--lvl-3) 30%, transparent);
    background: color-mix(in srgb, var(--lvl-3) 8%, transparent);
    padding: 2px 7px;
    border-radius: 999px;
  }

  .dbinfo__grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1px;
    background: var(--border);
  }

  .dbinfo__group {
    background: var(--surface);
    padding: 15px 17px 17px;
  }

  .dbinfo__group h4 {
    font-size: 0.63rem;
    letter-spacing: 0.13em;
    text-transform: uppercase;
    color: var(--dim);
    margin-bottom: 9px;
    font-weight: 650;
  }

  .dbinfo__row {
    display: flex;
    align-items: baseline;
    gap: 8px;
    padding: 3px 0;
    font-family: var(--font-mono);
    font-size: 0.75rem;
  }

  .dbinfo__field {
    color: var(--muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .dbinfo__dots {
    flex: 1;
    border-bottom: 1px dotted color-mix(in srgb, var(--border-strong) 70%, transparent);
    transform: translateY(-3px);
  }

  .dbinfo__value {
    color: var(--text);
    font-variant-numeric: tabular-nums;
  }

  .dbinfo__row.accent .dbinfo__value {
    color: var(--lvl-3);
    font-weight: 600;
  }

  .dbinfo__row.accent .dbinfo__field {
    color: var(--text-soft);
  }

  .dbinfo__foot {
    display: grid;
    gap: 6px;
    padding: 13px 17px 15px;
    border-top: 1px solid var(--border);
    background: color-mix(in srgb, var(--lvl-3) 4%, var(--surface));
    font-size: 0.76rem;
    color: var(--muted);

    line-height: 1.5;
  }

  .dbinfo__foot strong {
    color: var(--text-soft);
    font-family: var(--font-mono);
    font-weight: 600;
  }

  @media (max-width: 880px) {
    .dbinfo__grid {
      grid-template-columns: 1fr;
    }
  }
</style>
