export const level4 = {
  id: 'extensions',
  number: 4,
  title: 'Расширения и прикладной код',
  tabTitle: 'Расширения',
  subtitle: 'Когда встроенных прагм не хватает',
  lead: 'Расширения добавляют SQLite ровно то, чего в ней нет: виртуальные таблицы, свои функции, доступ к страницам, трассировку запросов. Это самый мощный и самый опасный слой: вы исполняете свой код внутри процесса, который держит базу.',
  color: '#fbbf24',
  icon: 'plug',
  time: '25–35 мин',
  tags: ['dbstat', 'sqlite_stmt', 'load_extension', 'trace', 'sqldiff'],
  theory: {
    intro: [
      'SQLite расширяема по дизайну: виртуальные таблицы, скалярные функции, агрегаты, collations, VFS. Часть расширений входит в поставку и включается compile-time флагами, часть вы пишете сами и загружаете как shared library.',
      'Прикладной код — это тоже слой наблюдаемости. Только приложение знает, какой SQL оно отправило, сколько строк вернулось, сколько раз повторило запрос после SQLITE_BUSY и что считает «медленным». Расширения и трассировка позволяют достать эти данные без изменения схемы.'
    ],
    keyIdea: {
      title: 'Расширение — это код в вашем процессе',
      text: 'Загрузка расширения даёт ему те же права, что и приложению: читать файлы, делать сетевые вызовы, падать. Поэтому load_extension по умолчанию выключен, а включать его стоит только для доверенных библиотек с контролем версии.'
    },
    sections: [
      {
        title: 'Какие расширения уже в поставке',
        body: [
          'dbstat показывает, сколько места занимает каждая таблица и индекс, включая неиспользуемые байты внутри страниц. sqlite_stmt перечисляет подготовленные выражения соединения и их счётчики: nscan, nstep, nsort, run, mem. bytecode и tables_used разбирают конкретный запрос. sqlite_dbpage даёт доступ к сырым страницам.',
          'Эти модули включаются при сборке SQLite: SQLITE_ENABLE_DBSTAT_VTAB, SQLITE_ENABLE_STMTVTAB, SQLITE_ENABLE_BYTECODE_VTAB, SQLITE_ENABLE_DBPAGE_VTAB, SQLITE_ENABLE_STMT_SCANSTATUS. Проверьте наличие через PRAGMA compile_options и pragma_module_list — «есть в документации» не значит «есть в вашей сборке».'
        ],
        bullets: [
          'dbstat — размер таблиц и индексов, unused bytes, число страниц на объект.',
          'sqlite_stmt — живые prepared statements: nscan, nstep, nsort, run, mem.',
          'bytecode / tables_used — план на уровне VDBE и список затронутых B-деревьев.',
          'sqlite_dbpage — сырые страницы; нужен для проверки заголовков и page-level диагностики.',
          'generate_series, json_each, fts5 — не диагностика, но часто используются в диагностических запросах.'
        ]
      },
      {
        title: 'dbstat: где реально лежат байты',
        body: [
          'page_count говорит, сколько страниц в файле. dbstat говорит, кому они принадлежат и сколько места внутри страниц пустует. Это разные вопросы: база может быть компактной по числу страниц, но иметь 30% неиспользуемого места внутри индекса после серии удалений.',
          'Важно различать unused и freelist. freelist — целые свободные страницы, которые можно переиспользовать. unused — свободное место внутри занятой страницы; оно не вернётся файловой системе без VACUUM или перестройки объекта. Поэтому после массового DELETE вы часто видите и freelist, и высокий unused одновременно.'
        ]
      },
      {
        title: 'sqlite_stmt и трассировка приложения',
        body: [
          'sqlite_stmt отвечает на вопрос «что сейчас открыто на этом соединении и сколько это стоило». nscan — сколько раз просматривались строки, nstep — сколько шагов сделал VDBE, nsort — сколько было сортировок. Сравнение двух похожих запросов по этим счётчикам часто убедительнее, чем секундомер.',
          'На стороне приложения есть trace callback (все выполненные SQL), progress handler (прерывание долгих запросов), authorizer (контроль доступа) и профилировщик. Они не требуют изменения схемы и работают с любой сборкой SQLite. Минус — накладные расходы и риск случайно залогировать чувствительные данные.'
        ]
      },
      {
        title: 'Инструменты сравнения и репликации',
        body: [
          'sqldiff сравнивает две базы и печатает SQL, который превращает одну в другую. Это быстрый способ проверить реплику, миграцию или восстановленный бэкап без ручных запросов. sqlite3_rsync синхронизирует файл базы по SSH, пересылая только изменённые страницы.',
          'Оба инструмента входят в официальную поставку. sqldiff умеет --summary, --schema, --table и --changeset; sqlite3_rsync требует WAL-режима для --wal-only и умеет работать в обе стороны.'
        ]
      }
    ],
    tools: [
      {
        name: 'dbstat',
        cmd: 'SELECT name, count(*), sum(unused) FROM dbstat GROUP BY name;',
        tag: 'vtab · compile-time',
        desc: 'Размер и распределение места по таблицам и индексам. Показывает unused bytes внутри страниц и позволяет найти раздутые объекты.',
        shows: 'pages, pgsize, payload, unused, mx_payload, aggregate'
      },
      {
        name: 'sqlite_stmt',
        cmd: 'SELECT sql, nscan, nstep, nsort, run FROM sqlite_stmt;',
        tag: 'vtab · compile-time',
        desc: 'Список подготовленных выражений на текущем соединении и их счётчики. Требует SQLITE_ENABLE_STMTVTAB.',
        shows: 'sql, ncol, ro, busy, nscan, nsort, naidx, nstep, run, mem'
      },
      {
        name: 'bytecode / tables_used',
        cmd: "SELECT * FROM bytecode('SELECT ...');",
        tag: 'vtab · compile-time',
        desc: 'Байткод VDBE и список B-деревьев, которые запрос реально использует. Работает и по тексту SQL, и по указателю на prepared statement.',
        shows: 'addr, opcode, p1..p5, comment, nexec, ncycle'
      },
      {
        name: 'sqlite_dbpage',
        cmd: "SELECT hex(substr(data,1,16)) FROM sqlite_dbpage('main') WHERE pgno=1;",
        tag: 'vtab · compile-time',
        desc: 'Доступ к сырым страницам базы. Нужен для проверки заголовка, магических байтов и page-level диагностики.',
        shows: 'pgno, data, schema'
      },
      {
        name: 'sqlite3_analyzer',
        cmd: 'sqlite3_analyzer app.db',
        tag: 'утилита поставки',
        desc: 'Полный отчёт о пространстве: payload, metadata, fanout, non-sequential pages, unused bytes по каждому объекту.',
        shows: 'page counts, payload %, fanout, unused bytes'
      },
      {
        name: 'sqldiff',
        cmd: 'sqldiff --summary prod.db replica.db',
        tag: 'утилита поставки',
        desc: 'SQL-различия между базами. Режимы --summary, --schema, --table, --changeset, --rbu.',
        shows: 'changes, inserts, deletes, unchanged'
      },
      {
        name: 'sqlite3_rsync',
        cmd: 'sqlite3_rsync ./app.db user@host:/srv/app/app.db',
        tag: 'утилита поставки',
        desc: 'Синхронизация базы по SSH с передачей только изменившихся страниц. Требует WAL для режима --wal-only.',
        shows: 'страницы, которые нужно передать, статус синхронизации'
      },
      {
        name: 'load_extension',
        cmd: "SELECT load_extension('./monitor');",
        tag: 'C API / SQL',
        desc: 'Загружает shared library с функциями или виртуальными таблицами. По умолчанию выключено в целях безопасности.',
        shows: 'новые функции в SQL, ошибки загрузки'
      },
      {
        name: 'trace callback',
        cmd: 'con.set_trace_callback(print)',
        tag: 'Python / C API',
        desc: 'Вызывается на каждое выполнение подготовленного выражения. Видно реальный SQL после подстановки параметров.',
        shows: 'SQL-текст, порядок выполнения'
      },
      {
        name: 'progress handler',
        cmd: 'con.set_progress_handler(cb, 1000)',
        tag: 'Python / C API',
        desc: 'Периодически вызывается во время выполнения. Ненулевой возврат прерывает запрос с SQLITE_INTERRUPT — основа таймаутов.',
        shows: 'число вызовов, прерванный запрос'
      }
    ],
    metrics: [
      {
        metric: 'dbstat pages',
        source: 'dbstat',
        good: 'распределение соответствует ожиданиям по данным',
        alarm: 'индекс больше таблицы без причины',
        note: 'Индекс на широком текстовом столбце может занимать больше места, чем сама таблица.'
      },
      {
        metric: 'unused %',
        source: 'dbstat',
        good: '< 10%',
        alarm: '> 30% на большом объекте',
        note: 'Высокий unused после массовых удалений — кандидат на VACUUM или перестройку индекса.'
      },
      {
        metric: 'freelist pages',
        source: 'dbstat / PRAGMA',
        good: '< 10% page_count',
        alarm: '> 30%',
        note: 'Целые свободные страницы. Переиспользуются, но файл не уменьшают.'
      },
      {
        metric: 'nscan',
        source: 'sqlite_stmt',
        good: 'единицы для точечных запросов',
        alarm: 'десятки тысяч на OLTP-запрос',
        note: 'Сколько строк просмотрено. Полное сканирование видно сразу.'
      },
      {
        metric: 'nstep',
        source: 'sqlite_stmt',
        good: 'пропорционален числу строк результата',
        alarm: 'на порядки больше nscan',
        note: 'Шаги VDBE. Много nstep при малом nscan — признак сложного плана или вложенных циклов.'
      },
      {
        metric: 'nsort',
        source: 'sqlite_stmt',
        good: '0 для OLTP-запросов с индексом',
        alarm: '> 0 на горячем пути',
        note: 'Сортировки стоят CPU и памяти; часто лечатся индексом под ORDER BY.'
      },
      {
        metric: 'cache_used',
        source: 'sqlite3_db_status',
        good: 'стабилен при стабильном рабочем наборе',
        alarm: 'рост без роста данных',
        note: 'Память page cache текущего соединения. Не путать с RSS процесса.'
      },
      {
        metric: 'Non-sequential pages',
        source: 'sqlite3_analyzer',
        good: '< 10%',
        alarm: '> 50% на большом индексе',
        note: 'Признак фрагментации: чтение индекса прыгает по файлу, latency растёт.'
      }
    ],
    checklist: [
      'Проверьте, какие расширения реально собраны: PRAGMA compile_options и pragma_module_list.',
      'Перед загрузкой своего расширения убедитесь, что путь и версия библиотеки контролируются.',
      'Для диагностики пространства используйте dbstat, для запросов — sqlite_stmt и scanstatus.',
      'Не логируйте параметры запросов без маскирования: trace callback видит реальные значения.',
      'Сравнивайте прод и реплику через sqldiff, а не вручную.'
    ]
  },

  visuals: [
    {
      type: 'dbstat-bars',
      title: 'dbstat: кто занимает место в файле',
      caption:
        'Реальные данные после удаления 10 000 записей из plays (в таблице осталось 30 000 строк). Обратите внимание: idx_plays_track занимает 325 страниц и 31.9% неиспользуемого места — больше, чем сама таблица plays.'
    },
    {
      type: 'terminal',
      title: 'sqlite3_analyzer: детали, которых не видно в dbstat',
      caption:
        'Фрагмент отчёта по индексу idx_plays_track. Non-sequential pages 209 (64.5%) — это и есть цена фрагментации: индекс читается прыжками по файлу.',
      lang: 'text',
      tag: 'реальный вывод',
      code: `*** Index IDX_PLAYS_TRACK of table PLAYS **************************************

Percentage of total database......................  38.8%
Number of entries................................. 30000
Bytes of storage consumed......................... 1331200
Bytes of payload.................................. 809394      60.8%
Bytes of metadata................................. 97796        7.3%
B-tree depth...................................... 3
Average payload per entry......................... 26.98
Average unused bytes per entry.................... 14.13
Average metadata per entry........................ 3.26
Average fanout.................................... 81.00
Non-sequential pages.............................. 209         64.5%
Maximum payload per entry......................... 27
Entries that use overflow......................... 0            0.0%
Index pages used.................................. 4
Primary pages used................................ 321
Overflow pages used............................... 0
Total pages used.................................. 325
Unused bytes on index pages....................... 5412        33.0%
Unused bytes on primary pages..................... 418598      31.8%
Unused bytes on overflow pages.................... 0
Unused bytes on all pages......................... 424010      31.9%`
    },
    {
      type: 'terminal',
      title: 'sqlite_stmt: два запроса, две разные истории',
      caption:
        'Один и тот же 30-тысячный набор данных. Полное сканирование: nscan 29999, nstep 98247. Поиск по индексу: nscan 0, nstep 46. Счётчики получены через C API на соединении с включённым SQLITE_ENABLE_STMTVTAB.',
      lang: 'text',
      tag: 'реальный вывод',
      code: `== sqlite_stmt (statements still open on the connection) ==
sql                                                  nscan  nsort  nstep  run
---------------------------------------------------  -----  -----  -----  ---
SELECT count(*) FROM plays WHERE ms_played > 200000         29999      0  98247    1
SELECT id, title FROM tracks WHERE artist = ? ORDER BY id DESC LIMIT 5      0      0     46    1

== sqlite3_stmt_scanstatus for the indexed lookup ==
idx  loops  visits          est  plan
  0      1       5            20  SEARCH tracks USING INDEX idx_tracks_artist (artist=?)

== sqlite3_stmt_scanstatus for the full scan ==
idx  loops  visits          est  plan
  0      1   30000         32768  SCAN plays`
    },
    {
      type: 'ext-arch',
      title: 'Где живёт расширение',
      caption:
        'Расширение загружается в адресное пространство процесса и регистрирует функции или виртуальные таблицы в конкретном соединении SQLite. Оно не является отдельным сервисом и не изолировано от приложения.'
    }
  ],

  practice: {
    scenarios: [
      {
        title: 'Своя функция monitor_status() на C',
        goal: 'Собрать минимальное расширение, которое отдаёт JSON с размером базы и состоянием кэша, и подключить его в CLI.',
        steps: [
          {
            text: 'Создайте monitor.c. Функция использует публичный API sqlite3_db_status и PRAGMA через prepared statement.',
            code: `/* monitor.c — minimal SQLite extension.
** macOS: cc -fPIC -dynamiclib -I. monitor.c -o monitor.dylib
** Linux: cc -fPIC -shared -I. monitor.c -o monitor.so
*/
#include "sqlite3ext.h"
SQLITE_EXTENSION_INIT1
#include <stdio.h>

static int pragmaInt(sqlite3 *db, const char *sql, int fallback) {
  sqlite3_stmt *st = 0;
  int value = fallback;
  if (sqlite3_prepare_v2(db, sql, -1, &st, 0) == SQLITE_OK
      && sqlite3_step(st) == SQLITE_ROW) {
    value = sqlite3_column_int(st, 0);
  }
  sqlite3_finalize(st);
  return value;
}

static void monitorStatus(sqlite3_context *ctx, int argc, sqlite3_value **argv) {
  sqlite3 *db = sqlite3_context_db_handle(ctx);
  int cacheUsed = 0, cacheHigh = 0, spill = 0;
  char *out;

  sqlite3_db_status(db, SQLITE_DBSTATUS_CACHE_USED, &cacheUsed, &cacheHigh, 0);
  sqlite3_db_status(db, SQLITE_DBSTATUS_CACHE_SPILL, &spill, &cacheHigh, 0);

  out = sqlite3_mprintf(
    "{\\"page_size\\":%d,\\"page_count\\":%d,\\"freelist\\":%d,"
    "\\"cache_used\\":%d,\\"cache_spill\\":%d}",
    pragmaInt(db, "PRAGMA page_size", 0),
    pragmaInt(db, "PRAGMA page_count", 0),
    pragmaInt(db, "PRAGMA freelist_count", 0),
    cacheUsed, spill);

  if (out == 0) {
    sqlite3_result_error_nomem(ctx);
    return;
  }
  sqlite3_result_text(ctx, out, -1, sqlite3_free);
}

#ifdef _WIN32
__declspec(dllexport)
#endif
int sqlite3_monitor_init(sqlite3 *db, char **pzErrMsg,
                         const sqlite3_api_routines *pApi) {
  SQLITE_EXTENSION_INIT2(pApi);
  (void)pzErrMsg;
  return sqlite3_create_function(db, "monitor_status", 0,
                                 SQLITE_UTF8, 0, monitorStatus, 0, 0);
}`,
            lang: 'c',
            note: 'Имя точки входа выводится из имени файла: monitor.dylib → sqlite3_monitor_init. Несовпадение даёт «symbol not found» при загрузке.'
          },
          {
            text: 'Соберите библиотеку под архитектуру вашего sqlite3.',
            code: `$ cc -fPIC -dynamiclib -I. monitor.c -o monitor.dylib
$ ls -l monitor.dylib
-rwxr-xr-x 1 app app 16928 Oct 30 10:55 monitor.dylib

# Linux:
$ cc -fPIC -shared -I. monitor.c -o monitor.so`,
            lang: 'shell',
            note: 'На macOS с Rosetta встречается несовпадение архитектур: sqlite3 x86_64 не загрузит arm64-расширение. Соберите под ту же архитектуру (например, -arch x86_64).'
          },
          {
            text: 'Загрузите расширение и вызовите функцию.',
            code: `$ sqlite3 app.db ".load ./.scratch/ext/monitor" \\
    "SELECT monitor_status();"
{"page_size":4096,"page_count":838,"freelist":87,"cache_used":13792,"cache_spill":0}

$ sqlite3 app.db ".load ./monitor" \\
    "SELECT json_extract(monitor_status(),'$.page_count') AS pages;"
838`,
            lang: 'shell'
          },
          {
            text: 'Проверьте, что расширение не включено по умолчанию.',
            code: `$ sqlite3 app.db "SELECT load_extension('./monitor');"
Error: not authorized

$ sqlite3 app.db "PRAGMA compile_options;" | grep OMIT
# часто: OMIT_LOAD_EXTENSION — тогда загрузка недоступна вовсе`,
            lang: 'shell',
            note: 'В CLI расширения включаются .load. В приложении нужно явно вызвать sqlite3_enable_load_extension(db, 1) или Connection.enable_load_extension(True) — и только для доверенных путей.'
          }
        ],
        verdict:
          'Расширение — это обычный код в процессе. Оно даёт доступ к внутренним счётчикам без изменения схемы, но требует контроля версии, архитектуры и прав. Не загружайте расширения из недоверенных директорий и не включайте load_extension глобально.'
      },
      {
        title: 'Трассировка и таймаут на Python',
        goal: 'Увидеть реальные SQL-выражения приложения и научиться прерывать слишком долгий запрос.',
        steps: [
          {
            text: 'Включите trace callback и выполните пару запросов.',
            code: `import sqlite3

con = sqlite3.connect('file:app.db?mode=ro', uri=True)
seen = []
def trace(sql):
    seen.append(sql)

con.set_trace_callback(trace)
con.execute("SELECT count(*) FROM tracks WHERE artist = ?",
            ("Artist 42",)).fetchone()
con.execute("PRAGMA page_count").fetchone()
con.set_trace_callback(None)

for sql in seen:
    print(sql)

# SELECT count(*) FROM tracks WHERE artist = 'Artist 42'
# PRAGMA page_count`,
            lang: 'python',
            note: 'Trace вызывается на каждое выполнение подготовленного выражения, а не на каждую строку. Параметры уже подставлены — не логируйте это в прод без маскирования.'
          },
          {
            text: 'Добавьте progress handler, который прерывает запрос после лимита.',
            code: `import sqlite3, time

con = sqlite3.connect('file:app.db?mode=ro', uri=True)
calls = 0
deadline = time.monotonic() + 0.2

def progress():
    global calls
    calls += 1
    return 1 if time.monotonic() > deadline else 0

con.set_progress_handler(progress, 1000)
try:
    con.execute("SELECT count(*) FROM plays WHERE ms_played > 200000").fetchone()
except sqlite3.OperationalError as exc:
    print("interrupted:", exc, "callbacks:", calls)
finally:
    con.set_progress_handler(None, 0)`,
            lang: 'python',
            note: 'Ненулевой возврат прерывает выполнение с SQLITE_INTERRUPT. Это кооперативный механизм: он срабатывает между opcode-ами, а не мгновенно.'
          },
          {
            text: 'Измерьте накладные расходы и гранулярность.',
            code: `$ python3 trace_demo.py
n=1: 98304 callbacks
n=1000: 98 callbacks

# Для count(*) по covering index:
n=1000: 0 callbacks — потому что opcode Count
# обрабатывает много строк за один шаг VDBE.`,
            lang: 'shell',
            note: 'Число вызовов зависит от n и от opcode-ов. Не рассчитывайте, что progress handler вызовется ровно каждые n строк: это шаги виртуальной машины, а не строки.'
          }
        ],
        verdict:
          'Trace — дешёвый способ увидеть, что реально выполняется. Progress handler — основа таймаутов и ограничения CPU. Оба работают на уровне соединения и не требуют специальной сборки SQLite, но добавляют накладные расходы, которые нужно измерять.'
      },
      {
        title: 'Проверить реплику через dbstat, sqldiff и rsync',
        goal: 'Убедиться, что копия совпадает по данным, но отличается по физическому состоянию — и понять, почему это нормально.',
        steps: [
          {
            text: 'Сравните данные через sqldiff.',
            code: `$ sqldiff --summary prod.db replica.db
plays: 0 changes, 0 inserts, 0 deletes, 30000 unchanged
sqlite_stat1: 0 changes, 0 inserts, 0 deletes, 2 unchanged
tracks: 0 changes, 0 inserts, 0 deletes, 8000 unchanged`,
            lang: 'shell',
            note: 'Ноль изменений — данные совпадают. Это не значит, что файлы идентичны: физическая раскладка может отличаться.'
          },
          {
            text: 'Сравните физическое состояние через dbstat.',
            code: `-- прод после удалений
name               pages  unused
-----------------  -----  ------
idx_plays_track    325    31.9%
plays              256    0.8%

-- компактная копия (VACUUM INTO)
name               pages  unused
-----------------  -----  ------
idx_plays_track    224    1.4%
plays              256    0.8%`,
            lang: 'sql',
            note: 'Данные те же, а индекс занимает на 101 страницу меньше и почти не имеет unused. VACUUM INTO перестраивает копию, не трогая прод.'
          },
          {
            text: 'Синхронизируйте базу по SSH, если реплика отстала.',
            code: `$ sqlite3_rsync -v ./app.db app@replica:/srv/app/app.db
$ sqlite3_rsync --wal-only ./app.db app@replica:/srv/app/app.db`,
            lang: 'shell',
            note: '--wal-only откажется работать, если хотя бы одна база не в WAL. Утилита передаёт только изменившиеся страницы, но требует WAL на обеих сторонах.'
          },
          {
            text: 'Проверьте схему отдельно.',
            code: `$ sqldiff --schema prod.db replica.db
CREATE INDEX idx_tracks_title ON tracks(title);`,
            lang: 'shell',
            note: 'Разные индексы при одинаковых данных — частая причина «реплика тормозит»: план запроса на реплике другой.'
          }
        ],
        verdict:
          'Сравнивайте данные и физическое состояние отдельно. sqldiff отвечает за логику, dbstat и analyzer — за пространство и фрагментацию, rsync — за доставку страниц. Совпадение данных не гарантирует одинаковую производительность.'
      }
    ],
    pitfalls: [
      {
        title: 'Расширение из недоверенного пути',
        text: 'load_extension исполняет произвольный нативный код в процессе приложения. Путь должен быть фиксированным, версия — проверенной, а включение — минимально необходимым.'
      },
      {
        title: 'Ожидание, что dbstat есть всегда',
        text: 'dbstat, sqlite_stmt, bytecode и sqlite_dbpage включаются compile-time флагами. В системной сборке их может не быть; проверяйте pragma_module_list и compile_options.'
      },
      {
        title: 'unused ≠ freelist',
        text: 'Свободное место внутри занятой страницы не возвращается файловой системе и не видно в freelist_count. Его показывает dbstat, а лечится VACUUM или перестройкой объекта.'
      },
      {
        title: 'Трассировка с чувствительными данными',
        text: 'Trace callback видит SQL после подстановки параметров. Логирование в прод может записать персональные данные, токены и содержимое полей.'
      },
      {
        title: 'Progress handler как точный таймер',
        text: 'Он срабатывает по шагам VDBE и может не вызваться на запросе, который обрабатывает много строк одним opcode. Для жёстких лимитов используйте внешний таймаут и отмену на уровне приложения.'
      },
      {
        title: 'sqldiff как проверка производительности',
        text: 'sqldiff сравнивает данные, а не планы. Одинаковые строки при разных индексах и статистике дают разную latency.'
      }
    ]
  },

  quiz: [
    {
      question:
        'После массового DELETE в plays dbstat показывает idx_plays_track: 325 страниц и 31.9% unused, а PRAGMA freelist_count = 87. Как это объяснить?',
      options: [
        'Ошибка dbstat: unused и freelist всегда совпадают',
        'Часть места освободилась целыми страницами (freelist), а часть осталась пустой внутри занятых страниц индекса (unused)',
        'Индекс повреждён, нужен integrity_check и удаление индекса',
        'SQLite автоматически сжимает индекс после каждого DELETE'
      ],
      correct: 1,
      explain:
        'freelist — это целые страницы, полностью освободившиеся и готовые к переиспользованию. unused — свободные байты внутри страниц, которые всё ещё принадлежат объекту. После удалений бывает и то, и другое. VACUUM перестраивает файл и убирает оба вида потерь, но требует места и времени.'
    },
    {
      question: 'Почему sqlite3_enable_load_extension по умолчанию выключен?',
      options: [
        'Потому что расширения замедляют любой запрос',
        'Потому что загруженная библиотека исполняется в процессе приложения с его правами',
        'Потому что SQLite не умеет загружать библиотеки на Windows',
        'Потому что расширения несовместимы с WAL'
      ],
      correct: 1,
      explain:
        'Расширение — нативный код в адресном пространстве процесса. Включение загрузки из недоверенного источника равносильно исполнению произвольного кода. Расширения не «замедляют любой запрос» и совместимы с WAL; ограничение именно в безопасности.'
    },
    {
      question:
        'Progress handler вернул ненулевое значение во время SELECT. Что произойдёт?',
      options: [
        'Запрос продолжится, но вернёт меньше строк',
        'Выполнение прервётся с SQLITE_INTERRUPT, и приложение получит ошибку',
        'SQLite автоматически перезапустит запрос в WAL-режиме',
        'Соединение будет закрыто без возможности восстановления'
      ],
      correct: 1,
      explain:
        'Ненулевой возврат из progress callback прерывает выполнение с SQLITE_INTERRUPT. Это кооперативный механизм: он срабатывает между opcode-ами, поэтому не гарантирует мгновенную остановку. Соединение остаётся рабочим, запрос можно повторить.'
    }
  ]
};
