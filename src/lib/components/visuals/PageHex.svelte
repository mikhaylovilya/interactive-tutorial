<script lang="ts">
  /**
   * Interactive explorer for the 100-byte header of page 1.
   *
   * The hex string below is a real dump from the tutorial database
   * (SQLite 3.43.2, 4096-byte pages, 838 pages, 87 freelist pages).
   */
  const HEX =
    '53514C69746520666F726D6174203300100002020C4020200000000300000346000002A6000000570000000500000004000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000003002E6EBA';

  type FieldKind = 'magic' | 'be16' | 'be32' | 'u8' | 'reserved';

  interface HeaderField {
    offset: number;
    length: number;
    name: string;
    kind: FieldKind;
    note: string;
  }

  const fields: HeaderField[] = [
    {
      offset: 0,
      length: 16,
      name: 'Магическая строка',
      kind: 'magic',
      note: 'Сигнатура формата. Всегда «SQLite format 3» и завершающий нулевой байт. По ней SQLite отличает свою базу от чужого файла.'
    },
    {
      offset: 16,
      length: 2,
      name: 'Размер страницы',
      kind: 'be16',
      note: '4096 байт — типичный размер для современных баз. Значение 1 означало бы 65536. Меняется только через VACUUM или при создании базы.'
    },
    {
      offset: 18,
      length: 1,
      name: 'Write format',
      kind: 'u8',
      note: 'Версия формата записи. 2 — актуальный формат с поддержкой всех современных возможностей.'
    },
    {
      offset: 19,
      length: 1,
      name: 'Read format',
      kind: 'u8',
      note: 'Версия формата чтения. Обычно совпадает с write format; расхождение означает, что файл создан более новой версией.'
    },
    {
      offset: 20,
      length: 1,
      name: 'Reserved bytes',
      kind: 'u8',
      note: 'Байты в конце каждой страницы, зарезервированные под расширения (например, шифрование). 12 — ненулевое значение: полезная ёмкость страницы меньше 4096.'
    },
    {
      offset: 21,
      length: 1,
      name: 'Max embedded payload',
      kind: 'u8',
      note: 'Максимальная доля полезной нагрузки, которая остаётся на странице без overflow. 64 = 64/255.'
    },
    {
      offset: 22,
      length: 1,
      name: 'Min embedded payload',
      kind: 'u8',
      note: 'Минимальная доля payload на странице. 32 = 32/255. Влияет на то, когда запись уходит в overflow-страницы.'
    },
    {
      offset: 23,
      length: 1,
      name: 'Leaf payload fraction',
      kind: 'u8',
      note: 'Доля payload для leaf-страниц. 32 = 32/255. Эти три коэффициента определяют раскладку крупных записей.'
    },
    {
      offset: 24,
      length: 4,
      name: 'File change counter',
      kind: 'be32',
      note: 'Растёт при каждом коммите, который меняет файл. Помогает понять, менялась ли база с момента прошлого снимка.'
    },
    {
      offset: 28,
      length: 4,
      name: 'Database page count',
      kind: 'be32',
      note: '838 страниц — логический размер базы. Умножьте на размер страницы, чтобы получить 3 432 448 байт.'
    },
    {
      offset: 32,
      length: 4,
      name: 'First freelist trunk',
      kind: 'be32',
      note: 'Номер первой trunk-страницы freelist (678). По этой цепочке SQLite находит освобождённые страницы для переиспользования.'
    },
    {
      offset: 36,
      length: 4,
      name: 'Freelist page count',
      kind: 'be32',
      note: '87 свободных страниц × 4096 = 356 352 байт. Эти страницы уже не содержат данных, но файл ещё не стал меньше: место переиспользуется внутри базы.'
    },
    {
      offset: 40,
      length: 4,
      name: 'Schema cookie',
      kind: 'be32',
      note: 'Меняется при каждом изменении схемы. Соединения сравнивают cookie, чтобы понять, что кэш схемы устарел.'
    },
    {
      offset: 44,
      length: 4,
      name: 'Schema format',
      kind: 'be32',
      note: 'Версия формата схемы. 4 — современный формат; старые значения говорят о файле, созданном давно.'
    },
    {
      offset: 48,
      length: 4,
      name: 'Default page cache',
      kind: 'be32',
      note: 'Рекомендуемый размер page cache. 0 означает «использовать значение по умолчанию» (обычно 2000 страниц).'
    },
    {
      offset: 52,
      length: 4,
      name: 'Largest root b-tree',
      kind: 'be32',
      note: 'Номер самой большой корневой страницы при auto-vacuum. 0 — auto-vacuum выключен, отдельного указателя нет.'
    },
    {
      offset: 56,
      length: 4,
      name: 'Text encoding',
      kind: 'be32',
      note: '1 = UTF-8, 2 = UTF-16le, 3 = UTF-16be. Кодировку нельзя изменить после создания базы без пересоздания.'
    },
    {
      offset: 60,
      length: 4,
      name: 'User version',
      kind: 'be32',
      note: 'Свободное поле для приложения: PRAGMA user_version. Удобно для версии схемы или миграций.'
    },
    {
      offset: 64,
      length: 4,
      name: 'Incremental vacuum',
      kind: 'be32',
      note: 'Режим incremental vacuum и его состояние. 0 — выключен; ненулевые значения включают пошаговое освобождение страниц.'
    },
    {
      offset: 68,
      length: 4,
      name: 'Application ID',
      kind: 'be32',
      note: 'Ещё одно поле для приложения: PRAGMA application_id. Позволяет отличить свою базу от чужой с похожей схемой.'
    },
    {
      offset: 72,
      length: 20,
      name: 'Зарезервировано',
      kind: 'reserved',
      note: '20 байт, зарезервированных под будущие расширения формата. В этой базе все нули; читать их как данные нельзя.'
    },
    {
      offset: 92,
      length: 4,
      name: 'Version-valid-for',
      kind: 'be32',
      note: 'Значение file change counter, для которого актуален номер версии SQLite. Защита от чтения версии из старого заголовка.'
    },
    {
      offset: 96,
      length: 4,
      name: 'SQLite version number',
      kind: 'be32',
      note: '3043002 → 3.43.2. Версия библиотеки, последней писавшей файл. Полезно при разборе совместимости и поведения прагм.'
    }
  ];

  const bytes: number[] = HEX.match(/.{2}/g)!.map((pair) => parseInt(pair, 16));

  /** Default selection: freelist page count, the field this level is about. */
  let selected = $state(36);

  const field = $derived(fields.find((item) => item.offset === selected) ?? fields[0]);
  const fieldBytes = $derived(bytes.slice(field.offset, field.offset + field.length));
  const rawHex = $derived(
    fieldBytes.map((value) => value.toString(16).padStart(2, '0').toUpperCase()).join(' ')
  );

  const rows = $derived(
    Array.from({ length: 10 }, (_, rowIndex) => {
      const start = rowIndex * 10;
      return {
        offset: start.toString().padStart(3, '0'),
        cells: bytes.slice(start, start + 10).map((value, i) => ({
          index: start + i,
          hex: value.toString(16).padStart(2, '0').toUpperCase()
        })),
        ascii: bytes
          .slice(start, start + 10)
          .map((value) => (value >= 32 && value < 127 ? String.fromCharCode(value) : '·'))
          .join('')
      };
    })
  );

  function bigEndian(values: number[]): number {
    return values.reduce((acc, value) => acc * 256 + value, 0);
  }

  function decoded(target: HeaderField): { primary: string; secondary: string } {
    const slice = bytes.slice(target.offset, target.offset + target.length);
    if (target.kind === 'magic') {
      return {
        primary: 'SQLite format 3',
        secondary: 'ASCII, 15 символов + нулевой байт'
      };
    }
    if (target.kind === 'reserved') {
      return { primary: '20 байт', secondary: 'все нули в этой базе' };
    }
    if (target.kind === 'u8') {
      return { primary: String(slice[0]), secondary: `0x${slice[0].toString(16).toUpperCase()}` };
    }
    const value = bigEndian(slice);
    return {
      primary: value.toLocaleString('ru-RU'),
      secondary: `0x${value.toString(16).toUpperCase()}`
    };
  }

  const current = $derived(decoded(field));

  function isActive(index: number): boolean {
    return index >= field.offset && index < field.offset + field.length;
  }

  function selectByte(index: number): void {
    const match = fields.find(
      (item) => index >= item.offset && index < item.offset + item.length
    );
    if (match) selected = match.offset;
  }
</script>

<div class="ph">
  <div class="ph__bar">
    <span class="ph__title">page 1 · первые 100 байт</span>
    <span class="ph__tag">реальный дамп</span>
    <span class="ph__hint">кликните поле или байт</span>
  </div>

  <div class="ph__body">
    <div class="ph__hex" role="group" aria-label="Шестнадцатеричный дамп заголовка страницы 1">
      <div class="ph__ruler" aria-hidden="true">
        <span>offset</span>
        <span class="ph__ruler-cells">00 01 02 03 04 05 06 07 08 09</span>
        <span>ascii</span>
      </div>

      {#each rows as row}
        <div class="ph__row">
          <span class="ph__offset">{row.offset}</span>
          <span class="ph__cells">
            {#each row.cells as cell}
              <button
                type="button"
                class="ph__byte"
                class:active={isActive(cell.index)}
                tabindex="-1"
                aria-label={`Байт ${cell.index}: 0x${cell.hex}`}
                onclick={() => selectByte(cell.index)}
              >
                {cell.hex}
              </button>
            {/each}
          </span>
          <span class="ph__ascii">{row.ascii}</span>
        </div>
      {/each}

      <div class="ph__legend">
        <span><i class="ph__legend-swatch"></i> выбранное поле</span>
        <span>100 байт заголовка · дальше начинается btree-страница</span>
      </div>
    </div>

    <div class="ph__side">
      <div class="ph__fields" role="group" aria-label="Поля заголовка страницы">
        {#each fields as item}
          <button
            type="button"
            class="ph__field"
            class:active={item.offset === field.offset}
            onclick={() => (selected = item.offset)}
          >
            <span class="ph__field-off">+{item.offset}</span>
            <span class="ph__field-name">{item.name}</span>
            <span class="ph__field-value">{decoded(item).primary}</span>
          </button>
        {/each}
      </div>

      <div class="ph__detail">
        <div class="ph__detail-head">
          <div>
            <span class="ph__detail-off">
              смещение {field.offset}–{field.offset + field.length - 1}
            </span>
            <h4>{field.name}</h4>
          </div>
          <span class="ph__detail-len">{field.length} байт</span>
        </div>

        <div class="ph__detail-value">
          <strong>{current.primary}</strong>
          <span>{current.secondary}</span>
        </div>

        <div class="ph__raw">
          <span>hex</span>
          <code>{rawHex}</code>
        </div>

        <p>{field.note}</p>
      </div>
    </div>
  </div>
</div>

<style>
  .ph {
    border-radius: var(--radius);
    border: 1px solid var(--border);
    background: var(--surface);
    overflow: hidden;
    box-shadow: var(--shadow-soft);
  }

  .ph__bar {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    padding: 10px 16px;
    border-bottom: 1px solid var(--border);
    background: var(--surface-2);
    font-family: var(--font-mono);
    font-size: 0.74rem;
  }

  .ph__title {
    color: var(--lvl-5);
  }

  .ph__tag {
    font-family: var(--font-sans);
    font-size: 0.6rem;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: var(--lvl-5);
    border: 1px solid color-mix(in srgb, var(--lvl-5) 30%, transparent);
    background: color-mix(in srgb, var(--lvl-5) 8%, transparent);
    padding: 2px 7px;
    border-radius: 999px;
  }

  .ph__hint {
    margin-left: auto;
    font-family: var(--font-sans);
    font-size: 0.7rem;
    color: var(--dim);
  }

  .ph__body {
    display: grid;
    grid-template-columns: minmax(0, 1.25fr) minmax(300px, 1fr);
  }

  .ph__hex {
    padding: 14px 16px 16px;
    border-right: 1px solid var(--border);
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .ph__ruler,
  .ph__row {
    display: grid;
    grid-template-columns: 42px minmax(0, 1fr) 86px;
    gap: 10px;
    align-items: center;
    min-width: 480px;
  }

  .ph__ruler {
    font-family: var(--font-mono);
    font-size: 0.58rem;
    letter-spacing: 0.06em;
    color: var(--dim);
    padding-bottom: 6px;
    border-bottom: 1px solid var(--border);
    margin-bottom: 6px;
  }

  .ph__ruler-cells {
    text-align: center;
    word-spacing: 0.5em;
  }

  .ph__row {
    padding: 1px 0;
  }

  .ph__offset {
    font-family: var(--font-mono);
    font-size: 0.66rem;
    color: var(--dim);
  }

  .ph__cells {
    display: grid;
    grid-template-columns: repeat(10, minmax(0, 1fr));
    gap: 2px;
  }

  .ph__byte {
    font-family: var(--font-mono);
    font-size: 0.7rem;
    line-height: 1;
    padding: 5px 0 4px;
    border-radius: 3px;
    color: var(--text-soft);
    background: transparent;
    border: 1px solid transparent;
    transition: background 0.12s ease, color 0.12s ease, border-color 0.12s ease;
  }

  .ph__byte:hover {
    background: var(--surface-3);
    color: var(--text);
  }

  .ph__byte.active {
    background: color-mix(in srgb, var(--lvl-5) 22%, transparent);
    border-color: color-mix(in srgb, var(--lvl-5) 45%, transparent);
    color: color-mix(in srgb, var(--lvl-5) 45%, #ffffff);
    font-weight: 600;
  }

  .ph__ascii {
    font-family: var(--font-mono);
    font-size: 0.7rem;
    letter-spacing: 0.08em;
    color: var(--muted);
    white-space: pre;
    padding-left: 6px;
    border-left: 1px solid var(--border);
  }

  .ph__legend {
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
    align-items: center;
    margin-top: 12px;
    padding-top: 10px;
    border-top: 1px solid var(--border);
    font-size: 0.67rem;
    color: var(--dim);
    min-width: 480px;
  }

  .ph__legend span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .ph__legend-swatch {
    width: 12px;
    height: 10px;
    border-radius: 3px;
    background: color-mix(in srgb, var(--lvl-5) 22%, transparent);
    border: 1px solid color-mix(in srgb, var(--lvl-5) 45%, transparent);
  }

  .ph__side {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .ph__fields {
    max-height: 218px;
    overflow-y: auto;
    padding: 8px;
    display: grid;
    gap: 2px;
    border-bottom: 1px solid var(--border);
  }

  .ph__field {
    display: grid;
    grid-template-columns: 34px minmax(0, 1fr) auto;
    gap: 8px;
    align-items: baseline;
    text-align: left;
    padding: 5px 8px;
    border-radius: 6px;
    color: var(--muted);
    border: 1px solid transparent;
    transition: background 0.12s ease, color 0.12s ease;
  }

  .ph__field:hover {
    background: var(--surface-2);
    color: var(--text-soft);
  }

  .ph__field.active {
    background: color-mix(in srgb, var(--lvl-5) 10%, var(--surface-2));
    border-color: color-mix(in srgb, var(--lvl-5) 24%, transparent);
    color: var(--text);
  }

  .ph__field-off {
    font-family: var(--font-mono);
    font-size: 0.62rem;
    color: var(--dim);
  }

  .ph__field-name {
    font-size: 0.74rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ph__field-value {
    font-family: var(--font-mono);
    font-size: 0.68rem;
    color: var(--text-soft);
    font-variant-numeric: tabular-nums;
  }

  .ph__field.active .ph__field-value {
    color: color-mix(in srgb, var(--lvl-5) 60%, var(--text));
  }

  .ph__detail {
    padding: 16px 18px 18px;
    display: grid;
    gap: 10px;
  }

  .ph__detail-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
  }

  .ph__detail-off {
    font-family: var(--font-mono);
    font-size: 0.62rem;
    color: var(--dim);
  }

  .ph__detail-head h4 {
    font-size: 0.95rem;
    margin-top: 1px;
  }

  .ph__detail-len {
    flex: none;
    font-family: var(--font-mono);
    font-size: 0.63rem;
    color: var(--muted);
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 2px 8px;
  }

  .ph__detail-value {
    display: flex;
    align-items: baseline;
    gap: 10px;
    flex-wrap: wrap;
    padding: 9px 12px;
    border-radius: 9px;
    background: color-mix(in srgb, var(--lvl-5) 7%, var(--surface-2));
    border: 1px solid color-mix(in srgb, var(--lvl-5) 20%, var(--border));
  }

  .ph__detail-value strong {
    font-size: 1.15rem;
    letter-spacing: -0.02em;
    color: color-mix(in srgb, var(--lvl-5) 55%, var(--text));
    font-variant-numeric: tabular-nums;
  }

  .ph__detail-value span {
    font-family: var(--font-mono);
    font-size: 0.68rem;
    color: var(--muted);
  }

  .ph__raw {
    display: flex;
    align-items: baseline;
    gap: 8px;
    min-width: 0;
  }

  .ph__raw span {
    font-size: 0.6rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--dim);
  }

  .ph__raw code {
    font-size: 0.68rem;
    color: var(--text-soft);
    overflow-wrap: anywhere;
  }

  .ph__detail p {
    font-size: 0.78rem;
    line-height: 1.55;
    color: var(--muted);
  }

  @media (max-width: 900px) {
    .ph__body {
      grid-template-columns: 1fr;
    }

    .ph__hex {
      border-right: none;
      border-bottom: 1px solid var(--border);
    }
  }

  @media (max-width: 560px) {
    .ph__hint {
      display: none;
    }

    .ph__ruler,
    .ph__row {
      grid-template-columns: 32px minmax(0, 1fr);
      min-width: 360px;
    }

    .ph__ascii,
    .ph__ruler span:last-child {
      display: none;
    }

    .ph__legend {
      min-width: 0;
    }

    .ph__fields {
      max-height: 190px;
    }
  }
</style>
