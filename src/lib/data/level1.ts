import type { Level } from './types';

export const level1 = {
  id: 'os',
  number: 1,
  title: 'Операционная система',
  tabTitle: 'ОС и процесс',
  subtitle: 'Смотреть на процесс, а не на сервер',
  lead: 'У SQLite нет демона, порта и собственного журнала на сервере. База живёт внутри процесса приложения — значит, первый слой наблюдения это CPU, память, файловые дескрипторы и дисковый ввод-вывод этого процесса.',
  color: '#38bdf8',
  icon: 'cpu',
  time: '15–20 мин',
  tags: ['top', 'pidstat', 'iostat', 'strace', 'lsof'],
  theory: {
    intro: [
      'SQLite — встраиваемая библиотека. Всё, что она делает, делает процесс-хост: читает и пишет файл базы, вызывает fsync, держит файловые дескрипторы и page cache. Поэтому «снаружи» для SQLite — это не сервер, а операционная система и конкретный процесс.',
      'Это самый дешёвый слой диагностики. Он ничего не знает про SQL, но быстро отвечает на вопросы «кто ест CPU», «кто держит файл», «почему COMMIT ждёт диск» и «не кончились ли дескрипторы». Начинать расследование почти всегда стоит здесь.'
    ],
    keyIdea: {
      title: 'Сначала процесс и файл, потом SQL',
      text: 'Если узкое место — диск, лимит дескрипторов или нехватка памяти, никакой EXPLAIN QUERY PLAN не поможет. Инструменты ОС отделяют проблему инфраструктуры от проблемы запроса.'
    },
    sections: [
      {
        title: 'Что именно наблюдать',
        body: [
          'У работающего приложения с SQLite есть три сущности, за которыми стоит следить: процесс-хост, файл базы и его спутники. В режиме WAL рядом с app.db живут app.db-wal (журнал) и app.db-shm (wal-index). Все три файла — часть одной базы; потеря любого из них во время работы недопустима.',
          'В контейнере смотрите на cgroup, а не на хост: процессы видят лимиты памяти и I/O своей cgroup, а утилиты на хосте могут показывать совсем другую картину. Для SQLite это особенно важно: page cache и грязные страницы относятся к хосту, а RSS и лимиты — к контейнеру.'
        ],
        bullets: [
          'CPU: user time — работа движка и приложения, sys time — syscalls и копирование, iowait — ожидание диска.',
          'Память: RSS процесса, размер SQLite-кэша, mmap, page cache ОС, dirty/writeback страницы.',
          'I/O: IOPS, пропускная способность, await, очередь, latency fsync — не только «диск загружен на 100%».',
          'Ресурсы: открытые файловые дескрипторы, место на диске и inodes, лимиты ulimit/prlimit, квоты cgroup.'
        ]
      },
      {
        title: 'Как SQLite создаёт ввод-вывод',
        body: [
          'В journal_mode=DELETE каждый COMMIT пишет журнал, вызывает fsync и затем переносит страницы в основной файл. В WAL запись идёт в конец -wal, а fsync вызывается при фиксации кадра и особенно при checkpoint. Режим synchronous=FULL требует синхронизации на каждом COMMIT, synchronous=NORMAL в WAL допускает потерю последних транзакций при падении ОС, но не при падении процесса.',
          'Отсюда практическое следствие: всплеск fsync коррелирует не с каждым SELECT, а с коммитами и checkpoint. Если strace показывает десятки fsync в секунду с latency 15–20 мс, приложение может выглядеть «медленным на записи», хотя сам SQL выполняется за микросекунды.'
        ]
      },
      {
        title: 'Дешёвый чек-лист перед глубоким разбором',
        body: ['Потратьте минуту на эти команды, прежде чем открывать профилировщик запросов:'],
        bullets: [
          'pidstat -dru -p PID 1 — кто и сколько читает/пишет, есть ли рост RSS и iodelay.',
          'iostat -xz 1 — latency устройства и очередь, а не только %util.',
          'lsof -p PID | grep app.db — какие файлы базы открыты и в каком режиме.',
          'df -h и df -i — место и inodes; SQLite не умеет работать с переполненным диском.',
          'ulimit -n — запас файловых дескрипторов; один WAL-коннект открывает несколько файлов.'
        ]
      }
    ],
    tools: [
      {
        name: 'top / htop',
        cmd: 'top -H -p $(pgrep -f myapp)',
        tag: 'Linux · macOS',
        desc: 'Первый взгляд на процесс: CPU, RSS, число потоков. В htop включите отображение потоков (H) и полной командной строки (c).',
        shows: 'user/sys CPU, RSS, threads, load average'
      },
      {
        name: 'pidstat',
        cmd: 'pidstat -dru -p 4821 1',
        tag: 'Linux · sysstat',
        desc: 'Процессная статистика с раздельными блоками: CPU (-u), память (-r), блочный I/O (-d), контекстные переключения (-w).',
        shows: 'kB_rd/s, kB_wr/s, iodelay, %CPU, RSS'
      },
      {
        name: 'iostat',
        cmd: 'iostat -xz 1',
        tag: 'Linux · sysstat',
        desc: 'Метрики блочного устройства: completed I/O, throughput, await, queue size. Расширенный режим -x обязателен.',
        shows: 'r_await, w_await, aqu-sz, f/s, %util'
      },
      {
        name: 'iotop',
        cmd: 'sudo iotop -oPa',
        tag: 'Linux · root',
        desc: 'Показывает процессы, которые реально делают I/O в данный момент. Полезен, когда непонятно, чей это диск.',
        shows: 'per-process read/write, swap-in, I/O priority'
      },
      {
        name: 'lsof',
        cmd: 'lsof -p 4821 | grep -E "\\.db(-wal|-shm)?$"',
        tag: 'Linux · macOS',
        desc: 'Список открытых файлов процесса. Сразу видно, кто держит базу, есть ли WAL и SHM, не открыт ли файл дважды.',
        shows: 'fd, тип, размер, inode, путь к app.db / -wal / -shm'
      },
      {
        name: 'strace',
        cmd: 'strace -f -T -e trace=fsync,fdatasync,pwrite64 -p 4821',
        tag: 'Linux',
        desc: 'Счётчики и тайминги системных вызовов. Режим -c даёт сводку, -T печатает длительность каждого вызова в секундах.',
        shows: 'число fsync, latency pwrite/fdatasync, EAGAIN/EINTR'
      },
      {
        name: 'vmstat',
        cmd: 'vmstat 1',
        tag: 'Linux · macOS',
        desc: 'Общая картина: очередь runnable, swap, block in/out, iowait. На macOS часть колонок отсутствует или считается иначе.',
        shows: 'r, b, si/so, bi/bo, wa, free'
      },
      {
        name: '/proc и cgroup v2',
        cmd: 'cat /proc/4821/io; cat /sys/fs/cgroup/app/memory.current',
        tag: 'Linux',
        desc: 'Сырые счётчики процесса и контейнера: rchar/wchar, read_bytes/write_bytes, memory.current, io.stat, cpu.stat.',
        shows: 'байты на уровне syscall и на уровне блочного устройства'
      },
      {
        name: 'perf / fs_usage / dtruss',
        cmd: 'perf top -p 4821',
        tag: 'Linux · macOS',
        desc: 'Сэмплирующие профилировщики и трассировка файловых операций. На macOS fs_usage не требует таких привилегий, как dtruss.',
        shows: 'горячие функции, fsync/open/rename в реальном времени'
      }
    ],
    metrics: [
      {
        metric: 'CPU user + sys',
        source: 'pidstat -u, top',
        good: '< 70% одного ядра при штатной нагрузке',
        alarm: 'устойчиво > 90% или рост sys при том же трафике',
        note: 'Высокий sys часто означает syscalls, копирование или fsync, а не «тяжёлый SQL».'
      },
      {
        metric: 'RSS процесса',
        source: 'ps -o rss, pidstat -r',
        good: 'стабилен, соответствует cache_size + mmap + данным приложения',
        alarm: 'неограниченный рост без роста рабочего набора',
        note: 'SQLite-кэш считается в страницах; mmap может увеличивать RSS, но не обязательно ускоряет.'
      },
      {
        metric: 'Открытые дескрипторы',
        source: 'ls /proc/PID/fd | wc -l',
        good: 'меньше 70% от ulimit -n',
        alarm: 'близко к лимиту, ошибки SQLITE_CANTOPEN',
        note: 'WAL использует минимум три файла: .db, .db-wal, .db-shm, плюс временные файлы сортировки.'
      },
      {
        metric: 'fsync latency',
        source: 'strace -T, bpftrace, eBPF',
        good: '< 5 мс на NVMe/SSD',
        alarm: '> 20 мс или p99 сильно выше медианы',
        note: 'Именно fsync превращает COMMIT в ожидание; проверяйте режим synchronous и checkpoint.'
      },
      {
        metric: 'w_await / f_await',
        source: 'iostat -xz',
        good: 'близко к паспортной latency устройства',
        alarm: 'десятки миллисекунд, растущая очередь aqu-sz',
        note: 'Смотрите на распределение, а не только на среднее: один медленный диск портит p99.'
      },
      {
        metric: 'run queue r',
        source: 'vmstat 1',
        good: 'r ≤ числу доступных ядер',
        alarm: 'r > 2 × ядер устойчиво',
        note: 'Очередь runnable — признак CPU-насыщения, а не диска.'
      },
      {
        metric: 'Dirty / Writeback',
        source: '/proc/meminfo',
        good: '< 5% RAM, writeback успевает',
        alarm: 'dirty > 20% RAM, долгий writeback',
        note: 'Большой dirty означает, что fsync внезапно станет дорогим.'
      },
      {
        metric: 'Размер WAL',
        source: 'ls -l app.db-wal',
        good: 'пила: растёт и сбрасывается checkpoint-ом',
        alarm: 'монотонный рост, gigabyte-файлы',
        note: 'Долгоживущий читатель мешает checkpoint; это видно и в метрике, и в PRAGMA wal_checkpoint.'
      },
      {
        metric: 'Свободное место и inodes',
        source: 'df -h, df -i',
        good: '> 20% свободно',
        alarm: '< 5% или 0 свободных inodes',
        note: 'VACUUM и checkpoint требуют временного места; переполнение диска даёт SQLITE_FULL/IOERR.'
      }
    ],
    checklist: [
      'Найдите PID приложения и убедитесь, что смотрите на процесс-хост, а не на случайный родительский процесс.',
      'Проверьте lsof: какие именно файлы базы открыты и сколько соединений.',
      'Снимите 30–60 секунд pidstat/iostat: нужна динамика, а не один срез.',
      'Сопоставьте всплески fsync с коммитами и checkpoint, а не с каждым запросом.',
      'Проверьте лимиты: дескрипторы, память cgroup, свободное место и inodes.'
    ]
  },

  visuals: [
    {
      type: 'io-path',
      title: 'Путь страницы: где смотрит каждый инструмент',
      caption:
        'Чтение и запись проходят через SQLite, VFS, page cache ОС и блочное устройство. Инструменты ОС видят только нижнюю часть этой схемы — зато без изменений в приложении.'
    },
    {
      type: 'terminal',
      title: 'iostat: латентность важнее загрузки',
      caption:
        'Пример вывода Linux. Диск загружен всего на 9%, но 96 fsync/с — это уже заметная нагрузка на COMMIT. Смотрите на f/s, f_await и w_await, а не только на %util.',
      lang: 'text',
      tag: 'пример вывода',
      code: `$ iostat -xz 1
Linux 6.8.0-45-generic (db-01)   10/30/2026   _x86_64_   (8 CPU)

Device   r/s    rkB/s  r_await  w/s    wkB/s  w_await  f/s  f_await  aqu-sz  %util
nvme0n1  12.4   486.0    0.18   214.6  18240   0.42    96.2   0.38    0.11    9.42

# w_await 0.42 ms — диск не является узким местом.
# f/s 96 — почти сто синхронизаций в секунду: проверяем fsync и checkpoint.`
    },
    {
      type: 'terminal',
      title: 'pidstat: процесс, память и I/O в одном срезе',
      caption:
        'Три блока одного процесса. iodelay — время в тиках, проведённое в ожидании I/O; высокий iodelay при низком CPU часто указывает на диск или блокировку.',
      lang: 'text',
      tag: 'пример вывода',
      code: `$ pidstat -dru -p 4821 1
Linux 6.8.0-45-generic (db-01)   10/30/2026   _x86_64_   (8 CPU)

UID   PID   %usr  %system  %wait  %CPU  CPU  Command
1000  4821  38.2   22.4     9.7   60.6   3   node

UID   PID   minflt/s  majflt/s  VSZ       RSS      %MEM  Command
1000  4821  124.5     2.1       3120400   418220   5.2   node

UID   PID   kB_rd/s  kB_wr/s  kB_ccwr/s  iodelay  Command
1000  4821  12.0     6840.0   120.0      14       node`
    },
    {
      type: 'terminal',
      title: 'strace: сколько стоит fsync',
      caption:
        'Флаг -T печатает длительность каждого системного вызова. Здесь fdatasync занимает 14–17 мс — при synchronous=FULL это время попадёт в latency каждого COMMIT.',
      lang: 'text',
      tag: 'пример вывода',
      code: `$ sudo strace -f -T -e trace=fsync,fdatasync,pwrite64 -p 4821
pwrite64(12, "\\0\\0\\0\\0..."..., 4096, 7340032) = 4096  <0.000021>
fdatasync(12)                              = 0     <0.014872>
pwrite64(12, "\\0\\0\\0\\0..."..., 4096, 7344128) = 4096  <0.000018>
fdatasync(12)                              = 0     <0.017301>
pwrite64(12, "\\0\\0\\0\\0..."..., 4096, 7348224) = 4096  <0.000016>
fdatasync(12)                              = 0     <0.015944>`
    },
    {
      type: 'terminal',
      title: 'lsof: кто держит базу',
      caption:
        'В режиме WAL рядом с базой всегда есть -wal и -shm. Если файл открыт несколькими процессами, это нормально для SQLite, но именно здесь ищут «забытые» соединения и долгих читателей.',
      lang: 'text',
      tag: 'пример вывода',
      code: `$ lsof -p 4821 | grep -E '\\.db(-wal|-shm)?$'
node  4821 app  12u  REG  259,4  3432448  1234567  /var/lib/app/app.db
node  4821 app  13u  REG  259,4  4194304  1234568  /var/lib/app/app.db-wal
node  4821 app  14u  REG  259,4    32768  1234569  /var/lib/app/app.db-shm`
    }
  ],

  practice: {
    scenarios: [
      {
        title: 'Найти процесс, файлы и реальный размер базы',
        goal: 'За одну минуту понять, кто работает с базой и сколько места она занимает на диске и «по данным».',
        steps: [
          {
            text: 'Найдите процесс приложения и его PID.',
            code: `$ pgrep -af 'node|python|java' | head
4821 node /srv/app/server.js`,
            lang: 'shell'
          },
          {
            text: 'Посмотрите, какие файлы SQLite открыты процессом.',
            code: `$ lsof -p 4821 | grep -E '\\.db(-wal|-shm)?$'
node 4821 app 12u REG 259,4 3432448 1234567 /var/lib/app/app.db
node 4821 app 13u REG 259,4 4194304 1234568 /var/lib/app/app.db-wal`,
            lang: 'shell'
          },
          {
            text: 'Сравните логический размер, занятое место и данные внутри.',
            code: `$ ls -lh /var/lib/app/app.db*
-rw-r--r-- 1 app app 3.3M Oct 30 10:41 app.db
-rw-r--r-- 1 app app 4.0M Oct 30 10:41 app.db-wal
-rw-r--r-- 1 app app  32K Oct 30 10:41 app.db-shm

$ sqlite3 /var/lib/app/app.db "PRAGMA page_count; PRAGMA page_size; PRAGMA freelist_count;"
838
4096
87`,
            lang: 'shell',
            note: '838 × 4096 = 3.43 МБ. 87 страниц (356 КБ) лежат в freelist и могут быть переиспользованы, но файл сам не уменьшится.'
          }
        ],
        verdict:
          'Если файл больше, чем page_count × page_size, проверьте WAL и разреженность (sparse). Если page_count большой, а freelist растёт — база не «пухнет от данных», а хранит освобождённые страницы.'
      },
      {
        title: 'Поймать fsync-бурю и связать её с WAL',
        goal: 'Отличить медленный SQL от медленной синхронизации на диск.',
        steps: [
          {
            text: 'Снимите сводку syscalls за 10 секунд.',
            code: `$ sudo strace -f -c -p 4821
% time     seconds  usecs/call     calls    errors syscall
------ ----------- ----------- --------- --------- ----------------
 61.42    4.912000      153500        32           fdatasync
 22.10    1.768000          2210       800           pwrite64
  8.31    0.665000          4156       160           fsync
  4.02    0.321000          1284       250           pread64`,
            lang: 'shell'
          },
          {
            text: 'Посмотрите на конкретные вызовы с таймингом.',
            code: `$ sudo strace -f -T -e trace=fsync,fdatasync -p 4821
fdatasync(12) = 0 <0.151204>
fdatasync(12) = 0 <0.148771>
fdatasync(12) = 0 <0.160003>`,
            lang: 'shell'
          },
          {
            text: 'Сопоставьте с режимом журнала и checkpoint.',
            code: `$ sqlite3 /var/lib/app/app.db "PRAGMA journal_mode; PRAGMA synchronous; PRAGMA wal_checkpoint(PASSIVE);"
wal
1
0|122|122`,
            lang: 'shell'
          }
        ],
        verdict:
          '32 fdatasync за 10 секунд при 150 мс каждый — это ~4.8 секунды чистого ожидания. В WAL с synchronous=NORMAL синхронизация концентрируется в checkpoint; если checkpoint происходит слишком часто, уменьшите его частоту или увеличьте интервал, но помните о размере WAL и durability.'
      },
      {
        title: 'Место кончилось, а du показывает мало',
        goal: 'Разобраться с разреженными файлами, freelist и WAL, не удалив живые данные.',
        steps: [
          {
            text: 'Сравните логический и фактически занятый размер.',
            code: `$ ls -l app.db; du -h app.db; du -h --apparent-size app.db
-rw-r--r-- 1 app app 5368709120 Oct 30 10:41 app.db
40M     app.db
5.0G    app.db`,
            lang: 'shell',
            note: 'На macOS вместо --apparent-size используйте stat -f %z app.db: логический размер и число блоков там тоже различаются.'
          },
          {
            text: 'Проверьте свободные страницы и режим автоочистки.',
            code: `$ sqlite3 app.db "PRAGMA freelist_count; PRAGMA auto_vacuum; PRAGMA journal_mode;"
1024000
0
wal`,
            lang: 'shell'
          },
          {
            text: 'Оцените, что даст VACUUM и сколько нужно места.',
            code: `$ sqlite3 app.db "SELECT printf('live=%.1f MB', (page_count-freelist_count)*page_size/1048576.0),
                             printf('free=%.1f MB', freelist_count*page_size/1048576.0)
                      FROM pragma_page_count(), pragma_freelist_count(), pragma_page_size();"
live=3120.0 MB
free=2000.0 MB`,
            lang: 'shell',
            note: 'VACUUM перестраивает файл и требует примерно столько же свободного места, сколько занимает итоговая база. Делайте его в окно обслуживания или используйте VACUUM INTO на другой диск.'
          }
        ],
        verdict:
          'Разреженность объясняет разницу ls/du, freelist — почему файл не уменьшается после DELETE. SQLite переиспользует свободные страницы, поэтому «раздутый» файл — не обязательно утечка. Лечится VACUUM, auto_vacuum=INCREMENTAL или перестройкой таблиц, а не удалением -wal «на всякий случай».'
      }
    ],
    pitfalls: [
      {
        title: 'iowait — не приговор диску',
        text: 'Высокий iowait означает, что CPU простаивал в ожидании I/O, но не говорит, какое устройство виновато. В виртуализации и сетевых ФС iowait может вводить в заблуждение; смотрите await, очередь и latency конкретного устройства.'
      },
      {
        title: '%util на NVMe почти бесполезен',
        text: 'Устройства с параллельными очередями могут быть загружены, пока %util показывает 40%, и наоборот. Ориентируйтесь на latency, queue depth и пропускную способность относительно паспортных значений.'
      },
      {
        title: 'Метрики хоста ≠ метрики контейнера',
        text: 'В контейнере читайте cgroup v2 (/sys/fs/cgroup/.../memory.current, io.stat, cpu.stat). Хостовые top/iostat покажут соседей и общий диск, но не лимиты вашего пода.'
      },
      {
        title: 'Page cache ОС и кэш SQLite — разные вещи',
        text: 'SQLite держит свой page cache (PRAGMA cache_size), а ОС — свой. Чтение может не доходить до диска, даже если SQLite-кэш промахнулся. Поэтому read_bytes в /proc/PID/io бывает низким при активных запросах.'
      },
      {
        title: 'Файл не уменьшается после DELETE',
        text: 'Освобождённые страницы попадают в freelist и переиспользуются. Это нормально. Не удаляйте -wal и -shm вручную: так можно потерять незакоммиченные данные или сломать координацию.'
      }
    ]
  },

  quiz: [
    {
      question:
        'Вы включили WAL и synchronous=NORMAL. strace почти не показывает fsync на каждый COMMIT. Это ожидаемо?',
      options: [
        'Да: в WAL с NORMAL синхронизация в основном происходит на checkpoint, а не на каждом коммите',
        'Нет: WAL всегда делает fsync на каждый COMMIT, иначе база не может работать',
        'Нет: fsync вообще не используется в SQLite, только fdatasync',
        'Да, но только если включён mmap_size — иначе fsync обязателен'
      ],
      correct: 0,
      explain:
        'В режиме WAL synchronous=NORMAL не синхронизирует каждый коммит: последние транзакции могут потеряться при отказе ОС/питания, но целостность базы сохраняется. Синхронизация концентрируется на checkpoint (и на коммитах при synchronous=FULL). Отсутствие fsync на каждый COMMIT — не баг, а выбранный компромисс durability/скорость.'
    },
    {
      question:
        'app.db-wal растёт до нескольких гигабайт, а PRAGMA wal_checkpoint возвращает busy=1. Что вероятнее всего?',
      options: [
        'Диск переполнен, поэтому SQLite не может писать в WAL',
        'Долгоживущее read-соединение или длинная транзакция удерживает snapshot и не даёт checkpoint продвинуться',
        'WAL всегда растёт линейно и не должен уменьшаться — это норма',
        'Нужно удалить -wal вручную и перезапустить приложение'
      ],
      correct: 1,
      explain:
        'busy=1 означает, что checkpoint не смог завершиться: читатель удерживает старый snapshot, и WAL нельзя перемотать. Ищите долгие SELECT/транзакции, соединения без закрытия и приложения, которые держат read-транзакцию открытой. Удаление -wal — опасная операция, а не лечение.'
    },
    {
      question:
        'iostat показывает %util = 100%, но w_await = 0.4 мс, а приложение работает штатно. Как это трактовать?',
      options: [
        'Диск гарантированно перегружен, нужно срочно добавлять IOPS',
        'Это ошибка iostat: при %util = 100% задержка не может быть низкой',
        '%util на NVMe/многопоточном устройстве не отражает насыщение; смотрите latency и очередь',
        'Проблема в сети: SQLite не успевает отдавать результаты'
      ],
      correct: 2,
      explain:
        '%util — доля времени, когда устройство было занято хотя бы одной операцией. Для параллельных NVMe это не мера насыщения. Низкий await и небольшая очередь при 100% util означают, что устройство успевает. Ориентируйтесь на latency, aqu-sz и p99, а не на одну цифру.'
    }
  ]
} satisfies Level;
