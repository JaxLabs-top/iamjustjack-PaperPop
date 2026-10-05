// Made by Jack (iamjustjack.de)

export const LANGUAGES = [
  'js', 'json', 'html', 'css', 'bash', 'python', 'go', 'rust', 'java', 'csharp', 'c', 'php', 'ruby', 'sql',
  'yaml', 'toml', 'markdown', 'diff', 'dockerfile', 'text',
] as const;
export type Lang = (typeof LANGUAGES)[number];

const ALIASES: Record<string, Lang> = {
  javascript: 'js', jsx: 'js', ts: 'js', tsx: 'js', typescript: 'js', mjs: 'js', cjs: 'js', node: 'js',
  jsonc: 'json', htm: 'html', xml: 'html', svg: 'html', vue: 'html', scss: 'css', sass: 'css', less: 'css',
  sh: 'bash', shell: 'bash', zsh: 'bash', console: 'bash', terminal: 'bash', py: 'python', golang: 'go',
  rs: 'rust', kt: 'java', kotlin: 'java', scala: 'java', swift: 'java', cs: 'csharp', 'c#': 'csharp',
  cpp: 'c', 'c++': 'c', h: 'c', rb: 'ruby', yml: 'yaml', md: 'markdown', patch: 'diff', docker: 'dockerfile',
  plain: 'text', txt: 'text', mysql: 'sql', postgres: 'sql', psql: 'sql',
};

export function normalizeLanguage(name: string | undefined): Lang | 'auto' {
  const n = (name ?? 'auto').toLowerCase();
  if (n === 'auto') return 'auto';
  if ((LANGUAGES as readonly string[]).includes(n)) return n as Lang;
  return ALIASES[n] ?? 'text';
}

const SIGNS: [Lang, RegExp, number][] = [
  ['js', /\b(const|let|var|function|export|import|return|async|await)\b/, 2],
  ['js', /=>|\bfrom ['"]|require\(|console\.\w+\(|<[A-Z]\w*[\s/>]|className=|: (string|number|boolean)\b|interface \w+|\btype \w+ =/, 3],
  ['json', /^\s*"[^"\n]+"\s*:/m, 3],
  ['html', /^\s*<(!doctype|html|head|body|div|span|section|main|a|p|ul|svg|script|style)\b/im, 4],
  ['html', /<\/[a-z][\w-]*>/i, 1],
  ['css', /^\s*[.#:@]?[\w\s.,#>:*-]+\{[^}]*:[^}]*\}/m, 4],
  ['css', /^\s*(@media|@import|@keyframes|:root)|--[\w-]+\s*:/m, 3],
  ['bash', /^\s*(\$ |#!\/)/m, 4],
  ['bash', /^\s*(npm|npx|pnpm|yarn|git|docker|cd|ls|curl|sudo|apt|brew|mkdir|echo|export|cp|mv|rm|chmod|ssh)\b/m, 3],
  ['python', /^\s*(def|class) \w+.*:\s*$|^\s*(from \w+ )?import \w+|\bself\.|\belif\b|\bprint\(/m, 4],
  ['go', /^package \w+|\bfunc (\(\w+ \*?\w+\) )?\w+\(|:= /m, 4],
  ['rust', /\bfn \w+|\blet mut\b|\bimpl\b|\buse std::|println!/, 4],
  ['java', /\b(public|private|protected) (static )?(final )?(class|void|\w+ \w+\()|System\.out|@Override/, 4],
  ['csharp', /\busing System|\bnamespace \w+|Console\.Write|\bvar \w+ = new\b/, 4],
  ['c', /#include\s*[<"]|\bint main\(|std::|\bprintf\(|\bnullptr\b/, 4],
  ['php', /<\?php|\$\w+\s*=|->\w+\(/, 3],
  ['ruby', /^\s*def \w+|\bend\s*$|\bputs\b|\brequire ['"]|\battr_\w+/m, 3],
  ['sql', /\b(select|insert into|update|delete from|create table|alter table)\b[\s\S]*\b(from|set|values|where|\()/i, 5],
  ['yaml', /^\s*-?\s*[\w.-]+:( |$).*\n(\s*-?\s*[\w.-]+:( |$))/m, 3],
  ['toml', /^\[[\w. -]+\]\s*$/m, 4],
  ['dockerfile', /^(FROM|RUN|COPY|CMD|WORKDIR|ENTRYPOINT|EXPOSE|ENV|ARG)\s/m, 5],
  ['markdown', /^#{1,6} \S|^\s*[-*] \[[ x]\]|\[[^\]]+\]\([^)]+\)/m, 3],
  ['diff', /^(@@ .* @@|diff --git|\+\+\+ |--- )/m, 8],
];

export function detectLanguage(code: string): Lang {
  const src = code.trim();
  if (!src) return 'text';
  if (/^[{[]/.test(src)) {
    try { JSON.parse(src); return 'json'; } catch { /* maybe JSON with comments or JS - keep scoring */ }
  }
  const score: Partial<Record<Lang, number>> = {};
  for (const [lang, re, w] of SIGNS) if (re.test(src)) score[lang] = (score[lang] ?? 0) + w;
  let best: Lang = 'text';
  let top = 2;
  for (const [lang, s] of Object.entries(score) as [Lang, number][]) if (s > top) { top = s; best = lang; }
  return best;
}

export type TokenType = 'comment' | 'string' | 'number' | 'keyword' | 'literal' | 'fn' | 'type' | 'prop' | 'attr' | 'tag' | 'punct' | 'ins' | 'del';
export interface Token { t: TokenType | null; v: string }

const words = (s: string) => new RegExp(`\\b(?:${s.trim().split(/\s+/).join('|')})\\b`, 'y');
const wordsI = (s: string) => new RegExp(`\\b(?:${s.trim().split(/\s+/).join('|')})\\b`, 'iy');

type Rule = [TokenType, RegExp];
const R = (t: TokenType, re: RegExp | string): Rule => [t, typeof re === 'string' ? new RegExp(re, 'y') : re];

const NUM = R('number', /\b(?:0x[\da-f]+|0b[01]+|\d[\d_]*(?:\.\d+)?(?:e[+-]?\d+)?)n?\b/iy);
const STR = R('string', /"(?:\\[\s\S]|[^"\\\n])*"|'(?:\\[\s\S]|[^'\\\n])*'/y);
const STR_BT = R('string', /`(?:\\[\s\S]|[^`\\])*`/y);
const FN = R('fn', /[A-Za-z_$][\w$]*(?=\s*\()/y);
const TYPE = R('type', /\b[A-Z][\w$]*\b/y);
const PUNCT = R('punct', /[{}()[\];,.:<>=+\-*/%!&|?^~@]+/y);
const SLASH = R('comment', /\/\/[^\n]*|\/\*[\s\S]*?(?:\*\/|$)/y);
const HASH = R('comment', /#[^\n]*/y);
const LITERAL = (s: string) => R('literal', words(s));

const C_KW = 'if else for while do switch case break continue return default new delete try catch finally throw class struct enum interface extends implements import export from as static const let var function async await yield typeof instanceof void in of public private protected abstract final override package namespace using this super';

const RULES: Record<Lang, Rule[]> = {
  js: [
    SLASH, STR, STR_BT,
    R('comment', /<!--[\s\S]*?-->/y),
    R('tag', /(?<![\w$)\]])<\/?(?:[A-Za-z][\w.:-]*)?(?=[\s/>])/y),
    R('attr', /(?<=[\s"'}])[A-Za-z_:][\w:.-]*(?==["{])/y),
    NUM, LITERAL('true false null undefined NaN Infinity'),
    R('keyword', words(`${C_KW} type declare readonly keyof satisfies get set with debugger`)),
    FN, TYPE, PUNCT,
  ],
  json: [R('prop', /"(?:\\[\s\S]|[^"\\\n])*"(?=\s*:)/y), STR, NUM, LITERAL('true false null'), PUNCT],
  html: [
    R('comment', /<!--[\s\S]*?(?:-->|$)/y), R('keyword', /<![A-Za-z][^>]*>/y),
    R('tag', /<\/?[A-Za-z][\w.:-]*|\/?>/y), R('attr', /[A-Za-z_:@][\w:.-]*(?==)/y), STR,
    R('string', /&[#\w]+;/y), PUNCT,
  ],
  css: [
    R('comment', /\/\*[\s\S]*?(?:\*\/|$)/y), SLASH, STR,
    R('keyword', /@[\w-]+/y), R('number', /#[\da-f]{3,8}\b/iy),
    R('number', /-?(?:\d*\.)?\d+(?:px|em|rem|%|vh|vw|vmin|vmax|ch|s|ms|deg|fr|pt|cm|mm)?\b/y),
    R('prop', /--[\w-]+|[a-z-]+(?=\s*:(?!:))(?![^{}]*\{)/y),
    R('type', /[.#][A-Za-z_][\w-]*/y), R('fn', /[A-Za-z-]+(?=\()/y), R('literal', /!important/y), PUNCT,
  ],
  bash: [
    HASH, STR, R('string', /`[^`]*`/y),
    R('prop', /\$(?:\{[^}]*\}|[\w@*#?!$-]+|\([^)]*\))/y),
    R('attr', /(?<=\s)--?[A-Za-z][\w-]*/y),
    R('keyword', words('if then else elif fi for while do done case esac function in return exit export local readonly set unset source alias')),
    R('fn', /(?<=^[ \t$>]*|[|;&]\s*)[\w./-]+/my), NUM, PUNCT,
  ],
  python: [
    HASH, R('string', /(?:[rbfu]|rb|br|fr|rf)?(?:"""[\s\S]*?(?:"""|$)|'''[\s\S]*?(?:'''|$))/iy),
    R('string', /(?:[rbfu]|rb|br|fr|rf)?(?:"(?:\\[\s\S]|[^"\\\n])*"|'(?:\\[\s\S]|[^'\\\n])*')/iy),
    R('attr', /@[\w.]+/y), NUM, LITERAL('True False None'),
    R('keyword', words('def class return if elif else for while in not and or is import from as with try except finally raise pass break continue lambda yield async await global nonlocal del assert self cls')),
    FN, TYPE, PUNCT,
  ],
  go: [
    SLASH, STR, STR_BT, NUM, LITERAL('true false nil iota'),
    R('keyword', words('package import func var const type struct interface map chan go defer return if else for range switch case default select break continue fallthrough goto')),
    R('type', words('string int int8 int16 int32 int64 uint uint8 uint16 uint32 uint64 float32 float64 bool byte rune error any')),
    FN, TYPE, PUNCT,
  ],
  rust: [
    SLASH, R('string', /r#*"[\s\S]*?"#*|b?"(?:\\[\s\S]|[^"\\])*"/y), R('string', /'(?:\\.|[^'\\])'/y),
    R('attr', /#!?\[[^\]]*\]/y), R('prop', /'[a-z_]+\b/y), NUM, LITERAL('true false None Some Ok Err self Self'),
    R('keyword', words('fn let mut const static struct enum impl trait type use mod pub crate super as if else match for while loop in return break continue move ref where async await dyn unsafe extern')),
    R('type', words('i8 i16 i32 i64 i128 isize u8 u16 u32 u64 u128 usize f32 f64 bool char str String Vec Option Result Box')),
    R('fn', /[A-Za-z_][\w]*!?(?=\s*[(<])/y), TYPE, PUNCT,
  ],
  java: [
    SLASH, STR, R('string', /"""[\s\S]*?"""/y), R('attr', /@[A-Za-z_]\w*/y), NUM, LITERAL('true false null'),
    R('keyword', words(`${C_KW} fun val var when object companion data sealed lateinit override open internal suppress synchronized volatile transient native throws func guard let init deinit extension protocol`)),
    R('type', words('int long short byte float double boolean char String Int Long Double Boolean Unit Any Void')),
    FN, TYPE, PUNCT,
  ],
  csharp: [
    SLASH, R('string', /\$?@?"(?:\\[\s\S]|[^"\\\n])*"/y), R('string', /'(?:\\.|[^'\\])'/y), NUM, LITERAL('true false null'),
    R('keyword', words(`${C_KW} var readonly sealed partial virtual record init get set lock event delegate params out ref is operator internal unsafe where select orderby`)),
    R('type', words('int long short byte float double decimal bool char string object dynamic')),
    FN, TYPE, PUNCT,
  ],
  c: [
    SLASH, R('keyword', /#\s*\w+/y), R('string', /<[\w./]+>(?<=#include\s*<[\w./]+>)/y), STR, R('string', /'(?:\\.|[^'\\])'/y),
    NUM, LITERAL('true false NULL nullptr'),
    R('keyword', words(`${C_KW} template typename sizeof typedef union extern inline volatile register unsigned signed auto constexpr noexcept virtual operator friend goto mutable explicit`)),
    R('type', words('int long short char float double bool size_t void string vector map')),
    FN, TYPE, PUNCT,
  ],
  php: [
    SLASH, HASH, R('keyword', /<\?php|\?>/y), STR, R('prop', /\$[A-Za-z_]\w*/y), NUM, LITERAL('true false null TRUE FALSE NULL'),
    R('keyword', words('function class public private protected static return if else elseif foreach for while switch case break continue new echo use namespace extends implements interface trait try catch finally throw match fn const as abstract final')),
    FN, TYPE, PUNCT,
  ],
  ruby: [
    HASH, R('string', /"(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*'/y), R('prop', /[@$]{1,2}[A-Za-z_]\w*/y),
    R('string', /:[A-Za-z_]\w*[?!]?/y), NUM, LITERAL('true false nil self'),
    R('keyword', words('def end class module if elsif else unless case when while until for in do begin rescue ensure raise return yield require require_relative include extend attr_accessor attr_reader attr_writer puts lambda proc then and or not')),
    FN, TYPE, PUNCT,
  ],
  sql: [
    R('comment', /--[^\n]*|\/\*[\s\S]*?(?:\*\/|$)/y), R('string', /'(?:''|[^'])*'/y), R('prop', /"[^"]*"|`[^`]*`/y), NUM,
    LITERAL('true false null'),
    R('keyword', wordsI('select from where and or not insert into values update set delete create table alter drop index view join left right inner outer full on group by order having limit offset as distinct union all case when then else end in is like between exists primary key foreign references default unique constraint with returning asc desc')),
    R('type', wordsI('int integer bigint smallint serial text varchar char boolean bool date time timestamp timestamptz numeric decimal float real json jsonb uuid')),
    FN, PUNCT,
  ],
  yaml: [
    HASH, STR, R('prop', /(?<=^[ \t-]*)[\w.$-]+(?=[ \t]*:(?:\s|$))/my), R('attr', /[&*][\w-]+|!{1,2}[\w-]*/y),
    NUM, LITERAL('true false null yes no on off'), PUNCT,
  ],
  toml: [
    HASH, R('type', /^\[\[?[^\]\n]+\]\]?/my), R('string', /"""[\s\S]*?"""|'''[\s\S]*?'''/y), STR,
    R('prop', /(?<=^[ \t]*)[\w.-]+(?=[ \t]*=)/my), NUM, LITERAL('true false'), PUNCT,
  ],
  markdown: [
    R('keyword', /^#{1,6} [^\n]*/my), R('string', /```[\s\S]*?(?:```|$)|`[^`\n]+`/y), R('fn', /\[[^\]\n]*\]\([^)\n]*\)/y),
    R('prop', /\*\*[^*\n]+\*\*|__[^_\n]+__/y), R('attr', /(?<=^[ \t]*)(?:[-*+]|\d+\.)(?= )/my), R('comment', /^>[^\n]*/my),
  ],
  dockerfile: [
    HASH, STR, R('keyword', /^(?:FROM|RUN|CMD|LABEL|EXPOSE|ENV|ADD|COPY|ENTRYPOINT|VOLUME|USER|WORKDIR|ARG|ONBUILD|STOPSIGNAL|HEALTHCHECK|SHELL)\b/imy),
    R('keyword', /\bAS\b/y), R('prop', /\$(?:\{[^}]*\}|\w+)/y), R('attr', /(?<=\s)--[\w-]+/y), NUM, PUNCT,
  ],
  diff: [],
  text: [],
};

function tokenizeWith(code: string, rules: Rule[]): Token[] {
  const out: Token[] = [];
  let plain = '';
  const flush = () => { if (plain) { out.push({ t: null, v: plain }); plain = ''; } };
  let i = 0;
  scan: while (i < code.length) {
    for (const [t, re] of rules) {
      re.lastIndex = i;
      const m = re.exec(code);
      if (m && m[0].length) {
        flush();
        out.push({ t, v: m[0] });
        i += m[0].length;
        continue scan;
      }
    }
    plain += code[i++];
  }
  flush();
  return out;
}

export function tokenize(code: string, lang: Lang): Token[] {
  if (lang === 'diff') {
    return code.split('\n').flatMap((line, i, all): Token[] => {
      const t: TokenType | null = /^(@@|diff |index )/.test(line) ? 'type' : /^\+(?!\+\+)/.test(line) ? 'ins' : /^-(?!--)/.test(line) ? 'del' : /^(\+\+\+|---)/.test(line) ? 'attr' : null;
      const toks: Token[] = [{ t, v: line }];
      if (i < all.length - 1) toks.push({ t: null, v: '\n' });
      return toks;
    });
  }
  const rules = RULES[lang];
  return rules.length ? tokenizeWith(code, rules) : [{ t: null, v: code }];
}

/** Splits tokens into lines (a token spanning lines is cut) so line numbers and diff backgrounds stay per line. */
export function toLines(tokens: Token[]): Token[][] {
  const lines: Token[][] = [[]];
  for (const tok of tokens) {
    const parts = tok.v.split('\n');
    parts.forEach((p, i) => {
      if (i > 0) lines.push([]);
      if (p) lines[lines.length - 1]!.push({ t: tok.t, v: p });
    });
  }
  return lines;
}
