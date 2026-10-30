<script lang="ts">
  import Icon from './Icon.svelte';
  import Matryoshka from './Matryoshka.svelte';
  import { levels } from '../data/levels';
  import { overview } from '../data/meta';
  import { router } from '../router.svelte';
  import { progress } from '../stores/progress.svelte';

  const resume = $derived(progress.nextLevel);
  const started = $derived(progress.visited.length > 0);
  const ctaLabel = $derived(started ? 'Продолжить разбор' : 'Начать с уровня 1');
</script>

<div class="overview">
  <section class="hero">
    <div class="hero__copy">
      <span class="eyebrow"><span class="dot"></span>{overview.eyebrow}</span>

      <h1 class="hero__title">
        {overview.title}
        <span class="hero__accent">{overview.accent}</span>
      </h1>

      <p class="hero__lead">{overview.lead}</p>
      <p class="hero__desc">{overview.description}</p>

      <div class="hero__actions">
        <a class="btn btn--primary" href={`#${router.levelPath(resume.id)}`}>
          {ctaLabel}
          <Icon name="arrow" size={16} />
        </a>
        <a class="btn btn--ghost" href="#/sources">
          <Icon name="book" size={16} />
          Источники и методика
        </a>
      </div>

      <dl class="stats">
        {#each overview.stats as stat}
          <div class="stat">
            <dt class="stat__value">{stat.value}</dt>
            <dd class="stat__label">{stat.label}</dd>
            <dd class="stat__hint">{stat.hint}</dd>
          </div>
        {/each}
      </dl>
    </div>

    <div class="hero__art">
      <Matryoshka />
      <div class="hero__legend" aria-hidden="true">
        {#each levels as level}
          <span class="legend__item" style={`--level-color: ${level.color}`}>
            <i></i>{level.number}
          </span>
        {/each}
        <span class="legend__text">снаружи → внутрь</span>
      </div>
    </div>
  </section>

  <section class="layers">
    <div class="section-head">
      <div>
        <span class="section-index">маршрут · 5 слоёв</span>
        <h2>От процесса до байта</h2>
      </div>
      <p>Каждый слой дешевле и точнее предыдущего — и отвечает на свой вопрос. Идти лучше по порядку, но навигация свободная.</p>
    </div>

    <div class="layers__list">
      {#each levels as level, index}
        {@const stats = progress.stats(level)}
        <a
          class="layer"
          href={`#${router.levelPath(level.id)}`}
          style={`--level-color: ${level.color}`}
        >
          <span class="layer__num">{String(index + 1).padStart(2, '0')}</span>

          <span class="layer__main">
            <span class="layer__top">
              <strong>{level.tabTitle}</strong>
              <span class="layer__time">{level.time}</span>
              {#if stats.done}
                <span class="layer__done"><Icon name="check" size={12} stroke={2.4} /> пройден</span>
              {:else if stats.answered > 0}
                <span class="layer__progress">{stats.correct}/{stats.total}</span>
              {/if}
            </span>
            <span class="layer__sub">{level.title} · {level.subtitle}</span>
            <span class="layer__text">{overview.layers[index]?.text ?? level.lead}</span>
            <span class="layer__tags">
              {#each level.tags.slice(0, 4) as tag}
                <span class="layer__tag">{tag}</span>
              {/each}
            </span>
          </span>

          <span class="layer__go"><Icon name="chevron" size={18} /></span>
        </a>
      {/each}
    </div>
  </section>

  <section class="howto">
    <div class="section-head">
      <div>
        <span class="section-index">как пользоваться</span>
        <h2>Четыре правила</h2>
      </div>
      <p>Туториал рассчитан на 60–90 минут. Прогресс сохраняется в браузере, регистрация не нужна.</p>
    </div>

    <div class="howto__grid">
      {#each overview.howTo as item, index}
        <article class="howto__item">
          <span class="howto__num">{String(index + 1).padStart(2, '0')}</span>
          <h3>{item.title}</h3>
          <p>{item.text}</p>
        </article>
      {/each}
    </div>
  </section>

  <section class="tabs-help">
    <div class="tabs-help__head">
      <Icon name="layers" size={18} />
      <h2>Что внутри каждого уровня</h2>
    </div>
    <div class="tabs-help__grid">
      <div>
        <span class="tabs-help__label">Теория</span>
        <p>Принцип слоя, инструменты, таблица метрик и чек-лист диагностики.</p>
      </div>
      <div>
        <span class="tabs-help__label">Визуалы</span>
        <p>Схемы, интерактивные дампы и реальные выводы команд с пометкой источника.</p>
      </div>
      <div>
        <span class="tabs-help__label">Практика</span>
        <p>Сценарии с командами и трактовкой результата, плюс типичные ошибки.</p>
      </div>
      <div>
        <span class="tabs-help__label">Квиз</span>
        <p>Три вопроса с проверкой и подробным объяснением. Прогресс — по верным ответам.</p>
      </div>
    </div>
  </section>
</div>

<style>
  .overview {
    display: grid;
    gap: 64px;
    padding-bottom: 24px;
  }

  .hero {
    display: grid;
    grid-template-columns: minmax(0, 1.15fr) minmax(280px, 0.85fr);
    gap: 34px;
    align-items: center;
    padding-top: 8px;
  }

  .hero__copy {
    display: grid;
    gap: 16px;
    min-width: 0;
  }

  .hero__title {
    font-size: clamp(2.1rem, 4.6vw, 3.5rem);
    letter-spacing: -0.045em;
    line-height: 1.04;
    max-width: 18ch;
  }

  .hero__accent {
    display: block;
    color: var(--accent);
    font-family: var(--font-mono);
    font-size: 0.62em;
    letter-spacing: -0.04em;
    margin-top: 4px;
    text-shadow: 0 0 34px color-mix(in srgb, var(--accent) 30%, transparent);
  }

  .hero__lead {
    font-size: clamp(1rem, 1.6vw, 1.12rem);
    line-height: 1.62;
    color: var(--text-soft);
    max-width: 58ch;
  }

  .hero__desc {
    font-size: 0.88rem;
    line-height: 1.65;
    color: var(--muted);
    max-width: 62ch;
    padding-left: 13px;
    border-left: 2px solid color-mix(in srgb, var(--accent) 40%, var(--border));
  }

  .hero__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 6px;
  }

  .stats {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 1px;
    margin-top: 14px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--border);
    overflow: hidden;
  }

  .stat {
    padding: 13px 14px 14px;
    background: var(--surface);
    min-width: 0;
  }

  .stat__value {
    font-size: 1.32rem;
    font-weight: 680;
    letter-spacing: -0.04em;
    color: var(--text);
    font-variant-numeric: tabular-nums;
  }

  .stat__label {
    font-size: 0.72rem;
    color: var(--text-soft);
    margin-top: 1px;
  }

  .stat__hint {
    font-size: 0.62rem;
    color: var(--dim);
    margin-top: 1px;
  }

  .hero__art {
    display: grid;
    justify-items: center;
    gap: 8px;
    min-width: 0;
  }

  .hero__legend {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .legend__item {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-family: var(--font-mono);
    font-size: 0.68rem;
    color: var(--muted);
  }

  .legend__item i {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--level-color);
    box-shadow: 0 0 8px color-mix(in srgb, var(--level-color) 60%, transparent);
  }

  .legend__text {
    font-family: var(--font-mono);
    font-size: 0.62rem;
    color: var(--dim);
    letter-spacing: 0.04em;
  }

  .layers__list {
    display: grid;
    gap: 10px;
  }

  .layer {
    display: grid;
    grid-template-columns: 42px minmax(0, 1fr) 28px;
    gap: 14px;
    align-items: center;
    padding: 15px 18px 16px;
    border-radius: var(--radius);
    border: 1px solid var(--border);
    background: var(--surface);
    text-decoration: none;
    color: var(--text);
    position: relative;
    overflow: hidden;
    transition: border-color 0.16s ease, transform 0.16s ease, background 0.16s ease;
  }

  .layer::before {
    content: '';
    position: absolute;
    inset: 0 auto 0 0;
    width: 3px;
    background: var(--level-color);
    opacity: 0.7;
  }

  .layer:hover {
    border-color: color-mix(in srgb, var(--level-color) 38%, var(--border));
    transform: translateX(5px);
    background: color-mix(in srgb, var(--level-color) 4%, var(--surface));
  }

  .layer__num {
    font-family: var(--font-mono);
    font-size: 0.95rem;
    color: var(--level-color);
    letter-spacing: -0.03em;
    text-align: center;
  }

  .layer__main {
    display: grid;
    gap: 2px;
    min-width: 0;
  }

  .layer__top {
    display: flex;
    align-items: baseline;
    gap: 10px;
    flex-wrap: wrap;
  }

  .layer__top strong {
    font-size: 1rem;
    letter-spacing: -0.015em;
  }

  .layer__time {
    font-family: var(--font-mono);
    font-size: 0.62rem;
    color: var(--dim);
  }

  .layer__done {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: 0.62rem;
    color: var(--ok);
    border: 1px solid color-mix(in srgb, var(--ok) 30%, var(--border));
    border-radius: 999px;
    padding: 1px 7px;
    background: color-mix(in srgb, var(--ok) 7%, transparent);
  }

  .layer__progress {
    font-family: var(--font-mono);
    font-size: 0.64rem;
    color: var(--level-color);
  }

  .layer__sub {
    font-size: 0.76rem;
    color: var(--muted);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .layer__text {
    font-size: 0.8rem;
    line-height: 1.52;
    color: var(--dim);
    margin-top: 4px;
    max-width: 88ch;
  }

  .layer__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    margin-top: 7px;
  }

  .layer__tag {
    font-family: var(--font-mono);
    font-size: 0.6rem;
    color: var(--muted);
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 1px 7px;
    background: var(--surface-2);
  }

  .layer__go {
    color: var(--dim);
    display: inline-flex;
    justify-content: flex-end;
    transition: color 0.16s ease, transform 0.16s ease;
  }

  .layer:hover .layer__go {
    color: var(--level-color);
    transform: translateX(2px);
  }

  .howto__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .howto__item {
    padding: 18px 19px 19px;
    border-radius: var(--radius);
    border: 1px solid var(--border);
    background: var(--surface);
    position: relative;
  }

  .howto__num {
    font-family: var(--font-mono);
    font-size: 0.66rem;
    color: color-mix(in srgb, var(--accent) 60%, var(--dim));
    letter-spacing: 0.08em;
  }

  .howto__item h3 {
    font-size: 0.98rem;
    margin: 5px 0 7px;
  }

  .howto__item p {
    font-size: 0.82rem;
    line-height: 1.6;
    color: var(--muted);
  }

  .tabs-help {
    padding: 22px 24px 24px;
    border-radius: var(--radius);
    border: 1px solid var(--border);
    background:
      radial-gradient(90% 140% at 0% 0%, color-mix(in srgb, var(--accent) 6%, transparent), transparent 60%),
      var(--surface);
  }

  .tabs-help__head {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 16px;
    color: var(--accent);
  }

  .tabs-help__head h2 {
    font-size: 1.1rem;
    color: var(--text);
  }

  .tabs-help__grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 18px;
  }

  .tabs-help__label {
    display: inline-block;
    font-size: 0.63rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--text-soft);
    font-weight: 650;
    margin-bottom: 4px;
  }

  .tabs-help__grid p {
    font-size: 0.78rem;
    line-height: 1.55;
    color: var(--muted);
  }

  @media (max-width: 1080px) {
    .hero {
      grid-template-columns: 1fr;
    }

    .hero__art {
      order: -1;
    }

    .hero__art :global(.mat) {
      max-width: 300px;
    }

    .tabs-help__grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 720px) {
    .overview {
      gap: 46px;
    }

    .stats {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .howto__grid {
      grid-template-columns: 1fr;
    }

    .layer {
      grid-template-columns: 32px minmax(0, 1fr);
      padding: 14px 14px 15px;
      gap: 10px;
    }

    .layer__go {
      display: none;
    }

    .layer__sub {
      white-space: normal;
    }

    .tabs-help {
      padding: 18px 17px 20px;
    }

    .tabs-help__grid {
      grid-template-columns: 1fr;
      gap: 13px;
    }
  }
</style>
