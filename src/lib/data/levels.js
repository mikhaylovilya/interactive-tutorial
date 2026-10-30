import { level1 } from './level1.js';
import { level2 } from './level2.js';
import { level3 } from './level3.js';
import { level4 } from './level4.js';
import { level5 } from './level5.js';

export const levels = [level1, level2, level3, level4, level5];

export const levelById = Object.fromEntries(levels.map((level) => [level.id, level]));

export const totalQuestions = levels.reduce((sum, level) => sum + level.quiz.length, 0);
