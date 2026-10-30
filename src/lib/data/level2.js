export const level2 = {
  id: 'external',
  number: 2,
  title: 'Внешний контур мониторинга',
  tabTitle: 'Метрики и алерты',
  subtitle: 'Метрики, дашборды и алерты вокруг встроенной СУБД',
  lead: 'SQLite не отдаёт metrics endpoint. Внешний контур строится вокруг файла и процесса-хоста: read-only экспортёр, Prometheus, Grafana и Alertmanager. Главное — не превратить наблюдение в дополнительную нагрузку.',
  color: '#a78bfa',
  icon: 'activity',
  time: '18–25 мин',
  tags: ['Prometheus', 'Grafana', 'Alertmanager', 'Litestream'],
  theory: {
    intro: [
      'У SQLite нет сервера, который можно опросить по сети, и нет готового postgres_exporter. Метрики приходится собирать там, где они есть: из файла базы через дешёвые PRAGMA, из приложения через счётчики запросов, из ОС через node_exporter и cgroups, из Litestream — через его собственный /metrics.',
      'Внешний слой отвечает на вопрос «что меняется со временем»: размер базы, WAL, ошибки SQLITE_BUSY, p95 запросов, отставание репликации. Он не заменяет разовое расследование из уровня 1, но позволяет увидеть тренд и разбудить дежурного до того, как закончится диск.'
    ],
    keyIdea: {
      title: 'Наблюдение должно быть дешевле проблемы',
      text: 'Скрейп раз в 30 секунд не должен делать integrity_check, сканировать dbstat или открывать базу на запись. Дешёвые метрики — page_count, freelist, размер WAL, режим журнала; дорогие проверки — по расписанию и отдельным заданием.'
    },
    sections: [
      {
        title: 'Три источника метрик',
        body: [
          'Первый — sidecar-экспортёр: отдельный процесс открывает базу в режиме mode=ro, выполняет несколько PRAGMA и отдаёт /metrics. Второй — сама приложенческая библиотека: она знает latency, число строк, SQLITE_BUSY и ретраи, которых не видно снаружи. Третий — платформа: node_exporter/process-exporter, cgroups, логи, Litestream, системы бэкапов.',
          'Для SQLite особенно важен третий источник: база — это файл, поэтому размер, рост и скорость репликации часто важнее, чем «средний CPU».'
        ],
        bullets: [
          'Sidecar: PRAGMA page_count, page_size, freelist_count, journal_mode; stat для -wal; read-only.',
          'Приложение: histogram длительности запросов, счётчик busy/locked, число ретраев, размер очереди.',
          'Платформа: размер файла и inode, диск, память cgroup, Litestream sync/lag, ошибки в логах.',
          'Аудит: schema_version, PRAGMA quick_check по расписанию, sqldiff между продом и эталоном.'
        ]
      },
      {
        title: 'Pull, push и цена скрейпа',
        body: [
          'Prometheus по умолчанию работает по pull-модели: сам приходит на /metrics. Для короткоживущих процессов (CI, serverless) используйте Pushgateway или OTLP; для батчевых проверок — textfile collector у node_exporter. Pull удобнее для алерта up==0: если экспортёр умер, это видно сразу.',
          'Скрейп должен быть идемпотентным и укладываться в timeout. Открывайте соединение с busy_timeout, закрывайте его после сбора и кэшируйте результат на несколько секунд. В WAL read-only соединение не блокирует писателей, но в rollback-journal режиме читатель может помешать checkpoint — ещё одна причина не делать тяжёлых запросов на каждом скрейпе.'
        ]
      },
      {
        title: 'Алерты, которые не будят зря',
        body: [
          'Алерт — это симптом, а не метрика. «WAL больше 512 МБ» может быть нормой для ночной загрузки, а «WAL не сбрасывается 30 минут при активных записях» — почти всегда проблема. Используйте for, относительные пороги и несколько условий; добавляйте runbook и владельца.',
          'Обязательный минимум: экспортёр недоступен, быстрый рост базы, WAL не сбрасывается, ошибки busy/locked, нарушение integrity_check, ошибки репликации Litestream и кончающееся место на диске.'
        ]
      }
    ],
    tools: [
      {
        name: 'Prometheus',
        cmd: 'scrape_configs: [{ job_name: sqlite, targets: ["127.0.0.1:9101"] }]',
        tag: 'TSDB · PromQL',
        desc: 'Собирает метрики по pull-модели, хранит time series, считает правила и отправляет алерты в Alertmanager.',
        shows: 'тренды, rate/increase, histogram_quantile, topk'
      },
      {
        name: 'Custom exporter',
        cmd: 'python3 sqlite_exporter.py',
        tag: 'Python stdlib',
        desc: 'Небольшой sidecar, который читает базу в режиме mode=ro и отдаёт /metrics. 60–80 строк хватает для основных метрик.',
        shows: 'размер, WAL, freelist, journal_mode, up'
      },
      {
        name: 'node_exporter / process-exporter',
        cmd: 'process-exporter --config.path=/etc/process-exporter.yml',
        tag: 'инфраструктура',
        desc: 'Метрики ОС и процессов: CPU, RSS, файловые дескрипторы, диск, сеть. Дополняет SQLite-метрики контекстом.',
        shows: 'node_filesystem_avail_bytes, process_open_fds'
      },
      {
        name: 'Grafana',
        cmd: 'Panel → PromQL → visualization',
        tag: 'визуализация',
        desc: 'Дашборды, аннотации деплоев, пороги и алерты. Для SQLite полезны панели размера, WAL и latency.',
        shows: 'time series, stat, heatmap, alert state'
      },
      {
        name: 'Alertmanager',
        cmd: 'amtool check-config alertmanager.yml',
        tag: 'дежурство',
        desc: 'Маршрутизация, группировка, silences и inhibition. Отделяет «шум» от инцидента и доставляет в нужный канал.',
        shows: 'routing tree, silences, notification log'
      },
      {
        name: 'Zabbix',
        cmd: 'UserParameter=sqlite.size[*],sqlite3 -readonly "$1" "..."',
        tag: 'классический мониторинг',
        desc: 'Агент, UserParameter, триггеры и low-level discovery. Хорошо подходит, если инфраструктура уже на Zabbix.',
        shows: 'triggers, items, graphs, проблемы'
      },
      {
        name: 'OpenTelemetry',
        cmd: 'tracer.start_as_current_span("db.query")',
        tag: 'traces · metrics',
        desc: 'Трассировка запросов на стороне приложения: длительность, ошибки, связь с HTTP-запросами и БД.',
        shows: 'spans db.query, p95, error rate, exemplars'
      },
      {
        name: 'Litestream',
        cmd: 'addr: ":9090"',
        tag: 'репликация',
        desc: 'Непрерывная репликация SQLite в S3/файл и собственные Prometheus-метрики: sync, errors, WAL, checkpoint.',
        shows: 'litestream_sync_count, sync_error_count, wal_size'
      },
      {
        name: 'Логи и Loki',
        cmd: 'grep -E "SQLITE_(BUSY|IOERR|FULL|CORRUPT)" app.log',
        tag: 'логи',
        desc: 'Ошибки, которые не видны в метриках: disk I/O error, database is locked, malformed. Собирайте структурные логи.',
        shows: 'error rate, топ ошибок, корреляция с деплоем'
      }
    ],
    metrics: [
      {
        metric: 'sqlite_up',
        source: 'экспортёр',
        good: '1',
        alarm: '0 дольше 2 минут',
        note: 'Самый важный алерт: база недоступна или экспортёр сломан.'
      },
      {
        metric: 'sqlite_db_size_bytes',
        source: 'page_count × page_size',
        good: 'плавный рост, объяснимый трафиком',
        alarm: 'ступенчатый рост > 20% в сутки',
        note: 'Логический размер; фактический может отличаться из-за freelist и WAL.'
      },
      {
        metric: 'sqlite_wal_size_bytes',
        source: 'stat -c %s app.db-wal',
        good: 'пила, сбрасывается checkpoint-ом',
        alarm: 'монотонный рост > 512 МБ или > 30% от базы',
        note: 'Лучший индикатор застрявшего checkpoint и долгих читателей.'
      },
      {
        metric: 'sqlite_freelist_pages',
        source: 'PRAGMA freelist_count',
        good: '< 10% page_count',
        alarm: '> 30% страниц свободно',
        note: 'Файл можно сжать VACUUM, но сначала проверьте, не является ли это нормой после массовых удалений.'
      },
      {
        metric: 'sqlite_busy_errors_total',
        source: 'приложение',
        good: 'около нуля, редкие ретраи успешны',
        alarm: 'устойчивый rate > 0.5/с',
        note: 'Считайте именно ошибки и ретраи; высокий busy без ошибок может быть штатной конкуренцией.'
      },
      {
        metric: 'sqlite_query_duration_seconds',
        source: 'приложение (histogram)',
        good: 'p95 ниже SLO',
        alarm: 'p99 растёт быстрее трафика',
        note: 'p95/p99 полезнее среднего; стройте histogram_quantile по bucket-ам.'
      },
      {
        metric: 'sqlite_quick_check_ok',
        source: 'отдельное задание по расписанию',
        good: '1',
        alarm: '0',
        note: 'Не выполняйте на каждом скрейпе: это полное сканирование базы.'
      },
      {
        metric: 'litestream_sync_error_count',
        source: 'Litestream /metrics',
        good: '0, счётчик не растёт',
        alarm: 'increase() > 0',
        note: 'Ошибка репликации — риск потерять RPO; репликация должна проверяться восстановлением.'
      },
      {
        metric: 'litestream_wal_size',
        source: 'Litestream /metrics',
        good: 'стабильный размер',
        alarm: 'рост без sync-операций',
        note: 'Коррелируйте с litestream_sync_count: ноль sync при растущем WAL — репликация встала.'
      }
    ],
    checklist: [
      'Убедитесь, что экспортёр открывает базу строго read-only и не делает тяжёлых проверок.',
      'Проверьте timeout и кэш: один медленный скрейп не должен копить соединения.',
      'Настройте up == 0 и рост диска раньше, чем алерты на latency.',
      'Добавьте runbook и владельца к каждому алерту; иначе через неделю его замьютят.',
      'Проверьте восстановление из реплики/бэкапа — метрика репликации без restore-теста ничего не гарантирует.'
    ]
  },

  visuals: [
    {
      type: 'monitoring-stack',
      title: 'Контур наблюдаемости вокруг SQLite',
      caption:
        'Приложение и sidecar-экспортёр отдают метрики; Prometheus забирает их по pull-модели; Grafana и Alertmanager потребляют результат. Litestream добавляет контур репликации. SQLite при этом остаётся файлом — сервера метрик у него нет.'
    },
    {
      type: 'dashboard',
      title: 'Макет дашборда: размер, WAL, ошибки, latency',
      caption:
        'Стилизованная реконструкция панели Grafana для SQLite (не скриншот). Четыре stat-панели отвечают на вопросы «сколько», «растёт ли», «есть ли ошибки», «как быстро»; графики показывают тренд за 6 часов.'
    },
    {
      type: 'terminal',
      title: 'Что реально отдаёт экспортёр',
      caption:
        'Вывод учебного экспортёра на тестовой базе. Метрики дешёвые: page_count, freelist_count и stat по WAL. Обратите внимание на единицы измерения в имени метрики — это избавляет от ошибок в PromQL.',
      lang: 'text',
      tag: 'пример вывода',
      code: `$ curl -s localhost:9101/metrics | grep -v '^#'
sqlite_db_size_bytes{db="demo_ro.db"} 3432448
sqlite_freelist_pages{db="demo_ro.db"} 0
sqlite_journal_mode{db="demo_ro.db",mode="wal"} 1
sqlite_page_count{db="demo_ro.db"} 838
sqlite_page_size_bytes{db="demo_ro.db"} 4096
sqlite_quick_check_ok{db="demo_ro.db"} 1
sqlite_up{db="demo_ro.db"} 1
sqlite_wal_size_bytes{db="demo_ro.db"} 0`
    },
    {
      type: 'terminal',
      title: 'PromQL: несколько вопросов дежурного',
      caption:
        'PromQL отвечает не «какое значение сейчас», а «как оно меняется». Для gauge используйте delta/deriv, для счётчиков — rate/increase. Гистограмма latency раскрывается через histogram_quantile.',
      lang: 'promql',
      tag: 'пример запросов',
      code: `# Размер базы в мегабайтах
sqlite_db_size_bytes / 1024 / 1024

# Рост за сутки (gauge -> delta)
delta(sqlite_db_size_bytes[24h]) / 1024 / 1024

# Доля WAL относительно базы
sqlite_wal_size_bytes / clamp_min(sqlite_db_size_bytes, 1)

# Ошибки busy в секунду
sum(rate(sqlite_busy_errors_total[5m]))

# p95 длительности запросов из histogram
histogram_quantile(0.95,
  sum by (le) (rate(sqlite_query_duration_seconds_bucket[5m])))

# Ошибки репликации Litestream за 5 минут
increase(litestream_sync_error_count[5m])`
    }
  ],

  practice: {
    scenarios: [
      {
        title: 'Экспортёр за 10 минут: read-only и без зависимостей',
        goal: 'Сделать минимальный Prometheus-экспортёр, который не мешает базе и отдаёт стабильные метрики.',
        steps: [
          {
            text: 'Создайте файл sqlite_exporter.py. Ключевые решения: URI mode=ro, PRAGMA query_only, busy_timeout, кэш на 5 секунд.',
            code: `#!/usr/bin/env python3
"""Read-only SQLite exporter for Prometheus. Python 3.9+, stdlib only."""
import os, sqlite3, threading, time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

DB = os.environ.get("SQLITE_DB", "/var/lib/app/app.db")
PORT = int(os.environ.get("PORT", "9101"))
CACHE_TTL = float(os.environ.get("CACHE_TTL", "5"))

FAMILIES = {
    "sqlite_up": ("gauge", "Database is readable: 1 or 0"),
    "sqlite_page_size_bytes": ("gauge", "Page size in bytes"),
    "sqlite_page_count": ("gauge", "Pages in the database"),
    "sqlite_db_size_bytes": ("gauge", "Logical database size"),
    "sqlite_freelist_pages": ("gauge", "Pages on the freelist"),
    "sqlite_wal_size_bytes": ("gauge", "Size of the -wal file"),
    "sqlite_journal_mode": ("gauge", "Active journal mode"),
}
cache = {"at": 0.0, "body": ""}
lock = threading.Lock()

def collect():
    labels = f'db="{Path(DB).name}"'
    try:
        con = sqlite3.connect(f"file:{DB}?mode=ro", uri=True, timeout=2)
        con.execute("PRAGMA query_only = ON")
        con.execute("PRAGMA busy_timeout = 2000")
        page_size = con.execute("PRAGMA page_size").fetchone()[0]
        page_count = con.execute("PRAGMA page_count").fetchone()[0]
        freelist = con.execute("PRAGMA freelist_count").fetchone()[0]
        mode = con.execute("PRAGMA journal_mode").fetchone()[0]
        con.close()
        wal = Path(f"{DB}-wal")
        wal_size = wal.stat().st_size if wal.exists() else 0
        samples = [
            ("sqlite_up", labels, 1),
            ("sqlite_page_size_bytes", labels, page_size),
            ("sqlite_page_count", labels, page_count),
            ("sqlite_db_size_bytes", labels, page_size * page_count),
            ("sqlite_freelist_pages", labels, freelist),
            ("sqlite_wal_size_bytes", labels, wal_size),
            ("sqlite_journal_mode", f'{labels},mode="{mode}"', 1),
        ]
    except Exception:
        samples = [("sqlite_up", labels, 0)]
    return render(samples)

def render(samples):
    grouped = {}
    for name, labels, value in samples:
        grouped.setdefault(name, []).append((labels, value))
    lines = []
    for name, (kind, help_text) in FAMILIES.items():
        if name not in grouped:
            continue
        lines.append(f"# HELP {name} {help_text}")
        lines.append(f"# TYPE {name} {kind}")
        for labels, value in grouped[name]:
            lines.append(f"{name}{{{labels}}} {value}")
    return "\\n".join(lines) + "\\n"

def metrics():
    now = time.monotonic()
    with lock:
        if now - cache["at"] > CACHE_TTL:
            cache.update(at=now, body=collect())
        return cache["body"]

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/healthz":
            body, code = "ok\\n", 200
        elif self.path == "/metrics":
            body, code = metrics(), 200
        else:
            body, code = "not found\\n", 404
        data = body.encode()
        self.send_response(code)
        self.send_header("Content-Type", "text/plain; version=0.0.4; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def log_message(self, *args):
        pass

if __name__ == "__main__":
    server = ThreadingHTTPServer(("0.0.0.0", PORT), Handler)
    print(f"sqlite exporter on :{PORT}, db={DB}", flush=True)
    server.serve_forever()`,
            lang: 'python',
            note: 'В продакшене добавьте graceful shutdown, ограничение одновременных сборов и отдельный healthcheck. Приложение и экспортёр не должны открывать базу на запись без необходимости.'
          },
          {
            text: 'Запустите и проверьте вывод.',
            code: `$ SQLITE_DB=/var/lib/app/app.db python3 sqlite_exporter.py &
sqlite exporter on :9101, db=/var/lib/app/app.db

$ curl -s localhost:9101/metrics | grep -v '^#'
sqlite_db_size_bytes{db="app.db"} 3432448
sqlite_freelist_pages{db="app.db"} 0
sqlite_journal_mode{db="app.db",mode="wal"} 1
sqlite_page_count{db="app.db"} 838
sqlite_page_size_bytes{db="app.db"} 4096
sqlite_up{db="app.db"} 1
sqlite_wal_size_bytes{db="app.db"} 0`,
            lang: 'shell'
          },
          {
            text: 'Подключите к Prometheus и проверьте targets.',
            code: `# prometheus.yml
global:
  scrape_interval: 30s
  scrape_timeout: 10s

scrape_configs:
  - job_name: sqlite
    static_configs:
      - targets: ["127.0.0.1:9101"]

  - job_name: litestream
    static_configs:
      - targets: ["127.0.0.1:9090"]`,
            lang: 'yaml',
            note: 'В Grafana добавьте панели sqlite_db_size_bytes, sqlite_wal_size_bytes и histogram_quantile по latency. Не ставьте scrape_interval меньше 10 секунд без необходимости.'
          }
        ],
        verdict:
          'Экспортёр должен быть максимально скучным: read-only, таймаут, кэш, минимум PRAGMA. Если для метрики нужно сканировать всю базу, это не метрика для скрейпа — это отдельная проверка по расписанию.'
      },
      {
        title: 'Алерты на WAL, integrity_check и репликацию',
        goal: 'Написать правила, которые ловят застрявший checkpoint и деградацию репликации, но не шумят.',
        steps: [
          {
            text: 'Опишите правила в отдельном файле.',
            code: `groups:
  - name: sqlite
    rules:
      - alert: SqliteExporterDown
        expr: up{job="sqlite"} == 0
        for: 2m
        labels: { severity: critical }
        annotations:
          summary: "SQLite exporter is down ({{ $labels.instance }})"
          runbook_url: "https://wiki.example.com/runbooks/sqlite"

      - alert: SqliteWalNotDraining
        expr: |
          max_over_time(sqlite_wal_size_bytes[30m]) > 512 * 1024 * 1024
          and
          delta(sqlite_wal_size_bytes[30m]) > -1
        for: 15m
        labels: { severity: warning }
        annotations:
          summary: "WAL on {{ $labels.db }} is large and not shrinking"
          description: "Long reader or stuck checkpoint. Check open connections and wal_checkpoint."

      - alert: SqliteGrowthSpike
        expr: delta(sqlite_db_size_bytes[24h]) / clamp_min(sqlite_db_size_bytes offset 24h, 1) > 0.2
        for: 30m
        labels: { severity: warning }
        annotations:
          summary: "Database grew more than 20% in 24h"

      - alert: SqliteBusyErrors
        expr: sum(rate(sqlite_busy_errors_total[5m])) > 0.5
        for: 10m
        labels: { severity: warning }
        annotations:
          summary: "SQLite busy errors are sustained"

      - alert: LitestreamSyncErrors
        expr: increase(litestream_sync_error_count[5m]) > 0
        for: 5m
        labels: { severity: critical }
        annotations:
          summary: "Litestream replication errors on {{ $labels.db }}"`,
            lang: 'yaml'
          },
          {
            text: 'Проверьте синтаксис и поведение правил локально.',
            code: `$ promtool check rules sqlite-rules.yml
Checking sqlite-rules.yml
  SUCCESS: 5 rules found

$ promtool test rules sqlite-tests.yml
SUCCESS`,
            lang: 'shell'
          },
          {
            text: 'Для integrity_check используйте отдельное задание, а не скрейп.',
            code: `# Раз в сутки, в окно обслуживания, на реплике или бэкапе
$ sqlite3 -readonly /backup/app.db "PRAGMA quick_check(1);"
ok

# Публикуйте результат как метрику через Pushgateway / textfile collector
$ echo 'sqlite_quick_check_ok{db="app.db"} 1' > /var/lib/node_exporter/textfile/sqlite.prom`,
            lang: 'shell',
            note: 'quick_check дешевле integrity_check, но всё равно читает базу. На больших файлах запускайте его на копии, а не на проде в час пик.'
          }
        ],
        verdict:
          'Хороший алерт содержит симптом, порог, for, severity и ссылку на runbook. «WAL > 512 МБ» без for и контекста — плохой алерт; «WAL большой и не уменьшается 15 минут» — уже гипотеза о застрявшем checkpoint.'
      },
      {
        title: 'Litestream: метрики репликации и проверка восстановления',
        goal: 'Убедиться, что репликация не просто «включена», а действительно движется и восстанавливается.',
        steps: [
          {
            text: 'Включите metrics endpoint и настройте реплику.',
            code: `# litestream.yml
addr: ":9090"

dbs:
  - path: /var/lib/app/app.db
    replicas:
      - type: s3
        bucket: sqlite-backups-prod
        path: app
        sync-interval: 10s`,
            lang: 'yaml',
            note: 'Проверьте синтаксис и версию Litestream: в v0.5 часть полей конфигурации отличается от v0.3.'
          },
          {
            text: 'Снимите ключевые метрики.',
            code: `$ curl -s localhost:9090/metrics | grep -E '^litestream_(sync_count|sync_error_count|wal_size)'
litestream_sync_count{db="/var/lib/app/app.db"} 18422
litestream_sync_error_count{db="/var/lib/app/app.db"} 0
litestream_wal_size{db="/var/lib/app/app.db"} 32768`,
            lang: 'shell'
          },
          {
            text: 'Настройте алерты на остановку sync и ошибки.',
            code: `groups:
  - name: litestream
    rules:
      - alert: LitestreamReplicationStopped
        expr: increase(litestream_sync_count[10m]) == 0
        for: 5m
        labels: { severity: critical }
      - alert: LitestreamSyncErrors
        expr: increase(litestream_sync_error_count[5m]) > 0
        for: 1m
        labels: { severity: critical }`,
            lang: 'yaml'
          },
          {
            text: 'Раз в квартал проверяйте restore, а не только метрики.',
            code: `$ litestream restore -o /tmp/restored.db s3://sqlite-backups-prod/app
$ sqlite3 /tmp/restored.db "PRAGMA integrity_check; SELECT count(*) FROM plays;"
ok
30000`,
            lang: 'shell'
          }
        ],
        verdict:
          'Метрика sync_count без restore-теста создаёт ложное чувство защиты. RPO проверяется восстановлением: сколько данных реально потеряно и проходит ли integrity_check на копии.'
      }
    ],
    pitfalls: [
      {
        title: 'integrity_check на каждом скрейпе',
        text: 'Это полное сканирование всех страниц. На большой базе вы получите всплеск I/O, долгий read-lock и таймауты экспортёра. Используйте quick_check по расписанию и на копии.'
      },
      {
        title: 'Экспортёр с правами записи',
        text: 'Скрипт, который случайно делает PRAGMA optimize, checkpoint или пишет в базу, может изменить её состояние и конкурировать с приложением. Открывайте mode=ro и включайте query_only.'
      },
      {
        title: 'Кардинальность по пути к файлу',
        text: 'Если метка db содержит полный путь, уникальный для каждого пользователя, вы получите тысячи серий. Используйте стабильные имена (env, service, db) и ограничьте набор.'
      },
      {
        title: 'Абсолютные пороги без тренда',
        text: 'WAL 200 МБ может быть нормой для одной базы и катастрофой для другой. Сравнивайте с размером базы, историей и активностью записей.'
      },
      {
        title: 'Метрики без контекста деплоя',
        text: 'Аннотации релизов и изменений схемы в Grafana позволяют за минуту связать рост latency с миграцией. Без них расследование начинается с нуля.'
      },
      {
        title: 'Pull-мониторинг и короткоживущие процессы',
        text: 'Если приложение живёт секунды, Prometheus может не успеть его scrape-нуть. Для таких сценариев используйте Pushgateway/OTLP, иначе графики будут пустыми.'
      }
    ]
  },

  quiz: [
    {
      question: 'Зачем экспортёру открывать SQLite в режиме mode=ro и выполнять PRAGMA query_only?',
      options: [
        'Чтобы экспортёр не мог случайно изменить базу и не конкурировал с приложением за запись',
        'Чтобы Prometheus мог читать метрики быстрее, чем в режиме read-write',
        'Потому что SQLite не поддерживает параллельные соединения без read-only',
        'Чтобы автоматически включить WAL и ускорить checkpoint'
      ],
      correct: 0,
      explain:
        'Наблюдение не должно менять объект наблюдения. mode=ro + query_only защищают от случайных записей, checkpoint и DDL, а также уменьшают риск блокировок. Read-only не «ускоряет Prometheus» и не включает WAL — это ортогональные вещи.'
    },
    {
      question: 'Почему PRAGMA integrity_check не стоит вызывать каждые 15 секунд на боевой базе?',
      options: [
        'Он возвращает только одно слово и не помещается в метку Prometheus',
        'Он полностью сканирует страницы, создаёт заметную I/O-нагрузку и может удерживать read-lock',
        'Он работает только в режиме WAL и блокирует все записи навсегда',
        'Он автоматически делает VACUUM, поэтому база каждый раз перестраивается'
      ],
      correct: 1,
      explain:
        'integrity_check проверяет все страницы и индексы. На большой базе это дорого по I/O и времени; на проде в час пик это может ухудшить latency и помешать checkpoint. Используйте quick_check по расписанию, желательно на копии или реплике.'
    },
    {
      question:
        'Какой алерт лучше всего указывает на застрявший checkpoint, а не просто на большой файл?',
      options: [
        'sqlite_db_size_bytes > 10 GB',
        'up{job="sqlite"} == 1',
        'max_over_time(sqlite_wal_size_bytes[30m]) > 512MB AND delta(sqlite_wal_size_bytes[30m]) > -1',
        'rate(sqlite_page_count[5m]) > 1'
      ],
      correct: 2,
      explain:
        'Нужно сочетание «WAL большой» и «он не уменьшается»: это гипотеза о долгом читателе или невыполняющемся checkpoint. Абсолютный размер базы слишком груб, up==1 не говорит о WAL, а rate по gauge page_count вообще некорректен.'
    }
  ]
};
