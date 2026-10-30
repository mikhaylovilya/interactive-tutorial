export const overview = {
  eyebrow: 'интерактивный разбор · SQLite',
  title: 'Матрёшка мониторинга',
  accent: 'SQLite',
  lead: 'Пять слоёв наблюдаемости вокруг встраиваемой СУБД: от процессов ОС до байтов WAL и байткода VDBE. С реальными выводами, командами и проверкой понимания.',
  description:
    'SQLite не сервер, а библиотека. У неё нет порта, демона и готового /metrics. Зато есть файл, процесс-хост, встроенные PRAGMA, расширения и внутренние счётчики. Этот туториал собирает их в одну картину — от внешнего контура до страницы 1.',
  stats: [
    { value: '5', label: 'уровней', hint: 'от ОС до internals' },
    { value: '15', label: 'вопросов', hint: 'с разбором ответов' },
    { value: '40+', label: 'инструментов', hint: 'команды и примеры' },
    { value: '100%', label: 'в браузере', hint: 'без бэкенда' }
  ],
  howTo: [
    {
      title: 'Идите снаружи внутрь',
      text: 'Начните с уровня 1: процесс, файлы, диск. Затем внешний мониторинг, встроенные прагмы, расширения и только потом — байткод и WAL. Каждый следующий слой отвечает на более узкий вопрос.'
    },
    {
      title: 'Читайте вывод, а не только команду',
      text: 'В блоках с пометкой «реальный вывод» — результаты, снятые на учебной базе SQLite. В пометкой «пример» — типичные ответы Linux-утилит, которые зависят от машины.'
    },
    {
      title: 'Проверяйте себя',
      text: 'В каждом уровне три вопроса. Ответы сохраняются в localStorage: можно закрыть вкладку и продолжить позже. Прогресс считается по числу верных ответов.'
    },
    {
      title: 'Не копируйте команды вслепую',
      text: 'Диагностика на проде должна быть read-only. integrity_check, ANALYZE и VACUUM — дорогие операции; запускайте их на копии, реплике или в окно обслуживания.'
    }
  ],
  layers: [
    {
      title: 'ОС и процесс',
      level: 1,
      text: 'CPU, RSS, дескрипторы, fsync, iostat. Самый дешёвый слой и первое место, где видно «диск виноват».'
    },
    {
      title: 'Внешний мониторинг',
      level: 2,
      text: 'Экспортёр, Prometheus, Grafana, алерты, Litestream. Тренды и дежурство вместо разового расследования.'
    },
    {
      title: 'Встроенные инструменты',
      level: 3,
      text: 'PRAGMA, .dbinfo, EXPLAIN QUERY PLAN, .stats, ANALYZE, backup. Всё уже в поставке SQLite.'
    },
    {
      title: 'Расширения',
      level: 4,
      text: 'dbstat, sqlite_stmt, bytecode, своя C-функция, trace и progress handler, sqldiff.'
    },
    {
      title: 'Внутренности',
      level: 5,
      text: 'VDBE, scanstatus, счётчики памяти, заголовок страницы, кадры WAL, VFS.'
    }
  ]
};

export const sources = [
  {
    group: 'SQLite: официальная документация',
    items: [
      {
        label: 'PRAGMA Statements',
        url: 'https://sqlite.org/pragma.html',
        note: 'Справочник прагм: page_count, freelist_count, journal_mode, optimize, wal_checkpoint, cache_size.'
      },
      {
        label: 'EXPLAIN QUERY PLAN',
        url: 'https://sqlite.org/eqp.html',
        note: 'Как читать SCAN, SEARCH, USING INDEX, COVERING INDEX и TEMP B-TREE.'
      },
      {
        label: 'The DBSTAT Virtual Table',
        url: 'https://sqlite.org/dbstat.html',
        note: 'Схема dbstat и примеры запросов по страницам, payload и unused bytes.'
      },
      {
        label: 'The SQLITE_STMT Virtual Table',
        url: 'https://sqlite.org/stmt.html',
        note: 'Счётчики nscan, nstep, nsort, run, mem. Флаг SQLITE_ENABLE_STMTVTAB.'
      },
      {
        label: 'Bytecode And Tables_Used',
        url: 'https://sqlite.org/bytecodevtab.html',
        note: 'Табличные функции bytecode() и tables_used() для разбора prepared statements.'
      },
      {
        label: 'Prepared Statement Scan Status',
        url: 'https://sqlite.org/c3ref/stmt_scanstatus.html',
        note: 'NLOOP, NVISIT, EST, NCYCLE, EXPLAIN; SQLITE_SCANSTAT_COMPLEX и сброс счётчиков.'
      },
      {
        label: 'Write-Ahead Logging',
        url: 'https://sqlite.org/wal.html',
        note: 'Устройство WAL, checkpoint, ограничения и взаимодействие с читателями.'
      },
      {
        label: 'Database File Format',
        url: 'https://sqlite.org/fileformat2.html',
        note: 'Заголовок страницы 1, смещения полей, формат btree-страниц и ячеек.'
      },
      {
        label: 'sqlite3_analyzer',
        url: 'https://sqlite.org/sqlanalyze.html',
        note: 'Отчёт о распределении места: payload, metadata, fanout, non-sequential pages.'
      },
      {
        label: 'sqldiff',
        url: 'https://sqlite.org/sqldiff.html',
        note: 'Сравнение баз: --summary, --schema, --table, --changeset.'
      },
      {
        label: 'sqlite3_rsync',
        url: 'https://sqlite.org/rsync.html',
        note: 'Синхронизация базы по SSH с передачей изменившихся страниц.'
      },
      {
        label: 'Compile-Time Options',
        url: 'https://sqlite.org/compile.html',
        note: 'Флаги ENABLE_DBSTAT_VTAB, ENABLE_STMTVTAB, ENABLE_STMT_SCANSTATUS, DEFAULT_MEMSTATUS.'
      },
      {
        label: 'VFS: Virtual File System',
        url: 'https://sqlite.org/vfs.html',
        note: 'Слой xOpen/xRead/xWrite/xSync и точка расширения для репликации и инструментов.'
      },
      {
        label: 'Online Backup API',
        url: 'https://sqlite.org/backup.html',
        note: 'Консистентная копия живой базы без остановки приложения.'
      }
    ]
  },
  {
    group: 'SQLite: инструменты и исходники',
    items: [
      {
        label: 'SQLite Download Page',
        url: 'https://sqlite.org/download.html',
        note: 'Официальные сборки CLI, sqlite3_analyzer, sqldiff и sqlite3_rsync для macOS, Linux и Windows.'
      },
      {
        label: 'SQLite Source Repository',
        url: 'https://sqlite.org/src/',
        note: 'Исходники, включая ext/misc/stmt.c и инструменты сборки.'
      },
      {
        label: 'SQLite Documentation Index',
        url: 'https://sqlite.org/docs.html',
        note: 'Полный список документов: от c3ref API до внутренностей btree.'
      }
    ]
  },
  {
    group: 'Мониторинг и эксплуатация',
    items: [
      {
        label: 'Prometheus: naming and labels',
        url: 'https://prometheus.io/docs/practices/naming/',
        note: 'Почему единицы измерения входят в имя метрики и как не плодить кардинальность.'
      },
      {
        label: 'Prometheus: alerting rules',
        url: 'https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/',
        note: 'Синтаксис правил, for, labels, annotations, runbook.'
      },
      {
        label: 'Alertmanager',
        url: 'https://prometheus.io/docs/alerting/latest/alertmanager/',
        note: 'Маршрутизация, группировка, silences и inhibition.'
      },
      {
        label: 'Grafana documentation',
        url: 'https://grafana.com/docs/',
        note: 'Панели, PromQL, аннотации и алерты.'
      },
      {
        label: 'Litestream metrics',
        url: 'https://litestream.io/reference/metrics/',
        note: 'Имена метрик репликации и включение endpoint через addr.'
      },
      {
        label: 'Litestream: how it works',
        url: 'https://litestream.io/how-it-works/',
        note: 'Репликация на уровне страниц и использование VFS.'
      },
      {
        label: 'iostat(1) man page',
        url: 'https://man7.org/linux/man-pages/man1/iostat.1.html',
        note: 'Расшифровка r_await, w_await, aqu-sz и %util.'
      },
      {
        label: 'Python sqlite3',
        url: 'https://docs.python.org/3/library/sqlite3.html',
        note: 'set_trace_callback, set_progress_handler, enable_load_extension и URI-соединения.'
      }
    ]
  }
];

export const honesty = [
  {
    title: 'Реальные выводы, но конкретная среда',
    text: 'Блоки с пометкой «реальный вывод» сняты на учебной базе: SQLite 3.43.2 (системная сборка) и 3.50.4 (официальная сборка инструментов), macOS. Числа циклов scanstatus, размеры кэша и latency зависят от машины и версии — важны отношения и методика, а не абсолютные значения.'
  },
  {
    title: 'Примеры Linux-утилит',
    text: 'Вывод iostat, pidstat, strace и lsof помечен как пример: на macOS часть флагов и колонок отличается, а iotop и /proc недоступны. Команды приведены для Linux, где эти инструменты чаще всего и используются в проде.'
  },
  {
    title: 'Дашборд — реконструкция',
    text: 'Grafana-панель в уровне 2 — стилизованная реконструкция типичного дашборда, а не скриншот. Она показывает состав панелей и логику, но не является доказательством конкретных значений.'
  },
  {
    title: 'Не инструкция по разрушению',
    text: 'VACUUM, integrity_check, ANALYZE, ручной разбор WAL и удаление файлов — операции с последствиями. На живой базе используйте read-only соединения и копии; команды в туториале предполагают учебный стенд.'
  }
];
