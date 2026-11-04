// On-screen games. Each game draws itself inside #game-area.

const GAMES = [
  { id: "memory", art: "lightstick", tag: "K-POP", title: "משחק זיכרון", text: "הפכו קלפים ומצאו זוגות של אותה מילה." },
  { id: "search", art: "star", tag: "STUDY", title: "תפזורת", text: "לחצו על האות הראשונה ועל האחרונה של כל מילה." },
  { id: "missing", art: "bun", tag: "SQUISHY", title: "אותיות חסרות", text: "השלימו את האותיות שהלכו לאיבוד." },
  { id: "flash", art: "mic", tag: "ON STAGE", title: "תראו ותכתבו", text: "המילה מופיעה לרגע ונעלמת. כתבו אותה מהזיכרון!" },
  { id: "scramble", art: "notes", tag: "DANCE", title: "אותיות מבולבלות", text: "לחצו על האותיות לפי הסדר כדי לבנות את המילה." },
  { id: "spelling", art: "pencil", tag: "STUDY", title: "מי כתוב נכון?", text: "שלוש מילים, רק אחת כתובה נכון. מצאו אותה!" },
  { id: "balloons", art: "balloon", tag: "PARTY", title: "הצילו את הבלונים", text: "נחשו את המילה אות אחרי אות, לפני שכל הבלונים מתפוצצים." },
  { id: "race", art: "ball", tag: "SOCCER", title: "מירוץ הקלדה", text: "כמה מילים תספיקו להקליד נכון בדקה אחת?" },
];

let gameWords = [];

function showGameMenu(words) {
  gameWords = words;
  const area = document.getElementById("game-area");
  area.innerHTML = `<div class="game-menu">${GAMES.map((g) => `
    <button class="game-card" data-game="${g.id}">
      <span class="game-card-top">${sticker(g.art, "game-art")}<span class="game-tag">${g.tag}</span></span>
      <span class="game-title">${g.title}</span>
      <span class="game-text">${g.text}</span>
    </button>`).join("")}</div>`;
  area.querySelectorAll("[data-game]").forEach((b) => b.addEventListener("click", () => startGame(b.dataset.game)));
}

function startGame(id) {
  const area = document.getElementById("game-area");
  const game = GAMES.find((g) => g.id === id);
  area.innerHTML = `
    <div class="game-top">
      <button class="btn ghost" id="game-back">→ לכל המשחקים</button>
      <h3>${sticker(game.art, "h3-art")} ${game.title}</h3>
      <span class="game-score" id="game-score"></span>
    </div>
    <div id="game-board"></div>`;
  document.getElementById("game-back").addEventListener("click", () => showGameMenu(gameWords));
  const board = document.getElementById("game-board");
  ({ memory: memoryGame, search: searchGame, missing: missingGame, flash: flashGame, scramble: scrambleGame, spelling: spellingGame, balloons: balloonsGame, race: raceGame })[id](board);
}

function setScore(text) {
  document.getElementById("game-score").textContent = text;
}

const CHEERS = ["את כוכבת! ✦", "גווווול! ⚽", "מדליית זהב! 🥇", "ריקוד ניצחון! ♪", "סקווישי ומנצחת! ♡", "מוח של אלופה! ✎"];

function finish(board, message, again) {
  board.innerHTML = `
    <div class="finish">
      ${sticker("trophy", "finish-art")}
      <div class="finish-cheer">${CHEERS[Math.floor(Math.random() * CHEERS.length)]}</div>
      <p>${message}</p>
      <button class="btn primary" id="again">עוד פעם!</button>
    </div>`;
  document.getElementById("again").addEventListener("click", again);
  confetti(60);
}

// Little hearts and stars that fly out of an element when the player gets it right.
function celebrate(el, count = 14) {
  if (!el) return;
  const box = el.getBoundingClientRect();
  burst(box.left + box.width / 2, box.top + box.height / 2, count, 120);
}

// A big shower of confetti from the top of the screen, for the end of a game.
function confetti(count) {
  for (let i = 0; i < count; i++) {
    setTimeout(() => burst(Math.random() * window.innerWidth, -20, 1, 0, true), i * 25);
  }
}

function burst(x, y, count, spread, falling) {
  const shapes = ["♥", "✦", "★", "♪", "●"];
  const colors = ["#ff3d9a", "#ff7cc3", "#ffc2e0", "#ffffff"];
  for (let i = 0; i < count; i++) {
    const p = document.createElement("span");
    p.className = falling ? "confetti fall" : "confetti";
    p.textContent = shapes[i % shapes.length];
    const angle = Math.random() * Math.PI * 2;
    const dist = spread * (0.5 + Math.random());
    p.style.left = `${x}px`;
    p.style.top = `${y}px`;
    p.style.color = colors[Math.floor(Math.random() * colors.length)];
    p.style.setProperty("--dx", `${falling ? (Math.random() - 0.5) * 160 : Math.cos(angle) * dist}px`);
    p.style.setProperty("--dy", `${falling ? window.innerHeight + 40 : Math.sin(angle) * dist}px`);
    p.style.fontSize = `${14 + Math.random() * 14}px`;
    document.body.appendChild(p);
    setTimeout(() => p.remove(), falling ? 2600 : 900);
  }
}

// --- Memory -------------------------------------------------------------

function memoryGame(board) {
  const words = shuffle(gameWords).slice(0, 8);
  const cards = shuffle(words.concat(words));
  let open = [];
  let moves = 0;
  let pairs = 0;
  board.innerHTML = `<div class="mem-grid">${cards.map((w, i) => `
    <button class="mem-card" data-i="${i}" aria-label="קלף ${i + 1}">
      <span class="mem-back">${sticker("lightstick", "mem-art")}</span><span class="mem-front">${wordSpan(w)}</span>
    </button>`).join("")}</div>`;
  setScore("ניסיונות: 0");

  board.querySelectorAll(".mem-card").forEach((card) => card.addEventListener("click", () => {
    if (open.length === 2 || card.classList.contains("open")) return;
    card.classList.add("open");
    open.push(card);
    if (open.length < 2) return;
    moves++;
    setScore(`ניסיונות: ${moves}`);
    const [a, b] = open;
    if (cards[a.dataset.i] === cards[b.dataset.i]) {
      a.classList.add("matched");
      celebrate(b);
      b.classList.add("matched");
      open = [];
      pairs++;
      if (pairs === words.length) {
        setTimeout(() => finish(board, `כל הכבוד! מצאתם את כל ${pairs} הזוגות ב-${moves} ניסיונות.`, () => memoryGame(board)), 700);
      }
    } else {
      setTimeout(() => {
        a.classList.remove("open");
        b.classList.remove("open");
        open = [];
      }, 1000);
    }
  }));
}

// --- Word search --------------------------------------------------------

function searchGame(board, lang) {
  const he = gameWords.filter(isHebrew);
  const en = gameWords.filter((w) => !isHebrew(w));
  if (!lang) lang = he.length >= en.length ? "he" : "en";
  const words = shuffle(lang === "he" ? he : en).slice(0, 10);
  const puzzle = makeWordSearch(words, false);
  if (!puzzle) {
    board.innerHTML = `<p class="note">צריך מילים של שתי אותיות ומעלה כדי לבנות תפזורת.</p>`;
    return;
  }
  const switcher = he.length && en.length
    ? `<div class="switch"><button class="btn ${lang === "he" ? "primary" : "ghost"}" data-lang="he">עברית</button><button class="btn ${lang === "en" ? "primary" : "ghost"}" data-lang="en">English</button></div>`
    : "";
  board.innerHTML = `
    ${switcher}
    <div class="search-play">
      <div class="play-grid" dir="ltr" style="--n:${puzzle.size}">
        ${puzzle.grid.map((row, y) => row.map((ch, x) => `<button class="pcell" data-x="${x}" data-y="${y}">${escapeHtml(ch)}</button>`).join("")).join("")}
      </div>
      <ul class="play-list">${puzzle.placed.map((p, i) => `<li data-i="${i}">${wordSpan(p.word)}</li>`).join("")}</ul>
    </div>`;
  board.querySelectorAll("[data-lang]").forEach((b) => b.addEventListener("click", () => searchGame(board, b.dataset.lang)));

  const cell = (x, y) => board.querySelector(`.pcell[data-x="${x}"][data-y="${y}"]`);
  const found = new Set();
  let start = null;
  setScore(`נמצאו 0 מתוך ${puzzle.placed.length}`);

  board.querySelectorAll(".pcell").forEach((btn) => btn.addEventListener("click", () => {
    const x = +btn.dataset.x;
    const y = +btn.dataset.y;
    if (!start) {
      start = [x, y];
      btn.classList.add("picked");
      return;
    }
    cell(start[0], start[1]).classList.remove("picked");
    const line = lineCells(start, [x, y]);
    start = null;
    if (!line) return;
    const key = line.map((c) => c.join(",")).join("|");
    const hit = puzzle.placed.findIndex((p, i) => {
      const k = p.cells.map((c) => c.join(",")).join("|");
      const back = p.cells.slice().reverse().map((c) => c.join(",")).join("|");
      return !found.has(i) && (k === key || back === key);
    });
    if (hit < 0) {
      line.forEach(([cx, cy]) => flash(cell(cx, cy), "miss"));
      return;
    }
    found.add(hit);
    celebrate(btn);
    line.forEach(([cx, cy]) => cell(cx, cy).classList.add("found", `c${hit % 6}`));
    board.querySelector(`.play-list li[data-i="${hit}"]`).classList.add("done");
    setScore(`נמצאו ${found.size} מתוך ${puzzle.placed.length}`);
    if (found.size === puzzle.placed.length) {
      setTimeout(() => finish(board, "מצאתם את כל המילים! איזה עיניים חדות 👀", () => searchGame(board, lang)), 800);
    }
  }));
}

// Cells on a straight line (across, down or diagonal) between two points.
function lineCells([x1, y1], [x2, y2]) {
  const dx = Math.sign(x2 - x1);
  const dy = Math.sign(y2 - y1);
  const len = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
  if (len === 0) return null;
  if (Math.abs(x2 - x1) !== 0 && Math.abs(y2 - y1) !== 0 && Math.abs(x2 - x1) !== Math.abs(y2 - y1)) return null;
  const cells = [];
  for (let i = 0; i <= len; i++) cells.push([x1 + dx * i, y1 + dy * i]);
  return cells;
}

function flash(el, cls) {
  el.classList.add(cls);
  setTimeout(() => el.classList.remove(cls), 600);
}

// --- Missing letters ----------------------------------------------------

function missingGame(board) {
  const words = shuffle(gameWords);
  let index = 0;
  let right = 0;

  function next() {
    if (index >= words.length) {
      finish(board, `סיימתם! ${right} מתוך ${words.length} מילים נכונות בניסיון הראשון.`, () => missingGame(board));
      return;
    }
    const word = words[index];
    const letters = graphemes(word);
    const spots = letters.map((ch, i) => i).filter((i) => /\p{L}/u.test(letters[i]));
    const count = Math.max(1, Math.min(spots.length - 1, Math.round(spots.length * 0.4)));
    const hidden = new Set(shuffle(spots).slice(0, count));
    const lang = langOf(word);
    let firstTry = true;
    setScore(`מילה ${index + 1} מתוך ${words.length}`);

    board.innerHTML = `
      <div class="missing-play">
        <div class="boxes big" lang="${lang}" dir="${lang === "he" ? "rtl" : "ltr"}">
          ${letters.map((ch, i) => {
            if (!/\p{L}/u.test(ch)) return `<span class="gap"></span>`;
            return hidden.has(i)
              ? `<input class="box input" maxlength="2" data-i="${i}" autocomplete="off" aria-label="אות חסרה">`
              : `<span class="box">${escapeHtml(ch)}</span>`;
          }).join("")}
        </div>
        <div class="feedback" id="feedback"></div>
        <button class="btn primary" id="check">בדיקה</button>
      </div>`;

    const inputs = [...board.querySelectorAll("input.box")];
    inputs[0].focus();
    inputs.forEach((input, k) => input.addEventListener("input", () => {
      input.classList.remove("wrong");
      if (input.value && inputs[k + 1]) inputs[k + 1].focus();
    }));
    board.querySelector(".missing-play").addEventListener("keydown", (e) => {
      if (e.key === "Enter" && e.target.tagName === "INPUT") document.getElementById("check").click();
    });

    document.getElementById("check").addEventListener("click", function check() {
      const button = document.getElementById("check");
      if (button.dataset.next) { index++; next(); return; }
      let ok = true;
      inputs.forEach((input) => {
        const good = normalize(input.value) === normalize(letters[input.dataset.i]);
        input.classList.toggle("wrong", !good);
        input.classList.toggle("right", good);
        if (!good) ok = false;
      });
      const feedback = document.getElementById("feedback");
      if (ok) {
        if (firstTry) right++;
        feedback.innerHTML = `<span class="good">מעולה! ✓</span> ${wordSpan(word)}`;
        celebrate(feedback);
        button.textContent = "למילה הבאה ←";
        button.dataset.next = "1";
        button.focus();
      } else {
        firstTry = false;
        feedback.innerHTML = `<span class="bad">כמעט! תקנו את האותיות האדומות.</span>`;
      }
    });
  }
  next();
}

// --- Look and write -----------------------------------------------------

function flashGame(board) {
  const words = shuffle(gameWords);
  let index = 0;
  let right = 0;

  function next() {
    if (index >= words.length) {
      finish(board, `סיימתם! כתבתם נכון ${right} מתוך ${words.length} מילים.`, () => flashGame(board));
      return;
    }
    const word = words[index];
    const lang = langOf(word);
    setScore(`מילה ${index + 1} מתוך ${words.length} · נכונות: ${right}`);
    board.innerHTML = `
      <div class="flash-play stage">
        <div class="flash-word">${wordSpan(word)}</div>
        <div class="timer"><span></span></div>
        <p class="hint">תסתכלו טוב...</p>
      </div>`;
    setTimeout(() => {
      if (!board.isConnected) return; // the player went back to the menu
      board.innerHTML = `
        <div class="flash-play">
          <p class="hint">עכשיו כתבו את המילה:</p>
          <input class="flash-input" id="answer" lang="${lang}" dir="${lang === "he" ? "rtl" : "ltr"}" autocomplete="off" spellcheck="false">
          <div class="feedback" id="feedback"></div>
          <button class="btn primary" id="check">בדיקה</button>
        </div>`;
      const input = document.getElementById("answer");
      const button = document.getElementById("check");
      input.focus();
      input.addEventListener("keydown", (e) => { if (e.key === "Enter") button.click(); });
      button.addEventListener("click", () => {
        if (button.dataset.next) { index++; next(); return; }
        const ok = normalize(input.value) === normalize(word);
        if (ok) { right++; celebrate(input); }
        setScore(`מילה ${index + 1} מתוך ${words.length} · נכונות: ${right}`);
        document.getElementById("feedback").innerHTML = ok
          ? `<span class="good">נכון! ✓</span>`
          : `<span class="bad">המילה הייתה:</span> ${wordSpan(word)}`;
        input.disabled = true;
        button.textContent = "למילה הבאה ←";
        button.dataset.next = "1";
        button.focus();
      });
    }, 3000);
  }
  next();
}

// --- Scrambled letters --------------------------------------------------

function scrambleGame(board) {
  const words = shuffle(gameWords.filter((w) => gridLetters(w).length > 1));
  let index = 0;
  let right = 0;

  function next() {
    if (index >= words.length) {
      finish(board, `סיימתם! ${right} מתוך ${words.length} מילים בניסיון הראשון.`, () => scrambleGame(board));
      return;
    }
    const word = words[index];
    const letters = gridLetters(word);
    const lang = langOf(word);
    const dir = lang === "he" ? "rtl" : "ltr";
    let mixed = letters;
    for (let t = 0; t < 10 && mixed.join("") === letters.join(""); t++) mixed = shuffle(letters);
    const picked = []; // indexes into mixed, in the order the player chose them
    let firstTry = true;
    setScore(`מילה ${index + 1} מתוך ${words.length}`);

    board.innerHTML = `
      <div class="missing-play">
        <div class="boxes big slots" dir="${dir}">${letters.map((_, i) => `<button class="box slot" data-slot="${i}" aria-label="משבצת ${i + 1}"></button>`).join("")}</div>
        <div class="letter-tiles" dir="${dir}">${mixed.map((ch, i) => `<button class="letter-tile" data-i="${i}">${escapeHtml(ch)}</button>`).join("")}</div>
        <div class="feedback" id="feedback"></div>
        <button class="btn ghost" id="clear">לנקות ולהתחיל שוב</button>
      </div>`;
    const tilesEls = [...board.querySelectorAll(".letter-tile")];
    const slots = [...board.querySelectorAll(".slot")];

    function draw() {
      slots.forEach((slot, i) => (slot.textContent = picked[i] === undefined ? "" : mixed[picked[i]]));
      tilesEls.forEach((t) => (t.disabled = picked.includes(+t.dataset.i)));
    }
    function check() {
      const answer = picked.map((i) => mixed[i]).join("");
      const feedback = document.getElementById("feedback");
      if (answer === letters.join("")) {
        if (firstTry) right++;
        slots.forEach((s) => s.classList.add("right"));
        feedback.innerHTML = `<span class="good">מעולה! ✓</span>`;
        celebrate(feedback);
        setTimeout(() => { index++; next(); }, 1100);
      } else {
        firstTry = false;
        feedback.innerHTML = `<span class="bad">לא בדיוק... נסו שוב!</span>`;
        board.querySelector(".slots").classList.add("shake");
        setTimeout(() => { picked.length = 0; draw(); board.querySelector(".slots").classList.remove("shake"); }, 700);
      }
    }
    tilesEls.forEach((t) => t.addEventListener("click", () => {
      picked.push(+t.dataset.i);
      draw();
      if (picked.length === letters.length) check();
    }));
    slots.forEach((slot, i) => slot.addEventListener("click", () => { // take a letter back
      if (picked[i] === undefined || picked.length === letters.length) return;
      picked.splice(i, 1);
      draw();
    }));
    document.getElementById("clear").addEventListener("click", () => { picked.length = 0; draw(); });
  }
  next();
}

// --- Which spelling is right ----------------------------------------------

function spellingGame(board) {
  const rounds = shuffle(gameWords)
    .map((w) => ({ word: w, options: shuffle([plain(w)].concat(misspellings(w, 2))) }))
    .filter((r) => r.options.length > 1);
  let index = 0;
  let right = 0;

  function next() {
    if (index >= rounds.length) {
      finish(board, `סיימתם! בחרתם נכון ${right} מתוך ${rounds.length} פעמים.`, () => spellingGame(board));
      return;
    }
    const round = rounds[index];
    setScore(`מילה ${index + 1} מתוך ${rounds.length} · נכונות: ${right}`);
    board.innerHTML = `
      <div class="missing-play">
        <p class="hint">איזו מילה כתובה נכון?</p>
        <div class="choices">${round.options.map((o, i) => `<button class="choice" data-i="${i}">${wordSpan(o)}</button>`).join("")}</div>
        <div class="feedback" id="feedback"></div>
      </div>`;
    board.querySelectorAll(".choice").forEach((b) => b.addEventListener("click", () => {
      const ok = round.options[b.dataset.i] === plain(round.word);
      board.querySelectorAll(".choice").forEach((c) => {
        c.disabled = true;
        if (round.options[c.dataset.i] === plain(round.word)) c.classList.add("right");
      });
      if (ok) { right++; celebrate(b); }
      else b.classList.add("wrong");
      document.getElementById("feedback").innerHTML = ok ? `<span class="good">נכון! ✓</span>` : `<span class="bad">אופס! הנכונה מסומנת בירוק.</span>`;
      setScore(`מילה ${index + 1} מתוך ${rounds.length} · נכונות: ${right}`);
      setTimeout(() => { index++; next(); }, ok ? 900 : 1800);
    }));
  }
  next();
}

// --- Balloons (guess the letters) -----------------------------------------

const HEB_KEYS = "אבגדהוזחטיכלמנסעפצקרשת";
const ENG_KEYS = "abcdefghijklmnopqrstuvwxyz";
const BALLOONS = 6;

function balloonsGame(board) {
  const words = shuffle(gameWords.filter((w) => gridLetters(w).length > 1));
  let index = 0;
  let saved = 0;

  function next() {
    if (index >= words.length) {
      finish(board, `סיימתם! ניחשתם ${saved} מתוך ${words.length} מילים.`, () => balloonsGame(board));
      return;
    }
    const word = words[index];
    const he = isHebrew(word);
    const shown = graphemes(plain(word)); // as written, e.g. with capitals
    const letters = shown.map((ch) => (he ? ch : ch.toLowerCase()));
    const base = (ch) => (he ? UNFINAL[ch] || ch : ch); // ם counts as מ
    const guessed = new Set();
    let left = BALLOONS;
    setScore(`מילה ${index + 1} מתוך ${words.length} · הצלחות: ${saved}`);

    board.innerHTML = `
      <div class="missing-play">
        <div class="balloons" id="balloons"></div>
        <div class="boxes big" dir="${he ? "rtl" : "ltr"}" id="word"></div>
        <div class="keyboard" dir="${he ? "rtl" : "ltr"}">${Array.from(he ? HEB_KEYS : ENG_KEYS).map((k) => `<button class="key" data-k="${k}">${k}</button>`).join("")}</div>
        <div class="feedback" id="feedback"></div>
      </div>`;

    function draw() {
      document.getElementById("balloons").innerHTML = Array.from({ length: BALLOONS }, (_, i) => `<span class="balloon ${i < left ? "" : "popped"}">${i < left ? sticker("balloon", "balloon-art") : "✦"}</span>`).join("");
      document.getElementById("word").innerHTML = letters.map((ch, i) => {
        if (!/\p{L}/u.test(ch)) return `<span class="gap"></span>`;
        return `<span class="box">${guessed.has(base(ch)) ? escapeHtml(shown[i]) : ""}</span>`;
      }).join("");
    }
    function done(won) {
      board.querySelectorAll(".key").forEach((k) => (k.disabled = true));
      if (won) { saved++; celebrate(document.getElementById("word"), 24); }
      document.getElementById("feedback").innerHTML = won
        ? `<span class="good">הצלתם את הבלונים! 🎉</span>`
        : `<span class="bad">הבלונים התפוצצו... המילה הייתה:</span> ${wordSpan(word)}`;
      letters.forEach((ch) => guessed.add(base(ch)));
      draw();
      setScore(`מילה ${index + 1} מתוך ${words.length} · הצלחות: ${saved}`);
      const more = document.createElement("button");
      more.className = "btn primary";
      more.textContent = "למילה הבאה ←";
      more.addEventListener("click", () => { index++; next(); });
      board.querySelector(".missing-play").appendChild(more);
      more.focus();
    }
    board.querySelectorAll(".key").forEach((key) => key.addEventListener("click", () => {
      const k = key.dataset.k;
      key.disabled = true;
      guessed.add(k);
      if (letters.some((ch) => base(ch) === k)) key.classList.add("hit");
      else { key.classList.add("miss"); left--; }
      draw();
      const complete = letters.every((ch) => !/\p{L}/u.test(ch) || guessed.has(base(ch)));
      if (complete) done(true);
      else if (left === 0) done(false);
    }));
    draw();
  }
  next();
}

// --- Typing race ------------------------------------------------------------

function raceGame(board) {
  setScore("");
  board.innerHTML = `
    <div class="flash-play">
      <p class="hint">יש לכם דקה אחת. כל מילה שמופיעה - מקלידים מהר ובלי טעויות!</p>
      <button class="btn primary big-start" id="go">מתחילים! ⏱️</button>
    </div>`;
  document.getElementById("go").addEventListener("click", () => run());

  function run() {
    let count = 0;
    let pool = [];
    let word = "";
    let timeLeft = 60;
    let best = 0;
    try { best = +localStorage.getItem("alma.raceBest") || 0; } catch (e) { /* ignore */ }
    const goal = Math.max(best, 10); // reach the trophy = beat your record
    board.innerHTML = `
      <div class="flash-play">
        <div class="race-clock" id="clock">60</div>
        <div class="race-track"><span class="race-runner" id="runner">${sticker("ball", "race-art")}</span>${sticker("trophy", "race-goal")}</div>
        <div class="flash-word" id="race-word"></div>
        <input class="flash-input" id="race-input" autocomplete="off" spellcheck="false">
        <p class="hint" id="race-count">נכונות: 0</p>
      </div>`;
    const input = document.getElementById("race-input");
    const nextWord = () => {
      if (!pool.length) pool = shuffle(gameWords);
      word = pool.pop();
      const lang = langOf(word);
      document.getElementById("race-word").innerHTML = wordSpan(word);
      input.lang = lang;
      input.dir = lang === "he" ? "rtl" : "ltr";
      input.value = "";
    };
    input.addEventListener("input", () => {
      if (normalize(input.value) === normalize(word)) {
        count++;
        document.getElementById("race-count").textContent = `נכונות: ${count}`;
        document.getElementById("runner").style.setProperty("--p", Math.min(count / goal, 1));
        if (count === goal) celebrate(document.getElementById("runner"), 20);
        input.classList.add("flash-good");
        setTimeout(() => input.classList.remove("flash-good"), 250);
        nextWord();
      }
    });
    nextWord();
    input.focus();
    const timer = setInterval(() => {
      if (!board.isConnected) { clearInterval(timer); return; }
      timeLeft--;
      document.getElementById("clock").textContent = timeLeft;
      if (timeLeft > 0) return;
      clearInterval(timer);
      const record = count > best;
      if (record) { try { localStorage.setItem("alma.raceBest", count); } catch (e) { /* ignore */ } }
      finish(board, `הקלדתם נכון ${count} מילים בדקה! ${record ? "🌟 שיא חדש!" : `השיא שלכם: ${best}`}`, () => raceGame(board));
    }, 1000);
  }
}
