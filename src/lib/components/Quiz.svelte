<script lang="ts">
  import Icon from './Icon.svelte';
  import { levels } from '../data/levels';
  import { router } from '../router.svelte';
  import { progress } from '../stores/progress.svelte';
  import type { Level } from '../data/types';

  interface Props {
    level: Level;
  }

  let { level }: Props = $props();

  let confirmReset = $state(false);

  const stats = $derived(progress.stats(level));

  const nextLevel = $derived.by(() => {
    const index = levels.findIndex((item) => item.id === level.id);
    return index >= 0 ? levels[index + 1] : undefined;
  });

  function optionClass(questionIndex: number, optionIndex: number): string {
    const item = progress.answers[level.id]?.[questionIndex];
    if (!item) return '';
    const isCorrect = level.quiz[questionIndex].correct === optionIndex;
    if (item.checked) {
      if (isCorrect) return 'is-correct';
      if (item.selected === optionIndex) return 'is-wrong';
      return 'is-muted';
    }
    return item.selected === optionIndex ? 'is-selected' : '';
  }

  function statusOf(questionIndex: number): { label: string; tone: string } {
    const item = progress.answers[level.id]?.[questionIndex];
    if (!item?.checked) return { label: 'не проверен', tone: 'idle' };
    return item.selected === level.quiz[questionIndex].correct
      ? { label: 'верно', tone: 'ok' }
      : { label: 'неверно', tone: 'bad' };
  }

  function reset(): void {
    progress.resetLevel(level.id);
    confirmReset = false;
  }
</script>

<div class="quiz">
  <div class="quiz__meter">
    <div class="quiz__meter-text">
      <strong>{stats.correct} из {stats.total}</strong>
      <span>верных ответов · проверено {stats.checked} из {stats.total}</span>
    </div>
    <div class="quiz__bar" role="progressbar" aria-valuemin="0" aria-valuemax={stats.total} aria-valuenow={stats.correct} aria-label="Верные ответы уровня">
      <span style={`width: ${(stats.correct / stats.total) * 100}%`}></span>
    </div>
    {#if confirmReset}
      <span class="quiz__confirm">
        Сбросить?
        <button type="button" class="quiz__confirm-yes" onclick={reset}>да</button>
        <button type="button" class="quiz__confirm-no" onclick={() => (confirmReset = false)}>нет</button>
      </span>
    {:else}
      <button type="button" class="quiz__reset" onclick={() => (confirmReset = true)}>
        <Icon name="reset" size={13} />
        <span>Сбросить</span>
      </button>
    {/if}
  </div>

  <div class="quiz__list">
    {#each level.quiz as question, questionIndex}
      {@const item = progress.answers[level.id]?.[questionIndex]}
      {@const status = statusOf(questionIndex)}
      <article class="question">
        <header class="question__head">
          <span class="question__num">вопрос {String(questionIndex + 1).padStart(2, '0')}</span>
          <span class="question__status" data-tone={status.tone}>{status.label}</span>
        </header>

        <h3 class="question__text">{question.question}</h3>

        <div class="options" role="group" aria-label={`Варианты ответа на вопрос ${questionIndex + 1}`}>
          {#each question.options as option, optionIndex}
            <button
              type="button"
              class="option {optionClass(questionIndex, optionIndex)}"
              disabled={item?.checked}
              aria-pressed={item?.selected === optionIndex}
              onclick={() => progress.select(level, questionIndex, optionIndex)}
            >
              <span class="option__letter">{String.fromCharCode(65 + optionIndex)}</span>
              <span class="option__text">{option}</span>
              <span class="option__mark" aria-hidden="true">
                {#if item?.checked && question.correct === optionIndex}
                  <Icon name="check" size={15} stroke={2.4} />
                {:else if item?.checked && item.selected === optionIndex}
                  <Icon name="x" size={15} stroke={2.2} />
                {/if}
              </span>
            </button>
          {/each}
        </div>

        {#if item?.checked}
          <div class="explain" class:explain--ok={item.selected === question.correct}>
            <span class="explain__icon">
              <Icon name={item.selected === question.correct ? 'check' : 'info'} size={15} />
            </span>
            <div>
              <strong>
                {item.selected === question.correct ? 'Верно' : 'Разберёмся'}
              </strong>
              {#if item.selected !== question.correct}
                <p class="explain__answer">
                  Правильный вариант: {String.fromCharCode(65 + question.correct)} — {question.options[question.correct]}
                </p>
              {/if}
              <p>{question.explain}</p>
            </div>
          </div>
        {/if}

        <div class="question__actions">
          {#if item?.checked}
            <button type="button" class="btn btn--ghost btn--sm" onclick={() => progress.retry(level, questionIndex)}>
              <Icon name="reset" size={14} />
              Ответить заново
            </button>
          {:else}
            <button
              type="button"
              class="btn btn--primary btn--sm"
              disabled={item?.selected === null || item?.selected === undefined}
              onclick={() => progress.check(level, questionIndex)}
            >
              Проверить ответ
            </button>
          {/if}
        </div>
      </article>
    {/each}
  </div>

  {#if stats.checked === stats.total}
    <div class="summary" class:summary--done={stats.done}>
      <span class="summary__icon">
        <Icon name={stats.done ? 'check' : 'info'} size={20} stroke={2.1} />
      </span>
      <div class="summary__body">
        <strong>
          {stats.done ? 'Уровень пройден' : `Верно ${stats.correct} из ${stats.total}`}
        </strong>
        <p>
          {#if stats.done}
            Все ответы верные. Можно переходить к следующему слою или перечитать практику.
          {:else}
            Ошибки — это нормальная часть разбора. Перечитайте объяснения и попробуйте снова: прогресс считается по верным ответам.
          {/if}
        </p>
      </div>
      {#if stats.done && nextLevel}
        <a class="btn btn--primary btn--sm" href={`#${router.levelPath(nextLevel.id)}`}>
          {nextLevel.tabTitle}
          <Icon name="arrow" size={15} />
        </a>
      {:else if stats.done}
        <a class="btn btn--primary btn--sm" href="#/sources">
          Источники
          <Icon name="arrow" size={15} />
        </a>
      {:else}
        <button type="button" class="btn btn--ghost btn--sm" onclick={() => (confirmReset = true)}>
          Пройти заново
        </button>
      {/if}
    </div>
  {/if}
</div>

<style>
  .quiz {
    display: grid;
    gap: 18px;
    max-width: 900px;
  }

  .quiz__meter {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
    padding: 13px 16px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
    background: var(--surface);
  }

  .quiz__meter-text {
    display: flex;
    flex-direction: column;
    gap: 0;
    min-width: 160px;
  }

  .quiz__meter-text strong {
    font-size: 0.95rem;
    letter-spacing: -0.01em;
  }

  .quiz__meter-text span {
    font-size: 0.7rem;
    color: var(--muted);
  }

  .quiz__bar {
    flex: 1;
    min-width: 120px;
    height: 6px;
    border-radius: 999px;
    background: var(--track);
    overflow: hidden;
  }

  .quiz__bar span {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, color-mix(in srgb, var(--lvl-accent, var(--accent)) 70%, #ffffff 4%), var(--lvl-accent, var(--accent)));
    transition: width 0.35s var(--ease);
  }

  .quiz__reset {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 0.72rem;
    color: var(--dim);
    padding: 4px 8px;
    border-radius: 6px;
  }

  .quiz__reset:hover {
    color: var(--text-soft);
    background: var(--surface-2);
  }

  .quiz__confirm {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.72rem;
    color: var(--muted);
  }

  .quiz__confirm-yes,
  .quiz__confirm-no {
    font-size: 0.72rem;
    padding: 3px 7px;
    border-radius: 5px;
    border: 1px solid var(--border);
  }

  .quiz__confirm-yes {
    color: var(--danger);
    border-color: color-mix(in srgb, var(--danger) 35%, var(--border));
  }

  .quiz__confirm-no {
    color: var(--text-soft);
  }

  .quiz__list {
    display: grid;
    gap: 14px;
  }

  .question {
    padding: 17px 19px 15px;
    border-radius: var(--radius);
    border: 1px solid var(--border);
    background: var(--surface);
  }

  .question__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 8px;
  }

  .question__num {
    font-family: var(--font-mono);
    font-size: 0.63rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--dim);
  }

  .question__status {
    font-size: 0.62rem;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    padding: 2px 8px;
    border-radius: 999px;
    border: 1px solid var(--border);
    color: var(--dim);
  }

  .question__status[data-tone='ok'] {
    color: var(--ok);
    border-color: color-mix(in srgb, var(--ok) 30%, var(--border));
    background: color-mix(in srgb, var(--ok) 7%, transparent);
  }

  .question__status[data-tone='bad'] {
    color: var(--danger);
    border-color: color-mix(in srgb, var(--danger) 30%, var(--border));
    background: color-mix(in srgb, var(--danger) 7%, transparent);
  }

  .question__text {
    font-size: 0.99rem;
    line-height: 1.45;
    margin-bottom: 13px;
    font-weight: 600;
    /* Long technical tokens such as sqlite3_status64(SQLITE_STATUS_MEMORY_USED)
       must not stretch the card beyond a narrow viewport. */
    overflow-wrap: anywhere;
  }

  .options {
    display: grid;
    gap: 7px;
  }

  .option {
    display: grid;
    grid-template-columns: 26px minmax(0, 1fr) 20px;
    gap: 10px;
    align-items: center;
    text-align: left;
    padding: 9px 12px;
    border-radius: 9px;
    border: 1px solid var(--border);
    background: var(--surface-2);
    color: var(--text-soft);
    font-size: 0.85rem;
    line-height: 1.45;
    overflow-wrap: anywhere;
    transition: border-color 0.14s ease, background 0.14s ease, color 0.14s ease;
  }

  .option:hover:not(:disabled) {
    border-color: color-mix(in srgb, var(--lvl-accent, var(--accent)) 40%, var(--border));
    background: var(--surface-3);
  }

  .option:disabled {
    cursor: default;
  }

  .option__letter {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 6px;
    font-family: var(--font-mono);
    font-size: 0.7rem;
    font-weight: 600;
    color: var(--muted);
    border: 1px solid var(--border);
    background: var(--surface);
  }

  .option__mark {
    display: inline-flex;
    justify-content: flex-end;
    color: var(--muted);
  }

  .option.is-selected {
    border-color: color-mix(in srgb, var(--lvl-accent, var(--accent)) 55%, var(--border));
    background: color-mix(in srgb, var(--lvl-accent, var(--accent)) 8%, var(--surface-2));
    color: var(--text);
  }

  .option.is-selected .option__letter {
    color: var(--lvl-accent, var(--accent));
    border-color: color-mix(in srgb, var(--lvl-accent, var(--accent)) 45%, var(--border));
  }

  .option.is-correct {
    border-color: color-mix(in srgb, var(--ok) 50%, var(--border));
    background: color-mix(in srgb, var(--ok) 8%, var(--surface-2));
    color: var(--text);
  }

  .option.is-correct .option__letter {
    color: var(--ok);
    border-color: color-mix(in srgb, var(--ok) 45%, var(--border));
  }

  .option.is-correct .option__mark {
    color: var(--ok);
  }

  .option.is-wrong {
    border-color: color-mix(in srgb, var(--danger) 50%, var(--border));
    background: color-mix(in srgb, var(--danger) 7%, var(--surface-2));
    color: var(--text);
  }

  .option.is-wrong .option__letter {
    color: var(--danger);
    border-color: color-mix(in srgb, var(--danger) 45%, var(--border));
  }

  .option.is-wrong .option__mark {
    color: var(--danger);
  }

  .option.is-muted {
    opacity: 0.72;
  }

  .explain {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    margin-top: 12px;
    padding: 11px 13px;
    border-radius: 9px;
    border: 1px solid color-mix(in srgb, var(--danger) 26%, var(--border));
    background: color-mix(in srgb, var(--danger) 4%, var(--surface-2));
    font-size: 0.82rem;
    line-height: 1.55;
    color: var(--muted);
  }

  .explain--ok {
    border-color: color-mix(in srgb, var(--ok) 26%, var(--border));
    background: color-mix(in srgb, var(--ok) 4%, var(--surface-2));
  }

  .explain__icon {
    flex: none;
    color: var(--danger);
    margin-top: 2px;
  }

  .explain--ok .explain__icon {
    color: var(--ok);
  }

  .explain strong {
    color: var(--text);
    font-size: 0.8rem;
  }

  .explain p {
    margin-top: 3px;
  }

  .explain__answer {
    font-family: var(--font-mono);
    font-size: 0.76rem;
    color: var(--danger);
  }

  .explain--ok .explain__answer {
    color: var(--ok);
  }

  .question__actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 12px;
  }

  .summary {
    display: flex;
    align-items: center;
    gap: 14px;
    flex-wrap: wrap;
    padding: 17px 19px;
    border-radius: var(--radius);
    border: 1px solid var(--border);
    background: var(--surface);
  }

  .summary--done {
    border-color: color-mix(in srgb, var(--ok) 32%, var(--border));
    background: color-mix(in srgb, var(--ok) 5%, var(--surface));
  }

  .summary__icon {
    flex: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    border-radius: 50%;
    color: var(--muted);
    border: 1px solid var(--border);
    background: var(--surface-2);
  }

  .summary--done .summary__icon {
    color: var(--ok);
    border-color: color-mix(in srgb, var(--ok) 32%, var(--border));
    background: color-mix(in srgb, var(--ok) 9%, transparent);
  }

  .summary__body {
    flex: 1;
    min-width: 200px;
  }

  .summary__body strong {
    font-size: 0.94rem;
  }

  .summary__body p {
    margin-top: 3px;
    font-size: 0.79rem;
    color: var(--muted);
    line-height: 1.5;
  }

  @media (max-width: 620px) {
    .question {
      padding: 14px 14px 13px;
    }

    .option {
      grid-template-columns: 24px minmax(0, 1fr) 16px;
      padding: 8px 10px;
      font-size: 0.81rem;
    }

    .summary {
      padding: 14px;
    }

    .summary :global(.btn) {
      width: 100%;
    }
  }
</style>
