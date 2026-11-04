// The printable worksheets. There is a pool of page types in five groups; every test
// picks 10 of them at random (see PATTERN), so each new test gives different pages.
// The test's seed makes the choice repeatable, so a saved test rebuilds the same pages.

const POOL_VERSION = 3; // raise when adding page types, and mark them with since: <new version>

const PATTERN = ["write", "puzzle", "spell", "write", "puzzle", "think", "spell", "puzzle", "write", "game"];

const PAGE_TYPES = [
  // Writing practice
  { id: "copy", cat: "write", title: "כותבים שוב ושוב", instr: () => "העתיקו כל מילה שלוש פעמים, בכתב יפה ומסודר.", body: copySheet },
  { id: "trace", cat: "write", title: "עוברים על הקו", instr: () => "עברו בעיפרון על המילים החלולות, ואז כתבו כל מילה לבד על הקו.", body: traceSheet },
  { id: "pyramid", cat: "write", title: "מגדלי מילים", instr: () => "בנו מגדל מכל מילה: בשורה הראשונה האות הראשונה, ובכל שורה מוסיפים עוד אות.", body: pyramidSheet },
  { id: "lookCover", cat: "write", title: "מסתכלים, מכסים, כותבים", instr: () => "קראו את המילה, קפלו את הדף או כסו אותה, כתבו אותה מהזיכרון, ואז בדקו. סמנו ✓ אם צדקתם, ונסו שוב בעמודה האחרונה.", body: lookCoverSheet },
  { id: "shapes", cat: "write", title: "מילים במשבצות", instr: () => "האות הראשונה כבר כתובה. מצאו במחסן איזו מילה מתאימה למשבצות, וכתבו אות אחת בכל משבצת.", body: shapesSheet },
  { id: "tickets", since: 3, cat: "write", title: "כרטיסים להופעה", instr: () => "כל מילה היא כרטיס VIP להופעה! כתבו את המילה פעמיים על הכרטיס שלה.", body: ticketsSheet },
  { id: "sizes", since: 3, cat: "write", title: "גדול, בינוני, קטן", instr: () => "כתבו כל מילה שלוש פעמים: בגדול, בבינוני ובקטן. נסו שהאותיות יישארו יפות בכל גודל!", body: sizesSheet },
  { id: "dictation", since: 2, cat: "write", title: "הכתבה", instr: () => "למבוגר: גזרו או קפלו את הרצועה שבתחתית הדף, והקריאו את המילים אחת אחרי השנייה. לילד/ה: כתבו כל מילה ששמעתם על קו.", body: dictationSheet },

  // Puzzles
  { id: "search", cat: "puzzle", title: (c) => (c.mixed ? "תפזורת - מילים בעברית" : "תפזורת"), instr: (c) => searchInstr(c.search1), body: (c) => searchSheet(c.search1), answers: (c) => searchAnswer(c.search1) },
  { id: "searchHard", cat: "puzzle", title: (c) => (c.mixed ? "תפזורת - מילים באנגלית" : "תפזורת לאלופים"), instr: (c) => searchInstr(c.search2), body: (c) => searchSheet(c.search2), answers: (c) => searchAnswer(c.search2) },
  { id: "scramble", cat: "puzzle", title: "אותיות מבולבלות", instr: () => "האותיות התבלבלו! סדרו אותן וכתבו את המילה על הקו.", body: scrambleSheet, answers: scrambleAnswer },
  { id: "connect", cat: "puzzle", title: "מותחים קו", instr: () => "חברו בקו כל מילה לאותיות המבולבלות שלה.", body: connectSheet },
  { id: "hidden", cat: "puzzle", title: "המילה המתחבאת", instr: () => "בכל שורה מתחבאת מילה מהרשימה בין אותיות אחרות. מצאו אותה והקיפו אותה.", body: hiddenSheet },
  { id: "maze", since: 3, cat: "puzzle", title: "מבוך האיות", instr: () => "צבעו רק את המילים שכתובות נכון, וכך תגלו את הדרך מההתחלה אל הגביע! זזים רק לצדדים או למטה.", body: mazeSheet, answers: mazeAnswer },
  { id: "crossword", since: 2, cat: "puzzle", title: "תשבץ מילים", instr: () => "שבצו את המילים מהמחסן במשבצות: מילה אחת בכל שורה או טור, לפי מספר המשבצות והאותיות שנפגשות. התחילו מהמילה הארוכה!", body: crosswordSheet, answers: crosswordAnswer },
  { id: "broken", since: 2, cat: "puzzle", title: "מילים שבורות", instr: () => "כל מילה נשברה לשני חלקים. חברו בקו כל התחלה לסוף שלה, וכתבו את המילה המלאה על הקו.", body: brokenSheet },
  { id: "code", cat: "puzzle", title: "הקוד הסודי", instr: () => "כל מספר הוא אות. היעזרו במפתח, וכתבו את האות מתחת לכל מספר כדי לגלות את המילים.", body: codeSheet },

  // Spelling
  { id: "missing", cat: "spell", title: "אותיות שהלכו לאיבוד", instr: () => "השלימו את האותיות החסרות בכל מילה. אפשר להיעזר במחסן המילים.", body: (c) => missingSheet(c, false) },
  { id: "missingHard", cat: "spell", title: "אותיות שהלכו לאיבוד 2", instr: () => "הפעם חסרות יותר אותיות! השלימו כל מילה.", body: (c) => missingSheet(c, true) },
  { id: "hunt", since: 3, cat: "spell", title: "צדים אותיות", instr: huntInstr, body: huntSheet },
  { id: "edges", since: 3, cat: "spell", title: "התחלה וסוף", instr: () => "לכל מילה חסרות האות הראשונה והאות האחרונה. השלימו אותן! אפשר להיעזר במחסן.", body: edgesSheet },
  { id: "trueFalse", since: 3, cat: "spell", title: "נכון או לא נכון?", instr: () => "חלק מהמילים כתובות נכון וחלק עם טעות. סמנו ✓ או ✗, ואם יש טעות - כתבו את המילה הנכונה.", body: trueFalseSheet, answers: trueFalseAnswer },
  { id: "fix", since: 2, cat: "spell", title: "תקנו את הטעות", instr: () => "בכל מילה יש טעות אחת! כתבו את המילה הנכונה על הקו.", body: fixSheet, answers: fixAnswer },
  { id: "spelling", cat: "spell", title: "מי כתוב נכון?", instr: () => "בכל שורה רק מילה אחת כתובה נכון. הקיפו אותה!", body: spellingSheet },

  // Thinking
  { id: "order", cat: "think", title: "לפי הסדר", instr: orderInstr, body: orderSheet, answers: orderAnswer },
  { id: "sortLength", cat: "think", title: "קצרות וארוכות", instr: () => "ספרו כמה אותיות יש בכל מילה, וכתבו אותה בעמודה המתאימה.", body: sortLengthSheet },
  { id: "sentence", cat: "think", title: "כל מילה במשפט", instr: () => "כתבו משפט שיש בו את המילה. נסו שכל משפט יהיה שונה.", body: sentenceSheet },
  { id: "draw", since: 3, cat: "think", title: "ציירו את המילה", instr: () => "ציירו ציור לכל מילה, וכתבו את המילה על הקו שמתחת לציור.", body: drawSheet },
  { id: "comic", since: 3, cat: "think", title: "קומיקס של מילים", instr: () => "כתבו קומיקס! השתמשו במילים מהתיבה בבועות הדיבור, וציירו את הדמויות בכל משבצת.", body: comicSheet },
  { id: "rate", since: 3, cat: "think", title: "מה קל לי?", instr: () => "כתבו כל מילה בעמודה שמתאימה לכם. את המילה הכי קשה - מתרגלים עוד בתחתית הדף!", body: rateSheet },
  { id: "detective", since: 2, cat: "think", title: "בלשי מילים", instr: () => "חקרו כל מילה: מה האות הראשונה שלה, מה האות האחרונה, וכמה אותיות יש בה?", body: detectiveSheet },
  { id: "story", cat: "think", title: "סיפור קטן", instr: () => "כתבו סיפור קצר שיש בו את כל המילים בתיבה. סמנו ✓ ליד כל מילה שהשתמשתם בה.", body: storySheet },

  // Games to cut out and play
  { id: "memory", cat: "game", title: "משחק זיכרון לגזירה", instr: () => "גזרו את הקלפים לאורך הקווים, הפכו אותם, ונסו למצוא זוגות של אותה מילה. מי שמוצא זוג - קורא את המילה בקול!", body: memorySheet },
  { id: "dice", since: 3, cat: "game", title: "קוביית אתגרים", instr: () => "זורקים קובייה, בוחרים מילה מהרשימה ועושים את האתגר שיצא. מסמנים לב ליד המילה בכל פעם שעשיתם איתה אתגר!", body: diceSheet },
  { id: "penalties", since: 3, cat: "game", title: "פנדלים של מילים", instr: () => "משחקות בזוגות: אחת מקריאה מילה, השנייה מאייתת בלי להסתכל. נכון? גול! צבעו את הכדור. מחליפות תפקידים, ומי שמבקיעה יותר - מנצחת!", body: penaltiesSheet },
  { id: "jigsaw", since: 3, cat: "game", title: "פאזל מילים לגזירה", instr: () => "גזרו את כל החלקים, ערבבו אותם, והרכיבו מחדש את המילים. אפשר להתחרות מי מרכיבה יותר מהר!", body: jigsawSheet },
  { id: "board", since: 2, cat: "game", title: "מירוץ המילים", instr: () => "משחק לוח ל-2 עד 4 שחקנים: צריך קובייה וחפץ קטן לכל שחקן. זורקים, מתקדמים, וקוראים את המילה במשבצת. מצליחים לאיית אותה בלי להסתכל? נשארים. טעיתם? חוזרים משבצת אחת. מי שמגיע ראשון לסיום - מנצח!", body: boardSheet },
  { id: "tictac", since: 2, cat: "game", title: "איקס עיגול של מילים", instr: () => "משחקים בזוגות. כדי לסמן X או O במשבצת, קוראים את המילה ומאייתים אותה בעל פה - השותף בודק. שלושה בשורה מנצחים!", body: tictacSheet },
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
    // Tests saved before new page types were added keep using the old pool, so they still rebuild the same pages.
    const pool = PAGE_TYPES.filter((type) => (type.since || 1) <= (test.version || 1));
    for (const type of shuffle(pool)) (pools[type.cat] = pools[type.cat] || []).push(type);
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

    // Decorations use their own random numbers, so they never change the content of a saved test.
    const deco = seededRandom(test.seed ^ 0x5bd1e995);
    const pick = (list) => list[Math.floor(deco() * list.length)];
    const themes = THEMES.map((t) => [deco(), t]).sort((a, b) => a[0] - b[0]).map((pair) => pair[1]);
    return pages.map((p, i) => {
      const theme = themes[i % themes.length];
      return sheetHtml(test.name, p, i + 1, chosen.length, { theme, mascot: pick(SQUISHIES), cheer: pick(theme.cheers) });
    }).join("");
  });
}

function sheetHtml(name, page, n, total, look) {
  const [a, b] = look.theme.stickers;
  return `
    <section class="sheet theme-${look.theme.id}">
      <div class="sheet-bg">${sticker(b, "bg-sticker")}</div>
      <header class="sheet-head">
        <div class="head-band">
          ${sticker(a, "head-sticker s1")}
          <div class="head-text">
            <div class="sheet-brand">✦ עלמה תירגולים ✦</div>
            <h2 class="sheet-test">${escapeHtml(name)}</h2>
          </div>
          ${sticker(b, "head-sticker s2")}
        </div>
        <div class="sheet-sub">
          <span class="sheet-pill">${page.isAnswers ? "" : `<b>${n}</b>`}${escapeHtml(page.title)}</span>
          <span class="sheet-name">שם: <span class="blank"></span> &nbsp; תאריך: <span class="blank short"></span></span>
        </div>
      </header>
      <div class="sheet-instr">${sticker(look.mascot, "mascot")}<p class="bubble">${page.instr}</p></div>
      <div class="sheet-body">${page.body}</div>
      <footer class="sheet-foot">
        <span class="cheer">${page.isAnswers ? "♡ פתרונות ♡" : escapeHtml(look.cheer)}</span>
        <span>${page.isAnswers ? "" : `♡ דף ${n} מתוך ${total} ♡`}</span>
        <span class="rating">${page.isAnswers ? "" : "איך היה? ☆ ☆ ☆"}</span>
      </footer>
    </section>`;
}

// ---------- Writing ----------

function ticketsSheet({ words }) {
  const art = ["star", "mic", "lightstick", "heart", "notes", "crown"];
  const cards = words.map((w, i) => `
    <div class="ticket">
      <div class="ticket-stub">${sticker(art[i % art.length], "ticket-art")}<span>VIP</span></div>
      <div class="ticket-main">
        <div class="ticket-word">${wordSpan(w)}</div>
        <div class="write-line"></div><div class="write-line"></div>
      </div>
    </div>`);
  return `<div class="tickets ${words.length > 14 ? "dense" : ""}">${cards.join("")}</div>`;
}

function sizesSheet({ words }) {
  const rows = words.map((w) => `
    <div class="copy-row sizes-row">
      <div class="copy-word">${wordSpan(w)}</div>
      <div class="write-line big"></div><div class="write-line mid"></div><div class="write-line small"></div>
    </div>`);
  return `<div class="rows ${words.length > 14 ? "dense" : ""}">${rows.join("")}</div>`;
}

function dictationSheet({ words }) {
  const lines = words.map((w, i) => `<div class="order-line"><span class="num">${i + 1}</span><span class="write-line"></span></div>`);
  const list = shuffle(words).map((w, i) => `<span>${i + 1}. ${wordSpan(w)}</span>`);
  return `
    <div class="order-blocks two-col">${lines.join("")}</div>
    <div class="dictation-strip"><div class="cut-line">✂</div><span class="bank-label">למבוגר - להקריא לפי הסדר:</span><div class="dictation-list">${list.join("")}</div></div>`;
}

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
  const box = Math.min(7, 64 / longest, 56 / (longest + 1.5)); // 3 rows of towers must fit on the page
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
    return `<div class="shape-row"><span class="num">${n + 1}</span>${boxesSpan(w, boxes)}</div>`;
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
  const cellMm = Math.min(small ? 6 : 12, (small ? 78 : 152) / puzzle.size);
  const rows = puzzle.grid.map((row, y) =>
    `<tr>${row.map((ch, x) => `<td class="${marked.has(`${x},${y}`) ? "hit" : ""}">${escapeHtml(ch)}</td>`).join("")}</tr>`);
  return `<table class="grid" dir="ltr" style="--cell:${cellMm.toFixed(2)}mm">${rows.join("")}</table>`;
}

// Crossword: words cross each other where they share a letter.
// x runs in reading direction (right to left for Hebrew), y runs down.
// Tries many arrangements and keeps the one that fits the most words.
function makeCrossword(words) {
  const items = words.map((word) => ({ word, letters: gridLetters(word) })).filter((it) => it.letters.length > 1);
  if (items.length < 2) return null;
  const longestFirst = items.slice().sort((a, b) => b.letters.length - a.letters.length);
  let best = null;
  for (let attempt = 0; attempt < 40 && (!best || best.placed.length < items.length); attempt++) {
    const order = attempt === 0 ? longestFirst : [longestFirst[randInt(Math.min(3, items.length))]].concat(shuffle(items));
    const result = buildCrossword([...new Set(order)]);
    if (!best || result.placed.length > best.placed.length) best = result;
  }
  return best;
}

function buildCrossword(items) {
  const cells = new Map(); // "x,y" -> { ch, h, v }
  const get = (x, y) => cells.get(`${x},${y}`);
  const placed = [];

  // Returns how many letters the word would share with words already placed, or -1 if it can't go there.
  const fits = (letters, x, y, horiz) => {
    const dx = horiz ? 1 : 0, dy = horiz ? 0 : 1;
    if (get(x - dx, y - dy) || get(x + dx * letters.length, y + dy * letters.length)) return -1;
    let crossings = 0;
    for (let i = 0; i < letters.length; i++) {
      const cx = x + dx * i, cy = y + dy * i;
      const cell = get(cx, cy);
      if (cell) {
        if (cell.ch !== letters[i] || (horiz ? cell.h : cell.v)) return -1;
        crossings++;
      } else if (horiz ? get(cx, cy - 1) || get(cx, cy + 1) : get(cx - 1, cy) || get(cx + 1, cy)) {
        return -1;
      }
    }
    return crossings;
  };
  const put = (item, x, y, horiz) => {
    item.letters.forEach((ch, i) => {
      const cx = x + (horiz ? i : 0), cy = y + (horiz ? 0 : i);
      const cell = get(cx, cy) || { ch };
      cell[horiz ? "h" : "v"] = true;
      cells.set(`${cx},${cy}`, cell);
    });
    placed.push({ word: item.word, x, y, horiz });
  };

  put(items[0], 0, 0, true);
  for (const item of items.slice(1)) {
    const options = [];
    for (const [key, cell] of cells) {
      const [cx, cy] = key.split(",").map(Number);
      item.letters.forEach((ch, i) => {
        if (ch !== cell.ch) return;
        for (const horiz of [true, false]) {
          const x = horiz ? cx - i : cx, y = horiz ? cy : cy - i;
          if (fits(item.letters, x, y, horiz) > 0) options.push([x, y, horiz]);
        }
      });
    }
    if (options.length) put(item, ...options[randInt(options.length)]);
  }

  const xs = [...cells.keys()].map((k) => +k.split(",")[0]);
  const ys = [...cells.keys()].map((k) => +k.split(",")[1]);
  const minX = Math.min(...xs), minY = Math.min(...ys);
  const width = Math.max(...xs) - minX + 1, height = Math.max(...ys) - minY + 1;
  const grid = Array.from({ length: height }, (_, y) => Array.from({ length: width }, (_, x) => (get(x + minX, y + minY) || {}).ch || ""));
  // Number the start of each word, top to bottom, in reading order.
  const starts = [...new Set(placed.map((p) => `${p.x - minX},${p.y - minY}`))]
    .map((k) => k.split(",").map(Number)).sort((a, b) => a[1] - b[1] || a[0] - b[0]);
  const numbers = new Map(starts.map(([x, y], i) => [`${x},${y}`, i + 1]));
  return { grid, width, height, numbers, placed, he: isHebrew(items[0].word) };
}

function crosswordSheet(ctx) {
  // A crossword needs one language; mixed lists use the bigger group.
  ctx.crossword = makeCrossword(ctx.mixed ? (ctx.he.length >= ctx.en.length ? ctx.he : ctx.en) : ctx.words);
  const cw = ctx.crossword;
  if (!cw) return `<p class="note">צריך לפחות שתי מילים כדי לבנות תשבץ.</p>`;
  const bank = `<div class="bank"><span class="bank-label">מחסן מילים:</span>${shuffle(cw.placed).map((p) => wordSpan(p.word, "w bank-word")).join("")}</div>`;
  return bank + crosswordTable(cw, false, 180, 160);
}

function crosswordAnswer(ctx) {
  return ctx.crossword ? crosswordTable(ctx.crossword, true, 84, 84) : "";
}

function crosswordTable(cw, showAnswers, maxW, maxH) {
  const cell = Math.min(11, maxW / cw.width, maxH / cw.height);
  const rows = cw.grid.map((row, y) => `<tr>${row.map((ch, x) => {
    if (!ch) return '<td class="cw-empty"></td>';
    const n = cw.numbers.get(`${x},${y}`);
    return `<td class="cw-cell">${n ? `<span class="cw-num">${n}</span>` : ""}${showAnswers ? escapeHtml(ch) : ""}</td>`;
  }).join("")}</tr>`);
  return `<table class="crossword" dir="${cw.he ? "rtl" : "ltr"}" style="--cell:${cell.toFixed(2)}mm">${rows.join("")}</table>`;
}

function brokenSheet({ words }) {
  const pick = shuffle(words.filter((w) => gridLetters(w).length >= 3)).slice(0, 10);
  const parts = pick.map((w) => {
    const letters = graphemes(plain(w));
    const at = Math.min(Math.max(Math.ceil(letters.length / 2) - randInt(2), 1), letters.length - 1);
    return { start: letters.slice(0, at).join(""), end: letters.slice(at).join(""), word: w };
  });
  const starts = parts.map((p) => `<div class="connect-item">${halfSpan(p.word, p.start, false)}<span class="dot"></span></div>`);
  const ends = shuffle(parts).map((p) => `<div class="connect-item"><span class="dot"></span>${halfSpan(p.word, p.end, true)}</div>`);
  const lines = parts.map((p, i) => `<div class="order-line"><span class="num">${i + 1}</span><span class="write-line"></span></div>`);
  return `
    <div class="connect broken"><div class="connect-col">${starts.join("")}</div><div class="connect-col far">${ends.join("")}</div></div>
    <div class="order-label">המילים המלאות:</div>
    <div class="order-blocks two-col">${lines.join("")}</div>`;
}

// Half a word with "…" on the side where the missing half goes (works for both directions).
function halfSpan(word, text, dotsFirst) {
  const lang = langOf(word);
  const dots = '<span class="dots">…</span>';
  return `<span class="w half" lang="${lang}" dir="${lang === "he" ? "rtl" : "ltr"}">${dotsFirst ? dots : ""}<span>${escapeHtml(text)}</span>${dotsFirst ? "" : dots}</span>`;
}

// Spelling maze: correctly spelled words make a path from the start to the trophy;
// every other square holds a misspelled word.
function mazeSheet(ctx) {
  const good = ctx.words.filter((w) => misspellings(w, 1).length);
  if (good.length < 2) return `<p class="note">המילים קצרות מדי בשביל מבוך. נסו מילים ארוכות יותר.</p>`;
  const cols = 5, rows = 6;
  const path = new Set(["0,0"]);
  let x = 0, y = 0;
  while (x < cols - 1 || y < rows - 1) {
    if (y === rows - 1 || (x < cols - 1 && randInt(2))) x++;
    else y++;
    path.add(`${x},${y}`);
  }
  let pool = [];
  const nextWord = () => { if (!pool.length) pool = shuffle(good); return pool.pop(); };
  const cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const w = nextWord();
      const onPath = path.has(`${c},${r}`);
      const shown = onPath ? plain(w) : misspellings(w, 1)[0];
      const mark = c === 0 && r === 0 ? '<span class="maze-tag">התחלה</span>' : c === cols - 1 && r === rows - 1 ? sticker("trophy", "maze-trophy") : "";
      cells.push({ html: `<div class="maze-cell">${mark}${wordSpan(shown)}</div>`, onPath });
    }
  }
  ctx.maze = { cells, cols };
  const dir = isHebrew(good[0]) ? "rtl" : "ltr";
  return `<div class="maze" dir="${dir}">${cells.map((c) => c.html).join("")}</div>`;
}

function mazeAnswer(ctx) {
  if (!ctx.maze) return "";
  return `<div class="maze small">${ctx.maze.cells.map((c) => (c.onPath ? c.html.replace("maze-cell", "maze-cell hit") : c.html)).join("")}</div>`;
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
    <div class="scramble-row"><span class="num">${n + 1}</span><span class="scramble-main">${tiles(w, scrambled(w))}<span class="write-line"></span></span></div>`);
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
    return `<div class="hidden-row"><span class="num">${n + 1}</span><span class="hidden-letters" dir="${he ? "rtl" : "ltr"}">${line.map((ch) => `<span>${escapeHtml(ch)}</span>`).join("")}</span></div>`;
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
    return `<div class="code-word"><span class="num">${n + 1}</span><span class="code-cells" dir="${lang === "he" ? "rtl" : "ltr"}">${cells.join("")}</span></div>`;
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
    return `<div class="shape-row"><span class="num">${n + 1}</span>${boxesSpan(w, boxes)}</div>`;
  });
  return (hard ? "" : wordBank(words)) + `<div class="rows two-col" style="${fitBox(words)}">${rows.join("")}</div>`;
}

function fixSheet(ctx) {
  ctx.fixOrder = shuffle(ctx.words).map((w) => ({ word: w, wrong: misspellings(w, 1)[0] })).filter((p) => p.wrong);
  const rows = ctx.fixOrder.map((p, n) => `<div class="fix-row"><span class="num">${n + 1}</span><span class="fix-wrong">${wordSpan(p.wrong)}</span><span class="write-line"></span></div>`);
  return `<div class="rows two-col">${rows.join("")}</div>`;
}

function fixAnswer(ctx) {
  return `<ol class="answer-order">${ctx.fixOrder.map((p) => `<li>${wordSpan(p.word)}</li>`).join("")}</ol>`;
}

// The letter that appears most often in the words (one per language).
function huntLetters({ he, en }) {
  return [he, en].filter((g) => g.length).map((group) => {
    const counts = new Map();
    group.forEach((w) => gridLetters(w).forEach((ch) => { const k = UNFINAL[ch] || ch; counts.set(k, (counts.get(k) || 0) + 1); }));
    const most = Math.max(...counts.values());
    const top = [...counts].filter(([, n]) => n === most).map(([k]) => k);
    return { letter: top[randInt(top.length)], words: group };
  });
}

function huntInstr(ctx) {
  ctx.hunt = ctx.hunt || huntLetters(ctx);
  return "צדו את האות! הקיפו אותה בכל מילה שהיא מופיעה בה, וכתבו כמה פעמים מצאתם אותה.";
}

function huntSheet(ctx) {
  ctx.hunt = ctx.hunt || huntLetters(ctx);
  const badges = ctx.hunt.map((h) => `<span class="hunt-badge">${sticker("star", "hunt-art")}<b>${escapeHtml(h.letter)}</b></span>`).join("");
  const rows = shuffle(ctx.words).map((w) => `
    <div class="hunt-row"><span class="hunt-word" dir="${isHebrew(w) ? "rtl" : "ltr"}">${graphemes(plain(w)).map((ch) => `<span>${escapeHtml(ch)}</span>`).join("")}</span><span class="hunt-count">× ___</span></div>`);
  return `<div class="hunt-top">האות שצדים: ${badges}</div><div class="rows two-col">${rows.join("")}</div>`;
}

function edgesSheet({ words }) {
  const rows = shuffle(words).map((w, n) => {
    const letters = graphemes(w);
    const spots = letters.map((ch, i) => i).filter((i) => /\p{L}/u.test(letters[i]));
    const hidden = new Set(spots.length >= 3 ? [spots[0], spots[spots.length - 1]] : [spots[0]]);
    const boxes = letters.map((ch, i) => {
      if (!/\p{L}/u.test(ch)) return `<span class="gap"></span>`;
      return hidden.has(i) ? `<span class="box empty"></span>` : `<span class="box">${escapeHtml(ch)}</span>`;
    });
    return `<div class="shape-row"><span class="num">${n + 1}</span>${boxesSpan(w, boxes)}</div>`;
  });
  return wordBank(words) + `<div class="rows two-col" style="${fitBox(words)}">${rows.join("")}</div>`;
}

function trueFalseSheet(ctx) {
  ctx.trueFalse = shuffle(ctx.words).map((w) => {
    const wrong = randInt(2) ? misspellings(w, 1)[0] : null;
    return { word: w, shown: wrong || plain(w), correct: !wrong };
  });
  const rows = ctx.trueFalse.map((r) => `<tr><td class="lc-word">${wordSpan(r.shown)}</td><td class="check">✓</td><td class="check">✗</td><td></td></tr>`);
  return `
    <table class="lc tf ${ctx.words.length > 14 ? "dense" : ""}">
      <thead><tr><th>המילה</th><th class="check">נכון</th><th class="check">טעות</th><th>אם יש טעות - כתבו נכון</th></tr></thead>
      <tbody>${rows.join("")}</tbody>
    </table>`;
}

function trueFalseAnswer(ctx) {
  return `<ol class="answer-order">${ctx.trueFalse.map((r) => `<li>${r.correct ? "✓" : "✗"} ${wordSpan(r.word)}</li>`).join("")}</ol>`;
}

function spellingSheet({ words }) {
  const rows = shuffle(words).map((w, n) => {
    const options = shuffle([plain(w)].concat(misspellings(w, 2)));
    return `<div class="spell-row"><span class="num">${n + 1}</span>${options.map((o) => wordSpan(o, "w spell-option")).join("")}</div>`;
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
    const lines = group.map((w, i) => `<div class="order-line"><span class="num">${i + 1}</span><span class="write-line"></span></div>`);
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

function detectiveSheet({ words }) {
  const rows = shuffle(words).map((w) => `<tr><td class="lc-word">${wordSpan(w)}</td><td></td><td></td><td></td><td></td></tr>`);
  return `
    <table class="lc ${words.length > 14 ? "dense" : ""}">
      <thead><tr><th>המילה</th><th>🔎 אות ראשונה</th><th>🔎 אות אחרונה</th><th>כמה אותיות?</th><th>✍️ כתבו שוב</th></tr></thead>
      <tbody>${rows.join("")}</tbody>
    </table>`;
}

function drawSheet({ words }) {
  const pick = shuffle(words).slice(0, 6);
  const art = ["bun", "star", "heart", "cat", "strawberry", "sparkle"];
  return `<div class="draw-grid">${pick.map((w, i) => `
    <div class="draw-box">
      ${sticker(art[i], "draw-corner")}
      <div class="draw-area"></div>
      <div class="draw-word">${wordSpan(w)}</div>
      <div class="write-line"></div>
    </div>`).join("")}</div>`;
}

function comicSheet({ words }) {
  const pick = shuffle(words).slice(0, 4);
  const panels = [1, 2, 3, 4].map((n) => `
    <div class="comic-panel">
      <span class="comic-num">${n}</span>
      <div class="comic-bubble"><div class="write-line"></div><div class="write-line"></div></div>
    </div>`);
  return `<div class="bank story-words"><span class="bank-label">המילים לקומיקס:</span>${pick.map((w) => `<span class="bank-item"><span class="tick"></span>${wordSpan(w)}</span>`).join("")}</div>
    <div class="order-line story-title"><span class="bank-label">שם הקומיקס:</span><span class="write-line"></span></div>
    <div class="comic">${panels.join("")}</div>`;
}

function rateSheet({ words }) {
  const lines = (n) => '<div class="order-line"><span class="write-line"></span></div>'.repeat(n);
  const n = Math.ceil(words.length / 2);
  const col = (art, label) => `<div class="sort-col"><div class="sort-head">${sticker(art, "rate-art")} ${label}</div>${lines(n)}</div>`;
  return wordBank(words) + `
    <div class="sort-cols" style="--cols:3">${col("star", "קל לי")}${col("sneaker", "עוד מתאמנת")}${col("heart", "קשה לי")}</div>
    <div class="rate-bottom">
      <div class="order-line"><span class="bank-label">המילה הכי קשה שלי:</span><span class="write-line"></span></div>
      <div class="order-line"><span class="bank-label">אכתוב אותה 3 פעמים:</span><span class="write-line"></span><span class="write-line"></span><span class="write-line"></span></div>
    </div>`;
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
  const art = Object.keys(STICKERS);
  return `<div class="cards" style="--cols:${cols}">${cards.map((w, i) => `<div class="card">${sticker(art[i % art.length], "card-sticker")}<span style="font-size:${Math.min(6, 60 / graphemes(w).length).toFixed(1)}mm">${wordSpan(w)}</span></div>`).join("")}</div>`;
}

function diceSheet({ words }) {
  const tasks = [
    ["⚀", "כתבו את המילה 3 פעמים"],
    ["⚁", "אייתו אותה בקול של זמרת על הבמה 🎤"],
    ["⚂", "מחאו כף על כל אות במילה"],
    ["⚃", "כתבו אותה באוויר עם האצבע, ואז על הדף"],
    ["⚄", "בעטו בכדור דמיוני על כל אות ⚽"],
    ["⚅", "ריקוד ניצחון! ואז אייתו בלי להסתכל ♪"],
  ];
  const table = tasks.map(([face, text]) => `<div class="dice-task"><span class="dice-face">${face}</span><span>${text}</span></div>`).join("");
  const list = words.map((w) => `<div class="dice-word">${wordSpan(w)}<span class="hearts"><span class="tick"></span><span class="tick"></span><span class="tick"></span></span></div>`).join("");
  return `<div class="dice-tasks">${table}</div><div class="dice-words">${list}</div>`;
}

function penaltiesSheet({ words }) {
  const rows = words.map((w) => `<tr><td class="lc-word">${wordSpan(w)}</td><td class="goal">${sticker("ball", "goal-ball")}</td><td class="goal">${sticker("ball", "goal-ball")}</td></tr>`);
  return `
    <table class="lc penalties ${words.length > 14 ? "dense" : ""}">
      <thead><tr><th>המילה</th><th class="goal">שחקנית 1: <span class="blank short"></span></th><th class="goal">שחקנית 2: <span class="blank short"></span></th></tr></thead>
      <tbody>${rows.join("")}</tbody>
    </table>
    <div class="score-line">${sticker("trophy", "score-art")} התוצאה: <span class="score-box"></span> : <span class="score-box"></span></div>`;
}

function jigsawSheet({ words }) {
  const pick = shuffle(words.filter((w) => gridLetters(w).length >= 2)).slice(0, 12);
  const pieces = shuffle(pick.flatMap((w) => {
    const letters = graphemes(plain(w)).filter((ch) => ch !== " ");
    const parts = letters.length >= 6 ? 3 : 2;
    const size = Math.ceil(letters.length / parts);
    const chunks = [];
    for (let i = 0; i < letters.length; i += size) chunks.push(letters.slice(i, i + size).join(""));
    return chunks.map((text, i) => ({ text, lang: langOf(w), first: i === 0, last: i === chunks.length - 1 }));
  }));
  return `<div class="jigsaw">${pieces.map((p) => `<div class="piece ${p.lang} ${p.first ? "first" : ""} ${p.last ? "last" : ""}"><span lang="${p.lang}" dir="${p.lang === "he" ? "rtl" : "ltr"}">${escapeHtml(p.text)}</span></div>`).join("")}</div>`;
}

function boardSheet({ words }) {
  const cols = 6, rows = 6;
  const total = cols * rows;
  const specials = { 6: "קדימה 2", 13: "↩ חזרה 1", 19: "קדימה 3", 26: "↩ חזרה 2", 31: "עוד תור!" };
  let pool = [];
  const squares = Array.from({ length: total }, (_, i) => {
    if (i === 0) return `${sticker("sneaker", "board-sticker")}<b>התחלה</b>`;
    if (i === total - 1) return `${sticker("trophy", "board-sticker")}<b>סיום!</b>`;
    if (specials[i]) return `${sticker(specials[i].startsWith("↩") ? "ball" : "star", "board-sticker")}<span class="board-special">${specials[i]}</span>`;
    if (!pool.length) pool = shuffle(words);
    return wordSpan(pool.pop());
  });
  // A snake path from the bottom up: every second row runs the other way.
  const cells = [];
  for (let r = rows - 1; r >= 0; r--) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + (r % 2 === 0 ? c : cols - 1 - c);
      cells.push(`<div class="board-cell ${i % 2 ? "alt" : ""}"><span class="board-num">${i + 1}</span>${squares[i]}</div>`);
    }
  }
  return `<div class="board">${cells.join("")}</div>`;
}

function tictacSheet({ words }) {
  const board = (k) => `
    <div class="bingo">
      <div class="bingo-title">${sticker("ball", "title-sticker")} ✕ ◯ <small>לוח ${k}</small> ${sticker("medal", "title-sticker")}</div>
      <div class="bingo-grid" style="--n:3">${shuffle(words).slice(0, 9).map((w) => `<div class="bingo-cell">${wordSpan(w)}</div>`).join("")}</div>
    </div>`;
  return `<div class="bingos">${board(1)}<div class="cut-line">✂</div>${board(2)}</div>`;
}

function bingoSheet({ words }) {
  const n = words.length >= 16 ? 4 : words.length >= 9 ? 3 : 2;
  const board = (k) => `
    <div class="bingo">
      <div class="bingo-title">${sticker("lightstick", "title-sticker")} בינגו! <small>לוח ${k}</small> ${sticker("mic", "title-sticker")}</div>
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
