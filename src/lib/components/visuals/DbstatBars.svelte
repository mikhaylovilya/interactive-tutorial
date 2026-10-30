<script lang="ts">
  // Real dbstat output on the tutorial database after deleting 10 000 rows from plays.
  const rows = [
    { name: 'idx_plays_track', pages: 325, unused: 31.9 },
    { name: 'plays', pages: 256, unused: 0.8 },
    { name: 'tracks', pages: 129, unused: 1.8 },
    { name: 'idx_tracks_artist', pages: 39, unused: 10.7 },
    { name: 'sqlite_stat1', pages: 1, unused: 97.7 },
    { name: 'sqlite_schema', pages: 1, unused: 79.8 }
  ];

  const max = Math.max(...rows.map((row) => row.pages));
  const total = rows.reduce((sum, row) => sum + row.pages, 0);
</script>

<div class="bars">
  <div class="bars__head">
    <span>объект</span>
    <span>страницы · неиспользуемые байты</span>
  </div>

  {#each rows as row}
    <div class="bars__row">
      <span class="bars__name">{row.name}</span>
      <div class="bars__track">
        <div
          class="bars__bar"
          style={`width: ${Math.max(4, (row.pages / max) * 100)}%`}
        >
          <span class="bars__used" style={`width: ${100 - row.unused}%`}></span>
          <span class="bars__unused" style={`width: ${row.unused}%`}></span>
        </div>
        <span class="bars__value">{row.pages} стр. · {row.unused}%</span>
      </div>
    </div>
  {/each}

  <div class="bars__legend">
    <span class="bars__key"><i class="key-used"></i> занято полезными данными</span>
    <span class="bars__key"><i class="key-unused"></i> unused внутри страниц</span>
    <span class="bars__total">всего {total} страниц</span>
  </div>

  <p class="bars__note">
    <strong>idx_plays_track</strong> занимает больше места, чем таблица <strong>plays</strong>:
    325 страниц против 256. После удалений 31.9% байт индекса пустует, но страницы не возвращаются
    файловой системе — это видно только в dbstat, а не в <code>page_count</code>.
  </p>
</div>

<style>
  .bars {
    padding: 20px;
    border-radius: var(--radius);
    border: 1px solid var(--border);
    background:
      radial-gradient(110% 130% at 100% 0%, color-mix(in srgb, var(--lvl-4) 10%, transparent), transparent 60%),
      var(--surface);
  }

  .bars__head {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    font-size: 0.61rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--dim);
    padding-bottom: 8px;
    border-bottom: 1px solid var(--border);
    margin-bottom: 12px;
  }

  .bars__row {
    display: grid;
    grid-template-columns: 155px minmax(0, 1fr);
    gap: 12px;
    align-items: center;
    padding: 5px 0;
  }

  .bars__name {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--text-soft);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .bars__track {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }

  .bars__bar {
    display: flex;
    height: 20px;
    border-radius: 5px;
    overflow: hidden;
    background: var(--surface-3);
    border: 1px solid color-mix(in srgb, var(--lvl-4) 18%, var(--border));
    flex: none;
    max-width: 100%;
  }

  .bars__used {
    background: linear-gradient(90deg, color-mix(in srgb, var(--lvl-4) 72%, #ffffff 6%), var(--lvl-4));
    min-width: 2px;
  }

  .bars__unused {
    background:
      repeating-linear-gradient(
        135deg,
        color-mix(in srgb, var(--danger) 70%, transparent) 0 4px,
        color-mix(in srgb, var(--danger) 28%, transparent) 4px 8px
      );
    min-width: 0;
  }

  .bars__value {
    font-family: var(--font-mono);
    font-size: 0.68rem;
    color: var(--muted);
    white-space: nowrap;
    flex: none;
  }

  .bars__legend {
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
    align-items: center;
    margin-top: 14px;
    padding-top: 12px;
    border-top: 1px solid var(--border);
    font-size: 0.7rem;
    color: var(--muted);
  }

  .bars__key {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .bars__key i {
    width: 14px;
    height: 9px;
    border-radius: 3px;
    display: inline-block;
  }

  .key-used {
    background: var(--lvl-4);
  }

  .key-unused {
    background: repeating-linear-gradient(
      135deg,
      color-mix(in srgb, var(--danger) 70%, transparent) 0 3px,
      color-mix(in srgb, var(--danger) 28%, transparent) 3px 6px
    );
  }

  .bars__total {
    margin-left: auto;
    font-family: var(--font-mono);
    font-size: 0.68rem;
    color: var(--dim);
  }

  .bars__note {
    margin-top: 12px;
    font-size: 0.78rem;
    line-height: 1.55;
    color: var(--muted);
  }

  .bars__note strong {
    color: var(--text-soft);
    font-family: var(--font-mono);
    font-weight: 600;
  }

  .bars__note code {
    font-size: 0.72rem;
    color: var(--text-soft);
  }

  @media (max-width: 680px) {
    .bars {
      padding: 15px;
    }

    .bars__row {
      grid-template-columns: 1fr;
      gap: 4px;
      padding: 6px 0;
    }

    .bars__track {
      flex-wrap: wrap;
      gap: 6px;
    }

    .bars__value {
      order: -1;
    }

    .bars__head {
      display: none;
    }
  }
</style>
