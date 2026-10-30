<script lang="ts">
  import Icon from '../Icon.svelte';
</script>

<div class="ext">
  <div class="ext__process">
    <span class="ext__boundary">адресное пространство процесса приложения</span>

    <div class="ext__layer">
      <span class="ext__tag">ваш код</span>
      <strong>Приложение</strong>
      <span class="ext__text">SQL-запросы, пул соединений, ретраи</span>
    </div>

    <div class="ext__layer ext__layer--ext">
      <span class="ext__tag">shared library</span>
      <strong>monitor.dylib / monitor.so</strong>
      <span class="ext__text">sqlite3_create_function → monitor_status()</span>
    </div>

    <div class="ext__layer ext__layer--core">
      <span class="ext__tag">libsqlite3</span>
      <strong>SQLite connection</strong>
      <span class="ext__text">VDBE · btree · pager · VFS</span>
      <div class="ext__modules">
        <code>dbstat</code><code>sqlite_stmt</code><code>bytecode</code><code>sqlite_dbpage</code>
      </div>
    </div>
  </div>

  <div class="ext__arrow" aria-hidden="true">
    <Icon name="arrow" size={16} />
    <span>VFS: xRead / xWrite / xSync</span>
  </div>

  <div class="ext__files">
    <div class="ext__file">
      <Icon name="db" size={17} />
      <div><strong>app.db</strong><span>страницы и заголовок</span></div>
    </div>
    <div class="ext__file">
      <Icon name="layers" size={17} />
      <div><strong>app.db-wal</strong><span>кадры незавершённых checkpoint</span></div>
    </div>
    <div class="ext__file">
      <Icon name="grid" size={17} />
      <div><strong>app.db-shm</strong><span>wal-index для координации</span></div>
    </div>
  </div>

  <p class="ext__note">
    Расширение не изолировано: оно видит те же файлы и память, что и приложение. Поэтому
    <code>load_extension</code> — это не «плагин в песочнице», а исполнение нативного кода с полными правами процесса.
  </p>
</div>

<style>
  .ext {
    padding: 20px;
    border-radius: var(--radius);
    border: 1px solid var(--border);
    background:
      radial-gradient(110% 130% at 0% 0%, color-mix(in srgb, var(--lvl-4) 10%, transparent), transparent 58%),
      var(--surface);
  }

  .ext__process {
    position: relative;
    display: grid;
    gap: 8px;
    padding: 28px 16px 16px;
    border: 1px dashed color-mix(in srgb, var(--lvl-4) 42%, var(--border));
    border-radius: 14px;
  }

  .ext__boundary {
    position: absolute;
    top: 8px;
    left: 16px;
    font-size: 0.6rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: color-mix(in srgb, var(--lvl-4) 70%, var(--muted));
  }

  .ext__layer {
    display: grid;
    grid-template-columns: auto 1fr;
    column-gap: 10px;
    row-gap: 2px;
    align-items: baseline;
    padding: 10px 12px;
    border-radius: 10px;
    border: 1px solid var(--border);
    background: color-mix(in srgb, var(--surface-2) 82%, transparent);
  }

  .ext__tag {
    font-family: var(--font-mono);
    font-size: 0.6rem;
    color: var(--dim);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    grid-row: 1 / span 2;
    align-self: center;
    min-width: 92px;
  }

  .ext__layer strong {
    font-size: 0.84rem;
  }

  .ext__text {
    grid-column: 2;
    font-size: 0.72rem;
    color: var(--muted);
  }

  .ext__layer--ext {
    border-color: color-mix(in srgb, var(--lvl-4) 45%, var(--border));
    background: color-mix(in srgb, var(--lvl-4) 8%, var(--surface-2));
    box-shadow: 0 0 30px -16px color-mix(in srgb, var(--lvl-4) 60%, transparent);
  }

  .ext__layer--ext strong {
    color: color-mix(in srgb, var(--lvl-4) 65%, var(--text));
    font-family: var(--font-mono);
    font-size: 0.78rem;
  }

  .ext__layer--core {
    border-color: color-mix(in srgb, var(--lvl-3) 32%, var(--border));
  }

  .ext__modules {
    grid-column: 2;
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 5px;
  }

  .ext__modules code {
    font-size: 0.62rem;
    padding: 1px 6px;
    border-radius: 5px;
    background: color-mix(in srgb, var(--lvl-3) 10%, transparent);
    color: color-mix(in srgb, var(--lvl-3) 65%, var(--text));
    border: 1px solid color-mix(in srgb, var(--lvl-3) 18%, transparent);
  }

  .ext__arrow {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 9px 0;
    color: var(--muted);
    font-family: var(--font-mono);
    font-size: 0.66rem;
  }

  .ext__arrow :global(svg) {
    transform: rotate(90deg);
    color: var(--lvl-4);
  }

  .ext__files {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
  }

  .ext__file {
    display: flex;
    align-items: flex-start;
    gap: 9px;
    padding: 10px 12px;
    border-radius: 10px;
    border: 1px solid var(--border);
    background: var(--surface-2);
    color: var(--muted);
  }

  .ext__file :global(svg) {
    flex: none;
    color: var(--lvl-3);
    margin-top: 2px;
  }

  .ext__file strong {
    display: block;
    font-family: var(--font-mono);
    font-size: 0.74rem;
    color: var(--text-soft);
    font-weight: 600;
  }

  .ext__file span {
    font-size: 0.67rem;
    line-height: 1.35;
  }

  .ext__note {
    margin-top: 14px;
    font-size: 0.78rem;
    line-height: 1.55;
    color: var(--muted);
  }

  .ext__note code {
    font-size: 0.72rem;
    color: var(--text-soft);
  }

  @media (max-width: 720px) {
    .ext {
      padding: 15px;
    }

    .ext__process {
      padding: 26px 11px 11px;
    }

    .ext__layer {
      grid-template-columns: 1fr;
    }

    .ext__tag {
      grid-row: auto;
      min-width: 0;
    }

    .ext__text,
    .ext__modules {
      grid-column: 1;
    }

    .ext__files {
      grid-template-columns: 1fr;
    }
  }
</style>
