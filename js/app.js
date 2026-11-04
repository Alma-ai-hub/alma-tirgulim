// Main screen: the new-test form, the results (sheets + games) and "My tests".

const SAMPLE = "שולחן\nמחברת\nחלון\nציפור\nתפוח\nכדור\nספרייה\nחבר\nשמש\nמטריה";

const els = {
  name: document.getElementById("test-name"),
  words: document.getElementById("words"),
  answers: document.getElementById("with-answers"),
  count: document.getElementById("word-count"),
  error: document.getElementById("form-error"),
  results: document.getElementById("results"),
  sheets: document.getElementById("sheets"),
  save: document.getElementById("save"),
  saveStatus: document.getElementById("save-status"),
  savedList: document.getElementById("saved-list"),
  savedCount: document.getElementById("saved-count"),
};

let current = null; // the test on screen: { name, words, seed, withAnswers }

// ---------- Form ----------

function loadDraft() {
  try {
    els.words.value = localStorage.getItem("alma.draft.words") || "";
    els.name.value = localStorage.getItem("alma.draft.name") || "";
  } catch (e) { /* storage not available - start empty */ }
  updateCount();
}

function saveDraft() {
  try {
    localStorage.setItem("alma.draft.words", els.words.value);
    localStorage.setItem("alma.draft.name", els.name.value);
  } catch (e) { /* not important */ }
}

function updateCount() {
  const n = parseWords(els.words.value).length;
  els.count.textContent = n === 1 ? "מילה אחת" : `${n} מילים`;
  els.count.classList.toggle("warn", n > 0 && (n < 5 || n > 20));
}

function defaultName() {
  return `מבדק ${new Date().toLocaleDateString("he-IL")}`;
}

function create() {
  const words = parseWords(els.words.value);
  if (words.length < 3) {
    els.error.textContent = "כתבו לפחות 3 מילים (הכי טוב 10-20).";
    return;
  }
  if (words.length > 20) {
    els.error.textContent = `יש ${words.length} מילים. אפשר עד 20 מילים, כדי שכל דף ייכנס בעמוד אחד.`;
    return;
  }
  els.error.textContent = "";
  if (!els.name.value.trim()) els.name.value = defaultName();
  saveDraft();
  show({ name: els.name.value.trim(), words, seed: newSeed(), withAnswers: els.answers.checked });
  els.results.scrollIntoView({ behavior: "smooth" });
}

// ---------- Results ----------

function show(test) {
  current = test;
  els.sheets.innerHTML = buildSheets(test);
  showGameMenu(test.words);
  els.results.hidden = false;
  showTab("sheets");
  updateSaveButton();
}

function remake() {
  show({ ...current, seed: newSeed() });
}

function updateSaveButton() {
  const saved = current && findSaved(current);
  els.save.disabled = !!saved;
  els.save.textContent = saved ? "♥ שמור במבדקים שלי" : "♡ שמירה במבדקים שלי";
  els.saveStatus.textContent = saved ? "" : "\"דפים אחרים\" מערבב ובוחר דפים חדשים מאותן מילים.";
}

function save() {
  if (!current || findSaved(current)) return;
  if (!addTest(current)) {
    els.saveStatus.textContent = "לא הצלחנו לשמור בדפדפן הזה.";
    return;
  }
  updateSaveButton();
  renderSaved();
  els.save.classList.add("pop");
  setTimeout(() => els.save.classList.remove("pop"), 600);
}

function showTab(name) {
  document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("active", t.dataset.tab === name));
  document.querySelectorAll(".panel").forEach((p) => (p.hidden = p.id !== `panel-${name}`));
}

// ---------- My tests ----------

function showView(name) {
  document.querySelectorAll(".view-btn").forEach((b) => b.classList.toggle("active", b.dataset.view === name));
  document.getElementById("view-create").hidden = name !== "create";
  document.getElementById("view-saved").hidden = name !== "saved";
  if (name === "saved") renderSaved();
}

function renderSaved() {
  const tests = loadTests();
  els.savedCount.textContent = tests.length;
  if (!tests.length) {
    els.savedList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">♡</div>
        <p>עוד אין מבדקים שמורים.</p>
        <p class="help">יוצרים מבדק, ולוחצים "שמירה במבדקים שלי".</p>
      </div>`;
    return;
  }
  els.savedList.innerHTML = tests.map((t, i) => `
    <article class="saved-card c${i % 4}">
      <div class="saved-top">
        <span class="saved-star">✦</span>
        <span class="saved-date">${new Date(t.created).toLocaleDateString("he-IL")}</span>
      </div>
      <h3>${escapeHtml(t.name)}</h3>
      <p class="saved-meta">${t.words.length} מילים${t.withAnswers ? " · עם פתרונות" : ""}</p>
      <div class="chips">${t.words.slice(0, 8).map((w) => wordSpan(w, "chip")).join("")}${t.words.length > 8 ? `<span class="chip more">+${t.words.length - 8}</span>` : ""}</div>
      <div class="saved-actions">
        <button class="btn primary small" data-open="${t.id}">פתיחה</button>
        <button class="btn ghost small" data-delete="${t.id}" aria-label="מחיקת ${escapeHtml(t.name)}">מחיקה</button>
      </div>
    </article>`).join("");

  els.savedList.querySelectorAll("[data-open]").forEach((b) => b.addEventListener("click", () => openTest(b.dataset.open)));
  els.savedList.querySelectorAll("[data-delete]").forEach((b) => b.addEventListener("click", () => {
    const test = loadTests().find((t) => t.id === b.dataset.delete);
    if (test && confirm(`למחוק את "${test.name}"?`)) {
      deleteTest(test.id);
      renderSaved();
      if (current) updateSaveButton();
    }
  }));
}

function openTest(id) {
  const test = loadTests().find((t) => t.id === id);
  if (!test) return;
  els.name.value = test.name;
  els.words.value = test.words.join("\n");
  els.answers.checked = test.withAnswers;
  updateCount();
  showView("create");
  show({ name: test.name, words: test.words, seed: test.seed, withAnswers: test.withAnswers });
  els.results.scrollIntoView({ behavior: "smooth" });
}

// ---------- Wiring ----------

els.words.addEventListener("input", updateCount);
document.getElementById("create").addEventListener("click", create);
document.getElementById("sample").addEventListener("click", () => {
  els.words.value = SAMPLE;
  if (!els.name.value.trim()) els.name.value = "מבדק לדוגמה";
  updateCount();
});
document.getElementById("print").addEventListener("click", () => window.print());
document.getElementById("remake").addEventListener("click", remake);
els.save.addEventListener("click", save);
document.querySelectorAll(".tab").forEach((t) => t.addEventListener("click", () => showTab(t.dataset.tab)));
document.querySelectorAll(".view-btn").forEach((b) => b.addEventListener("click", () => showView(b.dataset.view)));

loadDraft();
renderSaved();
