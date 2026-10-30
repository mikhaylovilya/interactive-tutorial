<script lang="ts">
  const headerFields = [
    ['0', 'magic', '377f0682'],
    ['4', 'version', '3007000'],
    ['8', 'page size', '4096'],
    ['12', 'checkpoint seq', '0'],
    ['16', 'salt-1', '2463fb10'],
    ['20', 'salt-2', 'cab28044'],
    ['24', 'checksum-1', 'e5e26637'],
    ['28', 'checksum-2', 'e24af0a6']
  ];

  const frames = [
    { index: 0, pgno: 1, commit: 0, csum: '07d5de67 / 5267c541' },
    { index: 1, pgno: 2, commit: 2, csum: '6ac44b7d / 3f38881c' },
    { index: 2, pgno: 2, commit: 2, csum: '83427302 / 1f9e980a' }
  ];
</script>

<div class="wal">
  <div class="wal__header">
    <div class="wal__caption">
      <strong>WAL header</strong>
      <span>32 байта</span>
    </div>
    <div class="wal__fields">
      {#each headerFields as [offset, name, value]}
        <div class="wal__field">
          <span class="wal__off">+{offset}</span>
          <span class="wal__name">{name}</span>
          <code>{value}</code>
        </div>
      {/each}
    </div>
  </div>

  <div class="wal__frames">
    {#each frames as frame}
      <div class="wal__frame" class:commit={frame.commit > 0}>
        <div class="wal__frame-head">
          <span class="wal__frame-index">frame {frame.index}</span>
          <span>pgno <strong>{frame.pgno}</strong></span>
          <span>commit <strong>{frame.commit}</strong></span>
          <span class="wal__csum">csum {frame.csum}</span>
        </div>
        <div class="wal__page">
          <span>страница {frame.pgno}</span>
          <span>4096 B</span>
        </div>
      </div>
    {/each}
  </div>

  <div class="wal__ruler" aria-hidden="true">
    <span>0</span>
    <span>32</span>
    <span>4152</span>
    <span>8272</span>
  </div>

  <div class="wal__note">
    <p>
      <strong>frame = 24 B заголовка + page_size.</strong> При page_size 4096 это 4120 байт.
      Поле <code>commit</code> равно размеру базы после коммита; ноль означает, что кадр не завершает транзакцию.
    </p>
    <p>
      На картинке три кадра: снимок страницы 1 без коммита и две версии страницы 2, последняя
      с маркером коммита. <code>PRAGMA wal_checkpoint(PASSIVE)</code> вернул <code>0|3|3</code>:
      busy=0, в WAL было 3 кадра, перенесены все 3.
    </p>
  </div>
</div>

<style>
  .wal {
    padding: 20px;
    border-radius: var(--radius);
    border: 1px solid var(--border);
    background:
      radial-gradient(100% 120% at 0% 0%, color-mix(in srgb, var(--lvl-5) 9%, transparent), transparent 60%),
      var(--surface);
    overflow: hidden;
  }

  .wal__header {
    display: grid;
    grid-template-columns: 110px minmax(0, 1fr);
    gap: 12px;
    align-items: start;
    padding-bottom: 14px;
    border-bottom: 1px solid var(--border);
  }

  .wal__caption {
    display: flex;
    flex-direction: column;
    gap: 1px;
    padding: 8px 10px;
    border-radius: 8px;
    background: color-mix(in srgb, var(--lvl-5) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--lvl-5) 24%, transparent);
  }

  .wal__caption strong {
    font-size: 0.75rem;
    color: color-mix(in srgb, var(--lvl-5) 62%, var(--text));
  }

  .wal__caption span {
    font-family: var(--font-mono);
    font-size: 0.63rem;
    color: var(--muted);
  }

  .wal__fields {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 6px;
  }

  .wal__field {
    display: flex;
    flex-direction: column;
    gap: 1px;
    padding: 5px 8px;
    border-radius: 7px;
    border: 1px solid var(--border);
    background: var(--surface-2);
    min-width: 0;
  }

  .wal__off {
    font-family: var(--font-mono);
    font-size: 0.58rem;
    color: var(--dim);
  }

  .wal__name {
    font-size: 0.64rem;
    color: var(--muted);
  }

  .wal__field code {
    font-size: 0.68rem;
    color: var(--text-soft);
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .wal__frames {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 14px;
  }

  .wal__frame {
    border: 1px solid var(--border);
    border-radius: 9px;
    overflow: hidden;
    background: var(--surface-2);
  }

  .wal__frame.commit {
    border-color: color-mix(in srgb, var(--ok) 38%, var(--border));
  }

  .wal__frame-head {
    display: flex;
    align-items: baseline;
    gap: 12px;
    flex-wrap: wrap;
    padding: 6px 10px;
    background: color-mix(in srgb, var(--lvl-5) 6%, transparent);
    border-bottom: 1px solid var(--border);
    font-family: var(--font-mono);
    font-size: 0.66rem;
    color: var(--muted);
  }

  .wal__frame.commit .wal__frame-head {
    background: color-mix(in srgb, var(--ok) 7%, transparent);
  }

  .wal__frame-index {
    color: color-mix(in srgb, var(--lvl-5) 70%, var(--text));
    font-weight: 600;
  }

  .wal__frame-head strong {
    color: var(--text-soft);
  }

  .wal__csum {
    margin-left: auto;
    color: var(--dim);
    font-size: 0.62rem;
  }

  .wal__page {
    display: flex;
    justify-content: space-between;
    padding: 13px 12px;
    font-family: var(--font-mono);
    font-size: 0.68rem;
    color: var(--dim);
    background:
      repeating-linear-gradient(
        135deg,
        color-mix(in srgb, var(--lvl-5) 4%, transparent) 0 6px,
        transparent 6px 12px
      ),
      var(--code-bg);
  }

  .wal__ruler {
    display: flex;
    justify-content: space-between;
    font-family: var(--font-mono);
    font-size: 0.6rem;
    color: var(--dim);
    padding: 8px 2px 0;
  }

  .wal__note {
    display: grid;
    gap: 6px;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid var(--border);
    font-size: 0.77rem;
    line-height: 1.55;
    color: var(--muted);
  }

  .wal__note strong {
    color: var(--text-soft);
  }

  .wal__note code {
    font-size: 0.71rem;
    padding: 0.08em 0.32em;
    border-radius: 4px;
    background: color-mix(in srgb, var(--lvl-5) 10%, transparent);
    color: color-mix(in srgb, var(--lvl-5) 65%, var(--text));
  }

  @media (max-width: 820px) {
    .wal {
      padding: 15px;
    }

    .wal__header {
      grid-template-columns: 1fr;
    }

    .wal__fields {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .wal__csum {
      margin-left: 0;
      width: 100%;
    }
  }
</style>
