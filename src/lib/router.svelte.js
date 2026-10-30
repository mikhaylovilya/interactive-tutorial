/**
 * Hash-based router. Hash routing keeps the build portable: no server rewrites
 * are needed, and the app works from any static sub-directory.
 *
 * Routes:
 *   #/                          overview
 *   #/level/<id>/<tab>          level view (theory | visuals | practice | quiz)
 *   #/sources                   sources and methodology
 */
import { levels } from './data/levels.js';

export const TABS = ['theory', 'visuals', 'practice', 'quiz'];

const DEFAULT_TAB = 'theory';

class Router {
  path = $state('/');

  constructor() {
    if (typeof window === 'undefined') return;
    this.#read();
    window.addEventListener('hashchange', () => this.#read());
  }

  #read() {
    const raw = window.location.hash.replace(/^#/, '');
    this.path = raw.startsWith('/') ? raw : `/${raw}`;
  }

  navigate(path) {
    const next = path.startsWith('/') ? path : `/${path}`;
    if (window.location.hash === `#${next}`) {
      this.path = next;
      return;
    }
    window.location.hash = next;
  }

  get route() {
    const parts = this.path.split('/').filter(Boolean);

    if (parts[0] === 'level' && parts[1]) {
      const level = levels.find((item) => item.id === parts[1]);
      if (!level) return { name: 'notfound', path: this.path };

      const tab = TABS.includes(parts[2]) ? parts[2] : DEFAULT_TAB;
      return { name: 'level', level, tab };
    }

    if (parts[0] === 'sources') return { name: 'sources' };

    return { name: 'overview' };
  }

  /** URL for a level tab. */
  levelPath(levelId, tab = DEFAULT_TAB) {
    return `/level/${levelId}/${tab}`;
  }
}

export const router = new Router();
