<script lang="ts">
  import Icon from './lib/components/Icon.svelte';
  import LevelView from './lib/components/LevelView.svelte';
  import Overview from './lib/components/Overview.svelte';
  import Sidebar from './lib/components/Sidebar.svelte';
  import Sources from './lib/components/Sources.svelte';
  import Toast from './lib/components/Toast.svelte';
  import { levels } from './lib/data/levels';
  import { router } from './lib/router.svelte';
  import { progress } from './lib/stores/progress.svelte';

  let menuOpen = $state(false);

  const route = $derived(router.route);
  const overall = $derived(progress.overall);

  // Apply the theme to <html> and keep the browser UI colour in sync.
  $effect(() => {
    const theme = progress.theme;
    document.documentElement.dataset.theme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#060a12' : '#f4f7fb');
  });

  // Lock background scrolling while the mobile drawer is open.
  $effect(() => {
    document.body.classList.toggle('no-scroll', menuOpen);
    return () => document.body.classList.remove('no-scroll');
  });

  // A route change closes the drawer and returns to the top of the page.
  $effect(() => {
    router.path;
    menuOpen = false;
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  });

  function closeMenu(): void {
    menuOpen = false;
  }
</script>

<div class="shell">
  <Sidebar open={menuOpen} onclose={closeMenu} />

  <button
    type="button"
    class="backdrop"
    class:visible={menuOpen}
    aria-label="Закрыть меню"
    tabindex={menuOpen ? 0 : -1}
    onclick={closeMenu}
  ></button>

  <div class="main">
    <header class="topbar">
      <button
        type="button"
        class="topbar__menu"
        aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
        aria-expanded={menuOpen}
        onclick={() => (menuOpen = !menuOpen)}
      >
        <Icon name={menuOpen ? 'x' : 'menu'} size={20} />
      </button>

      <a class="topbar__brand" href="#/" onclick={closeMenu}>
        <span class="topbar__mark" aria-hidden="true">М</span>
        <span>
          <strong>Матрёшка</strong>
          <small>SQLite</small>
        </span>
      </a>

      <span class="topbar__progress" aria-label={`Прогресс ${overall}%`}>
        <span class="topbar__bar"><i style={`width: ${overall}%`}></i></span>
        <span class="topbar__pct">{overall}%</span>
      </span>
    </header>

    <main class="content" id="content">
      <div class="container">
        {#if route.name === 'overview'}
          <Overview />
        {:else if route.name === 'sources'}
          <Sources />
        {:else if route.name === 'level'}
          <LevelView level={route.level} tab={route.tab} />
        {:else}
          <div class="notfound">
            <span class="notfound__code">404</span>
            <h1>Такого уровня нет</h1>
            <p>
              Маршрут <code>{route.path}</code> не совпал ни с одним разделом. В туториале пять уровней —
              от ОС до внутренностей SQLite.
            </p>
            <div class="notfound__actions">
              <a class="btn btn--primary" href="#/">Все уровни</a>
              <a class="btn btn--ghost" href={`#${router.levelPath(levels[0].id)}`}>Уровень 1</a>
            </div>
          </div>
        {/if}
      </div>

      <footer class="foot">
        <span>Учебный стенд · SQLite 3.43 / 3.50 · macOS</span>
        <span class="foot__sep" aria-hidden="true">·</span>
        <a href="#/sources">Методика и источники</a>
        <span class="foot__progress">Прогресс хранится только в этом браузере</span>
      </footer>
    </main>
  </div>

  <Toast />
</div>

<style>
  .shell {
    display: flex;
    min-height: 100vh;
    background:
      radial-gradient(70% 50% at 100% 0%, color-mix(in srgb, var(--accent) 4%, transparent), transparent 60%),
      var(--bg);
  }

  .main {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  .content {
    flex: 1;
    width: 100%;
    padding: 34px 40px 0;
  }

  .container {
    width: 100%;
    max-width: var(--content-w);
    margin: 0 auto;
    animation: fade-in 0.3s var(--ease) both;
  }

  .topbar {
    display: none;
  }

  .backdrop {
    display: none;
  }

  .foot {
    max-width: var(--content-w);
    margin: 0 auto;
    padding: 26px 0 28px;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px 10px;
    font-size: 0.68rem;
    color: var(--dim);
    border-top: 1px solid var(--border);
    margin-top: 46px;
  }

  .foot a {
    color: var(--muted);
    text-decoration: none;
  }

  .foot a:hover {
    color: var(--accent);
  }

  .foot__sep {
    opacity: 0.5;
  }

  .foot__progress {
    margin-left: auto;
  }

  .notfound {
    display: grid;
    gap: 12px;
    justify-items: start;
    padding: 40px 0 60px;
    max-width: 62ch;
  }

  .notfound__code {
    font-family: var(--font-mono);
    font-size: 0.8rem;
    letter-spacing: 0.18em;
    color: var(--danger);
  }

  .notfound h1 {
    font-size: clamp(1.8rem, 4vw, 2.6rem);
  }

  .notfound p {
    font-size: 0.94rem;
    line-height: 1.65;
    color: var(--muted);
  }

  .notfound__actions {
    display: flex;
    gap: 9px;
    flex-wrap: wrap;
    margin-top: 6px;
  }

  @media (max-width: 980px) {
    .topbar {
      display: flex;
      align-items: center;
      gap: 10px;
      position: sticky;
      top: 0;
      z-index: 30;
      padding: max(9px, env(safe-area-inset-top)) 14px 9px;
      border-bottom: 1px solid var(--border);
      background: color-mix(in srgb, var(--bg) 90%, transparent);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
    }

    .topbar__menu {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 38px;
      height: 38px;
      flex: none;
      border-radius: 10px;
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--text-soft);
    }

    .topbar__brand {
      display: flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      color: var(--text);
      min-width: 0;
    }

    .topbar__mark {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      flex: none;
      border-radius: 8px;
      font-family: var(--font-mono);
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--accent);
      border: 1px solid color-mix(in srgb, var(--accent) 35%, var(--border));
      background: color-mix(in srgb, var(--accent) 8%, var(--surface));
    }

    .topbar__brand span:last-child {
      display: flex;
      flex-direction: column;
      line-height: 1.15;
    }

    .topbar__brand strong {
      font-size: 0.82rem;
      letter-spacing: -0.01em;
    }

    .topbar__brand small {
      font-size: 0.6rem;
      color: var(--dim);
    }

    .topbar__progress {
      margin-left: auto;
      display: inline-flex;
      align-items: center;
      gap: 7px;
    }

    .topbar__bar {
      display: block;
      width: 54px;
      height: 5px;
      border-radius: 999px;
      background: var(--track);
      overflow: hidden;
    }

    .topbar__bar i {
      display: block;
      height: 100%;
      border-radius: inherit;
      background: var(--accent);
      transition: width 0.4s var(--ease);
    }

    .topbar__pct {
      font-family: var(--font-mono);
      font-size: 0.66rem;
      color: var(--muted);
      font-variant-numeric: tabular-nums;
    }

    .content {
      padding: 24px 18px 0;
    }

    .backdrop {
      display: block;
      position: fixed;
      inset: 0;
      z-index: 35;
      background: rgba(0, 0, 0, 0.55);
      backdrop-filter: blur(2px);
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.24s ease;
    }

    .backdrop.visible {
      opacity: 1;
      pointer-events: auto;
    }
  }

  @media (max-width: 560px) {
    .content {
      padding: 18px 13px 0;
    }

    .foot {
      margin-top: 32px;
      padding-bottom: 22px;
    }

    .foot__progress {
      margin-left: 0;
      width: 100%;
    }
  }
</style>
