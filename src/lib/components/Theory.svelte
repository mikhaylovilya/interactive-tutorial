<script lang="ts">
  import CmdBlock from './CmdBlock.svelte';
  import Icon from './Icon.svelte';
  import MetricsTable from './MetricsTable.svelte';
  import type { Level } from '../data/types';

  interface Props {
    level: Level;
  }

  let { level }: Props = $props();

  const theory = $derived(level.theory);
</script>

<div class="theory">
  <section class="theory__intro">
    <div class="prose theory__lead">
      {#each theory.intro as paragraph}
        <p>{paragraph}</p>
      {/each}
    </div>

    <aside class="callout theory__idea">
      <span class="callout__icon"><Icon name="info" size={18} /></span>
      <div>
        <strong>{theory.keyIdea.title}</strong>
        <p>{theory.keyIdea.text}</p>
      </div>
    </aside>
  </section>

  <section>
    <div class="section-head">
      <div>
        <span class="section-index">01 · как это устроено</span>
        <h2>Разбор по слоям</h2>
      </div>
      <p>Пять разделов: от общего принципа к конкретным командам и тому, что они на самом деле показывают.</p>
    </div>

    <div class="theory__sections">
      {#each theory.sections as section, index}
        <article class="section-card">
          <div class="section-card__head">
            <span class="section-card__num">{String(index + 1).padStart(2, '0')}</span>
            <h3>{section.title}</h3>
          </div>
          <div class="prose section-card__body">
            {#each section.body as paragraph}
              <p>{paragraph}</p>
            {/each}
          </div>
          {#if section.bullets?.length}
            <ul class="section-card__bullets">
              {#each section.bullets as bullet}
                <li>
                  <span class="section-card__bullet-dot" aria-hidden="true"></span>
                  <span>{bullet}</span>
                </li>
              {/each}
            </ul>
          {/if}
        </article>
      {/each}
    </div>
  </section>

  <section>
    <div class="section-head">
      <div>
        <span class="section-index">02 · инструменты</span>
        <h2>Чем смотреть</h2>
      </div>
      <p>{theory.tools.length} инструментов уровня. Команды можно скопировать, но на проде сначала прочитайте, что они меняют.</p>
    </div>

    <div class="tool-grid">
      {#each theory.tools as tool}
        <article class="tool">
          <header class="tool__head">
            <h3>{tool.name}</h3>
            <span class="tool__tag">{tool.tag}</span>
          </header>
          <p class="tool__desc">{tool.desc}</p>
          <CmdBlock code={tool.cmd} lang="cli" label="команда" dense />
          <p class="tool__shows">
            <Icon name="search" size={13} />
            <span>{tool.shows}</span>
          </p>
        </article>
      {/each}
    </div>
  </section>

  <section>
    <div class="section-head">
      <div>
        <span class="section-index">03 · метрики</span>
        <h2>Что измерять</h2>
      </div>
      <p>Норма и тревога зависят от нагрузки. Таблица — отправная точка, а не универсальный порог.</p>
    </div>
    <MetricsTable metrics={theory.metrics} />
  </section>

  <section>
    <div class="section-head">
      <div>
        <span class="section-index">04 · чек-лист</span>
        <h2>Порядок действий</h2>
      </div>
      <p>Пять шагов, которые стоит пройти до того, как менять что-то на живой базе.</p>
    </div>

    <ul class="checklist">
      {#each theory.checklist as item}
        <li>
          <span class="checklist__box" aria-hidden="true"><Icon name="check" size={13} stroke={2.4} /></span>
          <span>{item}</span>
        </li>
      {/each}
    </ul>
  </section>
</div>

<style>
  .theory {
    display: grid;
    gap: 46px;
  }

  .theory__lead {
    max-width: 78ch;
    font-size: 1.01rem;
    line-height: 1.72;
  }

  .theory__intro {
    display: grid;
    gap: 20px;
  }

  .theory__idea {
    max-width: 78ch;
  }

  .theory__idea p {
    margin-top: 4px;
    font-size: 0.87rem;
    line-height: 1.55;
    color: var(--muted);
  }

  .theory__sections {
    display: grid;
    gap: 14px;
  }

  .section-card {
    padding: 20px 22px 22px;
    border-radius: var(--radius);
    border: 1px solid var(--border);
    background: var(--surface);
  }

  .section-card__head {
    display: flex;
    align-items: baseline;
    gap: 12px;
    margin-bottom: 10px;
  }

  .section-card__num {
    font-family: var(--font-mono);
    font-size: 0.7rem;
    color: color-mix(in srgb, var(--lvl-accent, var(--accent)) 60%, var(--dim));
    letter-spacing: 0.06em;
  }

  .section-card h3 {
    font-size: 1.05rem;
  }

  .section-card__body {
    max-width: 76ch;
    font-size: 0.92rem;
    line-height: 1.66;
  }

  .section-card__body :global(p + p) {
    margin-top: 0.8em;
  }

  .section-card__bullets {
    list-style: none;
    display: grid;
    gap: 7px;
    margin-top: 14px;
    padding-top: 13px;
    border-top: 1px dashed var(--border);
    max-width: 82ch;
  }

  .section-card__bullets li {
    display: flex;
    gap: 9px;
    align-items: flex-start;
    font-size: 0.85rem;
    color: var(--muted);
    line-height: 1.5;
  }

  .section-card__bullet-dot {
    flex: none;
    width: 5px;
    height: 5px;
    margin-top: 7px;
    border-radius: 50%;
    background: var(--accent);
    opacity: 0.75;
  }

  .tool-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }

  .tool {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 16px 17px 15px;
    border-radius: var(--radius);
    border: 1px solid var(--border);
    background: var(--surface);
    min-width: 0;
  }

  .tool__head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 10px;
  }

  .tool__head h3 {
    font-family: var(--font-mono);
    font-size: 0.9rem;
    font-weight: 600;
    letter-spacing: -0.01em;
  }

  .tool__tag {
    flex: none;
    font-size: 0.61rem;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: var(--muted);
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 2px 7px;
    background: var(--surface-2);
  }

  .tool__desc {
    font-size: 0.82rem;
    line-height: 1.55;
    color: var(--muted);
    flex: 1;
  }

  .tool :global(.cmd) {
    margin-top: auto;
  }

  .tool__shows {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    font-size: 0.72rem;
    color: var(--dim);
  }

  .tool__shows :global(svg) {
    flex: none;
    margin-top: 2px;
    color: var(--accent);
  }

  .checklist {
    list-style: none;
    display: grid;
    gap: 9px;
    counter-reset: step;
  }

  .checklist li {
    display: flex;
    align-items: flex-start;
    gap: 11px;
    padding: 12px 15px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
    background: var(--surface);
    font-size: 0.88rem;
    color: var(--text-soft);
  }

  .checklist__box {
    flex: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 21px;
    height: 21px;
    margin-top: 1px;
    border-radius: 6px;
    color: var(--accent);
    border: 1px solid color-mix(in srgb, var(--accent) 32%, var(--border));
    background: color-mix(in srgb, var(--accent) 8%, transparent);
  }

  @media (max-width: 860px) {
    .tool-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 620px) {
    .theory {
      gap: 36px;
    }

    .section-card {
      padding: 16px 16px 18px;
    }
  }
</style>
