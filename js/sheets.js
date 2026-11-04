// The printable worksheets. There is a pool of page types in five groups; every test
// picks 10 of them at random (see PATTERN), so each new test gives different pages.
// The test's seed makes the choice repeatable, so a saved test rebuilds the same pages.

const PATTERN = ["write", "puzzle", "spell", "write", "puzzle", "think", "spell", "puzzle", "write", "game"];

const PAGE_TYPES = [
  // Writing practice
  { id: "copy", cat: "write", title: "כותבים שוב ושוב", instr: () => "העתיקו כל מילה שלוש פעמים, בכתב יפה ומסודר.", body: copySheet },
  { id: "trace", cat: "write", title: "עוברים על הקו", instr: () => "עברו בעיפרון על המילים החלולות, ואז כתבו כל מילה לבד על הקו.", body: traceSheet },
  { id: "pyramid", cat: "write", title: "מגדלי מילים", instr: () => "בנו מגדל מכל מילה: בשורה הראשונה האות הראשונה, ובכל שורה מוסיפים עוד אות.", body: pyramidSheet },
  { id: "lookCover", cat: "write", title: "מסתכלים, מכסים, כותבים", instr: () => "קראו את המילה, קפלו את הדף או כסו אותה, כתבו אותה מהזיכרון, ואז בדקו. סמנו ✓ אם צדקתם, ונסו שוב בעמודה האחרונה.", body: lookCoverSheet },
  { id: "shapes", cat: "write", title: "מילים במשבצות", instr: () => "האות הראשונה כבר כתובה. מצאו במחסן איזו מילה מתאימה למשבצות, וכתבו אות אחת בכל משבצת.", body: shapesSheet },

  // Puzzles
  { id: "search", cat: "puzzle", title: (c) => (c.mixed ? "תפזורת - מילים בעברית" : "תפזורת"), instr: (c) => searchInstr(c.search1), body: (c) => searchSheet(c.search1), answers: (c) => searchAnswer(c.search1) },
  { id: "searchHard", cat: "puzzle", title: (c) => (c.mixed ? "תפזורת - מילים באנגלית" : "תפזורת לאלופים"), instr: (c) => searchInstr(c.search2), body: (c) => searchSheet(c.search2), answers: (c) => searchAnswer(c.search2) },
  { id: "scramble", cat: "puzzle", title: "אותיות מבולבלות", instr: () => "האותיות התבלבלו! סדרו אותן וכתבו את המילה על הקו.", body: scrambleSheet, answers: scrambleAnswer },
  { id: "connect", cat: "puzzle", title: "מותחים קו", instr: () => "חברו בקו כל מילה לאותיות המבולבלות שלה.", body: connectSheet },
  { id: "hidden", cat: "puzzle", title: "המילה המתחבאת", instr: () => "בכל שורה מתחבאת מילה מהרשימה בין אותיות אחרות. מצאו אותה והקיפו אותה.", body: hiddenSheet },
  { id: "code", cat: "puzzle", title: "הקוד הסודי", instr: () => "כל מספר הוא אות. היעזרו במפתח, וכתבו את האות מתחת לכל מספר כדי לגלות את המילים.", body: codeSheet },

  // Spelling
  { id: "missing", cat: "spell", title: "אותיות שהלכו לאיבוד", instr: () => "השלימו את האותיות החסרות בכל מילה. אפשר להיעזר במחסן המילים.", body: (c) => missingSheet(c, false) },
  { id: "missingHard", cat: "spell", title: "אותיות שהלכו לאיבוד 2", instr: () => "הפעם חסרות יותר אותיות! השלימו כל מילה.", body: (c) => missingSheet(c, true) },
  { id: "spelling", cat: "spell", title: "מי כתוב נכון?", instr: () => "בכל שורה רק מילה אחת כתובה נכון. הקיפו אותה!", body: spellingSheet },

  // Thinking
  { id: "order", cat: "think", title: "לפי הסדר", instr: orderInstr, body: orderSheet, answers: orderAnswer },
  { id: "sortLength", cat: "think", title: "קצרות וארוכות", instr: () => "ספרו כמה אותיות יש בכל מילה, וכתבו אותה בעמודה המתאימה.", body: sortLengthSheet },
  { id: "sentence", cat: "think", title: "כל מילה במשפט", instr: () => "כתבו משפט שיש בו את המילה. נסו שכל משפט יהיה שונה.", body: sentenceSheet },
  { id: "story", cat: "think", title: "סיפור קטן", instr: () => "כתבו סיפור קצר שיש בו את כל המילים בתיבה. סמנו ✓ ליד כל מילה שהשתמשתם בה.", body: storySheet },

  // Games to cut out and play
  { id: "memory", cat: "game", title: "משחק זיכרון לגזירה", instr: () => "גזרו את הקלפים לאורך הקווים, הפכו אותם, ונסו למצוא זוגות של אותה מילה. מי שמוצא זוג - קורא את המילה בקול!", body: memorySheet },
  { id: "bingo", cat: "game", title: "בינגו מילים", instr: () => "גזרו את שני הלוחות. מבוגר מקריא מילים מהרשימה בסדר אקראי, וכל שחקן מסמן את המילה אם היא בלוח שלו. שורה מלאה? צועקים בינגו!", body: bingoSheet },
];

// test = { name, words, seed, withAnswers }
function buildSheets(test) {
  return withSeed(test.seed, () => {
    const words = test.words;
    const he = words.filter(isHebrew);
    const en = words.filter((w) => !isHebrew(w));
    const ctx = { words, he, en, mixed: he.length > 0 && en.length > 0 };

    // Mixed lists get one word search per language; otherwise an easy one and a hard one.
    ctx.search1 = { words: ctx.mixed ? he : words, hard: false };
    ctx.search2 = { words: ctx.mixed ? en : words, hard: !ctx.mixed };
    ctx.search1.puzzle = makeWordSearch(ctx.search1.words, ctx.search1.hard);
    ctx.search2.puzzle = makeWordSearch(ctx.search2.words, ctx.search2.hard);

    const pools = {};
    for (const type of shuffle(PAGE_TYPES)) (pools[type.cat] = pools[type.cat] || []).push(type);
    const chosen = PATTERN.map((cat) => pools[cat].pop());

    const pages = chosen.map((type) => ({
      title: typeof type.title === "function" ? type.title(ctx) : type.title,
      instr: type.instr(ctx),
      body: type.body(ctx),
      answer: type.answers ? type.answers(ctx) : "",
      answerTitle: typeof type.title === "function" ? type.title(ctx) : type.title,
    }));

    const answers = pages.filter((p) => p.answer);
    if (test.withAnswers && answers.length) {
      pages.push({
        title: "פתרונות",
        instr: "לבדיקה בסוף (למבוגרים).",
        body: `<div class="answers">${answers.map((p) => `<div class="answer-block"><div class="order-label">${escapeHtml(p.answerTitle)}</div>${p.answer}</div>`).join("")}</div>`,
        isAnswers: true,
      });
    }

    return pages.map((p, i) => sheetHtml(test.name, p, i + 1, chosen.length)).join("");
  });
}

function sheetHtml(name, page, n, total) {
  return `
    <section class="sheet">
      <header class="sheet-head">
        <div class="sheet-brand">✦ עלמה תירגולים ✦</div>
        <h2 class="sheet-test">${escapeHtml(name)}</h2>
        <div class="sheet-sub">
          <span class="sheet-pill">${page.isAnswers ? "" : `${n} · `}${escapeHtml(page.title)}</span>
          <span class="sheet-name">שם: <span class="blank"></span> &nbsp; תאריך: <span class="blank short"></span></span>
        </div>
      </header>
      <p class="sheet-instr">${page.instr}</p>
      <div class="sheet-body">${page.body}</div>
      <footer class="sheet-foot">${page.isAnswers ? "♡ פתרונות ♡" : `♡ דף ${n} מתוך ${total} ♡`}</footer>
    </section>`;
}

// ---------- Writing ----------

function copySheet({ words }) {
  const rows = words.map((w) => `
    <div class="copy-row">
      <div class="copy-word">${wordSpan(w)}</div>
      <div class="write-line"></div><div class="write-line"></div><div class="write-line"></div>
    </div>`);
  return `<div class="rows ${words.length > 14 ? "dense" : ""}">${rows.join("")}</div>`;
}

function traceSheet({ words }) {
  const rows = words.map((w) => `
    <div class="copy-row">
      <div class="trace-cell">${wordSpan(w, "w trace")}</div>
      <div class="trace-cell">${wordSpan(w, "w trace")}</div>
      <div class="write-line"></div>
    </div>`);
  return `<div class="rows ${words.length > 14 ? "dense" : ""}">${rows.join("")}</div>`;
}

function pyramidSheet({ words }) {
  const fit = words.filter((w) => gridLetters(w).length >= 3 && gridLetters(w).length <= 8);
  const pick = shuffle(fit.length >= 2 ? fit : words).slice(0, 6);
  const longest = Math.max(...pick.map((w) => gridLetters(w).length));
  const box = Math.min(7, 64 / longest);
  const blocks = pick.map((w) => {
    const n = gridLetters(w).length;
    const lang = langOf(w);
    const rows = Array.from({ length: n }, (_, i) => `<div class="boxes" dir="${lang === "he" ? "rtl" : "ltr"}">${'<span class="box"></span>'.repeat(i + 1)}</div>`);
    return `<div class="pyramid"><div class="pyramid-word">${wordSpan(w)}</div>${rows.join("")}</div>`;
  });
  return `<div class="pyramids" style="--box:${box.toFixed(2)}mm">${blocks.join("")}</div>`;
}

function lookCoverSheet({ words }) {
  const rows = words.map((w) => `
    <tr><td class="lc-word">${wordSpan(w)}</td><td class="fold"></td><td></td><td class="check"></td><td></td></tr>`);
  return `
    <table class="lc ${words.length > 14 ? "dense" : ""}">
      <thead><tr><th>1. מסתכלים</th><th class="fold">2. מכסים וכותבים</th><th>3. בודקים</th><th class="check">✓</th><th>4. כותבים שוב</th></tr></thead>
      <tbody>${rows.join("")}</tbody>
    </table>`;
}

function shapesSheet({ words }) {
  const rows = shuffle(words).map((w, n) => {
    let first = true;
    const boxes = graphemes(plain(w)).map((ch) => {
      if (!/\p{L}/u.test(ch)) return `<span class="gap"></span>`;
      if (first) { first = false; return `<span class="box">${escapeHtml(ch)}</span>`; }
      return `<span class="box"></span>`;
    });
    return `<div class="shape-row"><span class="num">${n + 1}.</span>${boxesSpan(w, boxes)}</div>`;
  });
  return wordBank(words) + `<div class="rows two-col" style="${fitBox(words)}">${rows.join("")}</div>`;
}

// ---------- Puzzles ----------

function searchInstr(search) {
  const where = search.hard
    ? "המילים מסתתרות לאורך, לרוחב, באלכסון ואפילו הפוך!"
    : (search.puzzle && search.puzzle.he ? "המילים כתובות מימין לשמאל או מלמעלה למטה." : "המילים כתובות משמאל לימין או מלמעלה למטה.");
  return `מצאו את כל המילים והקיפו אותן. ${where} סמנו ✓ ליד כל מילה שמצאתם.`;
}

function searchSheet(search) {
  if (!search.puzzle) return `<p class="note">לא הצלחנו לבנות תפזורת מהמילים האלה (צריך מילים של שתי אותיות ומעלה).</p>`;
  return gridTable(search.puzzle, false) + `<div class="search-bank">${search.puzzle.placed.map((p) => `<span class="bank-item"><span class="tick"></span>${wordSpan(p.word)}</span>`).join("")}</div>`;
}

function searchAnswer(search) {
  return search.puzzle ? gridTable(search.puzzle, true, true) : "";
}

function gridTable(puzzle, showAnswers, small) {
  const marked = new Set();
  if (showAnswers) puzzle.placed.forEach((p) => p.cells.forEach(([x, y]) => marked.add(`${x},${y}`)));
  const cellMm = Math.min(small ? 6 : 12, (small ? 78 : 172) / puzzle.size);
  const rows = puzzle.grid.map((row, y) =>
    `<tr>${row.map((ch, x) => `<td class="${marked.has(`${x},${y}`) ? "hit" : ""}">${escapeHtml(ch)}</td>`).join("")}</tr>`);
  return `<table class="grid" dir="ltr" style="--cell:${cellMm.toFixed(2)}mm">${rows.join("")}</table>`;
}

// Letters of a word in a new order (different from the word itself when possible).
function scrambled(word) {
  const letters = gridLetters(word);
  let mixed = letters;
  for (let t = 0; t < 10 && mixed.join("") === letters.join(""); t++) mixed = shuffle(letters);
  return mixed;
}

function tiles(word, letters) {
  const lang = langOf(word);
  return `<span class="tiles" dir="${lang === "he" ? "rtl" : "ltr"}">${letters.map((ch) => `<span class="tile">${escapeHtml(ch)}</span>`).join("")}</span>`;
}

function scrambleSheet(ctx) {
  ctx.scrambleOrder = shuffle(ctx.words);
  const rows = ctx.scrambleOrder.map((w, n) => `
    <div class="scramble-row"><span class="num">${n + 1}.</span><span class="scramble-main">${tiles(w, scrambled(w))}<span class="write-line"></span></span></div>`);
  return `<div class="rows two-col tall" style="${fitBox(ctx.words)}">${rows.join("")}</div>`;
}

function scrambleAnswer(ctx) {
  return `<ol class="answer-order">${ctx.scrambleOrder.map((w) => `<li>${wordSpan(w)}</li>`).join("")}</ol>`;
}

function connectSheet({ words }) {
  const pick = shuffle(words).slice(0, 12);
  const right = pick.map((w) => `<div class="connect-item">${wordSpan(w)}<span class="dot"></span></div>`);
  const left = shuffle(pick).map((w) => `<div class="connect-item"><span class="dot"></span>${tiles(w, scrambled(w))}</div>`);
  return `<div class="connect"><div class="connect-col">${right.join("")}</div><div class="connect-col far">${left.join("")}</div></div>`;
}

function hiddenSheet({ words }) {
  const rows = shuffle(words).map((w, n) => {
    const he = isHebrew(w);
    const filler = he ? HEB_FILLER : ENG_FILLER;
    const randomLetters = (k) => Array.from({ length: k }, () => filler[randInt(filler.length)]);
    const before = randomLetters(1 + randInt(4));
    const after = randomLetters(1 + randInt(4));
    let line = before.concat(gridLetters(w), after);
    if (he) line = line.map((ch) => UNFINAL[ch] || ch);
    if (he) { // keep the hidden word's own final letter
      const end = before.length + gridLetters(w).length - 1;
      line[end] = gridLetters(w).slice(-1)[0];
    }
    return `<div class="hidden-row"><span class="num">${n + 1}.</span><span class="hidden-letters" dir="${he ? "rtl" : "ltr"}">${line.map((ch) => `<span>${escapeHtml(ch)}</span>`).join("")}</span></div>`;
  });
  return `<div class="rows">${rows.join("")}</div>`;
}

function codeSheet({ words }) {
  const pick = shuffle(words).slice(0, 10);
  const letters = [...new Set(pick.flatMap(gridLetters))].sort((a, b) => a.localeCompare(b, isHebrew(a) ? "he" : "en"));
  const numbers = shuffle(letters.map((_, i) => i + 1));
  const code = new Map(letters.map((ch, i) => [ch, numbers[i]]));
  const key = letters.map((ch) => `<span class="key-item"><b>${escapeHtml(ch)}</b> = ${code.get(ch)}</span>`);
  const items = pick.map((w, n) => {
    const lang = langOf(w);
    const cells = gridLetters(w).map((ch) => `<span class="code-cell"><span class="code-num">${code.get(ch)}</span><span class="box"></span></span>`);
    return `<div class="code-word"><span class="num">${n + 1}.</span><span class="code-cells" dir="${lang === "he" ? "rtl" : "ltr"}">${cells.join("")}</span></div>`;
  });
  return `<div class="code-key"><span class="bank-label">המפתח:</span>${key.join("")}</div><div class="rows two-col tall" style="${fitBox(pick)}">${items.join("")}</div>`;
}

// ---------- Spelling ----------

function missingSheet({ words }, hard) {
  const rows = shuffle(words).map((w, n) => {
    const letters = graphemes(w);
    const spots = letters.map((ch, i) => i).filter((i) => /\p{L}/u.test(letters[i]));
    const count = Math.max(1, Math.min(spots.length - 1, Math.round(spots.length * (hard ? 0.55 : 0.3))));
    const hidden = new Set(shuffle(spots).slice(0, count));
    const boxes = letters.map((ch, i) => {
      if (!/\p{L}/u.test(ch)) return `<span class="gap"></span>`;
      return hidden.has(i) ? `<span class="box empty"></span>` : `<span class="box">${escapeHtml(ch)}</span>`;
    });
    return `<div class="shape-row"><span class="num">${n + 1}.</span>${boxesSpan(w, boxes)}</div>`;
  });
  return (hard ? "" : wordBank(words)) + `<div class="rows two-col" style="${fitBox(words)}">${rows.join("")}</div>`;
}

function spellingSheet({ words }) {
  const rows = shuffle(words).map((w, n) => {
    const options = shuffle([plain(w)].concat(misspellings(w, 2)));
    return `<div class="spell-row"><span class="num">${n + 1}.</span>${options.map((o) => wordSpan(o, "w spell-option")).join("")}</div>`;
  });
  return `<div class="rows ${words.length > 14 ? "dense" : ""}">${rows.join("")}</div>`;
}

// ---------- Thinking ----------

function orderInstr({ mixed, he }) {
  if (mixed) return "כתבו את המילים בעברית לפי סדר א-ב, ואת המילים באנגלית לפי סדר ABC.";
  return he.length ? "כתבו את המילים לפי סדר א-ב." : "כתבו את המילים לפי סדר ABC.";
}

function orderSheet({ words, mixed, he, en }) {
  const groups = mixed ? [he, en] : [words];
  const blocks = groups.map((group) => {
    const lines = group.map((w, i) => `<div class="order-line"><span class="num">${i + 1}.</span><span class="write-line"></span></div>`);
    return `<div class="order-block">${groups.length > 1 ? `<div class="order-label">${isHebrew(group[0]) ? "עברית" : "English"}</div>` : ""}${lines.join("")}</div>`;
  });
  return wordBank(words) + `<div class="order-blocks ${groups.length > 1 ? "split" : "two-col"}">${blocks.join("")}</div>`;
}

function orderAnswer({ words, mixed, he, en }) {
  const groups = mixed ? [he, en] : [words];
  return groups.map((g) => `<ol class="answer-order">${alphabetical(g).map((w) => `<li>${wordSpan(w)}</li>`).join("")}</ol>`).join("");
}

function sortLengthSheet({ words }) {
  const lengths = [...new Set(words.map((w) => gridLetters(w).length))].sort((a, b) => a - b);
  // One column per length, or three ranges when there are many different lengths.
  let columns = lengths.map((len) => ({ from: len, to: len }));
  if (columns.length > 4) {
    const size = Math.ceil(lengths.length / 3);
    columns = [0, 1, 2].map((k) => lengths.slice(k * size, (k + 1) * size)).filter((g) => g.length).map((g) => ({ from: g[0], to: g[g.length - 1] }));
  }
  const cols = columns.map((c) => {
    const count = words.filter((w) => { const n = gridLetters(w).length; return n >= c.from && n <= c.to; }).length;
    const label = c.from === c.to ? `${c.from} אותיות` : `${c.from}-${c.to} אותיות`;
    return `<div class="sort-col"><div class="sort-head">${label}</div>${'<div class="order-line"><span class="write-line"></span></div>'.repeat(count)}</div>`;
  });
  return wordBank(words) + `<div class="sort-cols" style="--cols:${columns.length}">${cols.join("")}</div>`;
}

function sentenceSheet({ words }) {
  const rows = words.map((w) => `<div class="sentence-row"><div class="copy-word">${wordSpan(w)}</div><div class="write-line"></div></div>`);
  return `<div class="rows ${words.length > 14 ? "dense" : ""}">${rows.join("")}</div>`;
}

function storySheet({ words }) {
  const pick = shuffle(words).slice(0, 5);
  return `
    <div class="bank story-words"><span class="bank-label">המילים לסיפור:</span>${pick.map((w) => `<span class="bank-item"><span class="tick"></span>${wordSpan(w)}</span>`).join("")}</div>
    <div class="order-line story-title"><span class="bank-label">שם הסיפור:</span><span class="write-line"></span></div>
    <div class="story-lines">${'<div class="write-line"></div>'.repeat(14)}</div>`;
}

// ---------- Games ----------

function memorySheet({ words }) {
  const cards = shuffle(words.concat(words));
  const cols = cards.length > 30 ? 5 : 4;
  return `<div class="cards" style="--cols:${cols}">${cards.map((w) => `<div class="card">${wordSpan(w)}</div>`).join("")}</div>`;
}

function bingoSheet({ words }) {
  const n = words.length >= 16 ? 4 : words.length >= 9 ? 3 : 2;
  const board = (k) => `
    <div class="bingo">
      <div class="bingo-title">✦ בינגו! ✦ <small>לוח ${k}</small></div>
      <div class="bingo-grid" style="--n:${n}">${shuffle(words).slice(0, n * n).map((w) => `<div class="bingo-cell">${wordSpan(w)}</div>`).join("")}</div>
    </div>`;
  return `<div class="bingos">${board(1)}<div class="cut-line">✂</div>${board(2)}</div>`;
}

// ---------- Shared pieces ----------

function wordBank(words) {
  return `<div class="bank"><span class="bank-label">מחסן מילים:</span>${shuffle(words).map((w) => wordSpan(w, "w bank-word")).join("")}</div>`;
}

// Letter boxes shrink when a long word would not fit in half a page.
function fitBox(words) {
  const longest = Math.max(...words.map((w) => graphemes(w).length));
  return `--bw:${Math.min(9, 70 / longest).toFixed(2)}mm`;
}

function boxesSpan(word, boxes) {
  const lang = langOf(word);
  return `<span class="boxes" lang="${lang}" dir="${lang === "he" ? "rtl" : "ltr"}">${boxes.join("")}</span>`;
}
