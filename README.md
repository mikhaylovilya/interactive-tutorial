# Матрёшка мониторинга SQLite

Интерактивный одностраничный туториал о том, как наблюдать, отлаживать и диагностировать SQLite — от процессов операционной системы до байтов WAL и байткода VDBE.

Проект объясняет главную особенность SQLite: это не сервер, а библиотека. У неё нет демона, порта и готового `/metrics`, поэтому наблюдаемость собирается из пяти слоёв — внешних и внутренних.

## Что внутри

Пять уровней, у каждого — теория, визуальный блок, практика и квиз:

1. **ОС и процесс** — CPU, RSS, файловые дескрипторы, `strace`, `iostat`, `lsof`.
2. **Внешний мониторинг** — экспортёр, Prometheus, Grafana, алерты, Litestream.
3. **Встроенные инструменты** — PRAGMA, `.dbinfo`, `EXPLAIN QUERY PLAN`, `.stats`, `ANALYZE`, backup.
4. **Расширения** — `dbstat`, `sqlite_stmt`, `bytecode()`, C-функция, trace/progress handler, `sqldiff`.
5. **Внутренности** — VDBE, scan status, счётчики памяти, заголовок страницы, кадры WAL, VFS.

Дополнительно:

- hash-роутинг (`#/level/<id>/<tab>`), без серверных rewrite-правил;
- прогресс по верным ответам с сохранением в `localStorage`;
- тёмная и светлая темы, мобильная навигация;
- интерактивный разбор 100-байтного заголовка страницы 1;
- реальные выводы SQLite-команд с пометками о среде и реконструкциях.

## Стек

- [Svelte 5](https://svelte.dev/) c рунами (`$state`, `$derived`, `$effect`, `$props`);
- TypeScript (строгий режим, `svelte-check`);
- Vite;
- CSS без UI-библиотек и чарт-движков: токены, `color-mix`, SVG/HTML-схемы.

## Запуск

```bash
npm install
npm run dev        # http://localhost:5173
npm run check      # проверка типов и Svelte-разметки
npm run build      # production-сборка в dist/
npm run preview    # локальный просмотр собранной версии
```

Сборка использует `base: './'` и hash-роутинг, поэтому `dist/` можно разместить в любом подкаталоге статического хостинга. Открывать `index.html` через `file://` нельзя: браузер заблокирует ES-модули — нужен HTTP-сервер.

## GitHub Pages

Сайт публикуется автоматически при пуше в `master` (workflow `.github/workflows/deploy-pages.yml`).

URL: https://mikhaylovilya.github.io/interactive-tutorial/

В настройках репозитория: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

## Структура

```
src/
  main.ts                     точка входа, mount(App)
  App.svelte                  оболочка: sidebar, topbar, роутинг
  app.css                     токены, примитивы, подсветка, адаптивность
  lib/
    router.svelte.ts          hash-роутер и типы маршрутов
    data/
      types.ts                схема контента
      level1.ts … level5.ts   контент уровней (satisfies Level)
      levels.ts               агрегаты и поиск по id
      meta.ts                 обзор, источники, оговорки
    stores/
      progress.svelte.ts      прогресс, ответы, тема, localStorage
      toast.svelte.ts         короткие уведомления
    components/
      Overview.svelte         главная страница
      LevelView.svelte        заголовок уровня и вкладки
      Theory/Visuals/Practice/Quiz.svelte
      Sidebar.svelte          навигация и прогресс
      Sources.svelte          источники и методика
      visuals/                схемы, дашборд, hex-дамп, WAL и др.
    utils/
      highlight.ts            безопасная подсветка синтаксиса
      format.ts               SVG-пути и форматирование чисел
      clipboard.ts            copy с fallback
      icons.ts                инлайновые SVG-иконки
```

Контент отделён от представления: каждый файл уровня заканчивается `satisfies Level`, поэтому пропущенное поле или неверный индекс правильного ответа ломает `npm run check`, а не страницу.

## Прогресс и данные

В `localStorage` хранятся только ответы квиза, посещённые уровни и тема:

- `sqlite-matryoshka:progress:v1`
- `sqlite-matryoshka:theme`

Общий прогресс — доля верных ответов среди всех вопросов. Уровень считается пройденным, когда все его вопросы отвечены верно и проверены. Данные никуда не отправляются, бэкенда нет.

## Честность данных

- Блоки «реальный вывод» сняты на учебной базе: системный SQLite 3.43.2 и официальная сборка 3.50.4, macOS.
- Вывод `iostat`, `pidstat`, `strace`, `lsof` помечен как пример: на macOS часть флагов и колонок отличается.
- Grafana-панель — стилизованная реконструкция, а не скриншот.
- Числа зависят от машины и версии; важны методика и отношения, а не абсолютные значения.
- Команды предполагают учебный стенд. На живой базе используйте read-only соединения и копии.

Полный список источников — на странице `#/sources` внутри приложения.
