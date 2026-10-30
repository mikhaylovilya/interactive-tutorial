/** Helpers for the miniature charts drawn in the UI (no chart library). */

export interface ChartOptions {
  width?: number;
  height?: number;
  pad?: number;
  min?: number;
  max?: number;
}

/** Build a polyline path for a series. */
export function linePath(values: number[], options: ChartOptions = {}): string {
  const { width = 600, height = 180, pad = 10, min, max } = options;
  if (!values.length) return '';

  const lo = min ?? Math.min(...values);
  const hi = max ?? Math.max(...values);
  const span = hi - lo || 1;
  const stepX = values.length > 1 ? (width - pad * 2) / (values.length - 1) : 0;

  return values
    .map((value, index) => {
      const x = pad + index * stepX;
      const y = height - pad - ((value - lo) / span) * (height - pad * 2);
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');
}

/** Close a line path into a filled area down to the chart baseline. */
export function areaPath(values: number[], options: ChartOptions = {}): string {
  if (!values.length) return '';
  const { width = 600, height = 180, pad = 10 } = options;
  const line = linePath(values, options);
  const lastX = width - pad;
  const firstX = pad;
  return `${line} L${lastX},${height - pad} L${firstX},${height - pad} Z`;
}

/** Deterministic pseudo-random series so the visual layout stays stable. */
export function series(seed: number, length: number, base = 50, spread = 20): number[] {
  const out: number[] = [];
  let state = seed;
  for (let i = 0; i < length; i += 1) {
    state = (state * 1664525 + 1013904223) % 4294967296;
    const noise = state / 4294967296;
    const wave = Math.sin((i / length) * Math.PI * 3 + seed) * spread * 0.55;
    out.push(Math.max(1, base + wave + (noise - 0.5) * spread));
  }
  return out;
}

export function formatInt(value: number): string {
  return new Intl.NumberFormat('ru-RU').format(value);
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const exponent = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const value = bytes / 1024 ** exponent;
  return `${value >= 10 || exponent === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[exponent]}`;
}

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));
