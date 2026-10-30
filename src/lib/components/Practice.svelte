<script lang="ts">
  import CmdBlock from './CmdBlock.svelte';
  import Icon from './Icon.svelte';
  import type { Level } from '../data/types';

  interface Props {
    level: Level;
  }

  let { level }: Props = $props();

  const practice = $derived(level.practice);
</script>

<div class="practice">
  <section>
    <div class="section-head">
      <div>
        <span class="section-index">практика · {practice.scenarios.length} сценария</span>
        <h2>Руки на клавиатуре</h2>
      </div>
      <p>Команды приведены для учебного стенда. На живой базе открывайте read-only соединение и делайте копию перед тяжёлыми операциями.</p>
    </div>

    <div class="scenarios">
      {#each practice.scenarios as scenario, scenarioIndex}
        <article class="scenario">
          <header class="scenario__head">
            <span class="scenario__num">сценарий {String(scenarioIndex + 1).padStart(2, '0')}</span>
            <h3>{scenario.title}</h3>
            <p>{scenario.goal}</p>
          </header>

          <ol class="steps">
            {#each scenario.steps as step, stepIndex}
              <li class="step">
                <span class="step__num" aria-hidden="true">{stepIndex + 1}</span>
                <div class="step__body">
                  <p class="step__text">{step.text}</p>
                  <CmdBlock code={step.code} lang={step.lang ?? 'shell'} label={step.lang ?? 'shell'} />
                  {#if step.note}
                    <div class="step__note">
                      <Icon name="info" size={14} />
                      <span>{step.note}</span>
                    </div>
                  {/if}
                </div>
              </li>
            {/each}
          </ol>

          <footer class="verdict">
            <span class="verdict__icon"><Icon name="check" size={16} stroke={2.2} /></span>
            <div>
              <strong>Что должно получиться</strong>
              <p>{scenario.verdict}</p>
            </div>
          </footer>
        </article>
      {/each}
    </div>
  </section>

  <section>
    <div class="section-head">
      <div>
        <span class="section-index">осторожно</span>
        <h2>Типичные ошибки</h2>
      </div>
      <p>Большинство проблем с диагностикой SQLite — не в отсутствии инструментов, а в неверной трактовке их вывода.</p>
    </div>

    <div class="pitfalls">
      {#each practice.pitfalls as pitfall}
        <article class="pitfall">
          <span class="pitfall__icon"><Icon name="alert" size={16} /></span>
          <div>
            <h3>{pitfall.title}</h3>
            <p>{pitfall.text}</p>
          </div>
        </article>
      {/each}
    </div>
  </section>
</div>

<style>
  .practice {
    display: grid;
    gap: 46px;
  }

  .scenarios {
    display: grid;
    gap: 22px;
  }

  .scenario {
    border-radius: var(--radius);
    border: 1px solid var(--border);
    background: var(--surface);
    overflow: hidden;
  }

  .scenario__head {
    padding: 18px 22px 16px;
    border-bottom: 1px solid var(--border);
    background:
      radial-gradient(120% 140% at 0% 0%, color-mix(in srgb, var(--lvl-accent, var(--accent)) 9%, transparent), transparent 62%),
      var(--surface-2);
  }

  .scenario__num {
    font-family: var(--font-mono);
    font-size: 0.63rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: color-mix(in srgb, var(--lvl-accent, var(--accent)) 65%, var(--muted));
  }

  .scenario__head h3 {
    font-size: 1.15rem;
    margin-top: 3px;
  }

  .scenario__head p {
    margin-top: 5px;
    font-size: 0.85rem;
    color: var(--muted);
    max-width: 80ch;
  }

  .steps {
    list-style: none;
    display: grid;
    gap: 0;
    padding: 6px 22px 4px;
  }

  .step {
    position: relative;
    display: grid;
    grid-template-columns: 28px minmax(0, 1fr);
    gap: 12px;
    padding: 16px 0;
    border-bottom: 1px dashed var(--border);
  }

  .step:last-child {
    border-bottom: none;
  }

  .step__num {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    font-family: var(--font-mono);
    font-size: 0.7rem;
    color: color-mix(in srgb, var(--lvl-accent, var(--accent)) 60%, var(--text));
    border: 1px solid color-mix(in srgb, var(--lvl-accent, var(--accent)) 30%, var(--border));
    background: color-mix(in srgb, var(--lvl-accent, var(--accent)) 7%, transparent);
    margin-top: 1px;
  }

  .step__body {
    display: grid;
    gap: 10px;
    min-width: 0;
  }

  .step__text {
    font-size: 0.9rem;
    color: var(--text-soft);
    line-height: 1.58;
  }

  .step__note {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 8px 11px;
    border-radius: 8px;
    background: color-mix(in srgb, var(--lvl-accent, var(--accent)) 5%, var(--surface-2));
    border: 1px solid color-mix(in srgb, var(--lvl-accent, var(--accent)) 16%, var(--border));
    font-size: 0.79rem;
    line-height: 1.5;
    color: var(--muted);
  }

  .step__note :global(svg) {
    flex: none;
    margin-top: 2px;
    color: color-mix(in srgb, var(--lvl-accent, var(--accent)) 70%, var(--text));
  }

  .verdict {
    display: flex;
    gap: 11px;
    align-items: flex-start;
    margin: 6px 22px 20px;
    padding: 13px 15px;
    border-radius: var(--radius-sm);
    border: 1px solid color-mix(in srgb, var(--ok) 28%, var(--border));
    background: color-mix(in srgb, var(--ok) 5%, var(--surface));
  }

  .verdict__icon {
    flex: none;
    display: inline-flex;
    color: var(--ok);
    margin-top: 1px;
  }

  .verdict strong {
    font-size: 0.8rem;
    color: var(--ok);
    letter-spacing: 0.02em;
  }

  .verdict p {
    margin-top: 3px;
    font-size: 0.83rem;
    line-height: 1.55;
    color: var(--muted);
  }

  .pitfalls {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .pitfall {
    display: flex;
    gap: 11px;
    align-items: flex-start;
    padding: 15px 16px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
    background: var(--surface);
  }

  .pitfall__icon {
    flex: none;
    display: inline-flex;
    color: var(--warn);
    margin-top: 1px;
  }

  .pitfall h3 {
    font-size: 0.87rem;
    margin-bottom: 3px;
  }

  .pitfall p {
    font-size: 0.79rem;
    line-height: 1.52;
    color: var(--muted);
  }

  @media (max-width: 820px) {
    .pitfalls {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 620px) {
    .practice {
      gap: 36px;
    }

    .scenario__head {
      padding: 15px 16px 13px;
    }

    .steps {
      padding: 4px 16px;
    }

    .step {
      grid-template-columns: 24px minmax(0, 1fr);
      gap: 10px;
    }

    .verdict {
      margin: 4px 16px 16px;
    }
  }
</style>
