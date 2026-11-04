// Stickers drawn as small SVG pictures, in pink and black, and the page themes that use them.
// sticker("ball") returns the SVG as text, ready to put inside the page.

const INK = "#1b1320";
const PINK = "#ff3d9a";
const PINK2 = "#ff7cc3";
const SOFT = "#ffc2e0";

// A cute face (eyes, blush, smile) used on the squishies and some stickers.
function face(cx, cy, w = 14) {
  return `
    <ellipse cx="${cx - w}" cy="${cy}" rx="4.2" ry="5.6" fill="${INK}"/><ellipse cx="${cx + w}" cy="${cy}" rx="4.2" ry="5.6" fill="${INK}"/>
    <circle cx="${cx - w + 1.5}" cy="${cy - 2}" r="1.6" fill="#fff"/><circle cx="${cx + w + 1.5}" cy="${cy - 2}" r="1.6" fill="#fff"/>
    <ellipse cx="${cx - w - 9}" cy="${cy + 9}" rx="5.5" ry="3.2" fill="${PINK2}"/><ellipse cx="${cx + w + 9}" cy="${cy + 9}" rx="5.5" ry="3.2" fill="${PINK2}"/>
    <path d="M${cx - 5} ${cy + 7} q5 5 10 0" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
}

const STICKERS = {
  star: `<path d="M50 8 L61.8 35.8 L91.9 38.4 L69 58.2 L75.9 87.6 L50 72 L24.1 87.6 L31 58.2 L8.1 38.4 L38.2 35.8 Z" fill="${PINK}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>${face(50, 52, 9)}`,
  heart: `<path d="M50 88 C20 66 6 50 6 32 C6 18 17 8 30 8 C40 8 46 14 50 22 C54 14 60 8 70 8 C83 8 94 18 94 32 C94 50 80 66 50 88 Z" fill="${PINK}" stroke="${INK}" stroke-width="4"/><ellipse cx="28" cy="28" rx="8" ry="5" fill="#fff" opacity=".7" transform="rotate(-30 28 28)"/>`,
  sparkle: `<path d="M50 4 C54 36 64 46 96 50 C64 54 54 64 50 96 C46 64 36 54 4 50 C36 46 46 36 50 4 Z" fill="${PINK2}" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>`,
  mic: `<path d="M40 54 L44 94 L56 94 L60 54 Z" fill="${INK}"/><rect x="36" y="48" width="28" height="9" rx="3" fill="${PINK}" stroke="${INK}" stroke-width="3"/>
    <circle cx="50" cy="30" r="22" fill="${SOFT}" stroke="${INK}" stroke-width="4"/>
    <path d="M32 24 H68 M30 34 H70 M40 10 V50 M50 8 V52 M60 10 V50" stroke="${PINK}" stroke-width="2.5"/>`,
  lightstick: `<path d="M20 22 L10 16 M80 22 L90 16 M14 42 H4 M86 42 H96" stroke="${PINK}" stroke-width="4" stroke-linecap="round"/>
    <rect x="43" y="58" width="14" height="38" rx="5" fill="${INK}"/><rect x="38" y="50" width="24" height="12" rx="4" fill="${PINK}" stroke="${INK}" stroke-width="3"/>
    <circle cx="50" cy="30" r="25" fill="${SOFT}" stroke="${INK}" stroke-width="4"/>
    <path d="M50 44 C38 36 34 30 34 25 C34 20 38 17 42 17 C46 17 48 19 50 22 C52 19 54 17 58 17 C62 17 66 20 66 25 C66 30 62 36 50 44 Z" fill="${PINK}"/>`,
  notes: `<path d="M38 74 V22 L84 12 V64" stroke="${INK}" stroke-width="5" fill="none" stroke-linejoin="round"/><path d="M38 22 L84 12 V26 L38 36 Z" fill="${INK}"/>
    <ellipse cx="28" cy="76" rx="13" ry="10" fill="${PINK}" stroke="${INK}" stroke-width="4" transform="rotate(-20 28 76)"/>
    <ellipse cx="74" cy="66" rx="13" ry="10" fill="${PINK}" stroke="${INK}" stroke-width="4" transform="rotate(-20 74 66)"/>`,
  sneaker: `<path d="M8 72 V38 Q8 32 14 32 H30 Q36 48 54 50 L80 54 Q94 58 94 70 V76 H8 Z" fill="#fff" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
    <rect x="6" y="72" width="90" height="12" rx="5" fill="${PINK}" stroke="${INK}" stroke-width="4"/>
    <path d="M36 44 L42 38 M44 48 L50 41 M52 50 L58 44" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/><path d="M10 54 H28" stroke="${PINK}" stroke-width="5"/>`,
  ball: `<circle cx="50" cy="50" r="42" fill="#fff" stroke="${INK}" stroke-width="4"/>
    <path d="M50 36 L63.3 45.7 L58.2 61.3 L41.8 61.3 L36.7 45.7 Z" fill="${INK}"/>
    <path d="M50 36 V12 M63.3 45.7 L86 38 M58.2 61.3 L72 82 M41.8 61.3 L28 82 M36.7 45.7 L14 38" stroke="${INK}" stroke-width="3.5"/>
    <path d="M42 9 L50 13 L58 9 M83 30 L86 38 L92 44 M78 78 L72 82 L70 90 M30 90 L28 82 L22 78 M8 44 L14 38 L17 30" stroke="${INK}" stroke-width="3.5" fill="none"/>`,
  trophy: `<path d="M28 22 H14 Q12 42 32 46 M72 22 H86 Q88 42 68 46" stroke="${INK}" stroke-width="5" fill="none"/>
    <path d="M26 12 H74 V34 Q74 60 50 62 Q26 60 26 34 Z" fill="${PINK}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
    <rect x="43" y="60" width="14" height="14" fill="${INK}"/><rect x="30" y="74" width="40" height="14" rx="4" fill="${INK}"/>
    <path d="M50 24 L54 33 L63 33 L56 39 L59 48 L50 42 L41 48 L44 39 L37 33 L46 33 Z" fill="#fff"/>`,
  medal: `<path d="M28 4 H46 L60 40 H42 Z" fill="${PINK}" stroke="${INK}" stroke-width="3"/><path d="M72 4 H54 L40 40 H58 Z" fill="${INK}"/>
    <circle cx="50" cy="64" r="26" fill="${SOFT}" stroke="${INK}" stroke-width="4"/>
    <path d="M50 48 L55 59 L67 59 L57 66 L61 78 L50 71 L39 78 L43 66 L33 59 L45 59 Z" fill="${PINK}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>`,
  pencil: `<g transform="rotate(-35 50 50)"><rect x="18" y="40" width="58" height="20" fill="${PINK}" stroke="${INK}" stroke-width="4"/>
    <rect x="8" y="40" width="12" height="20" rx="3" fill="${SOFT}" stroke="${INK}" stroke-width="4"/>
    <path d="M76 40 L94 50 L76 60 Z" fill="#ffe3c4" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><path d="M87 46 L94 50 L87 54 Z" fill="${INK}"/>
    <path d="M22 50 H72" stroke="${INK}" stroke-width="2.5" opacity=".5"/></g>`,
  book: `<path d="M50 28 Q30 18 6 24 V82 Q30 76 50 86 Z" fill="#fff" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M50 28 Q70 18 94 24 V82 Q70 76 50 86 Z" fill="${SOFT}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M14 38 Q30 34 42 40 M14 50 Q30 46 42 52 M14 62 Q30 58 42 64 M58 40 Q70 34 86 38 M58 52 Q70 46 86 50" stroke="${PINK}" stroke-width="3" fill="none"/>`,
  crown: `<path d="M10 74 L16 28 L36 50 L50 18 L64 50 L84 28 L90 74 Z" fill="${PINK}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
    <rect x="8" y="72" width="84" height="14" rx="4" fill="${INK}"/><circle cx="16" cy="26" r="5" fill="${SOFT}" stroke="${INK}" stroke-width="3"/>
    <circle cx="50" cy="16" r="6" fill="${SOFT}" stroke="${INK}" stroke-width="3"/><circle cx="84" cy="26" r="5" fill="${SOFT}" stroke="${INK}" stroke-width="3"/>
    <circle cx="30" cy="79" r="3" fill="${PINK}"/><circle cx="50" cy="79" r="3" fill="${PINK}"/><circle cx="70" cy="79" r="3" fill="${PINK}"/>`,
  balloon: `<path d="M50 74 Q44 84 52 90 Q60 96 50 100" stroke="${INK}" stroke-width="2.5" fill="none"/>
    <ellipse cx="50" cy="38" rx="30" ry="34" fill="${PINK}" stroke="${INK}" stroke-width="4"/><path d="M45 72 L55 72 L50 78 Z" fill="${PINK}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
    <ellipse cx="38" cy="24" rx="6" ry="10" fill="#fff" opacity=".6" transform="rotate(25 38 24)"/>`,
  bun: `<path d="M50 30 Q52 18 62 16" stroke="${INK}" stroke-width="3.5" fill="none" stroke-linecap="round"/><ellipse cx="64" cy="15" rx="8" ry="4.5" fill="${PINK2}" stroke="${INK}" stroke-width="3" transform="rotate(-20 64 15)"/>
    <ellipse cx="50" cy="60" rx="42" ry="32" fill="${SOFT}" stroke="${INK}" stroke-width="4"/>${face(50, 58)}`,
  cat: `<path d="M16 46 L22 12 L44 32 Z M84 46 L78 12 L56 32 Z" fill="${SOFT}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><path d="M24 22 L27 34 L35 32 Z M76 22 L73 34 L65 32 Z" fill="${PINK2}"/>
    <ellipse cx="50" cy="60" rx="40" ry="31" fill="${SOFT}" stroke="${INK}" stroke-width="4"/>${face(50, 58)}
    <path d="M6 60 H18 M6 68 L18 66 M94 60 H82 M94 68 L82 66" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>`,
  strawberry: `<path d="M50 22 C80 18 94 34 90 52 C86 74 64 94 50 94 C36 94 14 74 10 52 C6 34 20 18 50 22 Z" fill="${PINK}" stroke="${INK}" stroke-width="4"/>
    <path d="M30 22 L40 8 L50 18 L60 8 L70 22 Q50 30 30 22 Z" fill="#3ccf8e" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
    <g fill="${SOFT}"><ellipse cx="24" cy="44" rx="2" ry="3"/><ellipse cx="76" cy="44" rx="2" ry="3"/><ellipse cx="30" cy="76" rx="2" ry="3"/><ellipse cx="70" cy="76" rx="2" ry="3"/><ellipse cx="50" cy="84" rx="2" ry="3"/></g>
    ${face(50, 52, 12)}`,
};

function sticker(name, cls = "sticker") {
  return `<svg class="${cls}" viewBox="0 0 100 100" aria-hidden="true">${STICKERS[name] || ""}</svg>`;
}

const SQUISHIES = ["bun", "cat", "strawberry"];

// Each worksheet gets one of these themes: its stickers, a mascot and a cheer at the bottom.
const THEMES = [
  { id: "kpop", stickers: ["mic", "lightstick"], cheers: ["את כוכבת על הבמה! ✦", "כל הקהל מריע לך!", "בונוס: שירי את המילים בקול של כוכבת!"] },
  { id: "dance", stickers: ["notes", "sneaker"], cheers: ["רוקדים עם המילים! ♪", "בונוס: ריקוד ניצחון כשמסיימים!", "צעד, צעד, מילה! ♪"] },
  { id: "soccer", stickers: ["ball", "trophy"], cheers: ["גווווול! ⚽", "בעיטה מושלמת למילים!", "קפטנית הקבוצה!"] },
  { id: "sports", stickers: ["medal", "sneaker"], cheers: ["מדליית זהב בדרך!", "אלופת המילים!", "עוד שיא אישי!"] },
  { id: "study", stickers: ["pencil", "book"], cheers: ["מוח של אלופה! ✎", "חכמה וחזקה!", "כל מילה - עוד כוכב ✦"] },
  { id: "squishy", stickers: ["strawberry", "heart"], cheers: ["סקווישי וחמוד! ♡", "רך, ורוד ומנצח!", "לחיצה של כיף! ♡"] },
];
