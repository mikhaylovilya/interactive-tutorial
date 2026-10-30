/**
 * Shared content schema.
 *
 * All tutorial levels are plain data, which keeps the UI components dumb and
 * makes it possible to type-check the content itself. Each level file ends with
 * `satisfies Level`, so a typo in a field name or a missing quiz answer fails
 * the type check instead of silently rendering an empty block.
 */

export type VisualType =
  | 'io-path'
  | 'monitoring-stack'
  | 'dashboard'
  | 'dbinfo'
  | 'eqp-compare'
  | 'dbstat-bars'
  | 'ext-arch'
  | 'query-pipeline'
  | 'wal-layout'
  | 'page-hex'
  | 'terminal';

export interface TheorySection {
  title: string;
  body: string[];
  bullets?: string[];
}

export interface ToolItem {
  name: string;
  cmd: string;
  tag: string;
  desc: string;
  shows: string;
}

export interface MetricRow {
  metric: string;
  source: string;
  good: string;
  alarm: string;
  note: string;
}

export interface Theory {
  intro: string[];
  keyIdea: {
    title: string;
    text: string;
  };
  sections: TheorySection[];
  tools: ToolItem[];
  metrics: MetricRow[];
  checklist: string[];
}

export interface VisualSpec {
  type: VisualType;
  title: string;
  caption: string;
  /** Only terminal visuals carry code, but the fields stay optional. */
  lang?: string;
  tag?: string;
  code?: string;
}

export interface PracticeStep {
  text: string;
  code: string;
  lang?: string;
  note?: string;
}

export interface Scenario {
  title: string;
  goal: string;
  steps: PracticeStep[];
  verdict: string;
}

export interface Pitfall {
  title: string;
  text: string;
}

export interface Practice {
  scenarios: Scenario[];
  pitfalls: Pitfall[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  /** Zero-based index into `options`. */
  correct: number;
  explain: string;
}

export interface Level {
  id: string;
  number: number;
  title: string;
  tabTitle: string;
  subtitle: string;
  lead: string;
  color: string;
  icon: string;
  time: string;
  tags: string[];
  theory: Theory;
  visuals: VisualSpec[];
  practice: Practice;
  quiz: QuizQuestion[];
}

export interface OverviewStat {
  value: string;
  label: string;
  hint: string;
}

export interface HowToItem {
  title: string;
  text: string;
}

export interface OverviewLayer {
  title: string;
  level: number;
  text: string;
}

export interface Overview {
  eyebrow: string;
  title: string;
  accent: string;
  lead: string;
  description: string;
  stats: OverviewStat[];
  howTo: HowToItem[];
  layers: OverviewLayer[];
}

export interface SourceItem {
  label: string;
  url: string;
  note: string;
}

export interface SourceGroup {
  group: string;
  items: SourceItem[];
}

export interface HonestyNote {
  title: string;
  text: string;
}
