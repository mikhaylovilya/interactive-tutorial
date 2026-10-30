<script lang="ts">
  import Icon from '../Icon.svelte';

  const stages = [
    {
      icon: 'code',
      title: 'Приложение',
      text: 'SQL, транзакции, пул соединений',
      tools: ['trace callback', 'sqlite_stmt', 'логи']
    },
    {
      icon: 'db',
      title: 'SQLite core',
      text: 'VDBE → btree → pager',
      tools: ['EXPLAIN', '.stats', 'scanstatus']
    },
    {
      icon: 'layers',
      title: 'VFS',
      text: 'xRead / xWrite / xSync',
      tools: ['strace', 'VFS shim', 'bpftrace']
    },
    {
      icon: 'grid',
      title: 'Page cache ОС',
      text: 'грязные страницы, writeback',
      tools: ['vmstat', '/proc/meminfo', 'pidstat']
    },
    {
      icon: 'cpu',
      title: 'Диск',
      text: 'IOPS, очередь, latency',
      tools: ['iostat', 'iotop', 'fs_usage']
    }
  ];
</script>

<div class="io">
  <div class="io__flow">
    {#each stages as stage, i}
      <div class="io__stage">
        <span class="io__num">{String(i + 1).padStart(2, '0')}</span>
        <span class="io__icon"><Icon name={stage.icon} size={20} /></span>
        <strong>{stage.title}</strong>
        <span class="io__text">{stage.text}</span>
        <span class="io__tools">
          {#each stage.tools as tool}
            <code>{tool}</code>
          {/each}
        </span>
      </div>
      {#if i < stages.length - 1}
        <span class="io__arrow" aria-hidden="true"><Icon name="chevron" size={16} /></span>
      {/if}
    {/each}
  </div>
  <p class="io__note">
    <Icon name="info" size={14} />
    <span>
      Каждый инструмент видит только свой участок пути. <code>strace</code> покажет fsync, но не объяснит,
      какой запрос его вызвал; <code>scanstatus</code> покажет циклы, но не latency диска.
    </span>
  </p>
</div>

<style>
  .io {
    padding: 22px;
    border-radius: var(--radius);
    border: 1px solid var(--border);
    background:
      radial-gradient(120% 140% at 0% 0%, color-mix(in srgb, var(--lvl-1) 10%, transparent), transparent 60%),
      var(--surface);
  }

  .io__flow {
    display: flex;
    align-items: stretch;
    gap: 6px;
  }

  .io__stage {
    position: relative;
    flex: 1 1 0;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 5px;
    padding: 14px 12px 12px;
    border-radius: 12px;
    border: 1px solid var(--border);
    background: color-mix(in srgb, var(--surface-2) 75%, transparent);
  }

  .io__num {
    position: absolute;
    top: 8px;
    right: 9px;
    font-family: var(--font-mono);
    font-size: 0.6rem;
    color: var(--dim);
  }

  .io__icon {
    display: inline-flex;
    color: var(--lvl-1);
    margin-bottom: 2px;
  }

  .io__stage strong {
    font-size: 0.85rem;
    letter-spacing: -0.01em;
  }

  .io__text {
    font-size: 0.72rem;
    line-height: 1.4;
    color: var(--muted);
  }

  .io__tools {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 6px;
  }

  .io__tools code {
    font-size: 0.62rem;
    padding: 1px 5px;
    border-radius: 5px;
    color: color-mix(in srgb, var(--lvl-1) 65%, var(--text));
    background: color-mix(in srgb, var(--lvl-1) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--lvl-1) 18%, transparent);
  }

  .io__arrow {
    display: flex;
    align-items: center;
    color: var(--border-strong);
    flex: none;
  }

  .io__note {
    display: flex;
    gap: 8px;
    align-items: flex-start;
    margin-top: 16px;
    font-size: 0.78rem;
    color: var(--muted);
    line-height: 1.5;
  }

  .io__note :global(svg) {
    flex: none;
    margin-top: 2px;
    color: var(--lvl-1);
  }

  .io__note span {
    min-width: 0;
  }

  .io__note code {
    font-size: 0.72rem;
    color: var(--text-soft);
  }

  @media (max-width: 900px) {
    .io__flow {
      display: grid;
      grid-template-columns: 1fr;
      gap: 8px;
    }

    .io__arrow {
      justify-content: center;
      transform: rotate(90deg);
      height: 8px;
    }

    .io__stage {
      padding-right: 40px;
    }
  }

  @media (max-width: 720px) {
    .io {
      padding: 16px;
    }
  }
</style>
