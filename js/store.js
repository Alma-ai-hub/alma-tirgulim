// Saved tests, kept in the browser on this computer.
// A test is small: its name, words and seed are enough to rebuild the same pages.

const STORE_KEY = "alma.tests";

function loadTests() {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveTests(tests) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(tests));
    return true;
  } catch (e) {
    return false;
  }
}

function addTest(test) {
  const tests = loadTests();
  const saved = { ...test, id: `t${Date.now()}`, created: new Date().toISOString() };
  tests.unshift(saved);
  return saveTests(tests) ? saved : null;
}

function deleteTest(id) {
  saveTests(loadTests().filter((t) => t.id !== id));
}

function findSaved(test) {
  return loadTests().find((t) => t.seed === test.seed && t.withAnswers === test.withAnswers && t.name === test.name && t.words.join("\n") === test.words.join("\n"));
}
