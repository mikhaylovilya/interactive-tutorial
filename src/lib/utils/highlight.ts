/**
 * Very small, dependency-free syntax highlighter.
 *
 * It is deliberately conservative: tokenise first, HTML-escape every chunk,
 * and only then add <span> wrappers. That keeps code samples safe even when
 * they contain angle brackets or quotes.
 */
const SQL_KEYWORDS = new Set(
  `ABORT ACTION ADD AFTER ALL ALTER ANALYZE AND AS ASC ATTACH AUTOINCREMENT BEFORE BEGIN BETWEEN BY CASCADE CASE CAST CHECK COLLATE COLUMN COMMIT CONFLICT CONSTRAINT CREATE CROSS CURRENT_DATE CURRENT_TIME CURRENT_TIMESTAMP DATABASE DEFAULT DEFERRABLE DEFERRED DELETE DESC DETACH DISTINCT DO DROP EACH ELSE END ESCAPE EXCEPT EXCLUDE EXCLUSIVE EXISTS EXPLAIN FAIL FILTER FIRST FOLLOWING FOR FOREIGN FROM FULL GENERATED GLOB GROUP GROUPS HAVING IF IGNORE IMMEDIATE IN INDEX INDEXED INITIALLY INNER INSERT INSTEAD INTERSECT INTO IS ISNULL JOIN KEY LAST LEFT LIKE LIMIT MATCH MATERIALIZED NATURAL NO NOT NOTHING NOTNULL NULL NULLS OF OFFSET ON OR ORDER OTHERS OUTER OVER PARTITION PLAN PRAGMA PRECEDING PRIMARY QUERY RAISE RANGE RECURSIVE REFERENCES REGEXP REINDEX RELEASE RENAME REPLACE RESTRICT RETURNING RIGHT ROLLBACK ROW ROWS SAVEPOINT SELECT SET TABLE TEMP TEMPORARY THEN TIES TO TRANSACTION TRIGGER UNBOUNDED UNION UNIQUE UPDATE USING VACUUM VALUES VIEW VIRTUAL WHEN WHERE WINDOW WITH WITHOUT`
    .split(/\s+/)
    .filter(Boolean)
);

const PROMQL_KEYWORDS = new Set(
  `by without on ignoring group_left group_right offset bool and or unless sum avg min max count stddev stdvar topk bottomk quantile rate irate increase delta idelta deriv predict_linear histogram_quantile label_replace label_join absent absent_over_time up time vector scalar`.split(
    /\s+/
  )
);

const PY_KEYWORDS = new Set(
  `and as assert async await break class continue def del elif else except False finally for from global if import in is lambda None nonlocal not or pass raise return True try while with yield`.split(
    /\s+/
  )
);

const C_KEYWORDS = new Set(
  `auto break case char const continue default do double else enum extern float for goto if inline int long register restrict return short signed sizeof static struct switch typedef union unsigned void volatile while`.split(
    /\s+/
  )
);

const YAML_KEYWORDS = new Set(['true', 'false', 'null', 'yes', 'no', 'on', 'off']);

export type LangName =
  | 'sql'
  | 'cli'
  | 'shell'
  | 'python'
  | 'c'
  | 'yaml'
  | 'promql'
  | 'text';

export interface LangSpec {
  keywords: Set<string>;
  caseInsensitive?: boolean;
  prompt?: boolean;
  comment?: string | null;
  yamlKeys?: boolean;
}

export const LANGS: Record<LangName, LangSpec> = {
  sql: {
    keywords: SQL_KEYWORDS,
    caseInsensitive: true,
    prompt: true,
    comment: '--[^\\n]*'
  },
  cli: {
    keywords: SQL_KEYWORDS,
    caseInsensitive: true,
    prompt: true,
    comment: '--[^\\n]*'
  },
  shell: {
    keywords: new Set(),
    prompt: true,
    comment: '#[^\\n]*'
  },
  python: {
    keywords: PY_KEYWORDS,
    comment: '#[^\\n]*'
  },
  c: {
    keywords: C_KEYWORDS,
    comment: '\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/'
  },
  yaml: {
    keywords: YAML_KEYWORDS,
    comment: '#[^\\n]*',
    yamlKeys: true
  },
  promql: {
    keywords: PROMQL_KEYWORDS,
    prompt: false,
    comment: '#[^\\n]*'
  },
  text: { keywords: new Set(), comment: null }
};

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
};

const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (ch) => ESCAPES[ch] ?? ch);

function buildPattern(spec: LangSpec): string {
  const parts: string[] = [];

  if (spec.comment) parts.push(`(?<comment>${spec.comment})`);
  parts.push(`(?<string>'(?:[^'\\\\]|\\\\.)*'|"(?:[^"\\\\]|\\\\.)*")`);
  parts.push(`(?<number>\\b(?:0x[0-9a-fA-F]+|\\d+(?:\\.\\d+)?)\\b)`);
  if (spec.yamlKeys) parts.push(`(?<key>^[ \\t]*[A-Za-z_][\\w.-]*)(?=:)`);
  if (spec.prompt) parts.push(`(?<prompt>^[ \\t]*(?:\\$|sqlite>|sqlite3>|\\.\\.\\.>)(?= ))`);
  parts.push(`(?<dot>^[ \\t]*\\.[a-z][a-z0-9-]*)`);
  parts.push(`(?<word>[A-Za-z_][A-Za-z0-9_.-]*)`);

  return parts.join('|');
}

const PATTERNS = Object.fromEntries(
  Object.entries(LANGS).map(([name, spec]) => [name, new RegExp(buildPattern(spec), 'gm')])
) as Record<LangName, RegExp>;

/**
 * Tokenise code and return safe HTML.
 *
 * Unknown languages fall back to plain escaped text instead of throwing, so a
 * typo in a content file cannot break the page.
 */
export function highlight(code = '', lang = 'text'): string {
  const spec = LANGS[lang as LangName] ?? LANGS.text;
  if (lang === 'text' || !code) return escapeHtml(String(code));

  const re = new RegExp((PATTERNS[lang as LangName] ?? PATTERNS.text).source, 'gm');
  let out = '';
  let lastIndex = 0;
  let match;

  while ((match = re.exec(code)) !== null) {
    if (match.index > lastIndex) {
      out += escapeHtml(code.slice(lastIndex, match.index));
    }

    const groups: Record<string, string> = match.groups ?? {};
    let className = '';

    if (groups.comment) className = 'comment';
    else if (groups.string) className = 'string';
    else if (groups.number) className = 'number';
    else if (groups.key) className = 'key';
    else if (groups.prompt) className = 'prompt';
    else if (groups.dot) className = 'keyword';
    else if (groups.word) {
      const word = spec.caseInsensitive ? groups.word.toUpperCase() : groups.word;
      if (spec.keywords.has(word)) className = 'keyword';
    }

    out += className
      ? `<span class="tok-${className}">${escapeHtml(match[0])}</span>`
      : escapeHtml(match[0]);

    lastIndex = re.lastIndex;
    if (match[0].length === 0) re.lastIndex += 1; // safety net
  }

  out += escapeHtml(code.slice(lastIndex));
  return out;
}
