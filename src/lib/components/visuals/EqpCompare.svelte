<script lang="ts">
  import Icon from '../Icon.svelte';
</script>

<div class="eqp">
  <div class="eqp__panel eqp__panel--before">
    <div class="eqp__head">
      <span class="eqp__label">до индекса</span>
      <span class="eqp__cost">8000 строк · SCAN</span>
    </div>
    <pre><code>sqlite&gt; EXPLAIN QUERY PLAN
   ...&gt; SELECT id, title FROM tracks
   ...&gt; WHERE title = 'Track 42';

QUERY PLAN
`--SCAN tracks</code></pre>
    <p>
      Перебираются все 8000 строк таблицы. Индекса по <code>title</code> нет, поэтому
      планировщик может только сканировать.
    </p>
  </div>

  <span class="eqp__arrow" aria-hidden="true"><Icon name="arrow" size={20} /></span>

  <div class="eqp__panel eqp__panel--after">
    <div class="eqp__head">
      <span class="eqp__label">после CREATE INDEX + ANALYZE</span>
      <span class="eqp__cost">1 строка · SEARCH</span>
    </div>
    <pre><code>sqlite&gt; CREATE INDEX idx_tracks_title
   ...&gt; ON tracks(title);
sqlite&gt; ANALYZE;

sqlite&gt; EXPLAIN QUERY PLAN
   ...&gt; SELECT id, title FROM tracks
   ...&gt; WHERE title = 'Track 42';

QUERY PLAN
`--SEARCH tracks USING COVERING INDEX
    idx_tracks_title (title=?)</code></pre>
    <p>
      <code>COVERING INDEX</code> означает, что <code>id</code> и <code>title</code> берутся
      прямо из индекса: таблица не читается вообще.
    </p>
  </div>
</div>

<div class="eqp__note">
  <Icon name="info" size={15} />
  <span>
    План — это намерение планировщика. Число реально просмотренных строк подтверждает
    <code>sqlite_stmt.nscan</code> или <code>.scanstats</code> (уровень 5).
  </span>
</div>

<style>
  .eqp {
    display: flex;
    align-items: stretch;
    gap: 12px;
  }

  .eqp__panel {
    flex: 1 1 0;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
    border-radius: 14px;
    border: 1px solid var(--border);
    background: var(--surface);
    padding: 14px 16px 15px;
  }

  .eqp__panel--before {
    border-color: color-mix(in srgb, var(--danger) 28%, var(--border));
    background: color-mix(in srgb, var(--danger) 4%, var(--surface));
  }

  .eqp__panel--after {
    border-color: color-mix(in srgb, var(--ok) 30%, var(--border));
    background: color-mix(in srgb, var(--ok) 4%, var(--surface));
  }

  .eqp__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    flex-wrap: wrap;
  }

  .eqp__label {
    font-size: 0.63rem;
    letter-spacing: 0.11em;
    text-transform: uppercase;
    font-weight: 650;
    color: var(--muted);
  }

  .eqp__panel--before .eqp__label {
    color: var(--danger);
  }

  .eqp__panel--after .eqp__label {
    color: var(--ok);
  }

  .eqp__cost {
    font-family: var(--font-mono);
    font-size: 0.65rem;
    color: var(--dim);
  }

  pre {
    margin: 0;
    padding: 11px 12px;
    border-radius: 9px;
    background: var(--code-bg);
    border: 1px solid var(--code-border);
    overflow-x: auto;
  }

  code {
    font-family: var(--font-mono);
    font-size: 0.73rem;
    line-height: 1.6;
    color: #cfe0f2;
  }

  p {
    margin: 0;
    font-size: 0.78rem;
    color: var(--muted);
    line-height: 1.55;
  }

  p code {
    font-size: 0.72rem;
    padding: 0.1em 0.35em;
    border-radius: 4px;
    background: color-mix(in srgb, var(--accent) 9%, transparent);
    border: 1px solid color-mix(in srgb, var(--accent) 16%, transparent);
    color: color-mix(in srgb, var(--accent) 60%, var(--text));
  }

  .eqp__arrow {
    display: flex;
    align-items: center;
    color: var(--border-strong);
    flex: none;
  }

  .eqp__note {
    display: flex;
    gap: 8px;
    align-items: flex-start;
    margin-top: 12px;
    font-size: 0.78rem;
    color: var(--muted);
  }

  .eqp__note :global(svg) {
    flex: none;
    margin-top: 2px;
    color: var(--lvl-3);
  }

  .eqp__note code {
    font-size: 0.72rem;
    color: var(--text-soft);
  }

  @media (max-width: 820px) {
    .eqp {
      flex-direction: column;
    }

    .eqp__arrow {
      transform: rotate(90deg);
      justify-content: center;
      height: 6px;
    }
  }
</style>
