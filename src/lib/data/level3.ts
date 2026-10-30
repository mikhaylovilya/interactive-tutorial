import type { Level } from './types';

export const level3 = {
  id: 'builtin',
  number: 3,
  title: 'Встроенные инструменты SQLite',
  tabTitle: 'PRAGMA и CLI',
  subtitle: 'Диагностика изнутри движка, без внешних зависимостей',
  lead: 'У SQLite есть собственный «швейцарский нож»: PRAGMA, dot-команды CLI, EXPLAIN QUERY PLAN, sqlite3_analyzer. Всё это уже лежит в поставке и не требует ни агента, ни отдельного сервера — только понимания, что именно вы спрашиваете у движка.',
  color: '#34d399',
  icon: 'wrench',
  time: '20–30 мин',
  tags: ['PRAGMA', 'EXPLAIN QUERY PLAN', '.dbinfo', '.stats', 'ANALYZE'],
  theory: {
    intro: [
      'Встроенный слой — это те инструменты, которые SQLite предоставляет сама: PRAGMA-директивы, dot-команды командной строки, виртуальные таблицы и утилиты из поставки. Они дешевле внешнего мониторинга и точнее отвечают на вопросы о внутреннем состоянии конкретной базы.',
      'Важно понимать границу: PRAGMA — это не API стабильного стандарта. Синтаксис и набор прагм могут меняться между версиями SQLite. Поэтому в диагностических скриптах фиксируйте версию и проверяйте наличие прагмы перед использованием.'
    ],
    keyIdea: {
      title: 'PRAGMA читает то, что движок уже знает',
      text: 'Большинство прагм не сканируют базу: page_count, freelist_count, journal_mode, synchronous берутся из заголовка файла и внутренних структур. Дорогие операции — integrity_check, dbstat, ANALYZE — нужно запускать осознанно, а не в цикле.'
    },
    sections: [
      {
        title: 'Файл базы как источник правды',
        body: [
          'Заголовок первой страницы содержит размер страницы, счётчик изменений, число страниц, freelist, cookie схемы и версию формата. Именно оттуда .dbinfo и прагмы берут большинство значений, не читая пользовательские данные. Это делает их почти бесплатными.',
          'Полезно помнить: page_count × page_size — логический размер, а фактический размер файла может быть больше из-за freelist, незавершённого WAL и разреженности. freelist_count показывает страницы, которые уже освобождены, но ещё не отданы файловой системе.'
        ],
        bullets: [
          '.dbinfo — сводка заголовка: page size, reserved bytes, schema cookie, число таблиц и индексов, версия ПО.',
          'PRAGMA journal_mode / synchronous / auto_vacuum — режимы durability и управления пространством.',
          'PRAGMA schema_version — меняется при изменении схемы; useful для кэшей и миграций.',
          'PRAGMA data_version — меняется, когда другое соединение закоммитило изменения; не меняется от собственных записей.',
          'PRAGMA freelist_count / page_count — пространство; PRAGMA mmap_size и cache_size — память.'
        ]
      },
      {
        title: 'Планировщик: EXPLAIN и EXPLAIN QUERY PLAN',
        body: [
          'EXPLAIN QUERY PLAN показывает дерево доступа: SCAN, SEARCH, USE TEMP B-TREE, COVERING INDEX. Этого достаточно, чтобы заметить полное сканирование там, где ожидался поиск по индексу. EXPLAIN показывает байткод VDBE — уже уровень 5, но начинать почти всегда стоит с плана.',
          'План зависит от статистики. Без ANALYZE SQLite оценивает кардинальность по эвристикам; после ANALYZE появляется sqlite_stat1, и решения могут измениться. Поэтому «план был хороший, а стал плохой» часто означает не изменение данных, а изменение статистики или версии SQLite.'
        ],
        bullets: [
          'SEARCH ... USING INDEX — поиск по индексу; проверьте, что индекс действительно покрывает условие.',
          'SCAN — полное сканирование таблицы или индекса; на большой таблице это красный флаг.',
          'COVERING INDEX — все нужные колонки есть в индексе, таблица не читается.',
          'USE TEMP B-TREE FOR ORDER BY / GROUP BY — сортировка или группировка во временном B-дереве.',
          'AUTOMATIC COVERING INDEX — SQLite создала индекс на время запроса; кандидат на постоянный индекс.'
        ]
      },
      {
        title: 'Дорогие проверки и когда их запускать',
        body: [
          'integrity_check читает все страницы и проверяет инварианты B-дерева; quick_check делает то же, но пропускает проверку UNIQUE и некоторые дорогие шаги. На гигабайтной базе это минуты I/O. Запускайте на копии, реплике или в окно обслуживания.',
          'ANALYZE собирает статистику и может быть дорогим на больших таблицах. PRAGMA optimize — более умный вариант: он решает, какие таблицы действительно нужно проанализировать, и ограничивает время работы. Для короткоживущих соединений документация рекомендует PRAGMA optimize перед закрытием, для долгоживущих — optimize=0x10002 при открытии и периодически optimize.'
        ]
      },
      {
        title: 'Командная строка как диагностический пульт',
        body: [
          'CLI sqlite3 умеет гораздо больше, чем «выполнить SQL»: .dbinfo, .stats, .scanstats, .timer, .eqp, .schema, .indexes, .changes, .dump, .backup, .recover. Это самый быстрый способ посмотреть на базу без написания кода.',
          'Флаги запуска тоже полезны: -readonly, -cmd, -header, -column, -bail. Для диагностики прода всегда используйте -readonly, чтобы случайный UPDATE не стал инцидентом.'
        ]
      }
    ],
    tools: [
      {
        name: '.dbinfo',
        cmd: 'sqlite3 app.db ".dbinfo"',
        tag: 'CLI',
        desc: 'Сводка заголовка базы: размер страницы, reserved bytes, счётчики, число объектов схемы, версия SQLite, создавшая файл.',
        shows: 'page size, page count, freelist, schema cookie, software version'
      },
      {
        name: 'PRAGMA page_count / freelist_count',
        cmd: 'PRAGMA page_count; PRAGMA freelist_count;',
        tag: 'PRAGMA',
        desc: 'Логический размер и свободные страницы. Дешёвые операции, подходят для регулярного сбора.',
        shows: 'число страниц, число свободных страниц'
      },
      {
        name: 'PRAGMA journal_mode / synchronous',
        cmd: 'PRAGMA journal_mode; PRAGMA synchronous;',
        tag: 'PRAGMA',
        desc: 'Режим журнала и уровень durability. Определяют, какие fsync и блокировки увидит уровень ОС.',
        shows: 'delete/wal/truncate/persist, 0..3'
      },
      {
        name: 'PRAGMA cache_size / mmap_size',
        cmd: 'PRAGMA cache_size; PRAGMA mmap_size;',
        tag: 'PRAGMA',
        desc: 'Размер page cache (в страницах или KiB, если отрицательное) и mmap-окно. Влияют на память процесса и I/O.',
        shows: 'страницы кэша, байты mmap'
      },
      {
        name: 'PRAGMA schema_version / data_version',
        cmd: 'PRAGMA schema_version; PRAGMA data_version;',
        tag: 'PRAGMA',
        desc: 'schema_version меняется при DDL, data_version — при коммитах других соединений. Помогают кэшам и миграциям.',
        shows: 'целые счётчики'
      },
      {
        name: 'EXPLAIN QUERY PLAN',
        cmd: 'EXPLAIN QUERY PLAN SELECT ...;',
        tag: 'планировщик',
        desc: 'Дерево доступа к данным. Показывает SCAN/SEARCH, использование индексов и временных B-деревьев.',
        shows: 'SCAN, SEARCH, COVERING INDEX, TEMP B-TREE'
      },
      {
        name: '.stats on',
        cmd: '.stats on',
        tag: 'CLI',
        desc: 'Счётчики page cache, lookaside, memory, fullscan steps и VM steps для выполненных запросов.',
        shows: 'cache hits/misses, lookaside, Fullscan Steps, VM Steps'
      },
      {
        name: '.timer on',
        cmd: '.timer on',
        tag: 'CLI',
        desc: 'Печатает real/user/sys время каждого запроса. Быстрый способ сравнить варианты запроса или индекса.',
        shows: 'real, user, sys'
      },
      {
        name: 'ANALYZE / PRAGMA optimize',
        cmd: 'ANALYZE; PRAGMA optimize;',
        tag: 'статистика',
        desc: 'Собирает или обновляет sqlite_stat1. optimize решает, что анализировать, и ограничивает время работы.',
        shows: 'sqlite_stat1, изменение планов'
      },
      {
        name: 'PRAGMA integrity_check / quick_check',
        cmd: 'PRAGMA quick_check(1);',
        tag: 'целостность',
        desc: 'Проверка структуры B-дерева и индексов. Дорогая операция; quick_check дешевле, но не проверяет UNIQUE.',
        shows: 'ok или список ошибок'
      },
      {
        name: '.backup и VACUUM INTO',
        cmd: '.backup /backup/app.db',
        tag: 'резервное копирование',
        desc: 'Онлайн-копия через backup API или SQL-команду. Не требует остановки приложения и безопасна при активных читателях.',
        shows: 'созданный файл, время копирования'
      },
      {
        name: 'sqlite3_analyzer',
        cmd: 'sqlite3_analyzer app.db',
        tag: 'утилита поставки',
        desc: 'Отчёт о распределении места: страницы, payload, metadata, freelist, fanout по таблицам и индексам.',
        shows: 'page counts, payload %, unused bytes, fanout'
      },
      {
        name: 'sqldiff',
        cmd: 'sqldiff prod.db replica.db',
        tag: 'утилита поставки',
        desc: 'Сравнивает содержимое двух баз и печатает SQL-различия. Полезен для проверки реплики и миграций.',
        shows: 'INSERT/DELETE/UPDATE различия'
      }
    ],
    metrics: [
      {
        metric: 'page_size',
        source: 'PRAGMA page_size, .dbinfo',
        good: '4096 или 8192 для большинства нагрузок',
        alarm: '512/1024 на современном диске',
        note: 'Менять размер страницы можно только через VACUUM или при создании базы. Маленькие страницы дают больше I/O на больших строках.'
      },
      {
        metric: 'page_count',
        source: 'PRAGMA page_count',
        good: 'растёт плавно и объяснимо',
        alarm: 'скачки без роста данных',
        note: 'page_count × page_size — логический размер. Сравнивайте с freelist_count.'
      },
      {
        metric: 'freelist_count',
        source: 'PRAGMA freelist_count',
        good: '< 10% от page_count',
        alarm: '> 30% и не снижается',
        note: 'Свободные страницы переиспользуются. Высокий freelist — повод для VACUUM, а не для паники.'
      },
      {
        metric: 'journal_mode',
        source: 'PRAGMA journal_mode',
        good: 'wal для многопользовательской нагрузки',
        alarm: 'delete при конкурентных чтениях',
        note: 'Смена режима — операция с записью в файл; не делайте её на каждом старте без нужды.'
      },
      {
        metric: 'synchronous',
        source: 'PRAGMA synchronous',
        good: 'FULL (2) для финансов, NORMAL (1) в WAL для веба',
        alarm: 'OFF (0) на продакшене',
        note: 'NORMAL в WAL не теряет целостность при падении процесса, но может потерять последние транзакции при отказе ОС.'
      },
      {
        metric: 'cache_size',
        source: 'PRAGMA cache_size',
        good: 'хватает рабочему набору, но не раздувает RSS',
        alarm: 'крошечный кэш при повторяющихся чтениях',
        note: 'Отрицательное значение — KiB, положительное — страницы. По умолчанию обычно 2000 страниц (~8 МБ).'
      },
      {
        metric: 'schema_version',
        source: 'PRAGMA schema_version',
        good: 'меняется только при DDL',
        alarm: 'непрерывные изменения',
        note: 'Если schema_version растёт без миграций, ищите повторяющиеся CREATE/DROP или пересоздание temp-объектов.'
      },
      {
        metric: 'Fullscan Steps',
        source: '.stats on',
        good: 'близко к нулю для точечных запросов',
        alarm: 'десятки тысяч на OLTP-запрос',
        note: 'Счётчик из .stats показывает, сколько раз VDBE перебирал строки при полном сканировании.'
      },
      {
        metric: 'Page cache hit rate',
        source: '.stats on',
        good: '> 95% на повторяющихся запросах',
        alarm: 'низкий hit rate при достаточной RAM',
        note: 'hits/(hits+misses). Низкий hit rate может означать маленький cache_size или слишком разнообразный рабочий набор.'
      }
    ],
    checklist: [
      'Зафиксируйте версию SQLite: PRAGMA compile_options и SELECT sqlite_version().',
      'Снимите .dbinfo и базовые PRAGMA до любых изменений — это ваша точка отсчёта.',
      'Для медленного запроса сначала EXPLAIN QUERY PLAN, потом .timer, и только затем EXPLAIN.',
      'Проверьте, есть ли sqlite_stat1 и когда последний раз выполнялся ANALYZE/optimize.',
      'Дорогие проверки (integrity_check, dbstat, ANALYZE) запускайте на копии или по расписанию.'
    ]
  },

  visuals: [
    {
      type: 'dbinfo',
      title: '.dbinfo: заголовок базы как медицинская карта',
      caption:
        'Реальный вывод на учебной базе (838 страниц, 87 свободных). Почти все значения читаются из первой страницы и не требуют сканирования данных.'
    },
    {
      type: 'eqp-compare',
      title: 'EXPLAIN QUERY PLAN до и после индекса',
      caption:
        'Один и тот же запрос по tracks.title. Слева — полное сканирование 8000 строк, справа — поиск по covering index. План изменился, результат — нет.'
    },
    {
      type: 'terminal',
      title: '.stats on: куда уходят шаги',
      caption:
        'Реальный вывод на 30 000 строк. Fullscan Steps 29999 и VM Steps 98246 показывают полный перебор. Для сравнения: точечный поиск по индексу даёт единицы шагов и почти нулевой fullscan.',
      lang: 'text',
      tag: 'реальный вывод',
      code: `sqlite> .stats on
sqlite> SELECT count(*) FROM plays WHERE ms_played > 200000;
8235
Memory Used:                         1277872 (max 1277904) bytes
Number of Outstanding Allocations:   496 (max 497)
Number of Pcache Overflow Bytes:     1092096 (max 1092096) bytes
Largest Allocation:                  87360 bytes
Largest Pcache Allocation:           4368 bytes
Lookaside Slots Used:                60 (max 96)
Successful lookaside attempts:       159
Lookaside failures due to size:      0
Lookaside failures due to OOM:       0
Pager Heap Usage:                    1127920 bytes
Page cache hits:                     3
Page cache misses:                   258
Page cache writes:                   0
Page cache spills:                   0
Schema Heap Usage:                   2720 bytes
Statement Heap/Lookaside Usage:      3168 bytes
Fullscan Steps:                      29999
Sort Operations:                     0
Autoindex Inserts:                   0
Virtual Machine Steps:               98246
Reprepare operations:                0
Number of times run:                 1
Memory used by prepared stmt:        3168`
    },
    {
      type: 'terminal',
      title: 'Режимы журнала: что отвечает база',
      caption:
        'Переключение режимов — это запись в файл. На уже созданной базе journal_mode=wal сохраняется, а delete/truncate/persist меняют способ ведения журнала. Каждый режим по-разному виден инструментам ОС.',
      lang: 'text',
      tag: 'реальный вывод',
      code: `sqlite> PRAGMA journal_mode;
delete
sqlite> CREATE TABLE t(x);
sqlite> PRAGMA journal_mode=wal;
wal
sqlite> PRAGMA journal_mode=delete;
delete
sqlite> PRAGMA journal_mode=truncate;
truncate
sqlite> PRAGMA journal_mode=persist;
persist
sqlite> PRAGMA journal_mode=wal;
wal`
    },
    {
      type: 'terminal',
      title: 'PRAGMA optimize: тихий помощник',
      caption:
        'На этой базе optimize не нашёл, что анализировать, и не напечатал ничего. Это нормально: прагма задумана как почти no-op, который изредка запускает ограниченный ANALYZE.',
      lang: 'text',
      tag: 'реальный вывод',
      code: `sqlite> PRAGMA optimize;
sqlite> SELECT * FROM sqlite_stat1;
plays|idx_plays_track|40000 5 1
tracks|idx_tracks_artist|8000 20

-- 40000 строк в plays, в среднем 5 попаданий на track_id,
-- 1 — среднее число строк на уникальное значение в конце индекса.
-- tracks: 8000 строк, 20 на artist.`
    }
  ],

  practice: {
    scenarios: [
      {
        title: 'Полный осмотр базы за пять минут',
        goal: 'Собрать базовую карту базы: размер, свободное место, режимы, схему и статистику.',
        steps: [
          {
            text: 'Откройте базу только для чтения и снимите заголовок.',
            code: `$ sqlite3 -readonly app.db ".dbinfo"
database page size:  4096
write format:        2
read format:         2
reserved bytes:      12
file change counter: 3
database page count: 838
freelist page count: 87
schema cookie:       5
schema format:       4
default cache size:  0
autovacuum top root: 0
incremental vacuum:  0
text encoding:       1 (utf8)
user version:        0
application id:      0
software version:    3043002
number of tables:    3
number of indexes:   2
number of triggers:  0
number of views:     0
schema size:         534
data version         3`,
            lang: 'shell',
            note: 'software version 3043002 = 3.43.2. Полезно знать, какой версией создан файл: формат и поведение прагм зависят от версии.'
          },
          {
            text: 'Снимите режимы и размеры одним запросом.',
            code: `$ sqlite3 -readonly app.db <<'SQL'
SELECT 'page_size' AS metric, * FROM pragma_page_size()
UNION ALL SELECT 'page_count', * FROM pragma_page_count()
UNION ALL SELECT 'freelist_count', * FROM pragma_freelist_count()
UNION ALL SELECT 'journal_mode', * FROM pragma_journal_mode()
UNION ALL SELECT 'synchronous', * FROM pragma_synchronous()
UNION ALL SELECT 'cache_size', * FROM pragma_cache_size()
UNION ALL SELECT 'schema_version', * FROM pragma_schema_version()
UNION ALL SELECT 'data_version', * FROM pragma_data_version();
SQL
page_size       4096
page_count      838
freelist_count  87
journal_mode    wal
synchronous     1
cache_size      2000
schema_version  5
data_version    3`,
            lang: 'shell',
            note: 'Функции pragma_* — табличные обёртки, удобны для UNION и мониторинга. Они доступны в современных версиях SQLite.'
          },
          {
            text: 'Посмотрите на схему и статистику.',
            code: `$ sqlite3 -readonly app.db <<'SQL'
SELECT name, type FROM sqlite_schema ORDER BY type, name;
SELECT * FROM sqlite_stat1;
SQL
idx_plays_track|index
idx_tracks_artist|index
plays|table
sqlite_stat1|table
tracks|table
plays|idx_plays_track|40000 5 1
tracks|idx_tracks_artist|8000 20`,
            lang: 'shell'
          }
        ],
        verdict:
          'Если freelist_count высокий — решите, нужен ли VACUUM. Если journal_mode не wal при конкурентной нагрузке — проверьте, не переключает ли кто-то режим на каждом соединении. Если sqlite_stat1 пуст, планировщик работает на эвристиках.'
      },
      {
        title: 'Найти и починить полное сканирование',
        goal: 'Пройти путь от жалобы «запрос тормозит» до проверенного индекса и сравнения планов.',
        steps: [
          {
            text: 'Воспроизведите запрос и снимите план.',
            code: `sqlite> .eqp on
sqlite> SELECT id, title FROM tracks WHERE title = 'Track 42';
QUERY PLAN
\`--SCAN tracks
id  title
--  --------
42  Track 42

sqlite> EXPLAIN QUERY PLAN SELECT id, title FROM tracks WHERE title = 'Track 42';
QUERY PLAN
\`--SCAN tracks`,
            lang: 'sql',
            note: 'SCAN tracks означает перебор 8000 строк. Для одного значения это явно избыточно.'
          },
          {
            text: 'Создайте индекс и обновите статистику.',
            code: `sqlite> CREATE INDEX idx_tracks_title ON tracks(title);
sqlite> ANALYZE;`,
            lang: 'sql'
          },
          {
            text: 'Повторите план и измерьте время.',
            code: `sqlite> .eqp on
sqlite> SELECT id, title FROM tracks WHERE title = 'Track 42';
QUERY PLAN
\`--SEARCH tracks USING COVERING INDEX idx_tracks_title (title=?)
id  title
--  --------
42  Track 42

sqlite> .timer on
sqlite> SELECT count(*) FROM plays WHERE ms_played > 200000;
8235
Run Time: real 0.001 user 0.001300 sys 0.000415`,
            lang: 'sql',
            note: 'COVERING INDEX значит, что id и title берутся прямо из индекса: таблица не читается. Это лучший исход для такого запроса.'
          },
          {
            text: 'Проверьте, что индекс не стал лишним.',

            code: `sqlite> SELECT name, type FROM sqlite_schema WHERE tbl_name = 'tracks';
tracks|table
idx_tracks_artist|index
idx_tracks_title|index

sqlite> PRAGMA index_info(idx_tracks_title);
0|0|title`,
            lang: 'sql',
            note: 'Индекс по одному столбцу полезен только если по нему действительно ищут. Слишком много индексов замедляет запись и занимает место.'
          }
        ],
        verdict:
          'План SCAN → SEARCH USING COVERING INDEX — это подтверждённое улучшение, а не догадка. Всегда проверяйте его на реальных данных и с реальной статистикой: на маленькой таблице планировщик может осознанно выбрать SCAN.'
      },
      {
        title: 'Проверить целостность и сделать горячий бэкап',
        goal: 'Убедиться, что база не повреждена, и получить консистентную копию без остановки приложения.',
        steps: [
          {
            text: 'Сначала быстрая проверка, затем полная — на копии.',
            code: `$ sqlite3 -readonly app.db "PRAGMA quick_check(1);"
ok

$ cp app.db /tmp/app-copy.db
$ sqlite3 -readonly /tmp/app-copy.db "PRAGMA integrity_check;"
ok`,
            lang: 'shell',
            note: 'Копирование файла на живой базе в режиме WAL без -wal/-shm может дать несогласованную копию. Для реального бэкапа используйте .backup, VACUUM INTO или Litestream.'
          },
          {
            text: 'Сделайте онлайн-копию через backup API.',
            code: `$ sqlite3 app.db ".backup '/backup/app-$(date +%F).db'"
$ ls -lh /backup/
-rw-r--r-- 1 app app 2.5M Oct 30 10:52 app-2026-10-30.db`,
            lang: 'shell'
          },
          {
            text: 'Или через VACUUM INTO — заодно дефрагментирует копию.',
            code: `$ sqlite3 app.db "VACUUM INTO '/backup/app-compact.db';"
$ sqlite3 /backup/app-compact.db "PRAGMA page_count; PRAGMA freelist_count;"
647
0`,
            lang: 'shell',
            note: 'Исходная база была 838 страниц с 87 свободными; компактная копия — 647 страниц и 0 свободных. VACUUM INTO не меняет исходную базу.'
          },
          {
            text: 'Проверьте копию так, как будто это восстановление.',
            code: `$ sqlite3 /backup/app-compact.db <<'SQL'
PRAGMA integrity_check;
SELECT count(*) FROM plays;
SELECT count(*) FROM tracks;
SQL
ok
30000
8000`,
            lang: 'shell'
          }
        ],
        verdict:
          'Бэкап без проверки восстановления — это надежда, а не гарантия. integrity_check на копии, сверка количества строк и версии схемы занимают минуты, но именно они превращают копию в доказательство.'
      }
    ],
    pitfalls: [
      {
        title: 'PRAGMA без версии',
        text: 'Набор прагм и их поведение меняются между версиями. Скрипт, написанный под 3.50, может молча вернуть пустоту на 3.35. Фиксируйте версию и проверяйте результат, а не только код возврата.'
      },
      {
        title: 'integrity_check в час пик',
        text: 'Это полное сканирование базы. На большой базе оно даёт всплеск I/O и может замедлить приложение. Запускайте на реплике, копии или в окно обслуживания.'
      },
      {
        title: 'ANALYZE после каждого изменения',
        text: 'ANALYZE на больших таблицах дорог. Используйте PRAGMA optimize, который сам решает, что анализировать, и ограничивает время работы.'
      },
      {
        title: 'Индекс на всё',
        text: 'Каждый индекс ускоряет чтение и замедляет запись, занимает страницы и увеличивает размер WAL. Индекс оправдан, когда есть запросы, которые его реально используют.'
      },
      {
        title: 'Копирование файла на живой базе',
        text: 'cp app.db без -wal и -shm в режиме WAL может дать несогласованную копию. Используйте .backup, VACUUM INTO или Litestream.'
      },
      {
        title: 'Ожидание, что PRAGMA изменит файл',
        text: 'page_count, freelist_count, data_version — только чтение. VACUUM, journal_mode и auto_vacuum меняют файл; не путайте диагностику с изменением состояния.'
      }
    ]
  },

  quiz: [
    {
      question:
        'Запрос по tracks.title показывает SCAN tracks на 8000 строк. После CREATE INDEX и ANALYZE план стал SEARCH ... USING COVERING INDEX. Что это доказывает?',
      options: [
        'Что индекс всегда ускоряет любой запрос к таблице',
        'Что планировщик теперь использует индекс и не читает таблицу для нужных колонок',
        'Что база автоматически выполнила VACUUM',
        'Что ANALYZE изменил данные в таблице tracks'
      ],
      correct: 1,
      explain:
        'COVERING INDEX означает, что все запрошенные колонки есть в индексе, поэтому таблица не читается. ANALYZE не меняет данные — он обновляет статистику. Индекс не универсальное ускорение: он помогает конкретным запросам и стоит места и скорости записи.'
    },
    {
      question: 'Что произойдёт, если запустить PRAGMA integrity_check на большой боевой базе в час пик?',
      options: [
        'Ничего: это чтение заголовка, как .dbinfo',
        'База будет полностью просканирована, возможны всплеск I/O и замедление приложения',
        'SQLite автоматически переключится в WAL и ускорит проверку',
        'Проверка заблокирует все записи навсегда'
      ],
      correct: 1,
      explain:
        'integrity_check читает все страницы и проверяет инварианты B-дерева — это дорогая операция. Она не «читает заголовок», не переключает режим и не блокирует записи навсегда, но может заметно нагрузить диск. Для регулярных проверок используйте quick_check на копии или реплике.'
    },
    {
      question: 'Чем page_count × page_size отличается от размера файла app.db?',
      options: [
        'Ничем, это всегда одно и то же число',
        'Логический размер не учитывает freelist, WAL и разреженность файла',
        'page_count всегда больше размера файла, потому что включает WAL',
        'Размер файла считается только для баз в режиме DELETE'
      ],
      correct: 1,
      explain:
        'page_count × page_size — логический размер базы. Файл может быть больше из-за свободных страниц (freelist), отдельного -wal и разреженности, а также меньше логического размера при sparse-файлах. Поэтому сравнивать ls и PRAGMA нужно осознанно.'
    }
  ]
} satisfies Level;
