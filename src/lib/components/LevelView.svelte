<script lang="ts">
  import Icon from './Icon.svelte';
  import Practice from './Practice.svelte';
  import Quiz from './Quiz.svelte';
  import Theory from './Theory.svelte';
  import Visuals from './Visuals.svelte';
  import { levels } from '../data/levels';
  import { router } from '../router.svelte';
  import { progress } from '../stores/progress.svelte';
  import type { Level } from '../data/types';
  import type { Tab } from '../router.svelte';

  interface Props {
    level: Level;
    tab: Tab;
  }

  let { level, tab }: Props = $props();

  const index = $derived(levels.findIndex((item) => item.id === level.id));
  const prev = $derived(index > 0 ? levels[index - 1] : undefined);
  const next = $derived(index < levels.length - 1 ? levels[index + 1] : undefined);
  const stats = $derived(progress.stats(level));

  const tabList: Array<{ id: Tab; label: string; hint: string; icon: string }> = [
    { id: 'theory', label: 'Теория', hint: 'принцип и инструменты', icon: 'book' },
    { id: 'visuals', label: 'Визуалы', hint: 'схемы и вывод', icon: 'chart' },
    { id: 'practice', label: 'Практика', hint: 'сценарии', icon: 'terminal' },
    { id: 'quiz', label: 'Квиз', hint: '3 вопроса', icon: 'check' }
  ];

  function tabCount(id: Tab): string {
    if (id === 'visuals') return String(level.visuals.length);
    if (id === 'practice') return String(level.practice.scenarios.length);
    if (id === 'quiz') return `${stats.correct}/${stats.total}`;
    return String(level.theory.tools.length);
  }

  // Mark the level as visited so "continue" on the overview resumes here.
  $effect(() => {
    progress.markVisited(level.id);
  });
</script>

<article class="level" style={`--lvl-accent: ${level.color}`}>
  <header class="level__head">
    <nav class="crumbs" aria-label="Хлебные крошки">
      <a href="#/">Все уровни</a>
      <Icon name="chevron" size={12} />
      <span>уровень {level.number}</span>
    </nav>

    <div class="level__title-row">
      <span class="level__badge">
        <span class="level__icon"><Icon name={level.icon} size={20} /></span>
        <span class="level__num">{String(level.number).padStart(2, '0')}</span>
      </span>

      <div class="level__titles">
        <h1>{level.tabTitle}</h1>
        <p class="level__subtitle">{level.title} · {level.subtitle}</p>
      </div>

      <div class="level__meta">
        <span class="chip"><Icon name="activity" size={13} />{level.time}</span>
        {#if stats.done}
          <span class="chip chip--accent"><Icon name="check" size={13} />пройден</span>
        {:else}
          <span class="chip">{stats.correct}/{stats.total} верно</span>
        {/if}
      </div>
    </div>

    <p class="level__lead">{level.lead}</p>

    <ul class="level__tags">
      {#each level.tags as tag}
        <li>{tag}</li>
      {/each}
    </ul>
  </header>

  <div class="tabs">
    <div class="tabs__bar" role="tablist" aria-label="Разделы уровня">
      {#each tabList as item}
        <a
          class="tab"
          class:active={tab === item.id}
          href={`#${router.levelPath(level.id, item.id)}`}
          role="tab"
          aria-selected={tab === item.id}
        >
          <span class="tab__icon"><Icon name={item.icon} size={15} /></span>
          <span class="tab__text">
            <span class="tab__label">{item.label}</span>
            <span class="tab__hint">{item.hint}</span>
          </span>
          <span class="tab__count">{tabCount(item.id)}</span>
        </a>
      {/each}
    </div>

    <div class="tabs__panel" role="tabpanel">
      {#key `${level.id}:${tab}`}
        <div class="panel-in">
          {#if tab === 'theory'}
            <Theory {level} />
          {:else if tab === 'visuals'}
            <Visuals {level} />
          {:else if tab === 'practice'}
            <Practice {level} />
          {:else}
            <Quiz {level} />
          {/if}
        </div>
      {/key}
    </div>
  </div>

  <nav class="pager" aria-label="Переход между уровнями">
    {#if prev}
      <a class="pager__link pager__link--prev" href={`#${router.levelPath(prev.id)}`}>
        <span class="pager__dir"><Icon name="chevron" size={14} /> назад</span>
        <span class="pager__title">{prev.number}. {prev.tabTitle}</span>
        <span class="pager__sub">{prev.subtitle}</span>
      </a>
    {:else}
      <a class="pager__link pager__link--prev" href="#/">
        <span class="pager__dir"><Icon name="chevron" size={14} /> назад</span>
        <span class="pager__title">Все уровни</span>
        <span class="pager__sub">обзор и маршрут</span>
      </a>
    {/if}

    {#if next}
      <a class="pager__link pager__link--next" href={`#${router.levelPath(next.id)}`} style={`--next-color: ${next.color}`}>
        <span class="pager__dir">дальше <Icon name="chevron" size={14} /></span>
        <span class="pager__title">{next.number}. {next.tabTitle}</span>
        <span class="pager__sub">{next.subtitle}</span>
      </a>
    {:else}
      <a class="pager__link pager__link--next" href="#/sources">
        <span class="pager__dir">дальше <Icon name="chevron" size={14} /></span>
        <span class="pager__title">Источники</span>
        <span class="pager__sub">документация и методика</span>
      </a>
    {/if}
  </nav>
</article>

<style>
  .level {
    display: grid;
    gap: 26px;
    padding-bottom: 24px;
  }

  .level__head {
    display: grid;
    gap: 14px;
    padding-bottom: 22px;
    border-bottom: 1px solid var(--border);
  }

  .crumbs {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.71rem;
    color: var(--dim);
  }

  .crumbs a {
    color: var(--muted);
    text-decoration: none;
  }

  .crumbs a:hover {
    color: var(--text-soft);
  }

  .crumbs :global(svg) {
    transform: rotate(180deg);
    opacity: 0.6;
  }

  .level__title-row {
    display: flex;
    align-items: center;
    gap: 14px;
    flex-wrap: wrap;
  }

  .level__badge {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    padding: 8px 13px 8px 9px;
    border-radius: 14px;
    border: 1px solid color-mix(in srgb, var(--lvl-accent) 34%, var(--border));
    background: color-mix(in srgb, var(--lvl-accent) 8%, var(--surface));
    flex: none;
  }

  .level__icon {
    display: inline-flex;
    color: var(--lvl-accent);
  }

  .level__num {
    font-family: var(--font-mono);
    font-size: 0.82rem;
    color: color-mix(in srgb, var(--lvl-accent) 70%, var(--text));
    letter-spacing: -0.02em;
  }

  .level__titles {
    display: grid;
    gap: 2px;
    min-width: 0;
    flex: 1;
  }

  .level__titles h1 {
    font-size: clamp(1.6rem, 3.4vw, 2.2rem);
    letter-spacing: -0.035em;
    line-height: 1.08;
  }

  .level__subtitle {
    font-size: 0.84rem;
    color: var(--muted);
  }

  .level__meta {
    display: flex;
    gap: 7px;
    flex-wrap: wrap;
    margin-left: auto;
  }

  .level__lead {
    font-size: 0.98rem;
    line-height: 1.66;
    color: var(--text-soft);
    max-width: 78ch;
  }

  .level__tags {
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .level__tags li {
    font-family: var(--font-mono);
    font-size: 0.62rem;
    color: var(--muted);
    padding: 2px 8px;
    border-radius: 999px;
    border: 1px solid var(--border);
    background: var(--surface);
  }

  .tabs {
    display: grid;
    gap: 24px;
  }

  .tabs__bar {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 8px;
    position: sticky;
    top: 0;
    z-index: 20;
    padding: 8px 0;
    background: color-mix(in srgb, var(--bg) 88%, transparent);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }

  .tab {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 9px 12px;
    border-radius: 11px;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--muted);
    text-decoration: none;
    transition: border-color 0.15s ease, background 0.15s ease, color 0.15s ease;
    min-width: 0;
  }

  .tab:hover {
    color: var(--text-soft);
    border-color: var(--border-strong);
  }

  .tab.active {
    color: var(--text);
    border-color: color-mix(in srgb, var(--lvl-accent) 46%, var(--border));
    background: color-mix(in srgb, var(--lvl-accent) 9%, var(--surface));
    box-shadow: inset 0 -2px 0 var(--lvl-accent);
  }

  .tab__icon {
    display: inline-flex;
    color: var(--dim);
    flex: none;
  }

  .tab.active .tab__icon {
    color: var(--lvl-accent);
  }

  .tab__text {
    display: flex;
    flex-direction: column;
    min-width: 0;
    line-height: 1.2;
    flex: 1;
  }

  .tab__label {
    font-size: 0.83rem;
    font-weight: 600;
  }

  .tab__hint {
    font-size: 0.63rem;
    color: var(--dim);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .tab__count {
    flex: none;
    font-family: var(--font-mono);
    font-size: 0.65rem;
    color: var(--dim);
    font-variant-numeric: tabular-nums;
  }

  .tab.active .tab__count {
    color: color-mix(in srgb, var(--lvl-accent) 65%, var(--text));
  }

  .panel-in {
    animation: fade-up 0.32s var(--ease) both;
  }

  .pager {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    margin-top: 18px;
    padding-top: 22px;
    border-top: 1px solid var(--border);
  }

  .pager__link {
    display: grid;
    gap: 2px;
    padding: 14px 16px;
    border-radius: var(--radius);
    border: 1px solid var(--border);
    background: var(--surface);
    text-decoration: none;
    color: var(--text);
    transition: border-color 0.15s ease, background 0.15s ease;
  }

  .pager__link:hover {
    border-color: color-mix(in srgb, var(--lvl-accent) 40%, var(--border));
    background: color-mix(in srgb, var(--lvl-accent) 4%, var(--surface));
  }

  .pager__link--next {
    text-align: right;
    justify-items: end;
  }

  .pager__dir {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 0.63rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--dim);
  }

  .pager__link--prev .pager__dir :global(svg) {
    transform: rotate(180deg);
  }

  .pager__title {
    font-size: 0.92rem;
    font-weight: 600;
  }

  .pager__sub {
    font-size: 0.72rem;
    color: var(--muted);
  }

  @media (max-width: 760px) {
    .tabs__bar {
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 5px;
    }

    .tab {
      flex-direction: column;
      align-items: flex-start;
      gap: 3px;
      padding: 8px 8px 9px;
    }

    .tab__hint,
    .tab__count {
      display: none;
    }

    .tab__label {
      font-size: 0.73rem;
    }

    .level__meta {
      margin-left: 0;
    }
  }

  @media (max-width: 560px) {
    .level__title-row {
      align-items: flex-start;
    }

    .level__meta {
      width: 100%;
    }

    .pager {
      grid-template-columns: 1fr;
    }

    .pager__link--next {
      text-align: left;
      justify-items: start;
    }
  }
</style>
