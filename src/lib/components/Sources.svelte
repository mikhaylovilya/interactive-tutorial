<script lang="ts">
  import Icon from './Icon.svelte';
  import { honesty, sources } from '../data/meta';

  const totalLinks = sources.reduce((sum, group) => sum + group.items.length, 0);
</script>

<div class="sources">
  <header class="sources__head">
    <span class="eyebrow"><span class="dot"></span>методика и ссылки</span>
    <h1>Источники и честность</h1>
    <p>
      Туториал собран по официальной документации SQLite и практическим наблюдениям на учебном стенде.
      Ниже — ссылки на первоисточники и оговорки о том, что в выводе зависит от среды.
    </p>
    <div class="sources__meta">
      <span class="chip"><Icon name="book" size={13} />{totalLinks} ссылок</span>
      <span class="chip"><Icon name="alert" size={13} />{honesty.length} оговорки</span>
      <a class="chip chip--accent" href="https://sqlite.org/docs.html" target="_blank" rel="noreferrer">
        sqlite.org
        <Icon name="external" size={12} />
      </a>
    </div>
  </header>

  <section class="notes">
    <div class="section-head">
      <div>
        <span class="section-index">границы применимости</span>
        <h2>Что важно знать о данных</h2>
      </div>
      <p>Числа в туториале — иллюстрация методики, а не эталон. Проверяйте на своей базе и своей версии SQLite.</p>
    </div>

    <div class="notes__grid">
      {#each honesty as note, index}
        <article class="note">
          <span class="note__num">{String(index + 1).padStart(2, '0')}</span>
          <h3>{note.title}</h3>
          <p>{note.text}</p>
        </article>
      {/each}
    </div>
  </section>

  <section class="links">
    <div class="section-head">
      <div>
        <span class="section-index">первоисточники</span>
        <h2>Документация и инструменты</h2>
      </div>
      <p>Ссылки открываются в новой вкладке. Для офлайн-работы скачайте документацию SQLite одним архивом.</p>
    </div>

    <div class="links__groups">
      {#each sources as group, groupIndex}
        <section class="group">
          <h3 class="group__title">
            <span class="group__num">{String(groupIndex + 1).padStart(2, '0')}</span>
            {group.group}
            <span class="group__count">{group.items.length}</span>
          </h3>

          <ul class="group__list">
            {#each group.items as item}
              <li>
                <a class="link" href={item.url} target="_blank" rel="noreferrer">
                  <span class="link__label">
                    {item.label}
                    <Icon name="external" size={12} />
                  </span>
                  <span class="link__note">{item.note}</span>
                </a>
              </li>
            {/each}
          </ul>
        </section>
      {/each}
    </div>
  </section>

  <footer class="colophon">
    <div class="colophon__row">
      <span class="colophon__label">стек</span>
      <span>Svelte 5 · TypeScript · Vite · без UI-библиотек и чарт-движков</span>
    </div>
    <div class="colophon__row">
      <span class="colophon__label">хранение</span>
      <span>localStorage: ответы и тема. Данные никуда не отправляются</span>
    </div>
    <div class="colophon__row">
      <span class="colophon__label">сборка</span>
      <span>статический бандл, hash-роутинг, работает с любого подкаталога</span>
    </div>
  </footer>
</div>

<style>
  .sources {
    display: grid;
    gap: 52px;
    padding-bottom: 24px;
  }

  .sources__head {
    display: grid;
    gap: 12px;
    max-width: 78ch;
  }

  .sources__head h1 {
    font-size: clamp(1.9rem, 4vw, 2.8rem);
    letter-spacing: -0.04em;
  }

  .sources__head > p {
    font-size: 0.96rem;
    line-height: 1.68;
    color: var(--muted);
  }

  .sources__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
    text-decoration: none;
  }

  .notes__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .note {
    padding: 18px 19px 19px;
    border-radius: var(--radius);
    border: 1px solid var(--border);
    background:
      linear-gradient(150deg, color-mix(in srgb, var(--warn) 4%, transparent), transparent 55%),
      var(--surface);
  }

  .note__num {
    font-family: var(--font-mono);
    font-size: 0.64rem;
    color: var(--warn);
    letter-spacing: 0.08em;
  }

  .note h3 {
    font-size: 0.98rem;
    margin: 5px 0 6px;
  }

  .note p {
    font-size: 0.82rem;
    line-height: 1.6;
    color: var(--muted);
  }

  .links__groups {
    display: grid;
    gap: 16px;
  }

  .group {
    border-radius: var(--radius);
    border: 1px solid var(--border);
    background: var(--surface);
    overflow: hidden;
  }

  .group__title {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 18px;
    font-size: 0.85rem;
    border-bottom: 1px solid var(--border);
    background: var(--surface-2);
  }

  .group__num {
    font-family: var(--font-mono);
    font-size: 0.64rem;
    color: var(--accent);
  }

  .group__count {
    margin-left: auto;
    font-family: var(--font-mono);
    font-size: 0.66rem;
    color: var(--dim);
  }

  .group__list {
    list-style: none;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .group__list li {
    border-bottom: 1px solid var(--border);
    min-width: 0;
  }

  .group__list li:nth-child(odd) {
    border-right: 1px solid var(--border);
  }

  .link {
    display: grid;
    gap: 3px;
    padding: 12px 16px 13px;
    height: 100%;
    text-decoration: none;
    color: inherit;
    transition: background 0.14s ease;
  }

  .link:hover {
    background: color-mix(in srgb, var(--accent) 5%, var(--surface));
  }

  .link__label {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--text);
  }

  .link__label :global(svg) {
    color: var(--dim);
    flex: none;
  }

  .link:hover .link__label {
    color: var(--accent);
  }

  .link__note {
    font-size: 0.74rem;
    line-height: 1.5;
    color: var(--muted);
  }

  .colophon {
    display: grid;
    gap: 6px;
    padding-top: 18px;
    border-top: 1px solid var(--border);
  }

  .colophon__row {
    display: flex;
    gap: 12px;
    align-items: baseline;
    font-size: 0.74rem;
    color: var(--muted);
  }

  .colophon__label {
    flex: none;
    width: 74px;
    font-family: var(--font-mono);
    font-size: 0.62rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--dim);
  }

  @media (max-width: 860px) {
    .notes__grid,
    .group__list {
      grid-template-columns: 1fr;
    }

    .group__list li:nth-child(odd) {
      border-right: none;
    }
  }

  @media (max-width: 620px) {
    .sources {
      gap: 38px;
    }

    .colophon__row {
      flex-direction: column;
      gap: 1px;
    }

    .colophon__label {
      width: auto;
    }
  }
</style>
