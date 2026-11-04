// The 10 printable worksheets. Each function returns the inner HTML of one A4 page.
// buildSheets() decides the order and wraps every page with a header and footer.

function buildSheets(words, listTitle, withAnswers) {
  const he = words.filter(isHebrew);
  const en = words.filter((w) => !isHebrew(w));
  const mixed = he.length > 0 && en.length > 0;

  // Mixed lists get one word search per language; otherwise an easy one and a hard one.
  const search1 = mixed
    ? { words: he, hard: false, title: "תפזורת - מילים בעברית" }
    : { words, hard: false, title: "תפזורת" };
  const search2 = mixed
    ? { words: en, hard: false, title: "תפזורת - מילים באנגלית" }
    : { words, hard: true, title: "תפזורת לאלופים" };
  search1.puzzle = makeWordSearch(search1.words, search1.hard);
  search2.puzzle = makeWordSearch(search2.words, search2.hard);

  const sorted = mixed ? [alphabetical(he), alphabetical(en)] : [alphabetical(words)];

  const pages = [
    { title: "כותבים שוב ושוב", instr: "העתיקו כל מילה שלוש פעמים, בכתב יפה ומסודר.", body: copySheet(words) },
    { title: "מילים במשבצות", instr: "האות הראשונה כבר כתובה. מצאו במחסן איזו מילה מתאימה למשבצות, וכתבו אות אחת בכל משבצת.", body: shapesSheet(words) },
    { title: search1.title, instr: searchInstr(search1), body: searchSheet(search1) },
    { title: "אותיות שהלכו לאיבוד", instr: "השלימו את האותיות החסרות בכל מילה. אפשר להיעזר במחסן המילים.", body: missingSheet(words, false) },
    { title: "מסתכלים, מכסים, כותבים", instr: "קראו את המילה, קפלו את הדף או כסו אותה, כתבו אותה מהזיכרון, ואז בדקו. סמנו ✓ אם צדקתם, ונסו שוב בעמודה האחרונה.", body: lookCoverSheet(words) },
    { title: "לפי הסדר", instr: mixed ? "כתבו את המילים בעברית לפי סדר א-ב, ואת המילים באנגלית לפי סדר ABC." : (he.length ? "כתבו את המילים לפי סדר א-ב." : "כתבו את המילים לפי סדר ABC."), body: orderSheet(words, mixed ? [he, en] : [words]) },
    { title: search2.title, instr: searchInstr(search2), body: searchSheet(search2) },
    { title: "אותיות שהלכו לאיבוד 2", instr: "הפעם חסרות יותר אותיות! השלימו כל מילה.", body: missingSheet(words, true) },
    { title: "כל מילה במשפט", instr: "כתבו משפט שיש בו את המילה. נסו שכל משפט יהיה שונה.", body: sentenceSheet(words) },
    { title: "משחק זיכרון לגזירה", instr: "גזרו את הקלפים לאורך הקווים, הפכו אותם, ונסו למצוא זוגות של אותה מילה. מי שמוצא זוג - קורא את המילה בקול!", body: memorySheet(words) },
  ];

  if (withAnswers) {
    pages.push({ title: "פתרונות", instr: "לבדיקה בסוף (למבוגרים).", body: answersSheet(search1, search2, sorted), answers: true });
  }

  const total = 10;
  return pages
    .map((p, i) => `
      <section class="sheet">
        <header class="sheet-head">
          <div>
            <div class="sheet-title">${escapeHtml(p.title)}</div>
            ${listTitle ? `<div class="sheet-list">${escapeHtml(listTitle)}</div>` : ""}
          </div>
          <div class="sheet-name">שם: <span class="blank"></span> &nbsp; תאריך: <span class="blank short"></span></div>
        </header>
        <p class="sheet-instr">${p.instr}</p>
        <div class="sheet-body">${p.body}</div>
        <footer class="sheet-foot">${p.answers ? "פתרונות" : `דף ${i + 1} מתוך ${total}`}</footer>
      </section>`)
    .join("");
}

// 1. Write each word three times.
function copySheet(words) {
  const rows = words.map((w) => `
    <div class="copy-row">
      <div class="copy-word">${wordSpan(w)}</div>
      <div class="write-line"></div><div class="write-line"></div><div class="write-line"></div>
    </div>`);
  return `<div class="rows ${words.length > 14 ? "dense" : ""}">${rows.join("")}</div>`;
}

// 2. Word shapes: empty boxes for each word, first letter given, words in a bank.
function shapesSheet(words) {
  const rows = shuffle(words).map((w, n) => {
    const letters = graphemes(plain(w));
    let first = true;
    const boxes = letters.map((ch) => {
      if (ch === " " || ch === "-") return `<span class="gap"></span>`;
      if (first) { first = false; return `<span class="box">${escapeHtml(ch)}</span>`; }
      return `<span class="box"></span>`;
    });
    return `<div class="shape-row"><span class="num">${n + 1}.</span>${boxesSpan(w, boxes)}</div>`;
  });
  return wordBank(words) + `<div class="rows two-col">${rows.join("")}</div>`;
}

// 4 and 8. Missing letters.
function missingSheet(words, hard) {
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
  return wordBank(words) + `<div class="rows two-col">${rows.join("")}</div>`;
}

// 5. Look, cover, write, check.
function lookCoverSheet(words) {
  const rows = words.map((w) => `
    <tr><td class="lc-word">${wordSpan(w)}</td><td class="fold"></td><td></td><td class="check"></td><td></td></tr>`);
  return `
    <table class="lc ${words.length > 14 ? "dense" : ""}">
      <thead><tr><th>1. מסתכלים</th><th class="fold">2. מכסים וכותבים</th><th>3. בודקים</th><th class="check">✓</th><th>4. כותבים שוב</th></tr></thead>
      <tbody>${rows.join("")}</tbody>
    </table>`;
}

// 6. Alphabetical order.
function orderSheet(words, groups) {
  const blocks = groups.map((group) => {
    const lines = group.map((w, i) => `<div class="order-line"><span class="num">${i + 1}.</span><span class="write-line"></span></div>`);
    return `<div class="order-block">${groups.length > 1 ? `<div class="order-label">${isHebrew(group[0]) ? "עברית" : "English"}</div>` : ""}${lines.join("")}</div>`;
  });
  return wordBank(words) + `<div class="order-blocks ${groups.length > 1 ? "split" : "two-col"}">${blocks.join("")}</div>`;
}

// 3 and 7. Word search.
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

function gridTable(puzzle, showAnswers, small) {
  const marked = new Set();
  if (showAnswers) puzzle.placed.forEach((p) => p.cells.forEach(([x, y]) => marked.add(`${x},${y}`)));
  const cellMm = Math.min(small ? 7 : 12, (small ? 84 : 172) / puzzle.size);
  const rows = puzzle.grid.map((row, y) =>
    `<tr>${row.map((ch, x) => `<td class="${marked.has(`${x},${y}`) ? "hit" : ""}">${escapeHtml(ch)}</td>`).join("")}</tr>`);
  return `<table class="grid" dir="ltr" style="--cell:${cellMm.toFixed(2)}mm">${rows.join("")}</table>`;
}

// 9. A sentence with every word.
function sentenceSheet(words) {
  const rows = words.map((w) => `<div class="sentence-row"><div class="copy-word">${wordSpan(w)}</div><div class="write-line"></div></div>`);
  return `<div class="rows ${words.length > 14 ? "dense" : ""}">${rows.join("")}</div>`;
}

// 10. Memory cards to cut out: every word appears twice.
function memorySheet(words) {
  const cards = shuffle(words.concat(words));
  const cols = cards.length > 30 ? 5 : 4;
  return `<div class="cards" style="--cols:${cols}">${cards.map((w) => `<div class="card">${wordSpan(w)}</div>`).join("")}</div>`;
}

// Answers for both word searches and the alphabetical order page.
function answersSheet(search1, search2, sorted) {
  const grids = [search1, search2]
    .filter((s) => s.puzzle)
    .map((s) => `<div class="answer-block"><div class="order-label">${escapeHtml(s.title)}</div>${gridTable(s.puzzle, true, true)}</div>`);
  const order = sorted.map((list) => `<ol class="answer-order">${list.map((w) => `<li>${wordSpan(w)}</li>`).join("")}</ol>`);
  return `<div class="answers">${grids.join("")}</div><div class="order-label">לפי הסדר</div><div class="answers">${order.join("")}</div>`;
}

function wordBank(words) {
  return `<div class="bank"><span class="bank-label">מחסן מילים:</span>${shuffle(words).map((w) => wordSpan(w, "w bank-word")).join("")}</div>`;
}

function boxesSpan(word, boxes) {
  const lang = langOf(word);
  return `<span class="boxes" lang="${lang}" dir="${lang === "he" ? "rtl" : "ltr"}">${boxes.join("")}</span>`;
}
