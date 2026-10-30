<script lang="ts">
  import Icon from './Icon.svelte';
  import { levels } from '../data/levels';
  import { router } from '../router.svelte';
  import { progress } from '../stores/progress.svelte';
  import { toast } from '../stores/toast.svelte';

  interface Props {
    open?: boolean;
    onclose?: () => void;
  }

  let { open = false, onclose = () => {} }: Props = $props();

  let confirmReset = $state(false);

  const overall = $derived(progress.overall);
  const completed = $derived(progress.completedLevels);
  const route = $derived(router.route);

  // Ring geometry: r = 26, so circumference = 2 * π * r.
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = $derived(circumference * (1 - overall / 100));

  const themeLabel = $derived(progress.theme === 'dark' ? 'Светлая тема' : 'Тёмная тема');

  function activeLevel(id: string): boolean {
    return route.name === 'level' && route.level.id === id;
  }

  function resetAll(): void {
    progress.resetAll();
    confirmReset = false;
    toast.push('Прогресс сброшен', 'ok');
  }
</script>

<aside class="sidebar" class:open aria-label="Навигация по туториалу">
  <div class="sidebar__top">
    <a class="brand" href="#/" onclick={onclose}>
      <span class="brand__mark" aria-hidden="true">
        <svg viewBox="0 0 32 32" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.6">
          <path d="M16 3.5c-3.8 0-6 2.8-6 6 0 2 .8 3.6 2.1 4.6C9.3 16.2 7.6 19.8 7.6 23.4c0 3 2 4.6 5 4.6h6.8c3 0 5-1.6 5-4.6 0-3.6-1.7-7.2-4.5-9.3 1.3-1 2.1-2.6 2.1-4.6 0-3.2-2.2-6-6-6z" />
          <circle cx="16" cy="10" r="2.1" fill="currentColor" stroke="none" />
          <path d="M13 24h6" stroke-linecap="round" opacity="0.5" />
        </svg>
      </span>
      <span class="brand__text">
        <strong>Матрёшка</strong>
        <small>мониторинг SQLite</small>
      </span>
    </a>
  </div>

  <div class="progress-card">
    <div class="progress-card__ring">
      <svg viewBox="0 0 64 64" role="img" aria-label={`Общий прогресс: ${overall} процентов`}>
        <circle cx="32" cy="32" r={radius} fill="none" stroke="var(--track)" stroke-width="5" />
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke="var(--accent)"
          stroke-width="5"
          stroke-linecap="round"
          stroke-dasharray={circumference}
          stroke-dashoffset={dashOffset}
          transform="rotate(-90 32 32)"
          class="progress-card__arc"
        />
      </svg>
      <span class="progress-card__value">{overall}<small>%</small></span>
    </div>
    <div class="progress-card__text">
      <strong>{progress.totalCorrect} / {progress.totalQuestions} вопросов</strong>
      <span>{completed} из {levels.length} уровней пройдено</span>
    </div>
  </div>

  <nav class="nav" aria-label="Разделы">
    <span class="nav__label">Обзор</span>
    <a
      class="nav__link"
      class:active={route.name === 'overview'}
      href="#/"
      onclick={onclose}
    >
      <span class="nav__icon"><Icon name="grid" size={16} /></span>
      <span class="nav__title">Все уровни</span>
    </a>

    <span class="nav__label nav__label--levels">Уровни</span>
    {#each levels as level}
      {@const stats = progress.stats(level)}
      <a
        class="nav__link"
        class:active={activeLevel(level.id)}
        href={`#${router.levelPath(level.id)}`}
        onclick={onclose}
        style={`--level-color: ${level.color}`}
      >
        <span class="nav__num" style={`border-color: ${level.color}`}>{level.number}</span>
        <span class="nav__text">
          <span class="nav__title">{level.tabTitle}</span>
          <span class="nav__sub">{level.title}</span>
        </span>
        <span class="nav__score" class:done={stats.done}>
          {#if stats.done}
            <Icon name="check" size={13} stroke={2.4} />
          {:else}
            {stats.correct}/{stats.total}
          {/if}
        </span>
      </a>
    {/each}

    <span class="nav__label">Ещё</span>
    <a class="nav__link" class:active={route.name === 'sources'} href="#/sources" onclick={onclose}>
      <span class="nav__icon"><Icon name="book" size={16} /></span>
      <span class="nav__title">Источники и методика</span>
    </a>
  </nav>

  <div class="sidebar__foot">
    <button type="button" class="foot-btn" onclick={() => progress.toggleTheme()}>
      <Icon name={progress.theme === 'dark' ? 'sun' : 'moon'} size={15} />
      <span>{themeLabel}</span>
    </button>

    {#if confirmReset}
      <div class="foot-confirm">
        <span>Сбросить весь прогресс?</span>
        <button type="button" class="foot-confirm__yes" onclick={resetAll}>Да</button>
        <button type="button" class="foot-confirm__no" onclick={() => (confirmReset = false)}>Нет</button>
      </div>
    {:else}
      <button type="button" class="foot-btn foot-btn--muted" onclick={() => (confirmReset = true)}>
        <Icon name="reset" size={15} />
        <span>Сбросить прогресс</span>
      </button>
    {/if}

    <p class="sidebar__hint">Прогресс хранится локально в браузере.</p>
  </div>
</aside>

<style>
  .sidebar {
    position: sticky;
    top: 0;
    display: flex;
    flex-direction: column;
    gap: 18px;
    width: var(--sidebar-w);
    height: 100vh;
    height: 100dvh;
    padding: 20px 16px 16px;
    border-right: 1px solid var(--border);
    background:
      radial-gradient(120% 60% at 0% 0%, color-mix(in srgb, var(--accent) 5%, transparent), transparent 60%),
      var(--bg);
    z-index: 40;
  }

  .sidebar__top {
    flex: none;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    color: var(--text);
    padding: 2px;
  }

  .brand__mark {
    display: inline-flex;
    color: var(--accent);
    filter: drop-shadow(0 0 12px color-mix(in srgb, var(--accent) 35%, transparent));
  }

  .brand__text {
    display: flex;
    flex-direction: column;
    line-height: 1.2;
  }

  .brand__text strong {
    font-size: 0.98rem;
    letter-spacing: -0.02em;
  }

  .brand__text small {
    font-size: 0.67rem;
    color: var(--dim);
    letter-spacing: 0.04em;
  }

  .progress-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 11px 12px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
    background: var(--surface);
  }

  .progress-card__ring {
    position: relative;
    flex: none;
    width: 56px;
    height: 56px;
  }

  .progress-card__ring svg {
    width: 100%;
    height: 100%;
  }

  .progress-card__arc {
    transition: stroke-dashoffset 0.5s var(--ease);
  }

  .progress-card__value {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.82rem;
    font-weight: 650;
    letter-spacing: -0.03em;
    font-variant-numeric: tabular-nums;
  }

  .progress-card__value small {
    font-size: 0.58rem;
    color: var(--muted);
    margin-left: 1px;
  }

  .progress-card__text {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .progress-card__text strong {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-soft);
  }

  .progress-card__text span {
    font-size: 0.66rem;
    color: var(--dim);
  }

  .nav {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding-right: 2px;
  }

  .nav__label {
    font-size: 0.6rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--dim);
    font-weight: 650;
    margin: 10px 8px 4px;
  }

  .nav__label--levels {
    margin-top: 14px;
  }

  .nav__link {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 7px 8px;
    border-radius: 8px;
    text-decoration: none;
    color: var(--muted);
    border: 1px solid transparent;
    transition: background 0.14s ease, color 0.14s ease, border-color 0.14s ease;
    min-width: 0;
  }

  .nav__link:hover {
    background: var(--surface);
    color: var(--text-soft);
  }

  .nav__link.active {
    background: var(--surface);
    border-color: var(--border);
    color: var(--text);
  }

  .nav__link.active::before {
    content: '';
    position: absolute;
  }

  .nav__icon {
    display: inline-flex;
    color: var(--dim);
    flex: none;
    width: 20px;
    justify-content: center;
  }

  .nav__link.active .nav__icon {
    color: var(--accent);
  }

  .nav__num {
    flex: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 21px;
    height: 21px;
    border-radius: 50%;
    border: 1px solid var(--border-strong);
    font-family: var(--font-mono);
    font-size: 0.64rem;
    color: var(--text-soft);
    background: var(--surface-2);
  }

  .nav__text {
    display: flex;
    flex-direction: column;
    min-width: 0;
    flex: 1;
    line-height: 1.25;
  }

  .nav__title {
    font-size: 0.8rem;
    font-weight: 550;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .nav__sub {
    font-size: 0.63rem;
    color: var(--dim);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .nav__score {
    flex: none;
    font-family: var(--font-mono);
    font-size: 0.61rem;
    color: var(--dim);
    font-variant-numeric: tabular-nums;
    display: inline-flex;
    align-items: center;
    min-width: 28px;
    justify-content: flex-end;
  }

  .nav__score.done {
    color: var(--ok);
  }

  .sidebar__foot {
    flex: none;
    display: grid;
    gap: 5px;
    padding-top: 12px;
    border-top: 1px solid var(--border);
  }

  .foot-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    text-align: left;
    padding: 7px 8px;
    border-radius: 7px;
    font-size: 0.75rem;
    color: var(--muted);
  }

  .foot-btn:hover {
    background: var(--surface);
    color: var(--text-soft);
  }

  .foot-btn--muted {
    color: var(--dim);
  }

  .foot-confirm {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
    padding: 7px 8px;
    font-size: 0.72rem;
    color: var(--muted);
  }

  .foot-confirm__yes,
  .foot-confirm__no {
    font-size: 0.7rem;
    padding: 2px 7px;
    border-radius: 5px;
    border: 1px solid var(--border);
  }

  .foot-confirm__yes {
    color: var(--danger);
    border-color: color-mix(in srgb, var(--danger) 35%, var(--border));
  }

  .foot-confirm__no {
    color: var(--text-soft);
  }

  .sidebar__hint {
    font-size: 0.62rem;
    color: var(--dim);
    padding: 2px 8px 0;
    line-height: 1.4;
  }

  @media (max-width: 980px) {
    .sidebar {
      position: fixed;
      top: 0;
      bottom: 0;
      left: 0;
      width: min(320px, 86vw);
      transform: translateX(-100%);
      transition: transform 0.28s var(--ease);
      box-shadow: var(--shadow);
      background: var(--bg);
      padding-top: max(20px, env(safe-area-inset-top));
    }

    .sidebar.open {
      transform: translateX(0);
    }
  }
</style>
