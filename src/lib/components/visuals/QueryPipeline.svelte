<script lang="ts">
  const stages = [
    {
      title: 'SQL-текст',
      text: 'Строка запроса и параметры',
      tools: ['trace callback']
    },
    {
      title: 'Парсер',
      text: 'Дерево разбора, проверка синтаксиса',
      tools: ['parser_trace (debug)']
    },
    {
      title: 'Планировщик',
      text: 'Индексы, порядок соединений, оценки',
      tools: ['EXPLAIN QUERY PLAN', 'sqlite_stat1', 'optimize']
    },
    {
      title: 'Кодогенератор',
      text: 'Программа для виртуальной машины',
      tools: ['EXPLAIN', 'bytecode()']
    },
    {
      title: 'VDBE',
      text: 'Исполнение opcode-ов, циклы, регистры',
      tools: ['.stats', 'scanstatus', 'sqlite_stmt']
    },
    {
      title: 'Btree',
      text: 'Страницы, ячейки, курсоры',
      tools: ['dbstat', 'sqlite_dbpage']
    },
    {
      title: 'Pager',
      text: 'Кэш, блокировки, WAL, checkpoint',
      tools: ['db_status', 'wal_checkpoint']
    },
    {
      title: 'VFS / диск',
      text: 'read, write, fsync, latency',
      tools: ['strace', 'iostat', 'VFS shim']
    }
  ];
</script>

<div class="pipe">
  {#each stages as stage, i}
    <div class="pipe__row">
      <div class="pipe__marker" aria-hidden="true">
        <span class="pipe__dot"></span>
        {#if i < stages.length - 1}<span class="pipe__line"></span>{/if}
      </div>
      <div class="pipe__body">
        <div class="pipe__title">
          <span class="pipe__index">{String(i + 1).padStart(2, '0')}</span>
          <strong>{stage.title}</strong>
        </div>
        <p>{stage.text}</p>
      </div>
      <div class="pipe__tools">
        {#each stage.tools as tool}
          <code>{tool}</code>
        {/each}
      </div>
    </div>
  {/each}
</div>

<style>
  .pipe {
    padding: 20px 22px;
    border-radius: var(--radius);
    border: 1px solid var(--border);
    background:
      radial-gradient(100% 120% at 100% 0%, color-mix(in srgb, var(--lvl-5) 10%, transparent), transparent 60%),
      var(--surface);
  }

  .pipe__row {
    display: grid;
    grid-template-columns: 22px minmax(0, 1fr) minmax(170px, auto);
    gap: 12px;
    align-items: start;
    padding: 7px 0;
  }

  .pipe__marker {
    display: flex;
    flex-direction: column;
    align-items: center;
    align-self: stretch;
    padding-top: 4px;
  }

  .pipe__dot {
    width: 11px;
    height: 11px;
    border-radius: 50%;
    border: 2px solid var(--lvl-5);
    background: color-mix(in srgb, var(--lvl-5) 22%, var(--surface));
    flex: none;
  }

  .pipe__line {
    flex: 1;
    width: 1px;
    background: linear-gradient(var(--lvl-5), color-mix(in srgb, var(--lvl-5) 20%, transparent));
    opacity: 0.45;
    margin-top: 3px;
  }

  .pipe__title {
    display: flex;
    align-items: baseline;
    gap: 8px;
  }

  .pipe__index {
    font-family: var(--font-mono);
    font-size: 0.64rem;
    color: var(--dim);
  }

  .pipe__title strong {
    font-size: 0.86rem;
    letter-spacing: -0.01em;
  }

  .pipe__body p {
    margin: 1px 0 0 24px;
    font-size: 0.75rem;
    color: var(--muted);
    line-height: 1.45;
  }

  .pipe__tools {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    justify-content: flex-end;
  }

  .pipe__tools code {
    font-size: 0.63rem;
    padding: 2px 7px;
    border-radius: 999px;
    color: color-mix(in srgb, var(--lvl-5) 62%, var(--text));
    background: color-mix(in srgb, var(--lvl-5) 8%, transparent);
    border: 1px solid color-mix(in srgb, var(--lvl-5) 18%, transparent);
    white-space: nowrap;
  }

  @media (max-width: 760px) {
    .pipe {
      padding: 16px;
    }

    .pipe__row {
      grid-template-columns: 20px minmax(0, 1fr);
    }

    .pipe__tools {
      grid-column: 2;
      justify-content: flex-start;
      margin-top: 2px;
    }
  }
</style>
