// Shared helpers: reading the word list, Hebrew/English detection,
// random helpers, and the word-search (תפזורת) generator.

const MARKS = /[֑-ׇ̀-ͯ]/; // Hebrew niqqud and Latin accents
const HEB_FILLER = "אבגדהוזחטיכלמנסעפצקרשת";
const ENG_FILLER = "abcdefghijklmnopqrstuvwxyz";

function isHebrew(word) {
  return /[א-ת]/.test(word);
}

function langOf(word) {
  return isHebrew(word) ? "he" : "en";
}

// Words can be separated by new lines, commas or semicolons. Duplicates are dropped.
function parseWords(text) {
  const seen = new Set();
  const words = [];
  for (const part of text.split(/[\n,;،]+/)) {
    const word = part.trim().replace(/\s+/g, " ");
    const key = plain(word).toLowerCase();
    if (word && !seen.has(key)) {
      seen.add(key);
      words.push(word);
    }
  }
  return words;
}

// The word without niqqud.
function plain(word) {
  return word.replace(/[֑-ׇ]/g, "");
}

// Letters of a word, keeping niqqud attached to its letter.
function graphemes(word) {
  const out = [];
  for (const ch of word) {
    if (MARKS.test(ch) && out.length) out[out.length - 1] += ch;
    else out.push(ch);
  }
  return out;
}

// Letters used in a word search: no niqqud, no spaces or dashes.
function gridLetters(word) {
  let s = plain(word).replace(/[^\p{L}]/gu, "");
  if (!isHebrew(word)) s = s.toLowerCase();
  return Array.from(s);
}

// Letters only (no spaces), lower case, no niqqud - used to compare answers.
function normalize(word) {
  return gridLetters(word).join("");
}

function randInt(n) {
  return Math.floor(Math.random() * n);
}

function shuffle(list) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

// A word shown in its own direction, so English stays left-to-right inside Hebrew pages.
function wordSpan(word, cls = "w") {
  const lang = langOf(word);
  return `<span class="${cls}" lang="${lang}" dir="${lang === "he" ? "rtl" : "ltr"}">${escapeHtml(word)}</span>`;
}

// Sort in alphabet order (א-ב for Hebrew, ABC for English).
function alphabetical(words) {
  return words.slice().sort((a, b) => plain(a).localeCompare(plain(b), langOf(a), { sensitivity: "base" }));
}

// Builds a word search grid. All words should be in one language.
// Easy: words go forward (in reading direction) or down.
// Hard: also backwards and diagonal.
function makeWordSearch(words, hard) {
  const he = words.some(isHebrew);
  const items = words
    .map((word) => ({ word, letters: gridLetters(word) }))
    .filter((item) => item.letters.length > 1)
    .sort((a, b) => b.letters.length - a.letters.length);
  if (!items.length) return null;

  const fwd = he ? -1 : 1; // Hebrew is read right to left
  const dirs = hard
    ? [[fwd, 0], [0, 1], [fwd, 1], [-fwd, 1], [-fwd, 0], [0, -1]]
    : [[fwd, 0], [0, 1]];

  const longest = items[0].letters.length;
  const total = items.reduce((sum, item) => sum + item.letters.length, 0);
  let size = Math.max(hard ? 11 : 9, longest + 1, Math.ceil(Math.sqrt(total * (hard ? 2.2 : 2.6))));
  size = Math.min(size, 18);

  for (let attempt = 0; attempt < 40; attempt++) {
    if (attempt > 0 && attempt % 8 === 0 && size < 20) size++;
    const result = tryPlaceAll(items, size, dirs);
    if (result) {
      const filler = he ? HEB_FILLER : ENG_FILLER;
      for (const row of result.grid) {
        for (let x = 0; x < size; x++) if (!row[x]) row[x] = filler[randInt(filler.length)];
      }
      return { size, grid: result.grid, placed: result.placed, he };
    }
  }
  return null;
}

function tryPlaceAll(items, size, dirs) {
  const grid = Array.from({ length: size }, () => Array(size).fill(""));
  const placed = [];
  for (const item of items) {
    const cells = tryPlaceWord(grid, item.letters, size, dirs);
    if (!cells) return null;
    cells.forEach(([x, y], i) => (grid[y][x] = item.letters[i]));
    placed.push({ word: item.word, cells });
  }
  return { grid, placed };
}

function tryPlaceWord(grid, letters, size, dirs) {
  for (let t = 0; t < 300; t++) {
    const [dx, dy] = dirs[randInt(dirs.length)];
    const x0 = randInt(size);
    const y0 = randInt(size);
    const cells = [];
    let ok = true;
    for (let i = 0; i < letters.length; i++) {
      const x = x0 + dx * i;
      const y = y0 + dy * i;
      if (x < 0 || y < 0 || x >= size || y >= size || (grid[y][x] && grid[y][x] !== letters[i])) {
        ok = false;
        break;
      }
      cells.push([x, y]);
    }
    if (ok) return cells;
  }
  return null;
}
