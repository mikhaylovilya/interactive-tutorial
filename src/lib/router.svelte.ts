/**
 * Hash-based router. Hash routing keeps the build portable: no server rewrites
 * are needed, and the app works from any static sub-directory.
 *
 * Routes:
 *   #/                          overview
 *   #/level/<id>/<tab>          level view (theory | visuals | practice | quiz)
 *   #/sources                   sources and methodology
 */
import { levels } from './data/levels';
import type { Level } from './data/types';

export const TABS = ['theory', 'visuals', 'practice', 'quiz'] as const;

export type Tab = (typeof TABS)[number];

export type Route =
  | { name: 'overview' }
  | { name: 'sources' }
  | { name: 'level'; level: Level; tab: Tab }
  | { name: 'notfound'; path: string };

const DEFAULT_TAB: Tab = 'theory';

function isTab(value: string | undefined): value is Tab {
  return value !== undefined && (TABS as readonly string[]).includes(value);
}

class Router {
  path = $state('/');

  constructor() {
    if (typeof window === 'undefined') return;
    this.#read();
    window.addEventListener('hashchange', () => this.#read());
  }

  #read(): void {
    const raw = window.location.hash.replace(/^#/, '');
    this.path = raw.startsWith('/') ? raw : `/${raw}`;
  }

  navigate(path: string): void {
    const next = path.startsWith('/') ? path : `/${path}`;
    if (window.location.hash === `#${next}`) {
      this.path = next;
      return;
    }
    window.location.hash = next;
  }

  get route(): Route {
    const parts = this.path.split('/').filter(Boolean);

    if (parts[0] === 'level' && parts[1]) {
      const level = levels.find((item) => item.id === parts[1]);
      if (!level) return { name: 'notfound', path: this.path };

      const tab = isTab(parts[2]) ? parts[2] : DEFAULT_TAB;
      return { name: 'level', level, tab };
    }

    if (parts[0] === 'sources') return { name: 'sources' };

    return { name: 'overview' };
  }

  /** URL for a level tab. */
  levelPath(levelId: string, tab: Tab = DEFAULT_TAB): string {
    return `/level/${levelId}/${tab}`;
  }
}

export const router = new Router();
