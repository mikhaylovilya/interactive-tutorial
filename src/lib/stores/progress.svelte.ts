/**
 * Progress store built on Svelte 5 runes.
 *
 * Everything the learner does is kept in localStorage so the tutorial can be
 * closed and resumed later. The store is intentionally small and synchronous:
 * quiz answers are tiny, so there is no need for a backend or IndexedDB.
 */
import { levels } from '../data/levels';
import type { Level } from '../data/types';

const STORAGE_KEY = 'sqlite-matryoshka:progress:v1';
const THEME_KEY = 'sqlite-matryoshka:theme';
const VERSION = 1;

export type Theme = 'dark' | 'light';

export interface AnswerState {
  selected: number | null;
  checked: boolean;
}

export type AnswerMap = Record<string, AnswerState[]>;

export interface LevelStats {
  total: number;
  answered: number;
  checked: number;
  correct: number;
  done: boolean;
  hasWrong: boolean;
}

interface StoredProgress {
  version: number;
  answers: AnswerMap;
  visited: string[];
  lastLevel: number;
}

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

function freshAnswers(): AnswerMap {
  return Object.fromEntries(
    levels.map((level) => [
      level.id,
      level.quiz.map(() => ({ selected: null, checked: false }))
    ])
  );
}

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* Private mode / quota exceeded: the tutorial still works in memory. */
  }
}

class ProgressStore {
  answers = $state<AnswerMap>(freshAnswers());
  visited = $state<string[]>([]);
  theme = $state<Theme>('dark');
  lastLevel = $state(1);

  constructor() {
    if (typeof window === 'undefined') return;
    this.theme = readStorage(THEME_KEY) === 'light' ? 'light' : 'dark';
    this.#hydrate();
  }

  #hydrate(): void {
    const raw = readStorage(STORAGE_KEY);
    if (!raw) return;
    try {
      const saved = JSON.parse(raw) as Partial<StoredProgress>;
      if (saved.version !== VERSION) return;

      for (const level of levels) {
        const stored = saved.answers?.[level.id];
        if (!Array.isArray(stored)) continue;
        level.quiz.forEach((_, index) => {
          const item = stored[index];
          if (!item) return;
          const max = level.quiz[index].options.length - 1;
          const selected =
            Number.isInteger(item.selected) && item.selected! >= 0 && item.selected! <= max
              ? item.selected
              : null;
          this.answers[level.id][index] = {
            selected,
            checked: Boolean(item.checked && selected !== null)
          };
        });
      }

      if (Array.isArray(saved.visited)) {
        const valid = new Set(levels.map((level) => level.id));
        this.visited = saved.visited.filter((id) => valid.has(id));
      }

      if (Number.isInteger(saved.lastLevel)) {
        this.lastLevel = Math.min(5, Math.max(1, saved.lastLevel!));
      }
    } catch {
      /* Corrupted payload: start fresh instead of breaking the app. */
    }
  }

  #save(): void {
    const payload: StoredProgress = {
      version: VERSION,
      answers: clone(this.answers),
      visited: [...this.visited],
      lastLevel: this.lastLevel
    };
    writeStorage(STORAGE_KEY, JSON.stringify(payload));
  }

  setTheme(theme: Theme): void {
    this.theme = theme === 'light' ? 'light' : 'dark';
    writeStorage(THEME_KEY, this.theme);
  }

  toggleTheme(): void {
    this.setTheme(this.theme === 'dark' ? 'light' : 'dark');
  }

  markVisited(levelId: string): void {
    if (!this.visited.includes(levelId)) {
      this.visited = [...this.visited, levelId];
      this.#save();
    }
    const idx = levels.findIndex((level) => level.id === levelId);
    if (idx >= 0) {
      this.lastLevel = idx + 1;
      this.#save();
    }
  }

  stats(level: Level): LevelStats {
    const items = this.answers[level.id] ?? [];
    let correct = 0;
    let answered = 0;
    let checked = 0;
    level.quiz.forEach((question, index) => {
      const item = items[index];
      if (!item || item.selected === null) return;
      answered += 1;
      if (item.checked) checked += 1;
      // Only verified answers count: selecting an option must not reveal whether
      // it is correct through the progress meter.
      if (item.checked && item.selected === question.correct) correct += 1;
    });
    return {
      total: level.quiz.length,
      answered,
      checked,
      correct,
      done: correct === level.quiz.length && checked === level.quiz.length,
      hasWrong: level.quiz.some((question, index) => {
        const item = items[index];
        return Boolean(item?.checked && item.selected !== question.correct);
      })
    };
  }

  get totalQuestions(): number {
    return levels.reduce((sum, level) => sum + level.quiz.length, 0);
  }

  get totalCorrect(): number {
    return levels.reduce((sum, level) => sum + this.stats(level).correct, 0);
  }

  get completedLevels(): number {
    return levels.filter((level) => this.stats(level).done).length;
  }

  /** Overall progress in percent, based on correctly answered questions. */
  get overall(): number {
    return Math.round((this.totalCorrect / this.totalQuestions) * 100);
  }

  get lastVisitedLevel(): Level {
    return levels[Math.min(levels.length, Math.max(1, this.lastLevel)) - 1];
  }

  get nextLevel(): Level {
    return levels.find((level) => !this.stats(level).done) ?? levels[levels.length - 1];
  }

  select(level: Level, questionIndex: number, optionIndex: number): void {
    const item = this.answers[level.id]?.[questionIndex];
    if (!item || item.checked) return;
    item.selected = optionIndex;
    this.#save();
  }

  check(level: Level, questionIndex: number): void {
    const item = this.answers[level.id]?.[questionIndex];
    if (!item || item.selected === null) return;
    item.checked = true;
    this.#save();
  }

  retry(level: Level, questionIndex: number): void {
    const item = this.answers[level.id]?.[questionIndex];
    if (!item) return;
    item.selected = null;
    item.checked = false;
    this.#save();
  }

  resetLevel(levelId: string): void {
    const level = levels.find((item) => item.id === levelId);
    if (!level) return;
    this.answers[levelId] = level.quiz.map(() => ({ selected: null, checked: false }));
    this.visited = this.visited.filter((id) => id !== levelId);
    this.#save();
  }

  resetAll(): void {
    this.answers = freshAnswers();
    this.visited = [];
    this.lastLevel = 1;
    this.#save();
  }
}

export const progress = new ProgressStore();
