<script lang="ts">
  import Terminal from './Terminal.svelte';
  import Dashboard from './visuals/Dashboard.svelte';
  import Dbinfo from './visuals/Dbinfo.svelte';
  import DbstatBars from './visuals/DbstatBars.svelte';
  import EqpCompare from './visuals/EqpCompare.svelte';
  import ExtArch from './visuals/ExtArch.svelte';
  import IoPath from './visuals/IoPath.svelte';
  import MonitoringStack from './visuals/MonitoringStack.svelte';
  import PageHex from './visuals/PageHex.svelte';
  import QueryPipeline from './visuals/QueryPipeline.svelte';
  import WalLayout from './visuals/WalLayout.svelte';
  import type { Level, VisualType } from '../data/types';

  interface Props {
    level: Level;
  }

  let { level }: Props = $props();

  const LABELS: Record<VisualType, string> = {
    'io-path': 'схема пути запроса',
    'monitoring-stack': 'схема контура мониторинга',
    dashboard: 'реконструкция дашборда',
    dbinfo: 'реальный вывод',
    'eqp-compare': 'сравнение планов',
    'dbstat-bars': 'диаграмма пространства',
    'ext-arch': 'схема процесса',
    'query-pipeline': 'конвейер запроса',
    'wal-layout': 'структура WAL',
    'page-hex': 'интерактивный hex-дамп',
    terminal: 'вывод в терминале'
  };

  const isLive = (tag?: string): boolean => Boolean(tag?.includes('реальный'));
</script>

<div class="visuals">
  {#each level.visuals as visual, index}
    <figure class="visual">
      <figcaption class="visual__head">
        <span class="visual__index">{String(index + 1).padStart(2, '0')}</span>
        <div class="visual__titles">
          <h3>{visual.title}</h3>
          <span class="visual__kind">{LABELS[visual.type]}</span>
        </div>
        {#if visual.tag}
          <span class="visual__tag" class:live={isLive(visual.tag)}>{visual.tag}</span>
        {/if}
      </figcaption>

      <div class="visual__frame">
        {#if visual.type === 'terminal'}
          <Terminal
            title={visual.title}
            tag={visual.tag ?? 'пример вывода'}
            code={visual.code ?? ''}
            lang={visual.lang ?? 'text'}
            live={isLive(visual.tag)}
          />
        {:else if visual.type === 'io-path'}
          <IoPath />
        {:else if visual.type === 'monitoring-stack'}
          <MonitoringStack />
        {:else if visual.type === 'dashboard'}
          <Dashboard />
        {:else if visual.type === 'dbinfo'}
          <Dbinfo />
        {:else if visual.type === 'eqp-compare'}
          <EqpCompare />
        {:else if visual.type === 'dbstat-bars'}
          <DbstatBars />
        {:else if visual.type === 'ext-arch'}
          <ExtArch />
        {:else if visual.type === 'query-pipeline'}
          <QueryPipeline />
        {:else if visual.type === 'wal-layout'}
          <WalLayout />
        {:else if visual.type === 'page-hex'}
          <PageHex />
        {/if}
      </div>

      <p class="visual__caption">{visual.caption}</p>
    </figure>
  {/each}
</div>

<style>
  .visuals {
    display: grid;
    gap: 40px;
  }

  .visual {
    margin: 0;
    display: grid;
    gap: 12px;
    min-width: 0;
  }

  .visual__head {
    display: flex;
    align-items: baseline;
    gap: 12px;
    flex-wrap: wrap;
  }

  .visual__index {
    font-family: var(--font-mono);
    font-size: 0.7rem;
    color: var(--dim);
    flex: none;
  }

  .visual__titles {
    display: flex;
    align-items: baseline;
    gap: 10px;
    flex-wrap: wrap;
    min-width: 0;
  }

  .visual__titles h3 {
    font-size: 1.02rem;
  }

  .visual__kind {
    font-size: 0.64rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--dim);
  }

  .visual__tag {
    margin-left: auto;
    font-size: 0.62rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--muted);
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 2px 8px;
    white-space: nowrap;
  }

  .visual__tag.live {
    color: var(--accent);
    border-color: color-mix(in srgb, var(--accent) 30%, transparent);
    background: color-mix(in srgb, var(--accent) 7%, transparent);
  }

  .visual__frame {
    min-width: 0;
  }

  .visual__caption {
    font-size: 0.83rem;
    line-height: 1.6;
    color: var(--muted);
    max-width: 82ch;
    padding-left: 12px;
    border-left: 2px solid color-mix(in srgb, var(--lvl-accent, var(--accent)) 45%, var(--border));
  }

  @media (max-width: 640px) {
    .visuals {
      gap: 32px;
    }

    .visual__tag {
      margin-left: 0;
    }

    .visual__caption {
      padding-left: 9px;
    }
  }
</style>
