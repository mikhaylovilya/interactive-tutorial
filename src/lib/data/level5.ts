import type { Level } from './types';

export const level5 = {
  id: 'internals',
  number: 5,
  title: 'Внутренняя телеметрия',
  tabTitle: 'Внутренности',
  subtitle: 'Байткод, страницы, WAL и счётчики движка',
  lead: 'Самый глубокий слой — это то, что происходит внутри VDBE, pager и btree. Здесь нет готовых «метрик сервера», зато есть точные счётчики, байткод, заголовки страниц и кадры WAL. Эти инструменты нужны, когда внешние слои уже сказали «медленно», но не сказали почему.',
  color: '#fb7185',
  icon: 'layers',
  time: '30–40 мин',
  tags: ['VDBE', 'scanstatus', 'sqlite3_status64', 'WAL', 'page header'],
  theory: {
    intro: [
      'Запрос проходит путь: SQL-текст → парсер → планировщик → байткод VDBE → btree → pager → VFS → файл. Каждый слой можно наблюдать своим инструментом. Внутренняя телеметрия отвечает на вопросы «сколько циклов CPU ушло на этот цикл плана», «какие страницы читались», «что лежит в заголовке» и «почему checkpoint не продвигается».',
      'Здесь важно не путать уровни. EXPLAIN QUERY PLAN — это план, EXPLAIN — байткод, scanstatus — фактическое выполнение. Красивая строка плана ничего не доказывает; счётчики и байты доказывают.'
    ],
    keyIdea: {
      title: 'Измеряйте выполнение, а не только план',
      text: 'План говорит, что движок собирается делать. scanstatus и счётчики говорят, что он реально сделал: сколько циклов, посещений и строк. Именно расхождение между ожиданием и фактом чаще всего указывает на проблему.'
    },
    sections: [
      {
        title: 'Конвейер запроса и точки наблюдения',
        body: [
          'Парсер строит дерево разбора, планировщик выбирает индексы и порядок соединений, кодогенератор выпускает байткод, VDBE исполняет его. Btree-слой работает со страницами через pager, а pager — через VFS с файловой системой и журналом.',
          'На каждом переходе есть свой инструмент: EXPLAIN QUERY PLAN на выходе планировщика, EXPLAIN и bytecode() на выходе кодогенератора, scanstatus и .scanstats на входе VDBE, dbstat и sqlite_dbpage на уровне страниц, strace и iostat — на уровне VFS/ОС.'
        ],
        bullets: [
          'Планировщик: EXPLAIN QUERY PLAN, sqlite_stat1, PRAGMA optimize.',
          'Кодогенератор: EXPLAIN, bytecode(«SELECT ...»), opcode-ы OpenRead/Seek/Column/ResultRow.',
          'Исполнение: sqlite3_stmt_scanstatus, .scanstats, sqlite_stmt, .stats.',
          'Страницы: dbstat, sqlite_dbpage, sqlite3_analyzer.',
          'Файлы и журнал: заголовок page 1, WAL-кадры, PRAGMA wal_checkpoint.',
          'Ресурсы: sqlite3_status64, sqlite3_db_status, PRAGMA cache_size.'
        ]
      },
      {
        title: 'scanstatus: где реально горят циклы',
        body: [
          'Счётчик NCYCLE измеряет процессорное время в циклах (через sqlite3Hwtime), NLOOP — число запусков цикла, NVISIT — сколько раз тело цикла выполнилось, EST — оценку планировщика. Для одного запроса можно увидеть вклад каждого цикла и долю от общего времени.',
          'Типичная картина: полное сканирование даёт миллионы циклов на 30 000 строк, а поиск по индексу — тысячи. Второй типичный случай — временное B-дерево для ORDER BY, которое съедает треть времени при небольшом числе строк. Это прямое указание, что индекс под сортировку важнее, чем кажется.',
          'Счётчики включаются отдельно: SQLITE_ENABLE_STMT_SCANSTATUS при сборке и sqlite3_db_config(db, SQLITE_DBCONFIG_STMT_SCANSTATUS, 1, 0) или .scanstats on в CLI. Без этого CLI молча не покажет статистику.'
        ]
      },
      {
        title: 'Счётчики памяти: что работает, а что нет',
        body: [
          'sqlite3_status64 отдаёт глобальные счётчики: MEMORY_USED, PAGECACHE_USED, PAGECACHE_OVERFLOW, SCRATCH_USED, MALLOC_SIZE. sqlite3_db_status — счётчики конкретного соединения: CACHE_USED, CACHE_HIT, CACHE_MISS, CACHE_WRITE, CACHE_SPILL, LOOKASIDE_*, SCHEMA_USED, STMT_USED.',
          'Ключевая ловушка: если SQLite собрана с SQLITE_DEFAULT_MEMSTATUS=0 (частое дело в системных сборках), глобальные счётчики памяти возвращают нули, хотя база работает. При этом db_status CACHE_USED и CACHE_HIT/MISS продолжают работать. Поэтому «memory_used = 0» — не доказательство отсутствия памяти, а признак выключенного memstatus.'
        ]
      },
      {
        title: 'Страница и WAL как источники правды',
        body: [
          'Первая страница содержит 100-байтовый заголовок: магическая строка, размер страницы, формат, счётчик изменений, число страниц, freelist, cookie схемы, кодировка, версия. Смещения фиксированы, и их можно проверить hexdump-ом или через sqlite_dbpage.',
          'WAL состоит из 32-байтового заголовка и кадров по (page_size + 24) байт. В заголовке кадра: номер страницы, размер базы после коммита (0 — не коммит), две соли и две контрольные суммы. Кадры накапливаются до коммит-кадра; checkpoint переносит их в основной файл. Понимание этой структуры объясняет, почему WAL растёт, почему checkpoint возвращает busy и почему удалять -wal вручную нельзя.'
        ]
      },
      {
        title: 'VFS и отладочные сборки',
        body: [
          'VFS — последний слой перед файловой системой: xOpen, xRead, xWrite, xSync, xLock. Свой VFS-shim позволяет измерять latency операций, подменять файлы (in-memory, encryption, replication) и эмулировать ошибки. Litestream и подобные инструменты используют именно этот слой.',
          'Отладочные прагмы (vdbe_trace, vdbe_listing, parser_trace, select_trace, where_trace, btree_trace) доступны только в сборке с SQLITE_DEBUG. В обычной сборке неизвестная PRAGMA не возвращает ошибку — она просто игнорируется. Поэтому «прагма выполнилась» не значит «трассировка включилась»: проверяйте версию сборки и фактический вывод.'
        ]
      }
    ],
    tools: [
      {
        name: '.scanstats on',
        cmd: '.scanstats on',
        tag: 'CLI · compile-time',
        desc: 'Печатает циклы, циклы-в-процентах, число циклов и строк по каждому узлу плана. Требует SQLITE_ENABLE_STMT_SCANSTATUS.',
        shows: 'cycles, % от общего, loops, rows'
      },
      {
        name: 'sqlite3_stmt_scanstatus',
        cmd: 'sqlite3_stmt_scanstatus(stmt, i, SQLITE_SCANSTAT_NCYCLE, &v);',
        tag: 'C API',
        desc: 'Программный доступ к тем же счётчикам: NLOOP, NVISIT, EST, NCYCLE, EXPLAIN. v2 поддерживает SQLITE_SCANSTAT_COMPLEX.',
        shows: 'loops, visits, est, cycles, plan text'
      },
      {
        name: 'sqlite3_status64',
        cmd: 'sqlite3_status64(SQLITE_STATUS_MEMORY_USED, &cur, &hi, 0);',
        tag: 'C API · глобально',
        desc: 'Глобальные счётчики памяти и page cache. Зависят от SQLITE_DEFAULT_MEMSTATUS и sqlite3_config.',
        shows: 'MEMORY_USED, PAGECACHE_USED/OVERFLOW, SCRATCH_USED'
      },
      {
        name: 'sqlite3_db_status',
        cmd: 'sqlite3_db_status(db, SQLITE_DBSTATUS_CACHE_HIT, &v, &hi, 0);',
        tag: 'C API · соединение',
        desc: 'Счётчики конкретного соединения: попадания/промахи кэша, spill, lookaside, память схемы и prepared statements.',
        shows: 'CACHE_HIT/MISS/WRITE/SPILL, LOOKASIDE_*, STMT_USED'
      },
      {
        name: 'EXPLAIN / bytecode()',
        cmd: 'EXPLAIN SELECT ...;',
        tag: 'VDBE',
        desc: 'Байткод: opcode-ы, регистры, ветвления. Показывает, как именно план превращается в исполняемые шаги.',
        shows: 'addr, opcode, p1..p5, comment'
      },
      {
        name: 'sqlite_dbpage',
        cmd: "SELECT hex(data) FROM sqlite_dbpage('main') WHERE pgno=1;",
        tag: 'vtab · compile-time',
        desc: 'Сырые страницы базы. Позволяет проверить заголовок, флаги btree-страницы и границы ячеек.',
        shows: 'pgno, data, schema'
      },
      {
        name: 'PRAGMA wal_checkpoint',
        cmd: 'PRAGMA wal_checkpoint(PASSIVE);',
        tag: 'WAL',
        desc: 'Переносит кадры WAL в основной файл. Возвращает busy, число кадров в WAL и число перенесённых кадров.',
        shows: 'busy | log | checkpointed'
      },
      {
        name: 'vdbe_trace / vdbe_listing',
        cmd: 'PRAGMA vdbe_trace=ON;',
        tag: 'debug build',
        desc: 'Пошаговая трассировка VDBE с регистрами и результатами. Только в сборке с SQLITE_DEBUG; иначе молча игнорируется.',
        shows: 'opcode, регистры, значения, результат'
      },
      {
        name: 'VFS shim',
        cmd: 'sqlite3_vfs_register(&my_vfs, 0);',
        tag: 'C API',
        desc: 'Обёртка над файловыми операциями: измерение latency, подмена хранилища, репликация на уровне страниц.',
        shows: 'xRead/xWrite/xSync, размеры, ошибки'
      }
    ],
    metrics: [
      {
        metric: 'NCYCLE (scanstatus)',
        source: '.scanstats, sqlite3_stmt_scanstatus',
        good: 'основная доля — в самом дорогом узле плана',
        alarm: 'временное B-дерево съедает > 30%',
        note: 'Циклы — процессорное время, а не wall clock. Сравнивайте доли между узлами, а не абсолютные значения между машинами.'
      },
      {
        metric: 'visits vs est',
        source: 'scanstatus',
        good: 'одного порядка',
        alarm: 'visits на порядки больше est',
        note: 'Сильное расхождение — признак устаревшей статистики или неверной селективности.'
      },
      {
        metric: 'loops',
        source: 'scanstatus',
        good: '1 для верхнего узла',
        alarm: 'большое число loops у вложенного цикла',
        note: 'Вложенные циклы умножают стоимость; смотрите на произведение loops × visits.'
      },
      {
        metric: 'MEMORY_USED',
        source: 'sqlite3_status64',
        good: 'стабилен, соответствует рабочему набору',
        alarm: '0 при активной базе',
        note: 'Ноль чаще всего означает SQLITE_DEFAULT_MEMSTATUS=0, а не отсутствие памяти.'
      },
      {
        metric: 'PAGECACHE_OVERFLOW',
        source: 'sqlite3_status64',
        good: 'небольшой относительно cache_size',
        alarm: 'быстрый рост',
        note: 'Память page cache, выделенная через malloc вместо статического пула. Видна даже при выключенном memstatus.'
      },
      {
        metric: 'cache hit rate',
        source: 'sqlite3_db_status',
        good: '> 95% на повторяющихся запросах',
        alarm: 'низкий при достаточной RAM',
        note: 'hits/(hits+misses). После первого прогрева кэш должен стабилизироваться.'
      },
      {
        metric: 'WAL frames',
        source: 'размер -wal / (page_size + 24)',
        good: 'пила, сбрасывается checkpoint-ом',
        alarm: 'монотонный рост',
        note: 'Число кадров × 4120 байт при page_size 4096. Растущий WAL — симптом долгого читателя.'
      },
      {
        metric: 'checkpointed / log',
        source: 'PRAGMA wal_checkpoint',
        good: 'checkpointed = log',
        alarm: 'checkpointed < log или busy=1',
        note: 'Разница означает, что часть кадров не удалось перенести; причина — читатель или ошибка I/O.'
      },
      {
        metric: 'page free space',
        source: 'dbstat (pgsize − payload − unused)',
        good: 'страницы заполнены равномерно',
        alarm: 'много почти пустых страниц',
        note: 'Низкая заполненность после удалений — кандидат на VACUUM или перестройку.'
      }
    ],
    checklist: [
      'Убедитесь, что нужные compile-time флаги есть: scanstatus, dbstat, dbpage, bytecode.',
      'Для медленного запроса сравните план, байткод и фактический scanstatus — это три разных источника.',
      'Проверяйте версию сборки перед использованием отладочных прагм: в релизе они молча ничего не делают.',
      'Для памяти используйте db_status, если глобальные счётчики показывают нули.',
      'Перед ручным разбором WAL сделайте копию: -wal и -shm нельзя трогать на живой базе.'
    ]
  },

  visuals: [
    {
      type: 'query-pipeline',
      title: 'Путь запроса и инструменты на каждом слое',
      caption:
        'Один SQL проходит через парсер, планировщик, кодогенератор, VDBE, btree, pager и VFS. Верхние слои объясняют «почему так», нижние — «сколько это стоит».'
    },
    {
      type: 'terminal',
      title: '.scanstats on: циклы по узлам плана',
      caption:
        'Реальный вывод на 30 000 строк. Полное сканирование plays — 2.53 млн циклов (86% запроса). Во втором запросе временное B-дерево для ORDER BY съедает 569 тыс. циклов (31%) — почти столько же, сколько сам индексный скан.',
      lang: 'text',
      tag: 'реальный вывод',
      code: `sqlite> .scanstats on
sqlite> SELECT count(*) FROM plays WHERE ms_played > 200000;
8235
QUERY PLAN (cycles=2940933 [100%])
\`--SCAN plays     (cycles=2534541 [86%] loops=1 rows=30000)

sqlite> SELECT artist, count(*) AS n FROM tracks
   ...> GROUP BY artist ORDER BY n DESC LIMIT 3;
QUERY PLAN (cycles=1846941 [100%])
|--SCAN tracks USING COVERING INDEX idx_tracks_artist     (cycles=730815 [40%] loops=1 rows=8000)
\`--USE TEMP B-TREE FOR ORDER BY                           (cycles=568755 [31%] loops=1 rows=400)`
    },
    {
      type: 'wal-layout',
      title: 'Анатомия WAL: 32 байта заголовка и кадры по 4120 байт',
      caption:
        'Заголовок WAL содержит магию, версию формата, размер страницы, checkpoint sequence и соли. Каждый кадр — 24 байта метаданных плюс страница. Кадр с ненулевым db size завершает транзакцию.'
    },
    {
      type: 'page-hex',
      title: 'Заголовок страницы 1: 100 байт, которые объясняют всё',
      caption:
        'Реальный заголовок учебной базы. Смещения фиксированы; значения совпадают с .dbinfo: страница 4096, 838 страниц, 87 свободных, schema cookie 5, версия 3043002 (3.43.2).'
    },
    {
      type: 'terminal',
      title: 'Байткод: как план превращается в шаги',
      caption:
        'EXPLAIN того же запроса по индексу. Видно OpenRead двух B-деревьев, SeekLE по ключу, DeferredSeek к таблице и DecrJumpZero для LIMIT. Это уже не «план», а исполняемая программа.',
      lang: 'text',
      tag: 'реальный вывод',
      code: `addr  opcode         p1    p2    p3    p4             p5  comment
----  -------------  ----  ----  ----  -------------  --  -------------
0     Init           0     15    0                    0   Start at 15
1     Noop           1     4     0                    0
2     Integer        5     1     0                    0   r[1]=5; LIMIT counter
3     OpenRead       0     2     0     3              0   root=2 iDb=0; tracks
4     OpenRead       2     4     0     k(2,,)         2   root=4 iDb=0; idx_tracks_artist
5     String8        0     2     0     Artist 42      0   r[2]='Artist 42'
6     SeekLE         2     14    2     1              0   key=r[2]
7       IdxLT          2     14    2     1              0   key=r[2]
8       DeferredSeek   2     0     0                    0   Move 0 to 2.rowid if needed
9       IdxRowid       2     3     0                    0   r[3]=rowid; tracks.rowid
10      Column         0     1     4                    0   r[4]= cursor 0 column 1
11      ResultRow      3     2     0                    0   output=r[3..4]
12      DecrJumpZero   1     14    0                    0   if (--r[1])==0 goto 14
13    Prev           2     7     1                    0
14    Halt           0     0     0`
    },
    {
      type: 'terminal',
      title: 'Отладочная трассировка VDBE (сборка с SQLITE_DEBUG)',
      caption:
        'Фрагмент vdbe_trace для точечного запроса по rowid. Видно, как значение 42 попадает в регистр, SeekRowid находит строку и ResultRow отдаёт её. В обычной сборке эта прагма молча игнорируется.',
      lang: 'text',
      tag: 'реальный вывод debug-сборки',
      code: `SQL: [SELECT title FROM tracks WHERE id = 42;]
VDBE Trace:
   0 Init             0    8    0               00 Start at 8
   8 Transaction      0    0    6 0             01 usesStmtJournal=0
   9 TableLock        0    2    0 tracks        00 iDb=0 root=2 write=0
  10 Goto             0    1    0               00
   1 OpenRead         0    2    0 2             00 root=2 iDb=0; tracks
   2 Explain          2    0   33 SEARCH tracks USING INTEGER PRIMARY KEY (rowid=?) 00
   3 Integer         42    1    0               00 r[1]=42
R[1] =  i:42
   4 SeekRowid        0    7    1               00 intkey=r[1]
R[1] =  i:42
   5 Column           0    1    2               00 r[2]= cursor 0 column 1
R[2] =   s8[Track 42](8)(0-term)
   6 ResultRow        2    1    0               00 output=r[2]
R[2] =   s8[Track 42](8)(0-term)
Track 42
   7 Halt             0    0    0`
    }
  ],

  practice: {
    scenarios: [
      {
        title: 'Найти дорогой узел плана через scanstatus',
        goal: 'Не гадать по EXPLAIN, а измерить вклад каждого узла и проверить гипотезу индексом.',
        steps: [
          {
            text: 'Включите статистику и выполните запрос.',
            code: `sqlite> .scanstats on
sqlite> SELECT count(*) FROM plays WHERE ms_played > 200000;
8235
QUERY PLAN (cycles=2940933 [100%])
\`--SCAN plays     (cycles=2534541 [86%] loops=1 rows=30000)`,
            lang: 'sql',
            note: '86% циклов — в полном сканировании. Остальные 14% приходятся на служебные узлы плана.'
          },
          {
            text: 'Проверьте план и добавьте индекс под условие.',
            code: `sqlite> EXPLAIN QUERY PLAN
   ...> SELECT count(*) FROM plays WHERE ms_played > 200000;
QUERY PLAN
\`--SCAN plays

sqlite> CREATE INDEX idx_plays_ms ON plays(ms_played);
sqlite> ANALYZE;`,
            lang: 'sql'
          },
          {
            text: 'Сравните статистику после индекса.',
            code: `sqlite> .scanstats on
sqlite> SELECT count(*) FROM plays WHERE ms_played > 200000;
8235
QUERY PLAN (cycles=412880 [100%])
\`--SEARCH plays USING COVERING INDEX idx_plays_ms (ms_played>?)

-- visits: 8235 вместо 30000, циклов примерно в 7 раз меньше`,
            lang: 'sql',
            note: 'Числа зависят от машины и версии: важна не абсолютная величина, а отношение и число посещений.'
          },
          {
            text: 'Проверьте цену индекса для записи.',
            code: `sqlite> SELECT name, count(*) AS pages,
   ...>        printf('%.1f%%', 100.0*sum(unused)/sum(pgsize)) AS unused
   ...> FROM dbstat WHERE name LIKE 'idx_plays%' GROUP BY name;

name         pages  unused
-----------  -----  ------
idx_plays_track  325  31.9%
idx_plays_ms      26   2.1%`,
            lang: 'sql',
            note: 'Индекс добавил 26 страниц и замедлит INSERT/UPDATE в plays. Для аналитического запроса это оправдано, для редкого — нет.'
          }
        ],
        verdict:
          'scanstatus превращает «кажется, что сканирование» в «86% циклов в SCAN plays». После индекса проверяйте не только скорость чтения, но и цену записи: место, WAL и время INSERT.'
      },
      {
        title: 'Прочитать заголовок страницы 1 вручную',
        goal: 'Связать hex-дамп с полями .dbinfo и убедиться, что байты и прагмы говорят одно и то же.',
        steps: [
          {
            text: 'Достаньте первые 100 байт страницы 1.',
            code: `$ sqlite3 app.db \\
  "SELECT hex(substr(data,1,100)) FROM sqlite_dbpage('main') WHERE pgno=1;"
53514C69746520666F726D6174203300
1000 02 02 0C 40 20 20
00000003 00000346 000002A6 00000057
00000005 00000004 00000000 00000000
00000001 00000000 00000000 00000000
... (20 зарезервированных байт)
00000003 002E6EBA`,
            lang: 'shell',
            note: 'Пробелы добавлены для читаемости: реальный hex идёт одной строкой без разделителей.'
          },
          {
            text: 'Сопоставьте смещения с полями.',
            code: `0..15    "SQLite format 3\\0"   магическая строка
16..17   0x1000 = 4096          размер страницы
18       2                      write format
19       2                      read format
20       0x0C = 12              reserved bytes
24..27   3                      file change counter
28..31   0x346 = 838            database page count
32..35   0x2A6 = 678            первый trunk freelist
36..39   0x57 = 87              страниц во freelist
40..43   5                      schema cookie
44..47   4                      schema format
56..59   1                      text encoding (UTF-8)
92..95   3                      version-valid-for
96..99   0x2E6EBA = 3043002    версия SQLite`,
            lang: 'text'
          },
          {
            text: 'Проверьте btree-заголовок сразу после 100 байт.',
            code: `100      0x0D = 13   leaf table page
101..102 0x0000      первый freeblock
103..104 0x0005 = 5  число ячеек
105..106 0x0D39      начало области ячеек (3385)
107      0x00        фрагментированные байты

# далее массив указателей на ячейки:
108..109 0x0EED = 3821
110..111 0x0E39 = 3641
112..113 0x0DE4 = 3556
114..115 0x0D87 = 3463
116..117 0x0D39 = 3385`,
            lang: 'text',
            note: 'Это страница таблицы sqlite_schema: 5 объектов — 3 таблицы и 2 индекса. Флаг 13 (0x0D) означает table leaf.'
          },
          {
            text: 'Сверьте с .dbinfo.',
            code: `$ sqlite3 app.db ".dbinfo" | head -14
database page size:  4096
write format:        2
read format:         2
reserved bytes:      12
file change counter: 3
database page count: 838
freelist page count: 87
schema cookie:       5
schema format:       4
text encoding:       1 (utf8)`,
            lang: 'shell'
          }
        ],
        verdict:
          'Заголовок страницы — контракт формата. Если hex и .dbinfo расходятся, вы смотрите не на тот файл, не на ту страницу или на копию без WAL. Умение читать эти 100 байт окупается при разборе повреждений и нестандартных сборок.'
      },
      {
        title: 'Разобрать WAL по кадрам и сделать checkpoint',
        goal: 'Увидеть структуру WAL своими глазами и понять, что означают числа в ответе wal_checkpoint.',
        steps: [
          {
            text: 'Создайте базу в WAL с выключенным autocheckpoint и удерживайте соединение.',
            code: `import sqlite3, os
from pathlib import Path

con = sqlite3.connect('app.db')
con.execute("PRAGMA page_size=4096")
con.execute("PRAGMA journal_mode=WAL")
con.execute("PRAGMA wal_autocheckpoint=0")
con.execute("CREATE TABLE events(id INTEGER PRIMARY KEY, kind TEXT, payload BLOB)")
con.execute("INSERT INTO events(kind,payload) VALUES('click', randomblob(200))")
con.execute("INSERT INTO events(kind,payload) VALUES('scroll', randomblob(200))")
con.commit()
print('wal size', Path('app.db-wal').stat().st_size)
print('checkpoint', con.execute("PRAGMA wal_checkpoint(PASSIVE)").fetchone())`,
            lang: 'python',
            note: 'Если закрыть единственное соединение, SQLite выполнит checkpoint и удалит WAL. Для наблюдения держите соединение открытым.'
          },
          {
            text: 'Разберите заголовок и кадры.',
            code: `$ xxd -l 32 app.db-wal
00000000: 377f 0682 002d e218 0000 1000 0000 0000
00000010: 2463 fb10 cab2 8044 e5e2 6637 e24a f0a6

magic            0x377f0682
format version   3007000
page size        4096
checkpoint seq   0
salt-1           2463fb10
salt-2           cab28044

$ python3 - <<'PY'
from pathlib import Path
b = Path('app.db-wal').read_bytes()
n = (len(b) - 32) // (4096 + 24)
for i in range(n):
    off = 32 + i * 4120
    fh = b[off:off+24]
    print(i, 'pgno', int.from_bytes(fh[0:4],'big'),
          'commit', int.from_bytes(fh[4:8],'big'),
          'salt', fh[8:12].hex(), fh[12:16].hex())
PY

0 pgno 1 commit 0 salt 2463fb10 cab28044
1 pgno 2 commit 2 salt 2463fb10 cab28044
2 pgno 2 commit 2 salt 2463fb10 cab28044`,
            lang: 'shell',
            note: 'Три кадра: снимок страницы 1 без коммита и две версии страницы 2, причём коммит-маркер стоит на последнем кадре транзакции.'
          },
          {
            text: 'Выполните checkpoint и проверьте ответ.',
            code: `$ sqlite3 app.db "PRAGMA wal_checkpoint(PASSIVE);"
0|3|3

$ ls -l app.db*
-rw-r--r-- 1 app app 8192 app.db
-rw-r--r-- 1 app app    0 app.db-wal`,
            lang: 'shell',
            note: '0|3|3 — busy=0, в WAL было 3 кадра, все 3 перенесены. На macOS при закрытии последнего соединения WAL может быть удалён, а не обнулён.'
          }
        ],
        verdict:
          'busy=1 означает, что checkpoint не завершён: читатель держит старый snapshot или мешает I/O. Ненулевой log при малом checkpointed — сигнал разбираться с соединениями, а не удалять -wal.'
      },
      {
        title: 'Счётчики памяти и ловушка memstatus',
        goal: 'Научиться отличать «память действительно не используется» от «счётчики выключены при сборке».',
        steps: [
          {
            text: 'Снимите глобальные и локальные счётчики после запроса.',
            code: `sqlite3_int64 cur, hi;
sqlite3_status64(SQLITE_STATUS_MEMORY_USED, &cur, &hi, 0);
printf("MEMORY_USED %lld\\n", cur);

int v, h;
sqlite3_db_status(db, SQLITE_DBSTATUS_CACHE_USED, &v, &h, 0);
printf("CACHE_USED %d\\n", v);
sqlite3_db_status(db, SQLITE_DBSTATUS_CACHE_HIT, &v, &h, 0);
printf("CACHE_HIT %d\\n", v);`,
            lang: 'c'
          },
          {
            text: 'Сравните две сборки.',
            code: `-- обычная сборка (MEMSTATUS=1)
MEMORY_USED           1266448 (max 1266448)
DB CACHE_USED         1127920
DB CACHE_HIT                3
DB CACHE_MISS             258

-- сборка с -DSQLITE_DEFAULT_MEMSTATUS=0
MEMORY_USED                 0 (max 0)
DB CACHE_USED         1127920
DB CACHE_HIT                3
DB CACHE_MISS             258`,
            lang: 'text',
            note: 'Глобальные счётчики обнулились, локальные — нет. Это не утечка и не ошибка: memstatus отключён ради производительности.'
          },
          {
            text: 'Проверьте compile_options на реальной сборке.',
            code: `$ sqlite3 app.db "PRAGMA compile_options;" | grep -E 'MEMSTATUS|SCANSTATUS|DBSTAT'
DEFAULT_MEMSTATUS=0
ENABLE_DBSTAT_VTAB
ENABLE_STMT_SCANSTATUS`,
            lang: 'shell'
          }
        ],
        verdict:
          'Если MEMORY_USED = 0 при активной базе, сначала смотрите compile_options, а не ищите утечку. Для алертов используйте db_status cache-счётчики: они работают независимо от memstatus.'
      }
    ],
    pitfalls: [
      {
        title: 'План без выполнения',
        text: 'EXPLAIN QUERY PLAN показывает намерение, а не факт. Строка SEARCH может скрывать тысячи посещений. Всегда сверяйтесь со scanstatus или счётчиками.'
      },
      {
        title: 'Циклы между машинами',
        text: 'NCYCLE — аппаратный счётчик времени, а не миллисекунды. Сравнивайте доли узлов внутри одного запуска, а не абсолютные значения между разными серверами.'
      },
      {
        title: 'Отладочные прагмы в релизе',
        text: 'vdbe_trace, parser_trace и company требуют SQLITE_DEBUG. Неизвестная PRAGMA не даёт ошибку — она игнорируется. Пустой вывод не значит «трассировка была пустой».'
      },
      {
        title: 'Удаление -wal вручную',
        text: 'WAL содержит закоммиченные данные, ещё не перенесённые в основной файл. Удаление -wal на живой базе — потеря данных и повреждение координации с -shm.'
      },
      {
        title: 'Глобальные счётчики как истина',
        text: 'MEMORY_USED может быть нулём при выключенном memstatus, а PAGECACHE_USED — нулём без статического пула. Смотрите на PAGECACHE_OVERFLOW и db_status.'
      },
      {
        title: 'Чтение заголовка без учёта WAL',
        text: 'В режиме WAL актуальная версия страницы 1 может лежать в -wal. Читайте через sqlite_dbpage/pager, а не через dd по основному файлу.'
      },
      {
        title: 'Ожидание, что checkpoint уменьшит файл',
        text: 'Checkpoint переносит страницы, но не сжимает базу. Для уменьшения файла нужен VACUUM (или VACUUM INTO), а не учащённые checkpoint.'
      }
    ]
  },

  quiz: [
    {
      question:
        'В WAL-файле три кадра. У первого commit = 0, у второго и третьего commit = 2. Что это значит?',
      options: [
        'Первый кадр повреждён и будет проигнорирован',
        'Первый кадр не завершает транзакцию, а третий содержит маркер коммита для транзакции из двух страниц',
        'Кадр с commit = 0 — это заголовок WAL, а не кадр',
        'Все три кадра принадлежат разным базам'
      ],
      correct: 1,
      explain:
        'Поле db size после коммита равно 0 для кадров, которые не завершают транзакцию. Ненулевое значение (здесь 2) означает коммит и задаёт размер базы после него. Заголовок WAL — отдельные 32 байта перед кадрами, а не кадр с commit = 0.'
    },
    {
      question:
        'scanstatus показывает для полного сканирования est = 32768, visits = 30000. Как это трактовать?',
      options: [
        'Запрос выполнился неправильно: посещений не может быть меньше оценки',
        'est — оценка планировщика по статистике, visits — фактическое число; расхождение нормально и полезно для проверки статистики',
        'SQLite всегда округляет visits до ближайшей степени двойки',
        'Это ошибка счётчика, потому что est и visits обязаны совпадать'
      ],
      correct: 1,
      explain:
        'EST — прогноз планировщика, NVISIT — факт. Они не обязаны совпадать. Большое расхождение (на порядки) говорит об устаревшей статистике или неудачной оценке селективности; небольшое — нормально.'
    },
    {
      question:
        'При активной базе sqlite3_status64(SQLITE_STATUS_MEMORY_USED) возвращает 0. Что проверить в первую очередь?',
      options: [
        'Немедленно увеличить cache_size: память кончилась',
        'PRAGMA compile_options на SQLITE_DEFAULT_MEMSTATUS=0 — счётчики могут быть отключены при сборке',
        'Удалить -wal: он занимает всю память',
        'Перезапустить приложение: счётчик обнулился из-за ошибки'
      ],
      correct: 1,
      explain:
        'При SQLITE_DEFAULT_MEMSTATUS=0 глобальные счётчики памяти не ведутся и возвращают нули, хотя база работает нормально. Локальные db_status CACHE_USED/HIT/MISS при этом доступны. Поэтому сначала смотрят compile_options, а уже потом ищут утечку.'
    }
  ]
} satisfies Level;
