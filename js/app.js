// Main screen: reads the words, builds the worksheets and the games, switches tabs.

const SAMPLE = "שולחן\nמחברת\nחלון\nציפור\nתפוח\nכדור\nספרייה\nחבר\nשמש\nמטריה";

const els = {
  words: document.getElementById("words"),
  title: document.getElementById("list-title"),
  answers: document.getElementById("with-answers"),
  count: document.getElementById("word-count"),
  error: document.getElementById("form-error"),
  results: document.getElementById("results"),
  sheets: document.getElementById("sheets"),
};

function load() {
  try {
    els.words.value = localStorage.getItem("words") || "";
    els.title.value = localStorage.getItem("title") || "";
  } catch (e) { /* storage not available - start empty */ }
  updateCount();
}

function save() {
  try {
    localStorage.setItem("words", els.words.value);
    localStorage.setItem("title", els.title.value);
  } catch (e) { /* not important */ }
}

function updateCount() {
  const n = parseWords(els.words.value).length;
  els.count.textContent = n === 1 ? "מילה אחת" : `${n} מילים`;
  els.count.classList.toggle("warn", n > 0 && (n < 5 || n > 25));
}

function create() {
  const words = parseWords(els.words.value);
  if (words.length < 3) {
    els.error.textContent = "כתבו לפחות 3 מילים (הכי טוב 10-20).";
    return;
  }
  if (words.length > 30) {
    els.error.textContent = "יש יותר מ-30 מילים. נסו רשימה קצרה יותר, כדי שהדפים לא יהיו צפופים מדי.";
    return;
  }
  els.error.textContent = "";
  save();
  els.sheets.innerHTML = buildSheets(words, els.title.value.trim(), els.answers.checked);
  showGameMenu(words);
  els.results.hidden = false;
  showTab("sheets");
  els.results.scrollIntoView({ behavior: "smooth" });
}

function showTab(name) {
  document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("active", t.dataset.tab === name));
  document.querySelectorAll(".panel").forEach((p) => (p.hidden = p.id !== `panel-${name}`));
  document.body.dataset.tab = name;
}

els.words.addEventListener("input", updateCount);
document.getElementById("create").addEventListener("click", create);
document.getElementById("sample").addEventListener("click", () => {
  els.words.value = SAMPLE;
  updateCount();
});
document.getElementById("print").addEventListener("click", () => window.print());
document.getElementById("remake").addEventListener("click", create);
document.querySelectorAll(".tab").forEach((t) => t.addEventListener("click", () => showTab(t.dataset.tab)));

load();
