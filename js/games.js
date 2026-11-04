// On-screen games. Each game draws itself inside #game-area.

const GAMES = [
  { id: "memory", icon: "🃏", title: "משחק זיכרון", text: "הפכו קלפים ומצאו זוגות של אותה מילה." },
  { id: "search", icon: "🔍", title: "תפזורת", text: "לחצו על האות הראשונה ועל האחרונה של כל מילה." },
  { id: "missing", icon: "🧩", title: "אותיות חסרות", text: "השלימו את האותיות שהלכו לאיבוד." },
  { id: "flash", icon: "⚡", title: "תראו ותכתבו", text: "המילה מופיעה לרגע ונעלמת. כתבו אותה מהזיכרון!" },
];

let gameWords = [];

function showGameMenu(words) {
  gameWords = words;
  const area = document.getElementById("game-area");
  area.innerHTML = `<div class="game-menu">${GAMES.map((g) => `
    <button class="game-card" data-game="${g.id}">
      <span class="game-icon">${g.icon}</span>
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
      <h3>${game.icon} ${game.title}</h3>
      <span class="game-score" id="game-score"></span>
    </div>
    <div id="game-board"></div>`;
  document.getElementById("game-back").addEventListener("click", () => showGameMenu(gameWords));
  const board = document.getElementById("game-board");
  ({ memory: memoryGame, search: searchGame, missing: missingGame, flash: flashGame })[id](board);
}

function setScore(text) {
  document.getElementById("game-score").textContent = text;
}

function finish(board, message, again) {
  board.innerHTML = `
    <div class="finish">
      <div class="finish-icon">🏆</div>
      <p>${message}</p>
      <button class="btn primary" id="again">עוד פעם!</button>
    </div>`;
  document.getElementById("again").addEventListener("click", again);
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
      <span class="mem-back"></span><span class="mem-front">${wordSpan(w)}</span>
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
      <div class="flash-play">
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
        if (ok) right++;
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
