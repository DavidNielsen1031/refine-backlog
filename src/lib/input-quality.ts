/**
 * input-quality.ts
 *
 * Heuristic garbage-in detector for Speclint's refinement API.
 * Prevents hallucinated specs from scoring 100/100 when the input was junk.
 * Pure heuristics — no LLM calls.
 */

export interface InputQualityResult {
  score: number          // 0–100
  flags: string[]        // "too_short" | "template_only" | "no_technical_context" | "possible_spam"
  isSpeculative: boolean // true when score < 30
}

// -------------------------------------------------------------------
// Boilerplate stripping
// -------------------------------------------------------------------

/**
 * Strip noise from an input string before word-counting:
 *   - HTML comments <!-- ... -->
 *   - Markdown headings, bold, italic, fenced code blocks, blockquotes
 *   - Common GitHub issue template boilerplate lines
 */
function stripBoilerplate(text: string): string {
  let s = text

  // HTML comments (including multi-line)
  s = s.replace(/<!--[\s\S]*?-->/g, ' ')

  // Fenced code blocks — preserve content, strip fences
  s = s.replace(/```[\w]*\n?/g, ' ')

  // Inline code — mark as a word so it counts
  s = s.replace(/`[^`]+`/g, ' CODE ')

  // Markdown headings
  s = s.replace(/^#{1,6}\s+/gm, '')

  // Bold / italic markers
  s = s.replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')
  s = s.replace(/_{1,3}([^_]+)_{1,3}/g, '$1')

  // Blockquotes
  s = s.replace(/^>\s*/gm, '')

  // Horizontal rules
  s = s.replace(/^[-*_]{3,}\s*$/gm, '')

  // Common GitHub template section headers that carry zero user info
  const boilerplateLines = [
    /^(describe the bug|is your feature request related to a problem|describe the solution you'd like)/i,
    /^(describe alternatives you've considered|additional context)/i,
    /^(steps to reproduce|expected behavior|actual behavior|screenshots)/i,
    /^(desktop|smartphone|version|os|browser)/i,
    /^(to reproduce|environment|logs?|error message)/i,
    /^\*\*[^*]+\*\*\s*$/, // lines that are ONLY a bold label
  ]
  s = s
    .split('\n')
    .filter(line => !boilerplateLines.some(re => re.test(line.trim())))
    .join('\n')

  return s.replace(/\s+/g, ' ').trim()
}

function meaningfulWordCount(text: string): number {
  const stripped = stripBoilerplate(text)
  if (!stripped) return 0
  return stripped.split(/\s+/).filter(w => w.length > 0).length
}

// -------------------------------------------------------------------
// Signal detectors
// -------------------------------------------------------------------

/** True when most chars are outside basic Latin (Devanagari, Arabic, CJK, etc.) */
function hasDominantNonLatinScript(text: string): boolean {
  const stripped = stripBoilerplate(text)
  if (!stripped) return false
  const totalChars = stripped.replace(/\s/g, '').length
  if (totalChars === 0) return false
  // Devanagari U+0900–U+097F, Arabic U+0600–U+06FF, CJK U+4E00+, etc.
  // All of these are > U+024F (end of Latin Extended-B)
  const nonLatinCount = Array.from(stripped).filter(ch => ch.charCodeAt(0) > 0x024F).length
  return nonLatinCount / totalChars > 0.25
}

// Common keyboard-row sequences — dead giveaway for mashing
const KEYBOARD_SEQUENCES = new Set([
  'qwerty', 'qwertyuiop', 'asdf', 'asdfghjkl', 'zxcv', 'zxcvbn', 'zxcvbnm',
  'qwer', 'wert', 'erty', 'rtyu', 'tyui', 'yuio', 'uiop',
  'asd', 'sdf', 'dfg', 'fgh', 'ghj', 'hjk', 'jkl',
  'zxc', 'xcv', 'cvb', 'vbn', 'bnm',
  'qaz', 'wsx', 'edc', 'rfv', 'tgb', 'yhn', 'ujm',
])

/**
 * Detect pure keyboard mash / random chars.
 * A word is "gibberish" if:
 *   - It's a known keyboard row sequence, OR
 *   - It has no vowels and is ≤ 8 chars (not a technical token)
 * Overall: gibberish when >50% of words are gibberish.
 */
function isGibberish(text: string): boolean {
  const stripped = stripBoilerplate(text).toLowerCase()
  if (!stripped) return true
  const words = stripped.split(/\s+/).filter(w => w.length > 0)
  if (words.length === 0) return true

  const gibberishWords = words.filter(w => {
    // Known keyboard sequences
    if (KEYBOARD_SEQUENCES.has(w)) return true
    // Technical tokens are not gibberish
    if (/[./\\@#$%^&*()_+=[\]{}'";:<>?~]/.test(w)) return false
    // Digit-only tokens are not gibberish
    if (/^\d+$/.test(w)) return false
    // Short words with no vowels are suspicious
    if (w.length <= 8 && !/[aeiou]/.test(w)) return true
    // Very short words (≤ 3 chars) with at most 1 vowel look like initials/mash
    if (w.length <= 3) {
      const vowelCount = (w.match(/[aeiou]/g) ?? []).length
      // "asd" has 1 vowel but is clearly mash; require ≥ 2 vowels or known word
      // Allow common 3-letter words: "add", "the", "fix", "bug", "run", etc.
      const COMMON_SHORT_WORDS = new Set([
        'add', 'the', 'fix', 'bug', 'run', 'use', 'get', 'set', 'put', 'log',
        'new', 'old', 'top', 'end', 'for', 'not', 'but', 'and', 'are', 'its',
        'all', 'can', 'has', 'had', 'was', 'did', 'see', 'try', 'due', 'via',
        'max', 'min', 'api', 'url', 'css', 'app', 'ios', 'web', 'sdk', 'npm',
      ])
      if (COMMON_SHORT_WORDS.has(w)) return false
      if (vowelCount < 1 || (vowelCount === 1 && w.length === 3)) return true
    }
    return false
  })

  return gibberishWords.length / words.length > 0.50
}

/**
 * Detect GitHub issue templates where the user filled in NOTHING.
 * Signal: 2+ HTML comment blocks AND < 8 meaningful words after stripping.
 */
function isEmptyGitHubTemplate(text: string): boolean {
  const commentCount = (text.match(/<!--[\s\S]*?-->/g) ?? []).length
  if (commentCount < 2) return false
  const wordCount = meaningfulWordCount(text)
  return wordCount < 8
}

/**
 * A filled template has comment boilerplate but also has real content.
 */
function isFilledTemplate(text: string): boolean {
  const commentCount = (text.match(/<!--[\s\S]*?-->/g) ?? []).length
  if (commentCount < 2) return false
  return meaningfulWordCount(text) >= 20
}

/** First line has a meaningful title (at least 3 words OR 1 word ≥ 4 chars with a vowel). */
function hasMeaningfulTitle(text: string): boolean {
  const firstLine = text.split('\n').find(l => l.trim().length > 0) ?? ''
  const cleaned = firstLine.replace(/^#+\s*/, '').replace(/^\*+\s*/, '').trim()
  const words = cleaned.split(/\s+/).filter(w => w.length > 1)
  if (words.length >= 3) return true
  if (words.length >= 1 && /[aeiou]/i.test(cleaned) && cleaned.length >= 4) return true
  return false
}

// -------------------------------------------------------------------
// Technical context — code refs, paths, errors, stack traces, commands
// -------------------------------------------------------------------
const TECHNICAL_CONTEXT_RE = new RegExp(
  [
    // Error types / keywords
    '\\b(null|undefined|error|exception|traceback|stacktrace|bug|crash|fail|timeout|',
    '500|404|403|401|400|TypeError|SyntaxError|ReferenceError|NullPointerException|NPE)\\b',
    // File paths with at least 2 segments: /foo/bar
    '|\\/[a-z_\\-]+\\/[a-z_.\\-\\/]+',
    // Common tech abbreviations and protocols
    '|\\bapi\\b|\\bhttp[s]?:\\/\\/|\\bsql\\b|\\bdatabase\\b',
    // Code-structure keywords
    '|\\b(function|method|class|module|package|import|export|component|endpoint|webhook)\\b',
    // Runtime / language signals
    '|\\b(console\\.|throw|catch|async|await|promise|callback|token|JWT|OAuth|SSL|TLS)\\b',
    // Infrastructure
    '|\\b(cache|CDN|Docker|kubernetes|git|npm|yarn|pip|brew|CI\\/CD|README)\\b',
    // Shell / code literals
    '|\\$[a-zA-Z_]+',
    // Markdown/code: `something()`
    '|`[^`]+`',
  ].join(''),
  'im'
)

// -------------------------------------------------------------------
// Software / product domain vocabulary
// Signals the text is about a software product (even without specific tech refs)
// -------------------------------------------------------------------
const SOFTWARE_VOCAB_RE = new RegExp(
  [
    '\\b(add|fix|bug|feature|update|create|delete|remove|show|hide|display|load|save|',
    'upload|download|submit|validate|login|logout|signup|register|navigate|redirect|',
    'render|deploy|build|test|run|install|configure|setup|launch|start|stop|refresh|',
    'reload|reset|clear|filter|search|sort|export|import|share|send|receive|notify|',
    'alert|confirm|cancel|close|open|toggle|enable|disable|select|expand|collapse|',
    'scroll|preview|view|edit|manage|handle|process|parse|format|convert|sync|fetch|',
    'push|pull|clone|commit|merge|revert|undo|redo|copy|paste|move|rename|duplicate|',
    'publish|draft|archive|restore|recover|backup|monitor|track|debug|optimize|cache|',
    'sign.?in|sign.?out|sign.?up|log.?in|log.?out)\\b',
    // Nouns / entities common in software specs
    // Note: "tab" excluded intentionally — too common in non-English (Hindi "tab" = "then")
    '|\\b(user|page|button|click|form|menu|screen|modal|dialog|popup|drawer|panel|tabs|',
    'card|table|list|grid|chart|graph|dashboard|sidebar|header|footer|navbar|',
    'navigation|breadcrumb|pagination|tooltip|badge|icon|avatar|image|video|audio|',
    'file|document|folder|report|setting|preference|profile|account|email|password|',
    'session|cookie|auth|permission|role|admin|team|project|workspace|channel|thread|',
    'message|comment|notification|input|textarea|checkbox|radio|switch|slider|',
    'attachment|url|route|path|endpoint|api|event|payload|response|request|status|',
    'component|widget|layout|template|theme|style|schema|model|field|column|row)\\b',
    // Very specific software phrases
    '|\\b(dark mode|light mode|responsive|mobile|desktop|web app|frontend|backend|',
    'full stack|rest api|graphql|microservice|serverless)\\b',
  ].join(''),
  'i'
)

// -------------------------------------------------------------------
// Scoring
// -------------------------------------------------------------------

/**
 * Assess the quality of a raw input string.
 * Returns a score (0–100), flags, and whether the result is speculative.
 *
 * Score components:
 *   word count     0–25 pts
 *   tech context   0–35 pts
 *   software vocab 0–20 pts
 *   coherence      0–10 pts (requires wordCount >= 5 to award)
 *   title          0–10 pts
 */
export function assessInputQuality(input: string): InputQualityResult {
  const flags: string[] = []

  if (!input || !input.trim()) {
    return { score: 0, flags: ['too_short', 'possible_spam'], isSpeculative: true }
  }

  const wordCount = meaningfulWordCount(input)
  const gibberish = isGibberish(input)
  const nonLatin = hasDominantNonLatinScript(input)
  const emptyTemplate = isEmptyGitHubTemplate(input)
  const filledTemplate = isFilledTemplate(input)
  const hasTech = TECHNICAL_CONTEXT_RE.test(input)
  const hasSoftwareVocab = SOFTWARE_VOCAB_RE.test(input)
  const meaningfulTitle = hasMeaningfulTitle(input)

  // ----------------------------------------------------------------
  // 1. Word count (0–25 pts)
  // ----------------------------------------------------------------
  let wordScore: number
  if (wordCount < 5) {
    wordScore = 0
  } else if (wordCount < 10) {
    wordScore = 5
  } else if (wordCount < 25) {
    wordScore = 15
  } else if (wordCount < 50) {
    wordScore = 20
  } else {
    wordScore = 25
  }

  if (wordCount < 10) flags.push('too_short')

  // ----------------------------------------------------------------
  // 2. Technical context (0–35 pts)
  // ----------------------------------------------------------------
  const techScore = hasTech ? 35 : 0
  if (!hasTech) flags.push('no_technical_context')

  // ----------------------------------------------------------------
  // 3. Software vocabulary (0–20 pts)
  // ----------------------------------------------------------------
  const vocabScore = hasSoftwareVocab ? 20 : 0

  // ----------------------------------------------------------------
  // 4. Language coherence (0–10 pts)
  //    Requires wordCount >= 5 to rule out "asd" / keyboard mash
  //    Gibberish or non-Latin gets 0
  // ----------------------------------------------------------------
  let coherenceScore = 0
  if (gibberish) {
    flags.push('possible_spam')
  } else if (nonLatin) {
    flags.push('possible_spam')
    // Non-Latin gets a small coherence credit (it might be a real language,
    // just not English — but we still can't assess software relevance)
    if (wordCount >= 5) coherenceScore = 2
  } else if (wordCount >= 5) {
    coherenceScore = 10
  }

  // ----------------------------------------------------------------
  // 5. Meaningful title (0–10 pts)
  // ----------------------------------------------------------------
  const titleScore = meaningfulTitle ? 10 : 0

  // ----------------------------------------------------------------
  // Combine
  // ----------------------------------------------------------------
  let score = wordScore + techScore + vocabScore + coherenceScore + titleScore

  // ----------------------------------------------------------------
  // Template handling
  // ----------------------------------------------------------------
  if (emptyTemplate) {
    flags.push('template_only')
    score = Math.min(score, 15)
  } else if (filledTemplate) {
    // Small bonus for having used a structured template correctly
    score = Math.min(score + 5, 100)
  }

  // ----------------------------------------------------------------
  // Hard caps
  // ----------------------------------------------------------------

  // Non-Latin text → we can't validate software relevance → always speculative
  if (nonLatin) {
    score = Math.min(score, 20)
  }

  // Gibberish short text → basically nothing useful
  if (gibberish && wordCount < 5) {
    score = Math.min(score, 10)
  }

  // Medium+ length text with NO domain signals → likely off-topic / spam
  // (catches transliterated foreign language, lorem ipsum, random sentences)
  if (wordCount >= 10 && !hasTech && !hasSoftwareVocab) {
    score = Math.min(score, 25)
  }

  // ----------------------------------------------------------------
  // Short-but-clear-intent bump
  // A short phrase (3-15 words) that is coherent English with software vocabulary
  // should NOT be speculative — it's a valid terse spec like "Add dark mode"
  // ----------------------------------------------------------------
  const isShortButClearIntent =
    wordCount >= 3 &&
    wordCount <= 15 &&
    !gibberish &&
    !nonLatin &&
    meaningfulTitle &&
    !emptyTemplate &&
    (hasTech || hasSoftwareVocab)

  if (isShortButClearIntent) {
    score = Math.max(score, 30)
    // Remove 'too_short' — intent is clear enough
    const idx = flags.indexOf('too_short')
    if (idx !== -1) flags.splice(idx, 1)
  }

  score = Math.max(0, Math.min(100, Math.round(score)))

  return {
    score,
    flags,
    isSpeculative: score < 30,
  }
}
