import {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
  createContext,
  useContext,
  type ReactNode,
  type TouchEvent as ReactTouchEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
import {
  Sigma, Atom, FlaskConical, Dna, ListChecks, User as UserIcon, Home,
  Sun, Moon, ChevronRight, ChevronLeft, Search, Bell, Flame, Star,
  Play, X, TrendingUp, Zap, Target, Trophy, ArrowRight,
  BookOpen, Check, Globe, Lock, LogOut, HelpCircle, Palette as PaletteIcon,
  Vibrate, ShieldCheck, Medal, Send, Type as TypeIcon,
  RefreshCw, Info, Trash2, Share2, MessageCircle, Bot, Volume2, BookMarked,
  type LucideIcon,
} from "lucide-react";

/* ================================================================== */
/*  THEME — "Ink & Ember"                                             */
/* ================================================================== */

type ThemeMode = "light" | "dark";

interface Palette {
  bg: string;
  bgGrad: string;
  card: string;
  cardAlt: string;
  text: string;
  textSoft: string;
  textFaint: string;
  border: string;
  ember: string;
  emberSoft: string;
  emberDeep: string;
  signal: string;
  mint: string;
  gold: string;
  danger: string;
  shadow: string;
  navBg: string;
  chip: string;
  paper: string;
  subjectMath: string;
  subjectPhysics: string;
  subjectChemistry: string;
  subjectBiology: string;
}

interface ThemeContextValue {
  mode: ThemeMode;
  c: Palette;
  toggle: () => void;
  setMode: (mode: ThemeMode) => void;
  accent: AccentId;
  setAccent: (a: AccentId) => void;
  fontId: FontId;
  setFontId: (f: FontId) => void;
  fonts: FontPair;
  /** When true, headings/display text use the body face too — the
   * person's "apply Inter-like font to all text" request, generalized
   * to any chosen pair rather than hardcoded to Inter specifically. */
  uniformFont: boolean;
  setUniformFont: (v: boolean) => void;
}

type AccentId = "ember" | "signal" | "mint" | "violet" | "rose";

const ACCENTS: Record<AccentId, { label: string; dark: [string, string]; light: [string, string] }> = {
  ember: { label: "Ember", dark: ["#FF6B4A", "#D6482C"], light: ["#E85B3B", "#C4451E"] },
  signal: { label: "Signal Blue", dark: ["#5B8CFF", "#3D63D6"], light: ["#3D63D6", "#2A48AE"] },
  mint: { label: "Mint", dark: ["#4ADE9F", "#1FAE79"], light: ["#1FAE79", "#167F58"] },
  violet: { label: "Violet", dark: ["#B18CFF", "#8257E5"], light: ["#8257E5", "#6A3FC7"] },
  rose: { label: "Rose", dark: ["#FF7FA6", "#E14D78"], light: ["#E14D78", "#C22F5C"] },
};

/** Fixed subject-identity colors — independent of the chosen accent.
 * Math=blue, Physics=red, Chemistry=yellow/amber, Biology=green, so a
 * subject reads the same regardless of which accent hue is active. */
const SUBJECT_HUES: Record<SubjectId, { dark: string; light: string }> = {
  math: { dark: "#5B8CFF", light: "#2A56D6" },
  physics: { dark: "#FF6B6B", light: "#D6392F" },
  chemistry: { dark: "#F2C14B", light: "#B9821A" },
  biology: { dark: "#4ADE9F", light: "#1B9E68" },
};

type FontId =
  | "editorial" | "classic" | "geometric" | "friendly"
  | "inter" | "modernSans" | "grotesk" | "serifBook"
  | "mono" | "elegant" | "rounded" | "technical";

interface FontPair { display: string; body: string; label: string; import: string; desc: string; }

/** 12 professional pairs. "inter" is the person's requested pure
 * Inter-everywhere option; the rest give real variety in register
 * (editorial serif, geometric sans, monospace-technical, etc.) rather
 * than four near-duplicate sans pairings. */
const FONT_PAIRS: Record<FontId, FontPair> = {
  editorial: {
    label: "Editorial",
    desc: "Warm literary serif, tuned for long reading",
    display: "'Fraunces', Georgia, serif",
    body: "'Inter', -apple-system, sans-serif",
    import: "family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700;9..144,800&family=Inter:wght@400;500;600;700;800",
  },
  classic: {
    label: "Classic",
    desc: "Timeless textbook serif with a humanist sans",
    display: "'Playfair Display', Georgia, serif",
    body: "'Source Sans 3', -apple-system, sans-serif",
    import: "family=Playfair+Display:wght@500;600;700;800&family=Source+Sans+3:wght@400;500;600;700;800",
  },
  geometric: {
    label: "Geometric",
    desc: "Confident rounded geometry, friendly headings",
    display: "'Poppins', -apple-system, sans-serif",
    body: "'Inter', -apple-system, sans-serif",
    import: "family=Poppins:wght@500;600;700;800&family=Inter:wght@400;500;600;700;800",
  },
  friendly: {
    label: "Friendly",
    desc: "Soft, approachable — great for younger learners",
    display: "'Quicksand', -apple-system, sans-serif",
    body: "'Nunito', -apple-system, sans-serif",
    import: "family=Quicksand:wght@500;600;700&family=Nunito:wght@400;500;600;700;800",
  },
  inter: {
    label: "Inter (uniform)",
    desc: "Clean, neutral, applied consistently everywhere",
    display: "'Inter', -apple-system, sans-serif",
    body: "'Inter', -apple-system, sans-serif",
    import: "family=Inter:wght@400;500;600;700;800;900",
  },
  modernSans: {
    label: "Modern Sans",
    desc: "Crisp product-UI feel, high legibility at small sizes",
    display: "'Manrope', -apple-system, sans-serif",
    body: "'Manrope', -apple-system, sans-serif",
    import: "family=Manrope:wght@400;500;600;700;800",
  },
  grotesk: {
    label: "Grotesk",
    desc: "Contemporary Swiss grotesk, editorial-tech tone",
    display: "'Space Grotesk', -apple-system, sans-serif",
    body: "'IBM Plex Sans', -apple-system, sans-serif",
    import: "family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700",
  },
  serifBook: {
    label: "Book Serif",
    desc: "Traditional printed-textbook serif throughout",
    display: "'Lora', Georgia, serif",
    body: "'Lora', Georgia, serif",
    import: "family=Lora:wght@400;500;600;700",
  },
  mono: {
    label: "Technical Mono",
    desc: "Monospace headings — precise, STEM-lab character",
    display: "'JetBrains Mono', 'Courier New', monospace",
    body: "'Inter', -apple-system, sans-serif",
    import: "family=JetBrains+Mono:wght@500;600;700;800&family=Inter:wght@400;500;600;700",
  },
  elegant: {
    label: "Elegant",
    desc: "High-contrast display serif, refined and formal",
    display: "'Cormorant Garamond', Georgia, serif",
    body: "'Work Sans', -apple-system, sans-serif",
    import: "family=Cormorant+Garamond:wght@500;600;700&family=Work+Sans:wght@400;500;600;700",
  },
  rounded: {
    label: "Rounded",
    desc: "Soft rounded terminals, playful but professional",
    display: "'Baloo 2', -apple-system, sans-serif",
    body: "'Mulish', -apple-system, sans-serif",
    import: "family=Baloo+2:wght@500;600;700;800&family=Mulish:wght@400;500;600;700;800",
  },
  technical: {
    label: "Technical",
    desc: "Engineering-manual clarity, dense and functional",
    display: "'Archivo', -apple-system, sans-serif",
    body: "'Archivo', -apple-system, sans-serif",
    import: "family=Archivo:wght@400;500;600;700;800",
  },
};

const ThemeCtx = createContext<ThemeContextValue | null>(null);
const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};

const palettes: Record<ThemeMode, Palette> = {
  dark: {
    bg: "#0B0D12",
    bgGrad: "radial-gradient(130% 100% at 50% -10%, #171A24 0%, #0D0F16 50%, #08090D 100%)",
    card: "#13161F",
    cardAlt: "#191D29",
    text: "#F3F1EC",
    textSoft: "#A6ABBC",
    textFaint: "#5F6577",
    border: "rgba(243,241,236,0.07)",
    ember: "#FF6B4A",
    emberSoft: "rgba(255,107,74,0.15)",
    emberDeep: "#D6482C",
    signal: "#5B8CFF",
    mint: "#4ADE9F",
    gold: "#F2B84B",
    danger: "#FF5D6C",
    shadow: "0 24px 48px -20px rgba(0,0,0,0.6)",
    navBg: "rgba(19,22,31,0.82)",
    chip: "#1B1F2B",
    paper: "#0D0F16",
    subjectMath: SUBJECT_HUES.math.dark,
    subjectPhysics: SUBJECT_HUES.physics.dark,
    subjectChemistry: SUBJECT_HUES.chemistry.dark,
    subjectBiology: SUBJECT_HUES.biology.dark,
  },
  light: {
    bg: "#FAF7F2",
    bgGrad: "linear-gradient(180deg,#FDFBF8 0%,#F8F4EE 50%,#F3EEE6 100%)",
    card: "#FFFFFF",
    cardAlt: "#F7F3EC",
    text: "#1B1A17",
    textSoft: "#68655D",
    textFaint: "#A39E92",
    border: "rgba(38,32,20,0.08)",
    ember: "#E85B3B",
    emberSoft: "rgba(232,91,59,0.12)",
    emberDeep: "#C4451E",
    signal: "#3D63D6",
    mint: "#1FAE79",
    gold: "#C98A1E",
    danger: "#E14D5C",
    shadow: "0 20px 40px -18px rgba(120,80,50,0.22)",
    navBg: "rgba(255,255,255,0.85)",
    chip: "#F0EBE1",
    paper: "#FFFFFF",
    subjectMath: SUBJECT_HUES.math.light,
    subjectPhysics: SUBJECT_HUES.physics.light,
    subjectChemistry: SUBJECT_HUES.chemistry.light,
    subjectBiology: SUBJECT_HUES.biology.light,
  },
};

/** Applies the chosen accent hue on top of a base mode palette. Field
 * names (ember/emberSoft/emberDeep) are kept as-is across the app for
 * a minimal diff — what changes is which hue they resolve to. */
function applyAccent(base: Palette, mode: ThemeMode, accent: AccentId): Palette {
  const [main, deep] = ACCENTS[accent][mode];
  return {
    ...base,
    ember: main,
    emberDeep: deep,
    emberSoft: mode === "dark" ? `${main}26` : `${main}1F`,
    shadow: mode === "dark" ? base.shadow : `0 20px 40px -18px ${main}38`,
    subjectMath: SUBJECT_HUES.math[mode],
    subjectPhysics: SUBJECT_HUES.physics[mode],
    subjectChemistry: SUBJECT_HUES.chemistry[mode],
    subjectBiology: SUBJECT_HUES.biology[mode],
  };
}

function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>("light");
  const [accent, setAccent] = useState<AccentId>("signal");
  const [fontId, setFontId] = useState<FontId>("editorial");
  const [uniformFont, setUniformFont] = useState(false);
  const c = useMemo(() => applyAccent(palettes[mode], mode, accent), [mode, accent]);
  const fonts = FONT_PAIRS[fontId];
  const toggle = () => setMode((m) => (m === "dark" ? "light" : "dark"));
  return (
    <ThemeCtx.Provider value={{ mode, c, toggle, setMode, accent, setAccent, fontId, setFontId, fonts, uniformFont, setUniformFont }}>
      {children}
    </ThemeCtx.Provider>
  );
}

/* ================================================================== */
/*  GLOBAL STYLE                                                       */
/* ================================================================== */

const GlobalStyle = ({ fonts, uniformFont }: { fonts: FontPair; uniformFont: boolean }) => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?${fonts.import}&display=swap');

    * { box-sizing: border-box; }
    .app-root {
      font-family: ${fonts.body};
      -webkit-font-smoothing: antialiased;
    }
    .app-root h1, .app-root h2, .app-root h3, .app-root .display {
      font-family: ${uniformFont ? fonts.body : fonts.display};
      font-optical-sizing: auto;
    }
    .app-scroll::-webkit-scrollbar { width: 0px; height: 0px; }
    .app-scroll { scrollbar-width: none; -ms-overflow-style: none; }

    @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes popIn { 0% { opacity: 0; transform: scale(0.85); } 60% { opacity: 1; transform: scale(1.03); } 100% { opacity: 1; transform: scale(1); } }
    @keyframes floatY { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-6px); } }
    @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
    @keyframes pulseRing { 0% { box-shadow: 0 0 0 0 rgba(255,107,74,0.35); } 70% { box-shadow: 0 0 0 10px rgba(255,107,74,0); } 100% { box-shadow: 0 0 0 0 rgba(255,107,74,0); } }
    @keyframes wiggle { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(-4deg); } 75% { transform: rotate(4deg); } }
    @keyframes slideInRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes scaleFade { from { opacity: 0; transform: scale(0.94); } to { opacity: 1; transform: scale(1); } }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes sheetUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
    @keyframes scrimIn { from { opacity: 0; } to { opacity: 1; } }
    .btn-press { transition: transform .15s cubic-bezier(.4,0,.2,1), box-shadow .2s, background .2s; }
    .btn-press:active { transform: scale(0.94); }
    .hover-lift { transition: transform .25s cubic-bezier(.16,1,.3,1), box-shadow .25s; }
  `}</style>
);

/* ================================================================== */
/*  WORD OF THE DAY — TTS + dictionary bottom sheet                    */
/* ================================================================== */

interface WordEntry {
  word: string;
  phonetic: string;
  partOfSpeech: string;
  definition: string;
  example: string;
  synonyms: string[];
  subject: SubjectId;
}

const WORD_BANK: WordEntry[] = [
  { word: "Asymptote", phonetic: "\u02c8as-\u0259m(p)-\u02cct\u014dt", partOfSpeech: "noun", definition: "A line that a curve approaches but never quite touches as it stretches to infinity.", example: "As x grows larger, the curve hugs the horizontal asymptote at y = 0.", synonyms: ["limit line", "boundary curve"], subject: "math" },
  { word: "Derivative", phonetic: "d\u0259-\u02c8riv-\u0259t-iv", partOfSpeech: "noun", definition: "A measure of how a function's output changes as its input changes, at a single point.", example: "The derivative of position with respect to time gives you velocity.", synonyms: ["rate of change", "gradient"], subject: "math" },
  { word: "Integral", phonetic: "\u02c8in-ti-gr\u0259l", partOfSpeech: "noun", definition: "The accumulated total of a quantity over an interval, found as the area under a curve.", example: "The integral of velocity over time gives the total distance traveled.", synonyms: ["antiderivative", "accumulated sum"], subject: "math" },
  { word: "Vector", phonetic: "\u02c8v\u0113k-t\u0259r", partOfSpeech: "noun", definition: "A quantity with both magnitude and direction, often drawn as an arrow.", example: "Displacement is a vector, while distance is just a number.", synonyms: ["directed quantity"], subject: "math" },
  { word: "Coefficient", phonetic: "\u02cck\u014d-\u0259-\u02c8fish-\u0259nt", partOfSpeech: "noun", definition: "A number multiplied by a variable in an algebraic term.", example: "In 5x\u00b2, the coefficient of x\u00b2 is 5.", synonyms: ["multiplier", "factor"], subject: "math" },
  { word: "Polynomial", phonetic: "\u02ccp\u0252-l\u0113-\u02c8n\u014d-m\u0113-\u0259l", partOfSpeech: "noun", definition: "An expression made of variables and coefficients combined using addition, subtraction, and multiplication.", example: "3x\u00b2 + 2x \u2212 5 is a polynomial of degree two.", synonyms: ["multinomial expression"], subject: "math" },
  { word: "Momentum", phonetic: "m\u014d-\u02c8men-t\u0259m", partOfSpeech: "noun", definition: "The quantity of motion an object has, equal to its mass multiplied by its velocity.", example: "A loaded truck has far more momentum than a bicycle at the same speed.", synonyms: ["impetus", "inertia of motion"], subject: "physics" },
  { word: "Velocity", phonetic: "v\u0259-\u02c8l\u0252s-\u0259-t\u0113", partOfSpeech: "noun", definition: "The rate of change of an object's position, including direction.", example: "The car's velocity was 60 km/h due north.", synonyms: ["speed with direction"], subject: "physics" },
  { word: "Amplitude", phonetic: "\u02c8am-pli-t(y)\u00fcd", partOfSpeech: "noun", definition: "The maximum displacement of a wave from its resting position.", example: "Turning up the volume increases a sound wave's amplitude.", synonyms: ["peak height", "magnitude of oscillation"], subject: "physics" },
  { word: "Torque", phonetic: "t\u00f4rk", partOfSpeech: "noun", definition: "A twisting force that tends to cause rotation around an axis.", example: "Tightening a bolt with a wrench applies torque around its center.", synonyms: ["rotational force", "moment"], subject: "physics" },
  { word: "Frequency", phonetic: "\u02c8fr\u0113-kw\u0259n-s\u0113", partOfSpeech: "noun", definition: "The number of complete wave cycles that pass a point each second.", example: "A higher frequency sound wave produces a higher-pitched tone.", synonyms: ["cycle rate", "oscillation rate"], subject: "physics" },
  { word: "Catalyst", phonetic: "\u02c8ka-t\u0259l-\u0259st", partOfSpeech: "noun", definition: "A substance that speeds up a chemical reaction without being consumed by it.", example: "Enzymes act as biological catalysts inside every living cell.", synonyms: ["accelerant", "trigger"], subject: "chemistry" },
  { word: "Isotope", phonetic: "\u02c8\u012b-s\u0259-\u02cct\u014dp", partOfSpeech: "noun", definition: "A version of an element with the same number of protons but a different number of neutrons.", example: "Carbon-14 is a radioactive isotope used to date ancient fossils.", synonyms: ["nuclide variant"], subject: "chemistry" },
  { word: "Molarity", phonetic: "m\u014d-\u02c8lar-\u0259-t\u0113", partOfSpeech: "noun", definition: "A measure of concentration equal to moles of solute per liter of solution.", example: "A 1M solution of NaCl contains one mole of salt per liter of water.", synonyms: ["molar concentration"], subject: "chemistry" },
  { word: "Covalent", phonetic: "k\u014d-\u02c8v\u0101-l\u0259nt", partOfSpeech: "adjective", definition: "Describing a bond formed when two atoms share a pair of electrons.", example: "Water molecules are held together by covalent bonds between H and O.", synonyms: ["electron-sharing"], subject: "chemistry" },
  { word: "Equilibrium", phonetic: "\u02cc\u0113-kw\u0259-\u02c8lib-r\u0113-\u0259m", partOfSpeech: "noun", definition: "A state where the forward and reverse rates of a reaction are equal, so concentrations stop changing.", example: "The reaction reached equilibrium after ten minutes at constant temperature.", synonyms: ["balance", "steady state"], subject: "chemistry" },
  { word: "Homeostasis", phonetic: "\u02cch\u014d-m\u0113-\u014d-\u02c8st\u0101-s\u0259s", partOfSpeech: "noun", definition: "The tendency of a living system to keep its internal conditions stable and balanced.", example: "Sweating helps the body maintain homeostasis on a hot day.", synonyms: ["equilibrium", "internal balance"], subject: "biology" },
  { word: "Mitosis", phonetic: "m\u012b-\u02c8t\u014d-s\u0259s", partOfSpeech: "noun", definition: "The process by which a single cell divides to produce two genetically identical daughter cells.", example: "Skin cells constantly renew themselves through mitosis.", synonyms: ["cell division"], subject: "biology" },
  { word: "Allele", phonetic: "\u0259-\u02c8l\u0113l", partOfSpeech: "noun", definition: "One of two or more alternative versions of a gene at the same position on a chromosome.", example: "You inherit one allele for eye color from each parent.", synonyms: ["gene variant"], subject: "biology" },
  { word: "Photosynthesis", phonetic: "\u02ccf\u014d-t\u014d-\u02c8sin(t)-th\u0259-s\u0259s", partOfSpeech: "noun", definition: "The process plants use to convert light energy into chemical energy stored as glucose.", example: "Photosynthesis in chloroplasts releases oxygen as a byproduct.", synonyms: ["light-driven synthesis"], subject: "biology" },
  { word: "Enzyme", phonetic: "\u02c8en-\u02ccz\u012bm", partOfSpeech: "noun", definition: "A protein that speeds up a specific biochemical reaction inside a living organism.", example: "Amylase is the enzyme that begins breaking down starch in saliva.", synonyms: ["biological catalyst"], subject: "biology" },
];

/** Simple case-insensitive search across word, definition and part of
 * speech text, so the dictionary is useful for more than the exact
 * headword — matches on "protein" should still surface "Enzyme". */
function searchWordBank(query: string): WordEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return WORD_BANK.filter(
    (w) => w.word.toLowerCase().includes(q) || w.definition.toLowerCase().includes(q) || w.synonyms.some((s) => s.toLowerCase().includes(q))
  );
}

/** Best-effort subject guess for a word looked up online (the free
 * dictionary API has no subject taxonomy of its own) — falls back to
 * "math" as a neutral default so SubjectBadge always has a valid id. */
function guessSubjectForWord(word: string, definition: string): SubjectId {
  const text = `${word} ${definition}`.toLowerCase();
  const scores: Record<SubjectId, number> = { math: 0, physics: 0, chemistry: 0, biology: 0 };
  const KEYWORDS: Record<SubjectId, string[]> = {
    math: ["number", "equation", "geometry", "algebra", "calculus", "function", "theorem", "matrix"],
    physics: ["force", "energy", "motion", "wave", "particle", "velocity", "quantum", "electric"],
    chemistry: ["compound", "molecule", "reaction", "acid", "element", "bond", "solution", "atom"],
    biology: ["cell", "organism", "gene", "protein", "species", "tissue", "enzyme", "dna"],
  };
  (Object.keys(KEYWORDS) as SubjectId[]).forEach((s) => {
    KEYWORDS[s].forEach((k) => { if (text.includes(k)) scores[s] += 1; });
  });
  const best = (Object.keys(scores) as SubjectId[]).reduce((a, b) => (scores[b] > scores[a] ? b : a), "math" as SubjectId);
  return scores[best] > 0 ? best : "math";
}

/** Shape returned by api.dictionaryapi.dev — kept minimal to just the
 * fields we use, since the real payload has more nested variability
 * (multiple meanings/phonetics per entry) than this app needs. */
interface DictionaryApiMeaning { partOfSpeech: string; definitions: { definition: string; example?: string; synonyms?: string[] }[]; }
interface DictionaryApiEntry { word: string; phonetic?: string; phonetics: { text?: string }[]; meanings: DictionaryApiMeaning[]; }

/** Looks a word up against the free, keyless dictionaryapi.dev
 * service and reshapes the first entry into our WordEntry type so
 * the rest of the dictionary UI (TTS, synonym chips, subject badge)
 * works identically whether a word came from the local bank or the
 * network. Returns null on any failure so callers can fall back. */
async function fetchWordOnline(word: string): Promise<WordEntry | null> {
  const q = word.trim();
  if (!q) return null;
  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(q)}`);
    if (!res.ok) return null;
    const data: DictionaryApiEntry[] = await res.json();
    const entry = data[0];
    const meaning = entry?.meanings?.[0];
    const def = meaning?.definitions?.[0];
    if (!entry || !meaning || !def) return null;
    const phonetic = entry.phonetic || entry.phonetics.find((p) => p.text)?.text || "";
    const subject = guessSubjectForWord(entry.word, def.definition);
    return {
      word: entry.word,
      phonetic,
      partOfSpeech: meaning.partOfSpeech || "word",
      definition: def.definition,
      example: def.example || "No example sentence available for this word.",
      synonyms: (def.synonyms && def.synonyms.length > 0 ? def.synonyms : meaning.definitions.flatMap((d) => d.synonyms ?? [])).slice(0, 6),
      subject,
    };
  } catch {
    return null;
  }
}

type DictSearchStatus = "idle" | "loading" | "done" | "error";

/** Debounced online-first search hook: tries the local curated bank
 * first (instant, on-topic results for the app's own subjects), then
 * augments with a live network lookup so any word in the language can
 * be searched — not just the ~20 seeded STEM terms. */
function useDictionarySearch(query: string) {
  const [onlineResult, setOnlineResult] = useState<WordEntry | null>(null);
  const [status, setStatus] = useState<DictSearchStatus>("idle");
  const localResults = useMemo(() => searchWordBank(query), [query]);

  useEffect(() => {
    const q = query.trim();
    if (!q) { setOnlineResult(null); setStatus("idle"); return; }
    setStatus("loading");
    const handle = setTimeout(() => {
      fetchWordOnline(q).then((result) => {
        setOnlineResult(result);
        setStatus(result ? "done" : "error");
      });
    }, 420);
    return () => clearTimeout(handle);
  }, [query]);

  return { localResults, onlineResult, status };
}

function wordOfDay(): WordEntry {
  const dayIndex = Math.floor(Date.now() / 86400000);
  return WORD_BANK[dayIndex % WORD_BANK.length];
}

/** Wraps the Web Speech API. Falls back to a disabled state silently
 * if the browser doesn't support speech synthesis, rather than
 * throwing — this widget should degrade gracefully everywhere. */
function useSpeak() {
  const [speaking, setSpeaking] = useState(false);
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;

  const speak = useCallback((text: string) => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.92;
    utter.onstart = () => setSpeaking(true);
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utter);
  }, [supported]);

  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [supported]);

  return { speak, stop, speaking, supported };
}

function WordOfDayWidget({ c, entry, onOpenDictionary, onSearchDictionary }: { c: Palette; entry: WordEntry; onOpenDictionary: () => void; onSearchDictionary: () => void }) {
  const { speak, stop, speaking, supported } = useSpeak();
  return (
    <div
      style={{
        position: "relative",
        borderRadius: 28,
        padding: 20,
        background: `linear-gradient(150deg, ${c.card} 0%, ${c.cardAlt} 100%)`,
        border: `1px solid ${c.border}`,
        overflow: "hidden",
        marginBottom: 20,
        animation: "fadeSlideUp .5s ease .05s both",
        boxShadow: c.shadow,
      }}
    >
      <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: `radial-gradient(circle, ${c.ember}22, transparent 70%)` }} />
      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: c.ember, textTransform: "uppercase", letterSpacing: 0.6 }}>Word of the day</span>
        <SubjectBadge subject={entry.subject} size={30} c={c} />
      </div>

      <div style={{ position: "relative", display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
        <span className="display" style={{ fontSize: 27, fontWeight: 600, color: c.text }}>{entry.word}</span>
        <span style={{ fontSize: 13, color: c.textFaint, fontWeight: 500 }}>{entry.phonetic}</span>
      </div>
      <div style={{ fontSize: 11.5, fontWeight: 700, color: c.textSoft, fontStyle: "italic", marginBottom: 10 }}>{entry.partOfSpeech}</div>
      <div style={{ fontSize: 13.5, color: c.textSoft, fontWeight: 500, lineHeight: 1.55, marginBottom: 18 }}>{entry.definition}</div>

      <div style={{ position: "relative", display: "flex", gap: 10 }}>
        <button
          onClick={() => (speaking ? stop() : speak(`${entry.word}. ${entry.definition}`))}
          disabled={!supported}
          className="btn-press"
          style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 16px", borderRadius: 16,
            border: "none", cursor: supported ? "pointer" : "default", background: speaking ? c.ember : c.emberSoft, color: speaking ? "#fff" : c.ember,
            fontWeight: 700, fontSize: 13, opacity: supported ? 1 : 0.5,
          }}
        >
          <Volume2 size={16} style={{ animation: speaking ? "wiggle 0.6s ease-in-out infinite" : "none" }} />
          {speaking ? "Stop" : "Listen"}
        </button>
        <button
          onClick={onOpenDictionary}
          className="btn-press"
          style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 16px", borderRadius: 16, border: `1px solid ${c.border}`, cursor: "pointer", background: c.card, color: c.text, fontWeight: 700, fontSize: 13 }}
        >
          <BookMarked size={15} /> Dictionary
        </button>
        <button
          onClick={onSearchDictionary}
          className="btn-press"
          aria-label="Search dictionary"
          style={{ width: 44, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 16, border: `1px solid ${c.border}`, cursor: "pointer", background: c.card, color: c.textSoft }}
        >
          <Search size={16} />
        </button>
      </div>
    </div>
  );
}

/** Half-screen bottom sheet with the full dictionary entry: expanded
 * definition, an example sentence, synonyms as chips, and its own
 * listen button so the word can be replayed from inside the modal. */
/** One row in the dictionary's search-results list. */
function DictSearchRow({ entry, onOpen, c }: { entry: WordEntry; onOpen: () => void; c: Palette }) {
  return (
    <button
      onClick={onOpen}
      className="btn-press"
      style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 12, padding: 12, borderRadius: 16, background: c.card, border: `1px solid ${c.border}`, marginBottom: 8, cursor: "pointer" }}
    >
      <SubjectBadge subject={entry.subject} size={36} c={c} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: c.text }}>{entry.word}</div>
        <div style={{ fontSize: 11.5, color: c.textFaint, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{entry.definition}</div>
      </div>
      <ChevronRight size={15} color={c.textFaint} style={{ flexShrink: 0 }} />
    </button>
  );
}

/** The full rich entry view: TTS, definition, example, synonyms. */
function DictEntryDetail({ entry, c }: { entry: WordEntry; c: Palette }) {
  const { speak, stop, speaking, supported } = useSpeak();
  useEffect(() => () => stop(), [stop]);
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <SubjectBadge subject={entry.subject} size={44} c={c} />
        <div>
          <div className="display" style={{ fontSize: 24, fontWeight: 600, color: c.text }}>{entry.word}</div>
          <div style={{ fontSize: 12.5, color: c.textFaint, fontWeight: 500 }}>{entry.phonetic} &bull; <em>{entry.partOfSpeech}</em></div>
        </div>
      </div>

      <button
        onClick={() => (speaking ? stop() : speak(`${entry.word}. ${entry.definition} For example: ${entry.example}`))}
        disabled={!supported}
        className="btn-press"
        style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 14, border: "none", cursor: supported ? "pointer" : "default", background: speaking ? c.ember : c.emberSoft, color: speaking ? "#fff" : c.ember, fontWeight: 700, fontSize: 12.5, marginBottom: 20, opacity: supported ? 1 : 0.5 }}
      >
        <Volume2 size={15} style={{ animation: speaking ? "wiggle 0.6s ease-in-out infinite" : "none" }} />
        {speaking ? "Stop reading" : "Read aloud"}
      </button>

      <div style={{ marginBottom: 8, fontSize: 11, fontWeight: 700, color: c.textFaint, textTransform: "uppercase", letterSpacing: 0.5 }}>Definition</div>
      <div style={{ fontSize: 14, color: c.text, fontWeight: 500, lineHeight: 1.6, marginBottom: 18 }}>{entry.definition}</div>

      <div style={{ marginBottom: 8, fontSize: 11, fontWeight: 700, color: c.textFaint, textTransform: "uppercase", letterSpacing: 0.5 }}>Example</div>
      <div style={{ fontSize: 13.5, color: c.textSoft, fontWeight: 500, fontStyle: "italic", lineHeight: 1.6, marginBottom: 18, padding: "12px 14px", background: c.card, borderRadius: 14, border: `1px solid ${c.border}` }}>
        &ldquo;{entry.example}&rdquo;
      </div>

      <div style={{ marginBottom: 8, fontSize: 11, fontWeight: 700, color: c.textFaint, textTransform: "uppercase", letterSpacing: 0.5 }}>Related terms</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {entry.synonyms.map((syn) => (
          <span key={syn} style={{ fontSize: 12, fontWeight: 700, color: c.textSoft, background: c.chip, padding: "7px 13px", borderRadius: 99 }}>{syn}</span>
        ))}
      </div>
    </>
  );
}

/** Dictionary bottom sheet. Opens either straight into a word's rich
 * detail view (word-of-the-day) or, when opened without a starting
 * entry, into a search view where the person can look up any word in
 * the bank and drill into its full entry. A back arrow inside the
 * detail view returns to search rather than closing the sheet. */
function DictionaryModal({ entry, onClose, c }: { entry?: WordEntry; onClose: () => void; c: Palette }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<WordEntry | null>(entry ?? null);
  const { localResults, onlineResult, status } = useDictionarySearch(query);
  const showingSearch = !selected;
  // De-dupe: don't show the online card again if a local entry with
  // the exact same headword already matched.
  const showOnlineCard = onlineResult && !localResults.some((r) => r.word.toLowerCase() === onlineResult.word.toLowerCase());

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 70, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div
        onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", animation: "scrimIn .25s ease" }}
      />
      <div
        style={{
          position: "relative", background: c.bg, borderRadius: "28px 28px 0 0", height: "68%", display: "flex", flexDirection: "column",
          animation: "sheetUp .35s cubic-bezier(.16,1,.3,1)", boxShadow: "0 -20px 50px -20px rgba(0,0,0,0.5)", border: `1px solid ${c.border}`, borderBottom: "none",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 10 }}>
          <div style={{ width: 38, height: 4, borderRadius: 99, background: c.border }} />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 20px 10px" }}>
          {!showingSearch && entry === undefined && (
            <IconBtn icon={ChevronLeft} c={c} onClick={() => setSelected(null)} size={30} />
          )}
          <span style={{ flex: 1, fontSize: 11, fontWeight: 700, color: c.textFaint, textTransform: "uppercase", letterSpacing: 0.6 }}>Dictionary</span>
          <IconBtn icon={X} c={c} onClick={onClose} size={32} />
        </div>

        {showingSearch && (
          <div style={{ padding: "0 20px 10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: c.card, border: `1px solid ${c.border}`, borderRadius: 16, padding: "11px 14px" }}>
              <Search size={16} color={c.textFaint} />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search any word online..."
                style={{ flex: 1, border: "none", outline: "none", background: "transparent", color: c.text, fontSize: 13.5, fontWeight: 600 }}
              />
              {status === "loading" && <RefreshCw size={15} color={c.textFaint} style={{ animation: "spin 1s linear infinite" }} />}
              {query && status !== "loading" && <IconBtn icon={X} c={c} size={22} onClick={() => setQuery("")} />}
            </div>
          </div>
        )}

        <div className="app-scroll" style={{ flex: 1, overflowY: "auto", padding: "8px 20px 28px" }}>
          {showingSearch ? (
            <>
              {!query && (
                <div style={{ textAlign: "center", marginTop: 40, color: c.textFaint }}>
                  <BookMarked size={26} style={{ marginBottom: 10, opacity: 0.4 }} />
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Search any word online</div>
                  <div style={{ fontSize: 11.5, fontWeight: 500 }}>Plus {WORD_BANK.length} curated STEM terms built in</div>
                </div>
              )}
              {query && localResults.length === 0 && status === "error" && (
                <div style={{ textAlign: "center", marginTop: 40, color: c.textFaint }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>No matches for &ldquo;{query}&rdquo;</div>
                  <div style={{ fontSize: 11.5, fontWeight: 500, marginTop: 4 }}>Check your connection or try another spelling</div>
                </div>
              )}
              {localResults.length > 0 && (
                <div style={{ marginBottom: 4, fontSize: 10.5, fontWeight: 700, color: c.textFaint, textTransform: "uppercase", letterSpacing: 0.5, padding: "4px 2px" }}>From this app</div>
              )}
              {localResults.map((r) => (
                <DictSearchRow key={r.word} entry={r} onOpen={() => setSelected(r)} c={c} />
              ))}
              {showOnlineCard && (
                <>
                  <div style={{ marginBottom: 4, marginTop: localResults.length > 0 ? 14 : 0, fontSize: 10.5, fontWeight: 700, color: c.textFaint, textTransform: "uppercase", letterSpacing: 0.5, padding: "4px 2px", display: "flex", alignItems: "center", gap: 6 }}>
                    <Globe size={11} /> From the web
                  </div>
                  <DictSearchRow entry={onlineResult!} onOpen={() => setSelected(onlineResult!)} c={c} />
                </>
              )}
            </>
          ) : (
            <DictEntryDetail entry={selected} c={c} />
          )}
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  SUBJECT BADGE — realistic rounded-square icon tile                 */
/* ================================================================== */

type SubjectId = "math" | "physics" | "chemistry" | "biology";

const BADGE_ICON: Record<SubjectId, LucideIcon> = {
  math: Sigma,
  physics: Atom,
  chemistry: FlaskConical,
  biology: Dna,
};

/** Fixed per-subject color, independent of the chosen accent hue:
 * Math=blue, Physics=red, Chemistry=yellow, Biology=green — always. */
function subjectColor(subject: SubjectId, c: Palette): string {
  if (subject === "math") return c.subjectMath;
  if (subject === "physics") return c.subjectPhysics;
  if (subject === "chemistry") return c.subjectChemistry;
  return c.subjectBiology;
}

function SubjectBadge({ subject, size = 52, c }: { subject: SubjectId; size?: number; c: Palette }) {
  const Icon = BADGE_ICON[subject];
  const color = subjectColor(subject, c);
  return (
    <div
      className="hover-lift"
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.32,
        background: c.cardAlt,
        border: `1px solid ${c.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        flexShrink: 0,
        boxShadow: `inset 0 1px 0 ${c.border}`,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: size * 0.32,
          background: `linear-gradient(140deg, ${color}22, transparent 60%)`,
        }}
      />
      <Icon size={size * 0.46} color={color} strokeWidth={2.1} style={{ position: "relative" }} />
    </div>
  );
}

/* ================================================================== */
/*  DATA MODEL                                                         */
/* ================================================================== */

type ColorKey = "ember" | "signal" | "mint" | "gold";

interface Subject {
  id: SubjectId;
  name: string;
  tagline: string;
  progress: number;
  lessons: number;
  done: number;
  color: ColorKey;
}

/** Base subject metadata. `lessons` count is filled in just below from
 * the real LESSONS_BY_SUBJECT data — kept derived rather than
 * hardcoded so adding a lesson can never silently desync the count
 * shown across the app (this exact bug happened once already). */
const SUBJECTS_BASE: Omit<Subject, "lessons">[] = [
  { id: "math", name: "Mathematics", tagline: "Algebra to Calculus", progress: 0, done: 0, color: "ember" },
  { id: "physics", name: "Physics", tagline: "Mechanics & Waves", progress: 0, done: 0, color: "signal" },
  { id: "chemistry", name: "Chemistry", tagline: "Organic & Reactions", progress: 0, done: 0, color: "gold" },
  { id: "biology", name: "Biology", tagline: "Cells to Genetics", progress: 0, done: 0, color: "mint" },
];

/* ---- Rich lesson content blocks --------------------------------- */
/** Plain paragraph, optionally with a handful of inline spans marked
 * up as definitions/terms/emphasis so a lesson's prose can highlight
 * key vocabulary without leaving the paragraph flow. */
interface TextBlock {
  kind: "text";
  body: string;
  /** Inline spans within `body` to highlight — matched by exact
   * substring. `term` renders as a colored, definition-style span
   * (tap-to-reveal meaning); `emphasis` is a plain bold highlight. */
  spans?: { text: string; type: "term" | "emphasis"; meaning?: string }[];
}
/** A pulled-out definition callout — its own card, not inline. */
interface DefinitionBlock { kind: "definition"; term: string; meaning: string; }
/** A math expression or worked formula, rendered on a canvas so it
 * can include exponents/fractions-style layout rather than plain text. */
interface FormulaBlock { kind: "formula"; expression: string; caption?: string; }
/** A simple function/data graph, drawn on canvas from sampled points
 * or a plot function — covers "graphs" in the markup requirement. */
interface GraphBlock {
  kind: "graph";
  caption?: string;
  fn: (x: number) => number;
  domain: [number, number];
  color?: ColorKey;
}
/** A labeled-node diagram (e.g. atom structure, cell parts, force
 * diagram) — simple positioned nodes + connecting lines on canvas. */
interface DiagramBlock {
  kind: "diagram";
  caption?: string;
  nodes: { x: number; y: number; label: string }[];
  edges?: [number, number][];
}
/** An external reference link shown as a tappable card. */
interface LinkBlock { kind: "link"; label: string; url: string; }
type ContentBlock = TextBlock | DefinitionBlock | FormulaBlock | GraphBlock | DiagramBlock | LinkBlock;

/** One screen the learner advances through via "Next" — a handful of
 * content blocks, with an optional exercise checkpoint at the end. */
interface LessonStep {
  blocks: ContentBlock[];
  checkpoint?: Exercise;
}

/** One swipeable topic within a lesson (Programming Hub-style) — a
 * short run of Next-advanced steps under a single section heading. */
interface LessonSection {
  heading: string;
  steps: LessonStep[];
}

interface Lesson {
  title: string;
  mins: number;
  done: boolean;
  active?: boolean;
  /** Full step-by-step content. Lessons without this yet fall back to
   * a short placeholder section so every card in the list still opens
   * into a working player rather than a dead end. */
  sections?: LessonSection[];
}

const QUADRATICS_LESSON_SECTIONS: LessonSection[] = [
  {
    heading: "What makes an equation quadratic?",
    steps: [
      {
        blocks: [
          {
            kind: "text",
            body: "A quadratic equation is any equation where the highest power of the variable is 2 — meaning it includes an x\u00b2 term. These show up constantly: projectile motion, area problems, and profit curves all follow this shape.",
            spans: [{ text: "quadratic equation", type: "term", meaning: "An equation of the form ax\u00b2 + bx + c = 0, where a is not zero." }],
          },
          { kind: "definition", term: "Standard form", meaning: "ax\u00b2 + bx + c = 0, where a, b, and c are numbers and a \u2260 0." },
        ],
      },
      {
        blocks: [
          { kind: "graph", caption: "y = x\u00b2 \u2212 4 — a classic upward parabola", fn: (x) => x * x - 4, domain: [-4, 4], color: "ember" },
          {
            kind: "text",
            body: "Every quadratic graphs as a parabola — a symmetric U-shape (or upside-down U if a is negative). The points where the curve crosses the x-axis are the equation's solutions, also called roots.",
            spans: [{ text: "roots", type: "term", meaning: "The x-values where a quadratic equals zero — where its graph crosses the x-axis." }],
          },
        ],
        checkpoint: { type: "choice", q: "Looking at the graph above, where does y = x\u00b2 \u2212 4 cross the x-axis?", options: ["x = 0 only", "x = 2 and x = \u22122", "x = 4 and x = \u22124", "It never crosses"], answer: 1 },
      },
    ],
  },
  {
    heading: "Solving by factoring",
    steps: [
      {
        blocks: [
          {
            kind: "text",
            body: "The fastest way to solve many quadratics is factoring — rewriting the expression as two multiplied brackets. If their product is zero, at least one bracket must be zero.",
          },
          { kind: "formula", expression: "x\u00b2 + 5x + 6 = (x + 2)(x + 3)", caption: "Find two numbers that multiply to 6 and add to 5: that's 2 and 3." },
        ],
      },
      {
        blocks: [
          {
            kind: "text",
            body: "Once factored, set each bracket equal to zero and solve separately — this gives you both roots at once.",
          },
          { kind: "formula", expression: "(x + 2)(x + 3) = 0  \u2192  x = \u22122  or  x = \u22123", caption: "Zero Product Property in action" },
        ],
        checkpoint: { type: "blank", q: "Factor x\u00b2 + 7x + 10, then find the smaller root. x = ____", answer: "-5", hint: "Which two numbers multiply to 10 and add to 7? Try 2 and 5." },
      },
    ],
  },
  {
    heading: "The quadratic formula",
    steps: [
      {
        blocks: [
          {
            kind: "text",
            body: "Not every quadratic factors neatly. For those, the quadratic formula always works — it's derived from completing the square on the general form ax\u00b2 + bx + c = 0.",
          },
          { kind: "formula", expression: "x = (\u2212b \u00b1 \u221a(b\u00b2 \u2212 4ac)) / 2a", caption: "Works for absolutely any quadratic, factorable or not" },
          { kind: "definition", term: "Discriminant", meaning: "The part under the square root, b\u00b2 \u2212 4ac. Positive means two real roots, zero means one, negative means none (real)." },
        ],
      },
      {
        blocks: [
          { kind: "link", label: "Quadratic formula practice — Khan Academy", url: "https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations" },
        ],
        checkpoint: { type: "choice", q: "For x\u00b2 \u2212 2x \u2212 8 = 0, what is the discriminant (b\u00b2 \u2212 4ac)?", options: ["4", "20", "36", "\u221236"], answer: 2 },
      },
    ],
  },
];

/* NEW capstone lesson: Trigonometric Identities — added as fresh
 * content rather than replacing anything, giving Mathematics a
 * fully-authored bookend at both the start and end of the subject. */
const TRIG_IDENTITIES_SECTIONS: LessonSection[] = [
  {
    heading: "The Pythagorean identity",
    steps: [
      {
        blocks: [
          {
            kind: "text",
            body: "Trigonometric identities are equations that hold true for every possible angle. The most fundamental one comes directly from the Pythagorean theorem applied to the unit circle.",
            spans: [{ text: "unit circle", type: "term", meaning: "A circle of radius 1 centered at the origin, used to define sine and cosine for any angle." }],
          },
          { kind: "formula", expression: "sin\u00b2(\u03b8) + cos\u00b2(\u03b8) = 1", caption: "True for every angle \u03b8 — the cornerstone identity" },
        ],
      },
      {
        blocks: [
          { kind: "graph", caption: "y = sin(x) over one full cycle", fn: (x) => Math.sin(x), domain: [0, 6.28], color: "signal" },
          { kind: "text", body: "Notice sine oscillates smoothly between \u22121 and 1 — this bounded, repeating behavior is exactly why sin\u00b2 + cos\u00b2 always settles back to 1, no matter the angle." },
        ],
        checkpoint: { type: "blank", q: "If sin(\u03b8) = 0.6, then cos\u00b2(\u03b8) = ____ (as a decimal)", answer: "0.64", hint: "cos\u00b2(\u03b8) = 1 \u2212 sin\u00b2(\u03b8) = 1 \u2212 0.36" },
      },
    ],
  },
  {
    heading: "Angle sum formulas",
    steps: [
      {
        blocks: [
          {
            kind: "text",
            body: "Angle sum formulas let you find the sine or cosine of a combined angle without a calculator, by breaking it into two angles you already know.",
          },
          { kind: "formula", expression: "sin(A + B) = sin(A)cos(B) + cos(A)sin(B)", caption: "Angle sum formula for sine" },
        ],
      },
      {
        blocks: [
          {
            kind: "diagram",
            caption: "Building 75\u00b0 from two known angles",
            nodes: [
              { x: 90, y: 90, label: "45\u00b0" },
              { x: 310, y: 90, label: "30\u00b0" },
              { x: 200, y: 170, label: "75\u00b0 combined" },
            ],
            edges: [[0, 2], [1, 2]],
          },
          { kind: "link", label: "Angle sum & difference identities — Paul's Online Math Notes", url: "https://tutorial.math.lamar.edu/classes/alg/trigidentities.aspx" },
        ],
        checkpoint: { type: "choice", q: "Which two standard angles combine to make 75\u00b0?", options: ["20\u00b0 + 55\u00b0", "45\u00b0 + 30\u00b0", "60\u00b0 + 10\u00b0", "90\u00b0 \u2212 15\u00b0 only"], answer: 1 },
      },
    ],
  },
];

const LIMITS_LESSON_SECTIONS: LessonSection[] = [
  {
    heading: "What is a limit?",
    steps: [
      {
        blocks: [
          {
            kind: "text",
            body: "A limit describes the value a function gets closer and closer to as its input approaches some point — even if the function never actually reaches that value there.",
            spans: [{ text: "limit", type: "term", meaning: "The value a function approaches as the input gets arbitrarily close to a point." }],
          },
          {
            kind: "text",
            body: "This matters because some functions are undefined exactly at the point we care about, but still behave predictably right around it.",
          },
        ],
      },
      {
        blocks: [
          { kind: "definition", term: "Limit", meaning: "As x approaches a value a, the limit of f(x) is the value f(x) settles toward — written lim(x\u2192a) f(x) = L." },
          { kind: "formula", expression: "lim(x\u21922) (x\u00b2 \u2212 4)/(x \u2212 2) = 4", caption: "Even though the expression is undefined at x = 2, the limit still exists." },
        ],
      },
      {
        blocks: [
          { kind: "graph", caption: "f(x) = (x\u00b2\u22124)/(x\u22122) — a hole at x = 2, but the limit is still 4", fn: (x) => x + 2, domain: [-2, 6], color: "ember" },
          { kind: "text", body: "Notice the curve is really just the line y = x + 2 with a single point removed at x = 2 — the limit fills that gap conceptually." },
        ],
        checkpoint: { type: "choice", q: "As x approaches 2, what does (x\u00b2 \u2212 4)/(x \u2212 2) approach?", options: ["0", "2", "4", "It's undefined everywhere"], answer: 2 },
      },
    ],
  },
  {
    heading: "Continuity",
    steps: [
      {
        blocks: [
          {
            kind: "text",
            body: "A function is continuous at a point if you could draw the graph through that point without lifting your pen — no jumps, holes, or breaks.",
            spans: [{ text: "continuous", type: "term", meaning: "A function with no breaks, jumps, or holes at a given point." }],
          },
          { kind: "definition", term: "Continuity at a point", meaning: "f is continuous at a if: f(a) exists, the limit as x\u2192a exists, and they're equal." },
        ],
      },
      {
        blocks: [
          {
            kind: "diagram",
            caption: "Three ways continuity can fail",
            nodes: [
              { x: 60, y: 60, label: "Hole" },
              { x: 200, y: 60, label: "Jump" },
              { x: 340, y: 60, label: "Asymptote" },
              { x: 130, y: 160, label: "Discontinuity" },
              { x: 270, y: 160, label: "types" },
            ],
            edges: [[0, 3], [1, 3], [2, 4]],
          },
          { kind: "link", label: "Practice more limit problems on Khan Academy", url: "https://www.khanacademy.org/math/ap-calculus-ab/ab-limits-new" },
        ],
        checkpoint: { type: "blank", q: "For f to be continuous at x = a, f(a) must ____ (exist / not exist).", answer: "exist", hint: "Think about whether the function even has a value there" },
      },
    ],
  },
];

const NEWTON_LESSON_SECTIONS: LessonSection[] = [
  {
    heading: "The Three Laws",
    steps: [
      {
        blocks: [
          {
            kind: "text",
            body: "Newton's laws describe how forces affect motion. They're the foundation of classical mechanics — everything from a thrown ball to a rocket launch obeys them.",
            spans: [{ text: "forces", type: "term", meaning: "A push or pull that can change an object's motion." }],
          },
          { kind: "definition", term: "First Law (Inertia)", meaning: "An object at rest stays at rest, and an object in motion stays in motion at constant velocity, unless acted on by a net force." },
        ],
      },
      {
        blocks: [
          { kind: "formula", expression: "F = ma", caption: "Second Law: net force equals mass times acceleration" },
          {
            kind: "text",
            body: "Double the force on the same mass, and you double the acceleration. Double the mass with the same force, and acceleration is cut in half.",
          },
        ],
        checkpoint: { type: "slider", q: "A 2 kg object accelerates at 3 m/s\u00b2. What net force (in N) is acting on it?", min: 0, max: 12, step: 0.5, answer: 6, tolerance: 0.5, unit: " N" },
      },
      {
        blocks: [
          { kind: "definition", term: "Third Law", meaning: "For every action, there is an equal and opposite reaction — forces always come in pairs." },
          {
            kind: "diagram",
            caption: "Action–reaction pair: rocket thrust",
            nodes: [
              { x: 90, y: 100, label: "Rocket pushes gas down" },
              { x: 310, y: 100, label: "Gas pushes rocket up" },
            ],
            edges: [[0, 1]],
          },
        ],
      },
    ],
  },
  {
    heading: "Applying the laws",
    steps: [
      {
        blocks: [
          { kind: "graph", caption: "Velocity vs. time under constant force (constant acceleration)", fn: (x) => 1.5 * x, domain: [0, 8], color: "signal" },
          { kind: "text", body: "A constant net force produces constant acceleration — so velocity increases in a straight line over time, as shown above." },
        ],
      },
      {
        blocks: [
          { kind: "link", label: "Newton's Laws simulation — PhET Interactive", url: "https://phet.colorado.edu/en/simulations/forces-and-motion-basics" },
        ],
        checkpoint: { type: "choice", q: "A book resting on a table isn't accelerating. What does the first law tell us about the net force on it?", options: ["It must be zero", "It must equal gravity alone", "It must be increasing", "It doesn't apply to resting objects"], answer: 0 },
      },
    ],
  },
];

const ATOMIC_STRUCTURE_SECTIONS: LessonSection[] = [
  {
    heading: "Protons, neutrons, and electrons",
    steps: [
      {
        blocks: [
          {
            kind: "text",
            body: "Every atom is built from three particles. Protons and neutrons pack tightly into a dense central nucleus, while electrons occupy the much larger space surrounding it.",
            spans: [{ text: "nucleus", type: "term", meaning: "The dense central core of an atom, containing protons and neutrons." }],
          },
          { kind: "definition", term: "Atomic number", meaning: "The number of protons in an atom's nucleus — this defines which element it is." },
        ],
      },
      {
        blocks: [
          {
            kind: "diagram",
            caption: "A simplified carbon atom (6 protons, 6 neutrons, 6 electrons)",
            nodes: [
              { x: 200, y: 110, label: "Nucleus (p\u207a + n)" },
              { x: 90, y: 60, label: "Electron shell" },
              { x: 310, y: 160, label: "Electron shell" },
            ],
            edges: [[0, 1], [0, 2]],
          },
        ],
        checkpoint: { type: "choice", q: "What determines which element an atom is?", options: ["Its number of neutrons", "Its number of protons", "Its total mass", "Its number of electron shells"], answer: 1 },
      },
    ],
  },
  {
    heading: "Isotopes and mass number",
    steps: [
      {
        blocks: [
          {
            kind: "text",
            body: "Atoms of the same element can have different numbers of neutrons — these variants are called isotopes. They behave almost identically chemically, but differ in mass and sometimes stability.",
            spans: [{ text: "isotopes", type: "term", meaning: "Atoms of the same element with different numbers of neutrons." }],
          },
          { kind: "formula", expression: "Mass number = protons + neutrons", caption: "Carbon-14 has 6 protons and 8 neutrons \u2192 mass number 14" },
        ],
      },
      {
        blocks: [
          { kind: "link", label: "Isotopes explained — Royal Society of Chemistry", url: "https://edu.rsc.org/resources/isotopes/1745.article" },
        ],
        checkpoint: { type: "slider", q: "Carbon-12 has 6 protons. How many neutrons does it have? (mass number 12)", min: 0, max: 12, step: 1, answer: 6, tolerance: 0, unit: "" },
      },
    ],
  },
];

/* NEW capstone lesson for Chemistry: Acids & Bases */
const ACIDS_BASES_SECTIONS: LessonSection[] = [
  {
    heading: "The pH scale",
    steps: [
      {
        blocks: [
          {
            kind: "text",
            body: "Acids and bases are defined by how they behave in water. Acids release hydrogen ions (H\u207a), while bases release hydroxide ions (OH\u207b) or accept H\u207a. The pH scale measures where a solution falls between the two.",
            spans: [{ text: "pH scale", type: "term", meaning: "A logarithmic scale from 0 to 14 measuring how acidic or basic a solution is." }],
          },
          { kind: "definition", term: "pH", meaning: "A measure of hydrogen ion concentration: pH = \u2212log[H\u207a]. Below 7 is acidic, above 7 is basic, 7 is neutral." },
        ],
      },
      {
        blocks: [
          { kind: "graph", caption: "pH vs. [H\u207a] concentration — note the logarithmic curve", fn: (x) => -Math.log10(x + 0.0001), domain: [0.0001, 1], color: "gold" },
          { kind: "text", body: "Because the scale is logarithmic, each whole-number drop in pH means a 10\u00d7 increase in acidity — pH 4 is ten times more acidic than pH 5." },
        ],
        checkpoint: { type: "choice", q: "A solution with pH 3 is how many times more acidic than one with pH 5?", options: ["2 times", "10 times", "100 times", "1000 times"], answer: 2 },
      },
    ],
  },
  {
    heading: "Neutralization reactions",
    steps: [
      {
        blocks: [
          {
            kind: "text",
            body: "When an acid and a base react, they neutralize each other — the H\u207a and OH\u207b ions combine to form water, leaving a salt behind.",
          },
          { kind: "formula", expression: "HCl + NaOH \u2192 NaCl + H\u2082O", caption: "Classic acid-base neutralization: hydrochloric acid + sodium hydroxide" },
        ],
      },
      {
        blocks: [
          { kind: "link", label: "Acid-base reactions — Khan Academy", url: "https://www.khanacademy.org/science/ap-chemistry-beta/x2eef969c74e0d802:acids-and-bases" },
        ],
        checkpoint: { type: "blank", q: "In an acid-base neutralization, the acid and base always produce water and a ____", answer: "salt", hint: "This is the other product besides water" },
      },
    ],
  },
];

const BONDING_LESSON_SECTIONS: LessonSection[] = [
  {
    heading: "Ionic vs. covalent",
    steps: [
      {
        blocks: [
          {
            kind: "text",
            body: "Atoms bond to become more stable, usually by filling their outer electron shell. How they do this splits bonding into two main types.",
            spans: [{ text: "electron shell", type: "term", meaning: "The outermost layer of electrons around an atom, which determines its bonding behavior." }],
          },
          { kind: "definition", term: "Ionic bond", meaning: "Formed when one atom transfers an electron to another, creating oppositely charged ions that attract." },
        ],
      },
      {
        blocks: [
          { kind: "definition", term: "Covalent bond", meaning: "Formed when two atoms share a pair of electrons instead of transferring them." },
          {
            kind: "diagram",
            caption: "Sodium chloride: an ionic bond",
            nodes: [
              { x: 90, y: 100, label: "Na" },
              { x: 310, y: 100, label: "Cl" },
              { x: 200, y: 50, label: "e\u207b transferred" },
            ],
            edges: [[0, 2], [2, 1]],
          },
        ],
        checkpoint: { type: "choice", q: "Which bond type involves atoms sharing electrons rather than transferring them?", options: ["Ionic", "Covalent", "Metallic", "Neither"], answer: 1 },
      },
    ],
  },
  {
    heading: "Electronegativity",
    steps: [
      {
        blocks: [
          {
            kind: "text",
            body: "Electronegativity measures how strongly an atom pulls shared electrons toward itself. The bigger the difference between two bonding atoms, the more ionic the bond becomes.",
            spans: [{ text: "Electronegativity", type: "term", meaning: "A measure of an atom's tendency to attract shared electrons in a bond." }],
          },
          { kind: "formula", expression: "\u0394EN > 1.7 \u2192 ionic  |  \u0394EN < 1.7 \u2192 covalent", caption: "Rule of thumb using the Pauling electronegativity scale" },
        ],
      },
      {
        blocks: [
          { kind: "link", label: "Periodic table of electronegativity values", url: "https://en.wikipedia.org/wiki/Electronegativity" },
        ],
        checkpoint: { type: "blank", q: "A bond with a very large electronegativity difference between its atoms is most likely ____.", answer: "ionic", hint: "Large difference means one atom pulls electrons almost completely away" },
      },
    ],
  },
];

const CELL_STRUCTURE_SECTIONS: LessonSection[] = [
  {
    heading: "The building blocks of life",
    steps: [
      {
        blocks: [
          {
            kind: "text",
            body: "Every living thing is made of cells — the smallest unit that can carry out all the functions of life. Some organisms are a single cell; you are made of roughly 37 trillion of them.",
            spans: [{ text: "cells", type: "term", meaning: "The basic structural and functional unit of all living organisms." }],
          },
          { kind: "definition", term: "Cell theory", meaning: "All living things are made of cells, the cell is the basic unit of life, and all cells come from pre-existing cells." },
        ],
      },
      {
        blocks: [
          {
            kind: "diagram",
            caption: "Key organelles in an animal cell",
            nodes: [
              { x: 200, y: 100, label: "Nucleus" },
              { x: 90, y: 60, label: "Mitochondria" },
              { x: 310, y: 60, label: "Ribosomes" },
              { x: 200, y: 170, label: "Cell membrane" },
            ],
            edges: [[0, 1], [0, 2], [0, 3]],
          },
        ],
        checkpoint: { type: "choice", q: "Which organelle holds the cell's DNA and controls its activities?", options: ["Mitochondria", "Ribosome", "Nucleus", "Cell membrane"], answer: 2 },
      },
    ],
  },
  {
    heading: "Powerhouse of the cell",
    steps: [
      {
        blocks: [
          {
            kind: "text",
            body: "Mitochondria convert nutrients into ATP, the energy currency your cells actually spend. Cells that need lots of energy — like muscle cells — pack in far more mitochondria than others.",
            spans: [{ text: "ATP", type: "term", meaning: "Adenosine triphosphate — the molecule cells use to store and transfer usable energy." }],
          },
          { kind: "formula", expression: "Glucose + O\u2082 \u2192 CO\u2082 + H\u2082O + ATP", caption: "Simplified cellular respiration equation" },
        ],
      },
      {
        blocks: [
          { kind: "link", label: "Inside the mitochondria — Nature Education", url: "https://www.nature.com/scitable/topicpage/mitochondria-14053590/" },
        ],
        checkpoint: { type: "blank", q: "Cells that require a lot of energy, like muscle cells, tend to have more ____", answer: "mitochondria", hint: "The organelle nicknamed the 'powerhouse of the cell'" },
      },
    ],
  },
];

/* NEW capstone lesson for Biology: Evolution & Natural Selection */
const EVOLUTION_SECTIONS: LessonSection[] = [
  {
    heading: "Natural selection in action",
    steps: [
      {
        blocks: [
          {
            kind: "text",
            body: "Natural selection is the process by which organisms better suited to their environment tend to survive and reproduce more successfully, passing their traits to the next generation.",
            spans: [{ text: "natural selection", type: "term", meaning: "The process where organisms with favorable traits survive and reproduce more than others." }],
          },
          { kind: "definition", term: "Fitness", meaning: "In evolutionary terms, an organism's ability to survive and pass on its genes — not physical strength." },
        ],
      },
      {
        blocks: [
          {
            kind: "diagram",
            caption: "Four conditions required for natural selection",
            nodes: [
              { x: 90, y: 60, label: "Variation exists" },
              { x: 310, y: 60, label: "Trait is heritable" },
              { x: 90, y: 160, label: "More offspring than survive" },
              { x: 310, y: 160, label: "Trait affects survival" },
            ],
          },
        ],
        checkpoint: { type: "choice", q: "For natural selection to act on a trait, that trait must be:", options: ["Visible to predators", "Heritable", "Rare in the population", "Present in every individual"], answer: 1 },
      },
    ],
  },
  {
    heading: "Evidence for evolution",
    steps: [
      {
        blocks: [
          {
            kind: "text",
            body: "Multiple independent lines of evidence support evolution: the fossil record shows gradual change over time, comparative anatomy reveals shared ancestry, and DNA sequencing confirms how closely related species really are.",
          },
        ],
      },
      {
        blocks: [
          { kind: "link", label: "Evidence for evolution — Understanding Evolution (Berkeley)", url: "https://evolution.berkeley.edu/evolution-101/lines-of-evidence/" },
        ],
        checkpoint: { type: "blank", q: "Comparing DNA sequences across species is a modern way to measure how closely related they are — this field is called molecular ____", answer: "biology", hint: "The study of biological molecules like DNA and proteins" },
      },
    ],
  },
];

const GENETICS_LESSON_SECTIONS: LessonSection[] = [
  {
    heading: "Genes and alleles",
    steps: [
      {
        blocks: [
          {
            kind: "text",
            body: "Every trait you inherit is shaped by genes — segments of DNA that code for specific characteristics, passed down from both parents.",
            spans: [{ text: "genes", type: "term", meaning: "Segments of DNA that code for a specific trait." }],
          },
          { kind: "definition", term: "Allele", meaning: "One version of a gene. You inherit one allele from each parent for every gene." },
        ],
      },
      {
        blocks: [
          {
            kind: "diagram",
            caption: "Dominant vs. recessive alleles",
            nodes: [
              { x: 90, y: 90, label: "B (dominant)" },
              { x: 310, y: 90, label: "b (recessive)" },
              { x: 200, y: 170, label: "Bb = brown eyes" },
            ],
            edges: [[0, 2], [1, 2]],
          },
        ],
        checkpoint: { type: "choice", q: "If B (brown) is dominant and b (blue) is recessive, what eye color does Bb produce?", options: ["Blue", "Brown", "A blend of both", "Cannot be determined"], answer: 1 },
      },
    ],
  },
  {
    heading: "Punnett squares",
    steps: [
      {
        blocks: [
          {
            kind: "text",
            body: "A Punnett square predicts the probability of offspring inheriting each combination of alleles from two parents.",
          },
          { kind: "formula", expression: "Bb \u00d7 Bb \u2192 1 BB : 2 Bb : 1 bb", caption: "Classic monohybrid cross — 3:1 dominant-to-recessive phenotype ratio" },
        ],
      },
      {
        blocks: [
          { kind: "link", label: "Interactive Punnett square tool", url: "https://www.biointeractive.org/classroom-resources/punnett-squares" },
        ],
        checkpoint: { type: "slider", q: "Out of 4 offspring from a Bb \u00d7 Bb cross, how many are expected to show the recessive phenotype?", min: 0, max: 4, step: 1, answer: 1, tolerance: 0, unit: "" },
      },
    ],
  },
];

/** Short two-block placeholder used for lessons that don't have full
 * authored content yet, so every lesson card still opens into a
 * working player instead of a dead click. */
function placeholderSections(title: string, subject: SubjectId): LessonSection[] {
  return [
    {
      heading: "Overview",
      steps: [
        {
          blocks: [
            { kind: "text", body: `This lesson on ${title.toLowerCase()} is being written by your tutor team and will include full step-by-step content soon.` },
            { kind: "definition", term: title, meaning: `A core topic in ${subject}. Full walkthrough content is coming shortly — check back soon.` },
          ],
        },
      ],
    },
  ];
}

const LESSONS_BY_SUBJECT: Record<SubjectId, Lesson[]> = {
  math: [
    { title: "Quadratic Equations", mins: 12, done: false, active: true, sections: QUADRATICS_LESSON_SECTIONS },
    { title: "Functions & Graphs", mins: 18, done: false },
    { title: "Limits & Continuity", mins: 22, done: false, sections: LIMITS_LESSON_SECTIONS },
    { title: "Derivatives Basics", mins: 20, done: false },
    { title: "Integral Calculus", mins: 25, done: false },
    { title: "Trigonometric Identities", mins: 18, done: false, sections: TRIG_IDENTITIES_SECTIONS },
  ],
  physics: [
    { title: "Newton's Laws", mins: 15, done: false, active: true, sections: NEWTON_LESSON_SECTIONS },
    { title: "Work & Energy", mins: 17, done: false },
    { title: "Wave Motion", mins: 19, done: false },
    { title: "Electromagnetism", mins: 24, done: false },
  ],
  chemistry: [
    { title: "Atomic Structure", mins: 14, done: false, active: true, sections: ATOMIC_STRUCTURE_SECTIONS },
    { title: "Chemical Bonding", mins: 16, done: false, sections: BONDING_LESSON_SECTIONS },
    { title: "Organic Reactions", mins: 21, done: false },
    { title: "Acids & Bases", mins: 17, done: false, sections: ACIDS_BASES_SECTIONS },
  ],
  biology: [
    { title: "Cell Structure", mins: 13, done: false, active: true, sections: CELL_STRUCTURE_SECTIONS },
    { title: "DNA Replication", mins: 19, done: false },
    { title: "Genetics & Heredity", mins: 20, done: false, sections: GENETICS_LESSON_SECTIONS },
    { title: "Ecosystems", mins: 15, done: false },
    { title: "Evolution & Natural Selection", mins: 19, done: false, sections: EVOLUTION_SECTIONS },
  ],
};

/** The actual subject list the whole app renders from — lesson counts
 * are read straight off LESSONS_BY_SUBJECT, so this can never drift
 * out of sync with reality the way a hand-typed number could. */
const SUBJECTS: Subject[] = SUBJECTS_BASE.map((s) => ({ ...s, lessons: LESSONS_BY_SUBJECT[s.id].length }));

type Difficulty = "Easy" | "Medium" | "Hard";

interface Quiz {
  subject: SubjectId;
  title: string;
  questions: number;
  mins: number;
  difficulty: Difficulty;
  /** Position within its subject's quiz sequence (1, 2, 3...). Quizzes
   * are shown in this order on the subject's quiz list, mirroring how
   * lessons are numbered — later quizzes assume earlier ones. */
  order: number;
  /** Which exercise set this quiz uses. Different quizzes intentionally
   * pull different exercises so working through a subject's quizzes in
   * order feels like real progression, not the same 4 questions again. */
  exerciseSet: Exercise[];
}

/* Exercise sets are defined further down (SAMPLE_EXERCISES and
 * friends), then referenced here once QUIZZES is assembled below
 * that point in the file — see buildQuizzes() at the bottom of the
 * exercises section. */

interface ChoiceExercise { type: "choice"; q: string; options: string[]; answer: number; }
interface BlankExercise { type: "blank"; q: string; answer: string; hint?: string; }
interface SliderExercise { type: "slider"; q: string; min: number; max: number; step: number; answer: number; tolerance: number; unit?: string; }
interface OrderExercise { type: "order"; q: string; items: string[]; correctOrder: string[]; }
type Exercise = ChoiceExercise | BlankExercise | SliderExercise | OrderExercise;

/* ---- MATH exercise sets (3 quizzes, increasing difficulty) ------- */
const MATH_QUIZ_1: Exercise[] = [
  { type: "choice", q: "Solve for x: 3x + 5 = 20", options: ["3", "5", "15", "25"], answer: 1 },
  { type: "blank", q: "Simplify: 4x + 3x = ____x", answer: "7", hint: "Add the coefficients of x" },
  { type: "choice", q: "What is the value of x\u00b2 when x = 4?", options: ["8", "12", "16", "20"], answer: 2 },
  { type: "slider", q: "Solve: 2x = 18. What is x?", min: 0, max: 20, step: 1, answer: 9, tolerance: 0, unit: "" },
];
const MATH_QUIZ_2: Exercise[] = [
  { type: "choice", q: "What is the slope of the line y = 3x + 2?", options: ["1", "2", "3", "5"], answer: 2 },
  { type: "blank", q: "The graph of y = x\u00b2 is called a ____", answer: "parabola" },
  {
    type: "order",
    q: "Arrange these steps to graph a linear function, in order:",
    items: ["Plot the y-intercept", "Use the slope to find a second point", "Draw a line through both points", "Identify slope and y-intercept from the equation"],
    correctOrder: ["Identify slope and y-intercept from the equation", "Plot the y-intercept", "Use the slope to find a second point", "Draw a line through both points"],
  },
  { type: "slider", q: "What is f(3) if f(x) = 2x + 1?", min: 0, max: 12, step: 1, answer: 7, tolerance: 0, unit: "" },
];
const MATH_QUIZ_3: Exercise[] = [
  { type: "choice", q: "What is the derivative of x\u00b2?", options: ["x", "2x", "x\u00b2", "2x\u00b2"], answer: 1 },
  { type: "blank", q: "As x approaches a value where a function is undefined, we study its ____", answer: "limit" },
  { type: "slider", q: "What is the derivative of 5x at any point?", min: 0, max: 10, step: 1, answer: 5, tolerance: 0, unit: "" },
  { type: "choice", q: "The derivative of a constant is always:", options: ["The constant itself", "1", "0", "Undefined"], answer: 2 },
];

/* ---- PHYSICS exercise sets ---------------------------------------- */
const PHYSICS_QUIZ_1: Exercise[] = [
  { type: "choice", q: "An object at rest stays at rest unless acted on by:", options: ["Time", "A net force", "Gravity alone", "Nothing, it moves on its own"], answer: 1 },
  { type: "blank", q: "F = m \u00d7 ____", answer: "a", hint: "Newton's Second Law" },
  { type: "slider", q: "A 2kg object accelerates at 3 m/s\u00b2. What force (N) is applied?", min: 0, max: 20, step: 1, answer: 6, tolerance: 0, unit: "N" },
  { type: "choice", q: "Every action has an equal and opposite:", options: ["Mass", "Reaction", "Velocity", "Direction"], answer: 1 },
];
const PHYSICS_QUIZ_2: Exercise[] = [
  { type: "choice", q: "Kinetic energy depends on an object's mass and its:", options: ["Color", "Velocity", "Temperature", "Shape"], answer: 1 },
  { type: "blank", q: "Work = Force \u00d7 ____", answer: "distance" },
  { type: "slider", q: "A 4kg object moves at 3 m/s. What's its KE in joules? (KE = 0.5mv\u00b2)", min: 0, max: 30, step: 1, answer: 18, tolerance: 1, unit: "J" },
  { type: "choice", q: "Energy cannot be created or destroyed — only:", options: ["Transferred or transformed", "Multiplied", "Divided evenly", "Reversed"], answer: 0 },
];
const PHYSICS_QUIZ_3: Exercise[] = [
  {
    type: "order",
    q: "Arrange the stages of a transverse wave cycle in order, starting from equilibrium:",
    items: ["Reaches trough", "Returns to equilibrium", "Reaches crest", "Starts at equilibrium moving up"],
    correctOrder: ["Starts at equilibrium moving up", "Reaches crest", "Returns to equilibrium", "Reaches trough"],
  },
  { type: "blank", q: "The distance between two consecutive crests is called the ____", answer: "wavelength" },
  { type: "slider", q: "A wave has frequency 5Hz and wavelength 2m. What's its speed (m/s)?", min: 0, max: 20, step: 1, answer: 10, tolerance: 0, unit: "m/s" },
];

/* ---- CHEMISTRY exercise sets --------------------------------------- */
const CHEM_QUIZ_1: Exercise[] = [
  { type: "choice", q: "The nucleus of an atom contains protons and:", options: ["Electrons", "Neutrons", "Ions", "Photons"], answer: 1 },
  { type: "blank", q: "The number of protons in an atom is its atomic ____", answer: "number" },
  { type: "choice", q: "Electrons orbit the nucleus in regions called:", options: ["Shells", "Cores", "Bonds", "Rings"], answer: 0 },
  { type: "slider", q: "A carbon atom has 6 protons. How many electrons in a neutral atom?", min: 0, max: 12, step: 1, answer: 6, tolerance: 0, unit: "" },
];
const CHEM_QUIZ_2: Exercise[] = [
  { type: "choice", q: "A covalent bond forms when atoms:", options: ["Transfer electrons", "Share electrons", "Repel each other", "Lose protons"], answer: 1 },
  { type: "blank", q: "An ____ bond forms between a metal and a nonmetal via electron transfer", answer: "ionic" },
  { type: "choice", q: "Water (H\u2082O) is held together by which bond type?", options: ["Ionic", "Metallic", "Covalent", "Nuclear"], answer: 2 },
];
const CHEM_QUIZ_3: Exercise[] = [
  { type: "blank", q: "Reactions that combine two molecules into one, releasing water, are called ____ reactions", answer: "condensation", hint: "Also known as dehydration synthesis" },
  { type: "choice", q: "Organic chemistry is primarily the study of compounds containing:", options: ["Iron", "Carbon", "Sodium", "Oxygen only"], answer: 1 },
  {
    type: "order",
    q: "Arrange these steps of a substitution reaction in order:",
    items: ["New bond forms with incoming group", "Leaving group departs", "Reactant is identified with a leaving group", "Product is formed"],
    correctOrder: ["Reactant is identified with a leaving group", "Leaving group departs", "New bond forms with incoming group", "Product is formed"],
  },
];

/* ---- BIOLOGY exercise sets ------------------------------------------ */
const BIO_QUIZ_1: Exercise[] = [
  { type: "choice", q: "Which organelle is known as the 'powerhouse of the cell'?", options: ["Nucleus", "Mitochondria", "Ribosome", "Golgi apparatus"], answer: 1 },
  { type: "blank", q: "The ____ controls the cell's activities and holds its DNA", answer: "nucleus" },
  { type: "choice", q: "Plant cells have a rigid outer layer called the:", options: ["Cell wall", "Cell membrane only", "Vacuole", "Cytoplasm"], answer: 0 },
];
const BIO_QUIZ_2: Exercise[] = [
  { type: "blank", q: "DNA is copied through a process called ____", answer: "replication" },
  { type: "choice", q: "DNA's double helix is held together by bonds between:", options: ["Sugars", "Base pairs", "Phosphates", "Amino acids"], answer: 1 },
  {
    type: "order",
    q: "Arrange the steps of DNA replication in order:",
    items: ["New strands are synthesized", "Complementary bases pair up", "Two identical DNA molecules result", "The double helix unwinds"],
    correctOrder: ["The double helix unwinds", "Complementary bases pair up", "New strands are synthesized", "Two identical DNA molecules result"],
  },
];
const BIO_QUIZ_3: Exercise[] = [
  { type: "choice", q: "A trait controlled by a single gene with two alleles follows whose laws?", options: ["Darwin's", "Mendel's", "Newton's", "Watson's"], answer: 1 },
  { type: "blank", q: "An organism's observable traits are its ____ , while its genetic makeup is its genotype", answer: "phenotype" },
  { type: "slider", q: "In a simple dominant/recessive cross (Aa x Aa), what % of offspring show the dominant trait?", min: 0, max: 100, step: 25, answer: 75, tolerance: 0, unit: "%" },
];

/** Kept as a general-purpose fallback set (e.g. for chat-triggered
 * quizzes with no specific subject match) — mirrors the original
 * mixed-subject sampler this app shipped with. */
const SAMPLE_EXERCISES: Exercise[] = [MATH_QUIZ_1[0], PHYSICS_QUIZ_1[1], CHEM_QUIZ_1[2], BIO_QUIZ_2[2]];

const QUIZZES: Quiz[] = ([
  // Mathematics — 3 quizzes, in order, matching lesson progression
  { subject: "math", title: "Algebra Fundamentals", questions: MATH_QUIZ_1.length, mins: 6, difficulty: "Easy", order: 1, exerciseSet: MATH_QUIZ_1 },
  { subject: "math", title: "Functions & Graphing", questions: MATH_QUIZ_2.length, mins: 8, difficulty: "Medium", order: 2, exerciseSet: MATH_QUIZ_2 },
  { subject: "math", title: "Limits & Derivatives", questions: MATH_QUIZ_3.length, mins: 9, difficulty: "Hard", order: 3, exerciseSet: MATH_QUIZ_3 },

  // Physics
  { subject: "physics", title: "Newton's Laws Basics", questions: PHYSICS_QUIZ_1.length, mins: 7, difficulty: "Easy", order: 1, exerciseSet: PHYSICS_QUIZ_1 },
  { subject: "physics", title: "Work & Energy Check", questions: PHYSICS_QUIZ_2.length, mins: 8, difficulty: "Medium", order: 2, exerciseSet: PHYSICS_QUIZ_2 },
  { subject: "physics", title: "Wave Motion Challenge", questions: PHYSICS_QUIZ_3.length, mins: 8, difficulty: "Hard", order: 3, exerciseSet: PHYSICS_QUIZ_3 },

  // Chemistry
  { subject: "chemistry", title: "Atomic Structure Basics", questions: CHEM_QUIZ_1.length, mins: 6, difficulty: "Easy", order: 1, exerciseSet: CHEM_QUIZ_1 },
  { subject: "chemistry", title: "Bonding Check", questions: CHEM_QUIZ_2.length, mins: 6, difficulty: "Medium", order: 2, exerciseSet: CHEM_QUIZ_2 },
  { subject: "chemistry", title: "Organic Reactions Quiz", questions: CHEM_QUIZ_3.length, mins: 7, difficulty: "Hard", order: 3, exerciseSet: CHEM_QUIZ_3 },

  // Biology
  { subject: "biology", title: "Cell Structure Basics", questions: BIO_QUIZ_1.length, mins: 6, difficulty: "Easy", order: 1, exerciseSet: BIO_QUIZ_1 },
  { subject: "biology", title: "DNA Replication Check", questions: BIO_QUIZ_2.length, mins: 7, difficulty: "Medium", order: 2, exerciseSet: BIO_QUIZ_2 },
  { subject: "biology", title: "Genetics & Heredity Quiz", questions: BIO_QUIZ_3.length, mins: 8, difficulty: "Hard", order: 3, exerciseSet: BIO_QUIZ_3 },
] as Quiz[]).sort((a, b) => a.order - b.order);

/* ================================================================== */
/*  XP SYSTEM — daily history, level curve, streak & goal              */
/* ================================================================== */

/** XP required to go from level n to n+1 grows gently so early levels
 * come quickly (onboarding reward) and later ones feel earned. */
function xpForLevel(level: number): number {
  return 80 + (level - 1) * 40;
}
function levelFromTotalXp(totalXp: number): { level: number; intoLevel: number; forLevel: number } {
  let level = 1;
  let remaining = totalXp;
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level);
    level += 1;
  }
  return { level, intoLevel: remaining, forLevel: xpForLevel(level) };
}

interface DayXp { date: string; xp: number; }

/** How many trailing days the XP history keeps and charts. Both the
 * Learn screen's sparkline and the Profile screen's bar chart read
 * from this same 7-day window, so they always agree. */
const XP_HISTORY_DAYS = 7;

/** Seeds a 7-day trailing history at genuine zero — a brand new
 * learner who hasn't earned anything yet. Today's bucket fills in
 * live as lessons/quizzes are completed in this session. */
function seedXpHistory(): DayXp[] {
  const days: DayXp[] = [];
  for (let i = XP_HISTORY_DAYS - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({ date: d.toISOString().slice(0, 10), xp: 0 });
  }
  return days;
}

/** One completed quiz attempt — enough to compute a genuine running
 * average score, rather than showing a fabricated percentage. */
interface QuizAttempt { quizTitle: string; subject: SubjectId; scorePct: number; at: number; }

interface XpState {
  totalXp: number;
  history: DayXp[];
  streak: number;
  dailyGoal: number;
  todayXp: number;
  level: number;
  intoLevel: number;
  forLevel: number;
  quizAttempts: QuizAttempt[];
  award: (amount: number) => void;
  recordQuizAttempt: (attempt: QuizAttempt) => void;
}

/** Central XP store for the session — lessons and quizzes call
 * `award()` on completion, which updates today's history bucket,
 * running total, and derived level in one place so Profile's graphs
 * and the Learn screen's streak strip always agree. */
function useXpState(): [XpState, (s: XpState) => void] {
  const [history, setHistory] = useState<DayXp[]>(() => seedXpHistory());
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const todayKey = new Date().toISOString().slice(0, 10);
  const totalXp = useMemo(() => history.reduce((a, d) => a + d.xp, 0), [history]);
  const todayXp = useMemo(() => history.find((d) => d.date === todayKey)?.xp ?? 0, [history, todayKey]);
  // Real streak: count consecutive days with XP > 0, working backwards
  // from today. A brand new learner with all-zero history has a
  // streak of 0 — no artificial floor.
  const streak = useMemo(() => {
    let s = 0;
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].xp > 0) s += 1;
      else break;
    }
    return s;
  }, [history]);
  const { level, intoLevel, forLevel } = useMemo(() => levelFromTotalXp(totalXp), [totalXp]);

  const award = useCallback((amount: number) => {
    setHistory((prev) => {
      const next = [...prev];
      const idx = next.findIndex((d) => d.date === todayKey);
      if (idx >= 0) next[idx] = { ...next[idx], xp: next[idx].xp + amount };
      else next.push({ date: todayKey, xp: amount });
      return next;
    });
  }, [todayKey]);

  const recordQuizAttempt = useCallback((attempt: QuizAttempt) => {
    setQuizAttempts((prev) => [...prev, attempt]);
  }, []);

  const state: XpState = { totalXp, history, streak, dailyGoal: 100, todayXp, level, intoLevel, forLevel, quizAttempts, award, recordQuizAttempt };
  // second element kept for API symmetry with useState-style consumers; not used externally today
  return [state, () => {}];
}

/** Numeric average score (0-100) from real quiz attempts this
 * session, or null if none taken yet. Used for achievement
 * conditions where a raw number is needed rather than a formatted
 * string. */
function quizAttemptsAvgNumber(xp: XpState): number | null {
  if (xp.quizAttempts.length === 0) return null;
  return xp.quizAttempts.reduce((a, r) => a + r.scorePct, 0) / xp.quizAttempts.length;
}

/** Returns a formatted average score string ("82%") from real quiz
 * attempts this session, or null if none have been taken yet — the
 * caller decides how to render "no data" (e.g. an em dash) rather
 * than this function inventing a plausible-looking default. */
function quizAttemptsAvg(xp: XpState): string | null {
  const avg = quizAttemptsAvgNumber(xp);
  return avg === null ? null : `${Math.round(avg)}%`;
}

/* ================================================================== */
/*  SMALL UI PRIMITIVES                                                 */
/* ================================================================== */

function ProgressBar({ value, color, height = 8, delay = 0, track }: { value: number; color: string; height?: number; delay?: number; track: string }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(value * 100), 120 + delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return (
    <div style={{ width: "100%", height, borderRadius: 99, background: track, overflow: "hidden", position: "relative" }}>
      <div style={{ height: "100%", width: `${w}%`, borderRadius: 99, background: color, transition: "width 1.1s cubic-bezier(.16,1,.3,1)", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)", backgroundSize: "200% 100%", animation: "shimmer 2.4s linear infinite" }} />
      </div>
    </div>
  );
}

function RingProgress({ value, size = 96, stroke = 9, color, track, label, sub }: { value: number; size?: number; stroke?: number; color: string; track: string; label: string; sub?: string }) {
  const { c } = useTheme();
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const [dash, setDash] = useState(circ);
  useEffect(() => {
    const t = setTimeout(() => setDash(circ - value * circ), 200);
    return () => clearTimeout(t);
  }, [value, circ]);
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={dash} style={{ transition: "stroke-dashoffset 1.3s cubic-bezier(.16,1,.3,1)" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: size * 0.22, fontWeight: 700, color: c.text, fontFamily: "'Fraunces', serif" }}>{label}</span>
        {sub && <span style={{ fontSize: size * 0.1, color: c.textFaint, fontWeight: 600 }}>{sub}</span>}
      </div>
    </div>
  );
}

function Pill({ children, active, onClick, c }: { children: ReactNode; active: boolean; onClick: () => void; c: Palette }) {
  return (
    <button
      onClick={onClick}
      className="btn-press"
      style={{
        border: "none",
        cursor: "pointer",
        padding: "9px 17px",
        borderRadius: 99,
        fontSize: 13,
        fontWeight: 700,
        whiteSpace: "nowrap",
        background: active ? c.ember : c.chip,
        color: active ? "#fff" : c.textSoft,
        transition: "all .25s cubic-bezier(.4,0,.2,1)",
        boxShadow: active ? `0 8px 18px -8px ${c.ember}99` : "none",
      }}
    >
      {children}
    </button>
  );
}

function IconBtn({ icon: Icon, onClick, c, size = 38, active }: { icon: LucideIcon; onClick?: () => void; c: Palette; size?: number; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      className="btn-press"
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.32,
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: active ? c.emberSoft : c.cardAlt,
        color: active ? c.ember : c.textSoft,
        transition: "all .2s",
        flexShrink: 0,
      }}
    >
      <Icon size={size * 0.46} strokeWidth={2.2} />
    </button>
  );
}

/** Fully round profile avatar (a rounded-square reads as a "tile" like
 * the subject badges, so the person's own identity gets a distinct,
 * circular treatment instead). The ring is a soft double-ring — a
 * faint outer halo plus a crisper inner line — so it reads clearly
 * against both light and dark card backgrounds. */
function Avatar({ initial, c, size = 40, onClick, ring }: { initial: string; c: Palette; size?: number; onClick?: () => void; ring?: boolean }) {
  return (
    <button
      onClick={onClick}
      className="btn-press hover-lift"
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        border: "none",
        cursor: onClick ? "pointer" : "default",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(135deg, ${c.ember}, ${c.emberDeep})`,
        color: "#fff",
        fontWeight: 700,
        fontFamily: "'Fraunces', serif",
        fontSize: size * 0.4,
        flexShrink: 0,
        padding: 0,
        position: "relative",
        boxShadow: ring
          ? `0 0 0 3px ${c.bg}, 0 0 0 5px ${c.ember}55, 0 6px 16px -6px ${c.ember}99`
          : `0 4px 12px -4px ${c.ember}88`,
      }}
    >
      {initial.toUpperCase()}
    </button>
  );
}

function SectionTitle({ children, c, action }: { children: ReactNode; c: Palette; action?: ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
      <span className="display" style={{ fontSize: 18, fontWeight: 600, color: c.text }}>{children}</span>
      {action}
    </div>
  );
}

/* ================================================================== */
/*  BOTTOM NAV                                                          */
/* ================================================================== */

type TabId = "learn" | "quiz" | "chat" | "profile";

const NAV_ITEMS: { id: TabId; icon: LucideIcon; label: string }[] = [
  { id: "learn", icon: Home, label: "Learn" },
  { id: "quiz", icon: ListChecks, label: "Quiz" },
  { id: "chat", icon: MessageCircle, label: "Tutor" },
  { id: "profile", icon: UserIcon, label: "Profile" },
];

/** Horizontal margin either side of the floating tab bar — wider than
 * a plain edge-to-edge strip so the bar reads as a compact floating
 * island. This is the only sizing change from the original pill nav:
 * shape, padding, and label behavior are otherwise unchanged. */
const NAV_BAR_MARGIN_X = 40;
const NAV_BAR_MARGIN_BOTTOM = 18;
/** Approximate total footprint (bar + surrounding margin) any
 * scrollable content pads for so its last item never sits behind the
 * floating bar. The bar has no fixed height — it hugs its padded
 * content — so this is a safe estimate of that natural size. */
const NAV_CLEARANCE = 92;

function PillNav({ tab, setTab, c }: { tab: TabId; setTab: (t: TabId) => void; c: Palette }) {
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: `0 ${NAV_BAR_MARGIN_X}px ${NAV_BAR_MARGIN_BOTTOM}px`, zIndex: 40, pointerEvents: "none" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          background: c.navBg,
          backdropFilter: "blur(24px) saturate(1.6)",
          WebkitBackdropFilter: "blur(24px) saturate(1.6)",
          border: `1px solid ${c.border}`,
          borderRadius: 26,
          padding: "7px 8px",
          boxShadow: `${c.shadow}, inset 0 1px 0 ${c.border}`,
          pointerEvents: "auto",
        }}
      >
        {NAV_ITEMS.map((item) => {
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className="btn-press"
              aria-label={item.label}
              style={{
                border: "none",
                cursor: "pointer",
                background: active ? c.ember : "transparent",
                borderRadius: 19,
                padding: active ? "10px 18px" : "10px 14px",
                display: "flex",
                alignItems: "center",
                gap: 7,
                transition: "all .35s cubic-bezier(.16,1,.3,1)",
                boxShadow: active ? `0 8px 16px -6px ${c.ember}77` : "none",
              }}
            >
              <item.icon size={18.5} strokeWidth={2.4} color={active ? "#fff" : c.textFaint} />
              {active && <span style={{ fontSize: 12.5, fontWeight: 700, color: "#fff", whiteSpace: "nowrap" }}>{item.label}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  SCREEN: LEARN (Home)                                                */
/* ================================================================== */

type LearnFilter = "all" | "in progress" | "not started" | "completed";

function HomeHeader({
  c, scrolled, userName, onOpenProfile, onOpenNotifications, hasNotification, level,
}: { c: Palette; scrolled: boolean; userName: string; onOpenProfile: () => void; onOpenNotifications: () => void; hasNotification: boolean; level: number }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        padding: scrolled ? "13px 18px" : "20px 18px 16px",
        background: scrolled ? c.navBg : c.bg,
        backdropFilter: scrolled ? "blur(20px) saturate(1.4)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(20px) saturate(1.4)" : "none",
        borderBottom: `1px solid ${scrolled ? c.border : "transparent"}`,
        boxShadow: scrolled ? "0 12px 24px -18px rgba(0,0,0,0.45)" : "none",
        transition: "padding .3s cubic-bezier(.4,0,.2,1), background .3s ease, border-color .3s ease, box-shadow .3s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <Avatar initial={userName[0]} c={c} size={scrolled ? 38 : 48} onClick={onOpenProfile} ring />
          <div
            style={{
              position: "absolute", bottom: -2, right: -2, minWidth: 18, height: 18, borderRadius: 9, padding: "0 4px",
              background: c.gold, border: `2px solid ${c.bg}`, display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 9, fontWeight: 800, color: "#3A2800", boxShadow: "0 2px 6px -1px rgba(0,0,0,0.3)",
            }}
          >
            {level}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {!scrolled && (
            <div style={{ fontSize: 12.5, color: c.textFaint, fontWeight: 600, marginBottom: 2, display: "flex", alignItems: "center", gap: 5 }}>
              {greeting}
              <span style={{ width: 3, height: 3, borderRadius: "50%", background: c.textFaint, opacity: 0.6 }} />
              <span style={{ color: c.gold, fontWeight: 700 }}>Level {level}</span>
            </div>
          )}
          <div
            className="display"
            style={{ fontSize: scrolled ? 16.5 : 23, fontWeight: 600, color: c.text, transition: "font-size .25s ease", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", letterSpacing: -0.2 }}
          >
            {userName}
          </div>
        </div>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <IconBtn icon={Bell} c={c} onClick={onOpenNotifications} size={scrolled ? 36 : 42} />
          {hasNotification && (
            <div style={{ position: "absolute", top: 4, right: 4, width: 8, height: 8, borderRadius: "50%", background: c.danger, border: `2px solid ${c.bg}`, boxShadow: `0 0 0 2px ${c.danger}33` }} />
          )}
        </div>
      </div>
    </div>
  );
}

/** Tiny inline bar sparkline for the last 7 days of XP — gives the
 * streak strip a real at-a-glance shape instead of just a number. */
function MiniXpSparkline({ days, size = 34 }: { days: DayXp[]; size?: number }) {
  const max = Math.max(...days.map((d) => d.xp), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: size }}>
      {days.map((d, i) => (
        <div
          key={d.date}
          style={{
            width: 5, borderRadius: 3, background: "rgba(255,255,255,0.85)",
            height: Math.max(4, (d.xp / max) * size),
            opacity: i === days.length - 1 ? 1 : 0.55,
            transition: "height .6s cubic-bezier(.16,1,.3,1)",
          }}
        />
      ))}
    </div>
  );
}

function LearnScreen({
  onOpenSubject, onOpenSearch, onOpenProfile, onOpenNotifications, userName, xp,
}: { onOpenSubject: (s: Subject) => void; onOpenSearch: () => void; onOpenProfile: () => void; onOpenNotifications: () => void; userName: string; xp: XpState }) {
  const { c } = useTheme();
  const [filter, setFilter] = useState<LearnFilter>("all");
  const [scrolled, setScrolled] = useState(false);
  const [dictionaryMode, setDictionaryMode] = useState<"word" | "search" | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const overall = useMemo(() => SUBJECTS.reduce((a, s) => a + s.progress, 0) / SUBJECTS.length, []);
  const todayWord = useMemo(() => wordOfDay(), []);
  const last7 = useMemo(() => xp.history.slice(-7), [xp.history]);
  const goalPct = Math.min(1, xp.todayXp / xp.dailyGoal);

  const filtered = useMemo(() => {
    if (filter === "all") return SUBJECTS;
    if (filter === "completed") return SUBJECTS.filter((s) => s.progress >= 0.95);
    if (filter === "not started") return SUBJECTS.filter((s) => s.progress === 0);
    return SUBJECTS.filter((s) => s.progress > 0 && s.progress < 0.95);
  }, [filter]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setScrolled(el.scrollTop > 8);
  }, []);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
      <HomeHeader c={c} scrolled={scrolled} userName={userName} onOpenProfile={onOpenProfile} onOpenNotifications={onOpenNotifications} hasNotification level={xp.level} />

      <div ref={scrollRef} onScroll={handleScroll} className="app-scroll" style={{ flex: 1, overflowY: "auto", padding: `10px 18px ${NAV_CLEARANCE}px`, animation: "fadeIn .4s ease" }}>
        {/* Streak + daily goal + XP sparkline strip */}
        <div
          style={{
            position: "relative", overflow: "hidden", borderRadius: 24, padding: "16px 18px",
            background: `linear-gradient(135deg, ${c.ember}, ${c.emberDeep})`, marginBottom: 16, animation: "fadeSlideUp .5s ease .02s both", boxShadow: c.shadow,
          }}
        >
          <div style={{ position: "absolute", top: -40, right: -20, width: 140, height: 140, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.14), transparent 70%)" }} />
          <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Flame size={20} color="#FFD9A0" fill="#FFD9A0" style={{ animation: "wiggle 1.8s ease-in-out infinite" }} />
              <div>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>{xp.streak} day streak</div>
                <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 11, fontWeight: 500 }}>{xp.todayXp} / {xp.dailyGoal} XP today</div>
              </div>
            </div>
            <RingProgress value={overall} size={46} stroke={5} color="#fff" track="rgba(255,255,255,0.25)" label={`${Math.round(overall * 100)}%`} />
          </div>
          <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <MiniXpSparkline days={last7} />
            <div style={{ textAlign: "right" }}>
              <div style={{ color: "#fff", fontWeight: 800, fontSize: 15 }}>{xp.totalXp.toLocaleString()} XP</div>
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 10, fontWeight: 600 }}>{Math.round(goalPct * 100)}% of today&rsquo;s goal</div>
            </div>
          </div>
        </div>

        {/* HERO: Word of the Day widget */}
        <WordOfDayWidget c={c} entry={todayWord} onOpenDictionary={() => setDictionaryMode("word")} onSearchDictionary={() => setDictionaryMode("search")} />

        {/* Filter pills */}
        <div className="app-scroll" style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 18, paddingBottom: 2 }}>
          {(["all", "in progress", "not started", "completed"] as LearnFilter[]).map((f) => (
            <Pill key={f} active={filter === f} onClick={() => setFilter(f)} c={c}>
              {f[0].toUpperCase() + f.slice(1)}
            </Pill>
          ))}
        </div>

        <SectionTitle
          c={c}
          action={
            <button onClick={onOpenSearch} className="btn-press" style={{ border: "none", background: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 4 }}>
              <Search size={13} color={c.ember} />
              <span style={{ fontSize: 12.5, color: c.ember, fontWeight: 700 }}>Search</span>
            </button>
          }
        >
          Your subjects
        </SectionTitle>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
          {filtered.map((s, i) => (
            <button
              key={s.id}
              onClick={() => onOpenSubject(s)}
              className="btn-press hover-lift"
              style={{
                textAlign: "left",
                cursor: "pointer",
                borderRadius: 24,
                padding: 16,
                background: c.card,
                border: `1px solid ${c.border}`,
                animation: `fadeSlideUp .5s ease ${0.1 + i * 0.06}s both`,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <SubjectBadge subject={s.id} size={46} c={c} />
                <RingProgress value={s.progress} size={36} stroke={4} color={subjectColor(s.id, c)} track={c.chip} label={`${Math.round(s.progress * 100)}`} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14.5, color: c.text, marginBottom: 2 }}>{s.name}</div>
                <div style={{ fontSize: 11.5, color: c.textFaint, fontWeight: 500 }}>{s.tagline}</div>
              </div>
              <span style={{ fontSize: 11, color: c.textSoft, fontWeight: 700 }}>{s.done}/{s.lessons} lessons</span>
            </button>
          ))}
          {filtered.length === 0 && (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "30px 0", color: c.textFaint, fontSize: 13, fontWeight: 600 }}>
              Nothing here yet
            </div>
          )}
        </div>

        <SectionTitle c={c}>Continue learning</SectionTitle>
        <div
          onClick={() => onOpenSubject(SUBJECTS[0])}
          className="btn-press hover-lift"
          style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 14, background: c.card, border: `1px solid ${c.border}`, borderRadius: 22, padding: 14, marginBottom: 24, animation: "fadeSlideUp .5s ease .3s both" }}
        >
          <div style={{ width: 52, height: 52, borderRadius: 18, background: `linear-gradient(135deg, ${c.ember}, ${c.emberDeep})`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 10px 20px -8px ${c.ember}88` }}>
            <Play size={19} color="#fff" fill="#fff" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: c.text }}>Limits & Continuity</div>
            <div style={{ fontSize: 11.5, color: c.textFaint, fontWeight: 500 }}>Mathematics &bull; Lesson 3 of 42</div>
          </div>
          <ChevronRight size={18} color={c.textFaint} />
        </div>
      </div>
      {dictionaryMode && (
        <DictionaryModal
          entry={dictionaryMode === "word" ? todayWord : undefined}
          onClose={() => setDictionaryMode(null)}
          c={c}
        />
      )}
    </div>
  );
}

/* ================================================================== */
/*  SCREEN: SUBJECT DETAIL                                              */
/* ================================================================== */

/** Small ambient canvas motif behind the subject hero — a few
 * subject-flavored shapes (sine wave for physics, molecule dots for
 * chemistry, a helix for biology, a grid/graph for math) drawn once
 * at low opacity so each subject page has a distinct hero identity
 * rather than a plain gradient card. */
function SubjectHeroMotif({ subject, hue }: { subject: SubjectId; hue: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth, h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);
    ctx.globalAlpha = 0.35;
    ctx.strokeStyle = hue;
    ctx.fillStyle = hue;
    ctx.lineWidth = 1.5;

    if (subject === "math") {
      // faint coordinate grid + a parabola
      for (let x = 0; x <= w; x += 24) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.globalAlpha = 0.06; ctx.stroke(); }
      for (let y = 0; y <= h; y += 24) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.globalAlpha = 0.06; ctx.stroke(); }
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      for (let i = 0; i <= 60; i++) {
        const x = (i / 60) * w;
        const nx = (x / w) * 2 - 1;
        const y = h - 14 - (1 - nx * nx) * (h - 30);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    } else if (subject === "physics") {
      // sine wave
      ctx.beginPath();
      for (let x = 0; x <= w; x += 2) {
        const y = h / 2 + Math.sin(x / 18) * (h / 3.2);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    } else if (subject === "chemistry") {
      // molecule-style dots and bonds
      const pts = [[0.2, 0.3], [0.45, 0.2], [0.7, 0.4], [0.35, 0.6], [0.6, 0.7], [0.85, 0.55]];
      const abs = pts.map(([x, y]) => [x * w, y * h]);
      const edges: [number, number][] = [[0, 1], [1, 2], [1, 3], [3, 4], [4, 5], [2, 5]];
      edges.forEach(([a, b]) => { ctx.beginPath(); ctx.moveTo(abs[a][0], abs[a][1]); ctx.lineTo(abs[b][0], abs[b][1]); ctx.stroke(); });
      abs.forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill(); });
    } else {
      // DNA-style double helix
      ctx.lineWidth = 1.2;
      for (let x = 0; x <= w; x += 3) {
        const y1 = h / 2 + Math.sin(x / 14) * (h / 3);
        const y2 = h / 2 - Math.sin(x / 14) * (h / 3);
        if (x % 14 < 3) { ctx.beginPath(); ctx.moveTo(x, y1); ctx.lineTo(x, y2); ctx.globalAlpha = 0.18; ctx.stroke(); }
      }
      ctx.globalAlpha = 0.45;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 2) { const y = h / 2 + Math.sin(x / 14) * (h / 3); x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
      ctx.stroke();
      ctx.beginPath();
      for (let x = 0; x <= w; x += 2) { const y = h / 2 - Math.sin(x / 14) * (h / 3); x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
      ctx.stroke();
    }
  }, [subject, hue]);
  return <canvas ref={ref} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />;
}

function SubjectDetail({ subject, onBack, onStartQuiz, onOpenLesson }: { subject: Subject; onBack: () => void; onStartQuiz: (q: ActiveQuiz) => void; onOpenLesson: (l: Lesson) => void }) {
  const { c } = useTheme();
  const lessons = LESSONS_BY_SUBJECT[subject.id];
  // Every quiz belonging to this subject, in authored order (1, 2, 3...)
  const subjectQuizzes = useMemo(
    () => QUIZZES.filter((q) => q.subject === subject.id).sort((a, b) => a.order - b.order),
    [subject.id]
  );
  const subjectHue = subjectColor(subject.id, c);
  const totalMins = lessons.reduce((a, l) => a + l.mins, 0);
  const fullyAuthored = lessons.filter((l) => l.sections && l.sections.length > 0).length;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", animation: "fadeIn .3s ease" }}>
      <div style={{ padding: "18px 18px 6px", display: "flex", alignItems: "center", gap: 12 }}>
        <IconBtn icon={ChevronLeft} c={c} onClick={onBack} />
        <div className="display" style={{ flex: 1, fontSize: 17, fontWeight: 600, color: c.text }}>{subject.name}</div>
        <IconBtn icon={Search} c={c} onClick={() => {}} size={34} />
      </div>

      <div className="app-scroll" style={{ flex: 1, overflowY: "auto", padding: `10px 18px ${NAV_CLEARANCE}px` }}>
        {/* HERO */}
        <div style={{ position: "relative", overflow: "hidden", borderRadius: 26, background: `linear-gradient(165deg, ${subjectHue}1A, ${c.card} 65%)`, border: `1px solid ${subjectHue}2E`, padding: 20, marginBottom: 16, animation: "fadeSlideUp .4s ease both" }}>
          <SubjectHeroMotif subject={subject.id} hue={subjectHue} />
          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
            <SubjectBadge subject={subject.id} size={60} c={c} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="display" style={{ fontWeight: 600, fontSize: 18, color: c.text, marginBottom: 2 }}>{subject.tagline}</div>
              <div style={{ fontSize: 12, color: c.textFaint, fontWeight: 600 }}>{subject.done} of {subject.lessons} lessons complete</div>
            </div>
          </div>
          <div style={{ position: "relative", marginBottom: 14 }}>
            <ProgressBar value={subject.progress} color={subjectHue} track={c.chip} height={8} />
          </div>
          <div style={{ position: "relative", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {[
              { label: "Progress", value: `${Math.round(subject.progress * 100)}%` },
              { label: "Total time", value: `${totalMins}m` },
              { label: "Interactive", value: `${fullyAuthored}/${lessons.length}` },
            ].map((stat) => (
              <div key={stat.label} style={{ background: c.bg + "88", borderRadius: 14, padding: "8px 6px", textAlign: "center" }}>
                <div className="display" style={{ fontSize: 14, fontWeight: 600, color: c.text }}>{stat.value}</div>
                <div style={{ fontSize: 9, color: c.textFaint, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.3 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <SectionTitle c={c}>Lessons</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
          {lessons.map((l, i) => {
            const hasFullContent = !!(l.sections && l.sections.length > 0);
            return (
              <button
                key={l.title}
                onClick={() => onOpenLesson(l)}
                className="btn-press hover-lift"
                style={{
                  textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: 14,
                  background: l.active ? c.card : c.cardAlt,
                  border: `1px solid ${l.active ? subjectHue + "44" : c.border}`, borderRadius: 20, padding: 14,
                  animation: `fadeSlideUp .4s ease ${i * 0.05}s both`,
                }}
              >
                <div
                  style={{
                    position: "relative", width: 40, height: 40, borderRadius: 14, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                    background: l.done ? c.mint + "22" : l.active ? `${subjectHue}1E` : c.chip,
                  }}
                >
                  {l.done ? <Check size={17} color={c.mint} strokeWidth={2.8} /> : l.active ? <Play size={15} color={subjectHue} fill={subjectHue} /> : <span style={{ fontSize: 13, fontWeight: 800, color: c.textFaint }}>{i + 1}</span>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ fontWeight: 700, fontSize: 13.5, color: l.active || l.done ? c.text : c.textSoft }}>{l.title}</div>
                  </div>
                  <div style={{ fontSize: 11, color: c.textFaint, fontWeight: 500, display: "flex", alignItems: "center", gap: 5 }}>
                    <span>{l.mins} min{l.done && " \u00b7 Completed"}</span>
                    {hasFullContent && !l.done && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 3, color: subjectHue, fontWeight: 700 }}>
                        <span style={{ width: 3, height: 3, borderRadius: "50%", background: c.textFaint }} />
                        Interactive
                      </span>
                    )}
                  </div>
                </div>
                {l.active ? (
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: subjectHue, background: `${subjectHue}1E`, padding: "4px 10px", borderRadius: 99, flexShrink: 0 }}>Continue</span>
                ) : (
                  <ChevronRight size={16} color={c.textFaint} style={{ flexShrink: 0 }} />
                )}
              </button>
            );
          })}
        </div>

        {/* Quizzes for this subject, in order — satisfies "clicking a
            subject shows quizzes for that subject" directly on the
            subject page, in addition to the Quiz tab's browser. */}
        {subjectQuizzes.length > 0 && (
          <>
            <SectionTitle c={c}>Quizzes</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {subjectQuizzes.map((q, i) => {
                const diffColor = DIFF_COLOR[q.difficulty];
                return (
                  <button
                    key={q.title}
                    onClick={() => onStartQuiz({ quiz: q, index: 0, score: 0, exercises: q.exerciseSet })}
                    className="btn-press hover-lift"
                    style={{
                      textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: 14,
                      background: `linear-gradient(135deg, ${subjectHue}14, ${subjectHue}03)`, border: `1px solid ${subjectHue}30`,
                      borderRadius: 20, padding: 14, animation: `fadeSlideUp .4s ease ${i * 0.06}s both`,
                    }}
                  >
                    <div style={{ width: 40, height: 40, borderRadius: 14, background: `${subjectHue}1E`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: subjectHue }}>{q.order}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 13.5, color: c.text }}>{q.title}</div>
                      <div style={{ fontSize: 11, color: c.textFaint, fontWeight: 500 }}>{q.questions} questions &bull; {q.mins} min</div>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: c[diffColor], background: c[diffColor] + "1E", padding: "4px 9px", borderRadius: 99, flexShrink: 0 }}>{q.difficulty}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  SCREEN: QUIZ LIST                                                   */
/* ================================================================== */

interface ActiveQuiz {
  quiz: Quiz;
  index: number;
  score: number;
  exercises: Exercise[];
}

const DIFF_COLOR: Record<Difficulty, ColorKey> = { Easy: "mint", Medium: "gold", Hard: "ember" };

function QuizListScreen({ onStartQuiz }: { onStartQuiz: (q: ActiveQuiz) => void }) {
  const { c } = useTheme();
  const [activeSubject, setActiveSubject] = useState<SubjectId | null>(null);

  // Level 2: quizzes for the chosen subject, in order
  if (activeSubject) {
    const subject = SUBJECTS.find((s) => s.id === activeSubject)!;
    const hue = subjectColor(activeSubject, c);
    const quizzes = QUIZZES.filter((q) => q.subject === activeSubject).sort((a, b) => a.order - b.order);
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "18px 18px 6px", display: "flex", alignItems: "center", gap: 12 }}>
          <IconBtn icon={ChevronLeft} c={c} onClick={() => setActiveSubject(null)} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="display" style={{ fontSize: 17, fontWeight: 600, color: c.text }}>{subject.name} quizzes</div>
            <div style={{ fontSize: 11.5, color: c.textFaint, fontWeight: 500 }}>{quizzes.length} quizzes, in order</div>
          </div>
          <SubjectBadge subject={activeSubject} size={36} c={c} />
        </div>
        <div className="app-scroll" style={{ flex: 1, overflowY: "auto", padding: `10px 18px ${NAV_CLEARANCE}px` }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {quizzes.map((q, i) => {
              const diffColor = DIFF_COLOR[q.difficulty];
              return (
                <button
                  key={q.title}
                  onClick={() => onStartQuiz({ quiz: q, index: 0, score: 0, exercises: q.exerciseSet })}
                  className="btn-press hover-lift"
                  style={{
                    textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: 14,
                    background: `linear-gradient(135deg, ${hue}14, ${hue}03)`, border: `1px solid ${hue}30`,
                    borderRadius: 22, padding: 15, animation: `fadeSlideUp .4s ease ${i * 0.07}s both`,
                  }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 15, background: `${hue}1E`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: hue }}>{q.order}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: c.text, marginBottom: 3 }}>{q.title}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11.5, color: c.textFaint, fontWeight: 500 }}>
                      <span>{q.questions} questions</span>
                      <span>&bull;</span>
                      <span>{q.mins} min</span>
                    </div>
                  </div>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: c[diffColor], background: c[diffColor] + "1E", padding: "5px 11px", borderRadius: 99, flexShrink: 0 }}>
                    {q.difficulty}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Level 1: pick a subject
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "20px 18px 10px" }}>
        <div className="display" style={{ fontSize: 22, fontWeight: 600, color: c.text }}>Quizzes</div>
        <div style={{ fontSize: 12.5, color: c.textFaint, fontWeight: 500, marginTop: 3 }}>Pick a subject to see its quizzes, in order</div>
      </div>
      <div className="app-scroll" style={{ flex: 1, overflowY: "auto", padding: `10px 18px ${NAV_CLEARANCE}px` }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {SUBJECTS.map((s, i) => {
            const hue = subjectColor(s.id, c);
            const count = QUIZZES.filter((q) => q.subject === s.id).length;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSubject(s.id)}
                className="btn-press hover-lift"
                style={{
                  textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: 14,
                  background: `linear-gradient(135deg, ${hue}14, ${c.card} 70%)`, border: `1px solid ${hue}2E`,
                  borderRadius: 22, padding: 16, animation: `fadeSlideUp .4s ease ${i * 0.08}s both`,
                }}
              >
                <SubjectBadge subject={s.id} size={52} c={c} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: c.text, marginBottom: 3 }}>{s.name}</div>
                  <div style={{ fontSize: 11.5, color: c.textFaint, fontWeight: 500 }}>{count} quizzes available</div>
                </div>
                <ChevronRight size={18} color={hue} style={{ flexShrink: 0 }} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  QUIZ PLAYER                                                        */
/* ================================================================== */

function useExerciseChecker(ex: Exercise) {
  return useCallback(
    (given: unknown): boolean => {
      if (ex.type === "choice") return given === ex.answer;
      if (ex.type === "blank") return String(given).trim().toLowerCase() === ex.answer.toLowerCase();
      if (ex.type === "slider") return Math.abs((given as number) - ex.answer) <= ex.tolerance;
      if (ex.type === "order") return JSON.stringify(given) === JSON.stringify(ex.correctOrder);
      return false;
    },
    [ex]
  );
}

function ChoiceInput({ ex, onAnswer }: { ex: ChoiceExercise; onAnswer: (given: number, correct: boolean) => void }) {
  const { c } = useTheme();
  const [picked, setPicked] = useState<number | null>(null);
  const check = useExerciseChecker(ex);
  const pick = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    setTimeout(() => onAnswer(i, check(i)), 550);
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {ex.options.map((opt, i) => {
        const isPicked = picked === i;
        const isCorrect = i === ex.answer;
        let bg = c.card, border = c.border, fg = c.text;
        if (picked !== null) {
          if (isCorrect) { bg = c.mint + "1E"; border = c.mint; fg = c.mint; }
          else if (isPicked) { bg = c.danger + "1E"; border = c.danger; fg = c.danger; }
        }
        return (
          <button
            key={opt}
            onClick={() => pick(i)}
            className="btn-press"
            style={{ textAlign: "left", cursor: picked === null ? "pointer" : "default", padding: "15px 16px", borderRadius: 18, background: bg, border: `1.5px solid ${border}`, color: fg, fontWeight: 700, fontSize: 14, transition: "all .3s", display: "flex", alignItems: "center", justifyContent: "space-between" }}
          >
            {opt}
            {picked !== null && isCorrect && <Check size={17} color={c.mint} />}
            {picked !== null && isPicked && !isCorrect && <X size={17} color={c.danger} />}
          </button>
        );
      })}
    </div>
  );
}

function BlankInput({ ex, onAnswer }: { ex: BlankExercise; onAnswer: (given: string, correct: boolean) => void }) {
  const { c } = useTheme();
  const [val, setVal] = useState("");
  const [checked, setChecked] = useState<null | boolean>(null);
  const check = useExerciseChecker(ex);
  const submit = () => {
    if (checked !== null || !val.trim()) return;
    const ok = check(val);
    setChecked(ok);
    setTimeout(() => onAnswer(val, ok), 650);
  };
  return (
    <div>
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        disabled={checked !== null}
        placeholder="Type your answer"
        style={{
          width: "100%", padding: "15px 16px", borderRadius: 18, border: `1.5px solid ${checked === null ? c.border : checked ? c.mint : c.danger}`,
          background: checked === null ? c.card : checked ? c.mint + "18" : c.danger + "18",
          color: c.text, fontWeight: 700, fontSize: 15, outline: "none", marginBottom: 12,
        }}
      />
      {ex.hint && checked === null && <div style={{ fontSize: 11.5, color: c.textFaint, fontWeight: 500, marginBottom: 12 }}>Hint: {ex.hint}</div>}
      <button
        onClick={submit}
        disabled={!val.trim() || checked !== null}
        className="btn-press"
        style={{ width: "100%", padding: "14px", borderRadius: 18, border: "none", cursor: val.trim() ? "pointer" : "default", background: val.trim() && checked === null ? c.ember : c.chip, color: val.trim() && checked === null ? "#fff" : c.textFaint, fontWeight: 700, fontSize: 14 }}
      >
        {checked === null ? "Check answer" : checked ? "Correct!" : `Answer: ${ex.answer}`}
      </button>
    </div>
  );
}

function SliderInput({ ex, onAnswer }: { ex: SliderExercise; onAnswer: (given: number, correct: boolean) => void }) {
  const { c } = useTheme();
  const [val, setVal] = useState((ex.min + ex.max) / 2);
  const [checked, setChecked] = useState<null | boolean>(null);
  const check = useExerciseChecker(ex);
  const submit = () => {
    if (checked !== null) return;
    const ok = check(val);
    setChecked(ok);
    setTimeout(() => onAnswer(val, ok), 650);
  };
  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 18 }}>
        <span className="display" style={{ fontSize: 34, fontWeight: 600, color: checked === null ? c.text : checked ? c.mint : c.danger }}>
          {val.toFixed(1)}{ex.unit}
        </span>
      </div>
      <input
        type="range"
        min={ex.min}
        max={ex.max}
        step={ex.step}
        value={val}
        disabled={checked !== null}
        onChange={(e) => setVal(parseFloat(e.target.value))}
        style={{ width: "100%", accentColor: c.ember, marginBottom: 18 }}
      />
      <button
        onClick={submit}
        disabled={checked !== null}
        className="btn-press"
        style={{ width: "100%", padding: "14px", borderRadius: 18, border: "none", cursor: "pointer", background: checked === null ? c.ember : checked ? c.mint : c.danger, color: "#fff", fontWeight: 700, fontSize: 14 }}
      >
        {checked === null ? "Lock in answer" : checked ? "Correct!" : `Answer: ${ex.answer}${ex.unit}`}
      </button>
    </div>
  );
}

function OrderInput({ ex, onAnswer }: { ex: OrderExercise; onAnswer: (given: string[], correct: boolean) => void }) {
  const { c } = useTheme();
  const [items, setItems] = useState(ex.items);
  const [checked, setChecked] = useState<null | boolean>(null);
  const check = useExerciseChecker(ex);
  const dragIdx = useRef<number | null>(null);

  const move = (from: number, to: number) => {
    if (checked !== null) return;
    setItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const submit = () => {
    if (checked !== null) return;
    const ok = check(items);
    setChecked(ok);
    setTimeout(() => onAnswer(items, ok), 650);
  };

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        {items.map((item, i) => (
          <div
            key={item}
            draggable={checked === null}
            onDragStart={() => (dragIdx.current = i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => { if (dragIdx.current !== null) move(dragIdx.current, i); dragIdx.current = null; }}
            style={{
              display: "flex", alignItems: "center", gap: 10, padding: "13px 14px", borderRadius: 16,
              background: c.card, border: `1.5px solid ${c.border}`, cursor: checked === null ? "grab" : "default",
              fontWeight: 700, fontSize: 13, color: c.text,
            }}
          >
            <span style={{ width: 22, height: 22, borderRadius: 8, background: c.emberSoft, color: c.ember, fontSize: 11.5, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</span>
            <span style={{ flex: 1 }}>{item}</span>
            <span style={{ color: c.textFaint, fontSize: 15 }}>&#8942;&#8942;</span>
          </div>
        ))}
      </div>
      <button
        onClick={submit}
        disabled={checked !== null}
        className="btn-press"
        style={{ width: "100%", padding: "14px", borderRadius: 18, border: "none", cursor: "pointer", background: checked === null ? c.ember : checked ? c.mint : c.danger, color: "#fff", fontWeight: 700, fontSize: 14 }}
      >
        {checked === null ? "Check order" : checked ? "Correct order!" : "Not quite &mdash; review above"}
      </button>
    </div>
  );
}

function QuizPlayer({ quiz, onExit, onAwardXp, onRecordAttempt }: { quiz: ActiveQuiz; onExit: () => void; onAwardXp?: (amount: number) => void; onRecordAttempt?: (a: QuizAttempt) => void }) {
  const { c } = useTheme();
  const [idx, setIdx] = useState(quiz.index);
  const [score, setScore] = useState(quiz.score);
  const [done, setDone] = useState(false);
  const xpAwarded = useRef(false);
  const exercises = quiz.exercises;
  const current = exercises[idx % exercises.length];
  const total = quiz.quiz.questions;

  const handleAnswer = (_given: unknown, correct: boolean) => {
    if (correct) setScore((s) => s + 1);
    if (idx + 1 >= total) setDone(true);
    else setIdx((i) => i + 1);
  };

  useEffect(() => {
    if (done && !xpAwarded.current) {
      xpAwarded.current = true;
      onAwardXp?.(15 + score * 5);
      onRecordAttempt?.({ quizTitle: quiz.quiz.title, subject: quiz.quiz.subject, scorePct: Math.round((score / total) * 100), at: Date.now() });
    }
  }, [done, score, onAwardXp, onRecordAttempt, quiz.quiz.title, quiz.quiz.subject, total]);

  if (done) {
    const pct = Math.round((score / total) * 100);
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 30, animation: "scaleFade .4s ease" }}>
        <div style={{ width: 90, height: 90, borderRadius: 30, background: `linear-gradient(135deg, ${c.ember}, ${c.emberDeep})`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 22, boxShadow: `0 16px 30px -12px ${c.ember}88`, animation: "popIn .5s cubic-bezier(.16,1,.3,1)" }}>
          <Trophy size={38} color="#fff" />
        </div>
        <div className="display" style={{ fontSize: 24, fontWeight: 600, color: c.text, marginBottom: 6 }}>Quiz complete</div>
        <div style={{ fontSize: 13.5, color: c.textFaint, fontWeight: 500, marginBottom: 26 }}>{quiz.quiz.title}</div>
        <div style={{ display: "flex", gap: 14, marginBottom: 30 }}>
          <RingProgress value={pct / 100} size={110} stroke={9} color={c.ember} track={c.chip} label={`${pct}%`} sub="score" />
        </div>
        <div style={{ width: "100%", display: "flex", gap: 10 }}>
          <button onClick={() => { setIdx(0); setScore(0); setDone(false); }} className="btn-press" style={{ flex: 1, padding: 15, borderRadius: 18, border: `1.5px solid ${c.border}`, background: c.card, color: c.text, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <RefreshCw size={15} /> Retry
          </button>
          <button onClick={onExit} className="btn-press" style={{ flex: 1, padding: 15, borderRadius: 18, border: "none", background: c.ember, color: "#fff", fontWeight: 700, cursor: "pointer" }}>
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", animation: "fadeIn .3s ease" }}>
      <div style={{ padding: "18px 18px 6px", display: "flex", alignItems: "center", gap: 12 }}>
        <IconBtn icon={X} c={c} onClick={onExit} />
        <div style={{ flex: 1 }}>
          <ProgressBar value={(idx) / total} color={c.ember} track={c.chip} height={7} />
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: c.textFaint, flexShrink: 0 }}>{idx + 1}/{total}</span>
      </div>

      <div className="app-scroll" style={{ flex: 1, overflowY: "auto", padding: "20px 18px 24px" }} key={idx}>
        <div style={{ marginBottom: 8, fontSize: 11, fontWeight: 700, color: c.ember, textTransform: "uppercase", letterSpacing: 0.5 }}>{quiz.quiz.subject}</div>
        <div className="display" style={{ fontSize: 19, fontWeight: 600, color: c.text, marginBottom: 24, animation: "fadeSlideUp .4s ease both" }}>{current.q}</div>
        <div style={{ animation: "fadeSlideUp .4s ease .08s both" }}>
          {current.type === "choice" && <ChoiceInput ex={current} onAnswer={handleAnswer} />}
          {current.type === "blank" && <BlankInput ex={current} onAnswer={handleAnswer} />}
          {current.type === "slider" && <SliderInput ex={current} onAnswer={handleAnswer} />}
          {current.type === "order" && <OrderInput ex={current} onAnswer={handleAnswer} />}
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  LESSON PLAYER — content block renderers                            */
/* ================================================================== */

/** Renders a text block's `spans` as tap-to-reveal definition chips
 * inline within the paragraph, by slicing `body` around each match.
 * Falls back to plain text when there are no spans or none match. */
function SpannedText({ block, c, subjectHue }: { block: TextBlock; c: Palette; subjectHue: string }) {
  const [openSpan, setOpenSpan] = useState<number | null>(null);
  if (!block.spans || block.spans.length === 0) {
    return <p style={{ margin: 0, fontSize: 15, color: c.text, fontWeight: 500, lineHeight: 1.7 }}>{block.body}</p>;
  }
  // Build a flat list of [plainText | spanRef] pieces by walking the
  // spans in the order their text first appears in body.
  const pieces: { text: string; spanIdx: number | null }[] = [];
  let cursor = 0;
  const sorted = block.spans
    .map((s, idx) => ({ ...s, idx, at: block.body.indexOf(s.text, cursor) }))
    .filter((s) => s.at !== -1)
    .sort((a, b) => a.at - b.at);
  for (const s of sorted) {
    if (s.at < cursor) continue;
    if (s.at > cursor) pieces.push({ text: block.body.slice(cursor, s.at), spanIdx: null });
    pieces.push({ text: s.text, spanIdx: s.idx });
    cursor = s.at + s.text.length;
  }
  if (cursor < block.body.length) pieces.push({ text: block.body.slice(cursor), spanIdx: null });

  return (
    <p style={{ margin: 0, fontSize: 15, color: c.text, fontWeight: 500, lineHeight: 1.7 }}>
      {pieces.map((p, i) => {
        if (p.spanIdx === null) return <span key={i}>{p.text}</span>;
        const span = block.spans![p.spanIdx];
        const isTerm = span.type === "term";
        const isOpen = openSpan === p.spanIdx;
        return (
          <span key={i} style={{ position: "relative" }}>
            <span
              onClick={() => isTerm && setOpenSpan(isOpen ? null : p.spanIdx)}
              style={{
                fontWeight: 800,
                color: isTerm ? subjectHue : c.text,
                cursor: isTerm ? "pointer" : "default",
                borderBottom: isTerm ? `2px dotted ${subjectHue}88` : "none",
              }}
            >
              {p.text}
            </span>
            {isOpen && span.meaning && (
              <span
                style={{
                  position: "absolute", left: 0, bottom: "100%", marginBottom: 6, zIndex: 5,
                  display: "block", width: 220, padding: "10px 12px", borderRadius: 14,
                  background: c.text, color: c.bg, fontSize: 12, fontWeight: 600, lineHeight: 1.5,
                  boxShadow: "0 12px 24px -10px rgba(0,0,0,0.4)", animation: "popIn .2s ease",
                }}
              >
                {span.meaning}
              </span>
            )}
          </span>
        );
      })}
    </p>
  );
}

/** Pulled-out definition callout card — its own visual rhythm break
 * from paragraph text, marked with a book icon and subject hue. */
function DefinitionCard({ block, c, subjectHue }: { block: DefinitionBlock; c: Palette; subjectHue: string }) {
  return (
    <div style={{ borderRadius: 18, padding: 16, background: `${subjectHue}12`, border: `1px solid ${subjectHue}33` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
        <BookMarked size={13} color={subjectHue} />
        <span style={{ fontSize: 10.5, fontWeight: 800, color: subjectHue, textTransform: "uppercase", letterSpacing: 0.5 }}>Definition</span>
      </div>
      <div style={{ fontSize: 14.5, fontWeight: 700, color: c.text, marginBottom: 3 }}>{block.term}</div>
      <div style={{ fontSize: 13, fontWeight: 500, color: c.textSoft, lineHeight: 1.55 }}>{block.meaning}</div>
    </div>
  );
}

/** Renders a formula expression on canvas — not for typesetting power
 * (it's plain text drawn large), but so formulas share a visual
 * language with the graph/diagram blocks rather than looking like a
 * stray line of body copy. */
function FormulaCanvas({ block, c, subjectHue }: { block: FormulaBlock; c: Palette; subjectHue: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth, h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = c.cardAlt;
    const r = 16;
    ctx.beginPath();
    ctx.moveTo(r, 0); ctx.arcTo(w, 0, w, h, r); ctx.arcTo(w, h, 0, h, r); ctx.arcTo(0, h, 0, 0, r); ctx.arcTo(0, 0, w, 0, r);
    ctx.closePath();
    ctx.fill();
    ctx.font = "700 20px 'Fraunces', Georgia, serif";
    ctx.fillStyle = subjectHue;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(block.expression, w / 2, h / 2, w - 32);
  }, [block.expression, c.cardAlt, subjectHue]);
  return (
    <div>
      <canvas ref={ref} style={{ width: "100%", height: 84, display: "block", borderRadius: 16 }} />
      {block.caption && <div style={{ marginTop: 8, fontSize: 12, color: c.textFaint, fontWeight: 500, textAlign: "center", lineHeight: 1.5 }}>{block.caption}</div>}
    </div>
  );
}

/** Samples `fn` across `domain` and draws it as a line plot with
 * axes — a real function graph rather than a static illustration. */
function GraphCanvas({ block, c }: { block: GraphBlock; c: Palette }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const color = block.color ? c[block.color] : c.ember;
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth, h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = c.cardAlt;
    const r = 16;
    ctx.beginPath();
    ctx.moveTo(r, 0); ctx.arcTo(w, 0, w, h, r); ctx.arcTo(w, h, 0, h, r); ctx.arcTo(0, h, 0, 0, r); ctx.arcTo(0, 0, w, 0, r);
    ctx.closePath();
    ctx.fill();

    const pad = 26;
    const [x0, x1] = block.domain;
    const samples: [number, number][] = [];
    const steps = 60;
    for (let i = 0; i <= steps; i++) {
      const x = x0 + ((x1 - x0) * i) / steps;
      samples.push([x, block.fn(x)]);
    }
    const ys = samples.map((s) => s[1]);
    let y0 = Math.min(...ys, 0), y1 = Math.max(...ys, 0);
    if (y0 === y1) { y0 -= 1; y1 += 1; }
    const toPx = (x: number, y: number): [number, number] => [
      pad + ((x - x0) / (x1 - x0)) * (w - pad * 2),
      h - pad - ((y - y0) / (y1 - y0)) * (h - pad * 2),
    ];

    // axes
    ctx.strokeStyle = c.border;
    ctx.lineWidth = 1;
    if (y0 < 0 && y1 > 0) {
      const [, zy] = toPx(x0, 0);
      ctx.beginPath(); ctx.moveTo(pad, zy); ctx.lineTo(w - pad, zy); ctx.stroke();
    }
    if (x0 < 0 && x1 > 0) {
      const [zx] = toPx(0, y0);
      ctx.beginPath(); ctx.moveTo(zx, pad); ctx.lineTo(zx, h - pad); ctx.stroke();
    }

    // curve
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.beginPath();
    samples.forEach(([x, y], i) => {
      const [px, py] = toPx(x, y);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    });
    ctx.stroke();
  }, [block.fn, block.domain, color, c.border, c.cardAlt]);
  return (
    <div>
      <canvas ref={ref} style={{ width: "100%", height: 150, display: "block", borderRadius: 16 }} />
      {block.caption && <div style={{ marginTop: 8, fontSize: 12, color: c.textFaint, fontWeight: 500, lineHeight: 1.5 }}>{block.caption}</div>}
    </div>
  );
}

/** Draws labeled nodes with connecting edges — covers structural
 * "diagrams" (atoms, force pairs, punnett relationships) as a small
 * node-link graphic rather than free-hand illustration. */
function DiagramCanvas({ block, c, subjectHue }: { block: DiagramBlock; c: Palette; subjectHue: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth, h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = c.cardAlt;
    const r = 16;
    ctx.beginPath();
    ctx.moveTo(r, 0); ctx.arcTo(w, 0, w, h, r); ctx.arcTo(w, h, 0, h, r); ctx.arcTo(0, h, 0, 0, r); ctx.arcTo(0, 0, w, 0, r);
    ctx.closePath();
    ctx.fill();

    // scale native node coords (authored ~400x220) to the canvas box
    const sx = w / 400, sy = h / 220;
    const pos = block.nodes.map((n) => ({ x: n.x * sx, y: n.y * sy, label: n.label }));

    ctx.strokeStyle = subjectHue + "77";
    ctx.lineWidth = 2;
    (block.edges ?? []).forEach(([a, b]) => {
      if (!pos[a] || !pos[b]) return;
      ctx.beginPath();
      ctx.moveTo(pos[a].x, pos[a].y);
      ctx.lineTo(pos[b].x, pos[b].y);
      ctx.stroke();
    });

    pos.forEach((n) => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = subjectHue;
      ctx.fill();
      ctx.font = "700 11px 'Inter', sans-serif";
      ctx.fillStyle = c.text;
      ctx.textAlign = "center";
      ctx.textBaseline = n.y > h / 2 ? "top" : "bottom";
      ctx.fillText(n.label, n.x, n.y + (n.y > h / 2 ? 10 : -10), 130);
    });
  }, [block.nodes, block.edges, c.cardAlt, c.text, subjectHue]);
  return (
    <div>
      <canvas ref={ref} style={{ width: "100%", height: 170, display: "block", borderRadius: 16 }} />
      {block.caption && <div style={{ marginTop: 8, fontSize: 12, color: c.textFaint, fontWeight: 500, lineHeight: 1.5, textAlign: "center" }}>{block.caption}</div>}
    </div>
  );
}

/** External-reference link, shown as a tappable card that opens in a
 * new tab rather than navigating the app itself away. */
function LinkCard({ block, c, subjectHue }: { block: LinkBlock; c: Palette; subjectHue: string }) {
  return (
    <a
      href={block.url}
      target="_blank"
      rel="noreferrer"
      className="btn-press"
      style={{
        display: "flex", alignItems: "center", gap: 12, padding: 14, borderRadius: 16,
        background: c.card, border: `1px solid ${c.border}`, textDecoration: "none", cursor: "pointer",
      }}
    >
      <div style={{ width: 36, height: 36, borderRadius: 12, background: `${subjectHue}1E`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Globe size={16} color={subjectHue} />
      </div>
      <div style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 700, color: c.text, lineHeight: 1.4 }}>{block.label}</div>
      <ArrowRight size={15} color={c.textFaint} style={{ flexShrink: 0 }} />
    </a>
  );
}

/** Dispatches a single ContentBlock to its renderer. */
function ContentBlockView({ block, c, subjectHue }: { block: ContentBlock; c: Palette; subjectHue: string }) {
  switch (block.kind) {
    case "text": return <SpannedText block={block} c={c} subjectHue={subjectHue} />;
    case "definition": return <DefinitionCard block={block} c={c} subjectHue={subjectHue} />;
    case "formula": return <FormulaCanvas block={block} c={c} subjectHue={subjectHue} />;
    case "graph": return <GraphCanvas block={block} c={c} />;
    case "diagram": return <DiagramCanvas block={block} c={c} subjectHue={subjectHue} />;
    case "link": return <LinkCard block={block} c={c} subjectHue={subjectHue} />;
    default: return null;
  }
}

/* ================================================================== */
/*  LESSON PLAYER — swipe-between-sections shell                       */
/* ================================================================== */

/** Horizontal drag-to-swipe between sections (Programming-Hub style),
 * with a real touch/mouse drag gesture as the primary interaction and
 * the prev/next chevrons in the header as an always-available tap
 * fallback for the same transition. Only fires past a distance
 * threshold so it doesn't fight with vertical scrolling inside a step. */
function useSectionSwipe(count: number, index: number, onChange: (i: number) => void) {
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const [dragPx, setDragPx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const lockedAxis = useRef<"x" | "y" | null>(null);

  const begin = (x: number, y: number) => {
    startX.current = x;
    startY.current = y;
    lockedAxis.current = null;
    setDragging(true);
  };
  const move = (x: number, y: number) => {
    if (startX.current === null || startY.current === null) return;
    const dx = x - startX.current;
    const dy = y - startY.current;
    if (lockedAxis.current === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      lockedAxis.current = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
    }
    if (lockedAxis.current === "x") {
      // clamp so you can't drag past the first/last section
      const atStart = index === 0 && dx > 0;
      const atEnd = index === count - 1 && dx < 0;
      setDragPx(atStart || atEnd ? dx * 0.35 : dx);
    }
  };
  const end = () => {
    if (lockedAxis.current === "x") {
      const threshold = 70;
      if (dragPx < -threshold && index < count - 1) onChange(index + 1);
      else if (dragPx > threshold && index > 0) onChange(index - 1);
    }
    startX.current = null;
    startY.current = null;
    lockedAxis.current = null;
    setDragPx(0);
    setDragging(false);
  };

  const handlers = {
    onTouchStart: (e: ReactTouchEvent) => begin(e.touches[0].clientX, e.touches[0].clientY),
    onTouchMove: (e: ReactTouchEvent) => move(e.touches[0].clientX, e.touches[0].clientY),
    onTouchEnd: end,
    onMouseDown: (e: ReactMouseEvent) => begin(e.clientX, e.clientY),
    onMouseMove: (e: ReactMouseEvent) => { if (dragging) move(e.clientX, e.clientY); },
    onMouseUp: end,
    onMouseLeave: () => { if (dragging) end(); },
  };

  return { handlers, dragPx, dragging };
}

/** Bottom action sheet for a completed lesson: save for offline,
 * download a summary, or share — the trio the person asked for. */
function LessonActionsSheet({ lesson, onClose, c }: { lesson: Lesson; onClose: () => void; c: Palette }) {
  const [saved, setSaved] = useState(false);
  const actions: { icon: LucideIcon; label: string; sub: string; onClick: () => void }[] = [
    {
      icon: saved ? Check : BookMarked,
      label: saved ? "Saved" : "Save lesson",
      sub: "Keep this available offline",
      onClick: () => setSaved(true),
    },
    {
      icon: RefreshCw,
      label: "Download summary",
      sub: "Export key terms & formulas as a file",
      onClick: () => {},
    },
    {
      icon: Share2,
      label: "Share",
      sub: "Send this lesson to a friend",
      onClick: () => {
        if (navigator.share) navigator.share({ title: lesson.title, text: `Check out this lesson: ${lesson.title}` }).catch(() => {});
      },
    },
  ];
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 80, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", animation: "scrimIn .25s ease" }} />
      <div style={{ position: "relative", background: c.bg, borderRadius: "28px 28px 0 0", padding: "10px 20px 28px", animation: "sheetUp .3s cubic-bezier(.16,1,.3,1)", border: `1px solid ${c.border}`, borderBottom: "none" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
          <div style={{ width: 38, height: 4, borderRadius: 99, background: c.border }} />
        </div>
        <div style={{ fontSize: 12, fontWeight: 700, color: c.textFaint, marginBottom: 14 }}>{lesson.title}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {actions.map((a) => (
            <button
              key={a.label}
              onClick={a.onClick}
              className="btn-press"
              style={{ display: "flex", alignItems: "center", gap: 13, padding: 13, borderRadius: 18, border: `1px solid ${c.border}`, background: c.card, cursor: "pointer", textAlign: "left" }}
            >
              <div style={{ width: 38, height: 38, borderRadius: 13, background: c.emberSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <a.icon size={17} color={c.ember} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: c.text }}>{a.label}</div>
                <div style={{ fontSize: 11, color: c.textFaint, fontWeight: 500 }}>{a.sub}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Full step-by-step lesson experience. Structure: a lesson has
 * sections (swiped between horizontally, Programming-Hub style); each
 * section has steps (advanced with "Next"); each step renders a run
 * of content blocks and may end on a checkpoint exercise that must be
 * answered before "Next" continues. Falls back to a short placeholder
 * section for lessons without authored content yet, so every lesson
 * card opens into a working player rather than a dead end. */
function LessonPlayer({ lesson, subject, onExit, onAwardXp }: { lesson: Lesson; subject: Subject; onExit: () => void; onAwardXp?: (amount: number) => void }) {
  const { c } = useTheme();
  const sections = lesson.sections ?? placeholderSections(lesson.title, subject.id);
  const subjectHue = subjectColor(subject.id, c);
  const [sectionIdx, setSectionIdx] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [checkpointCleared, setCheckpointCleared] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [finished, setFinished] = useState(false);
  const xpAwarded = useRef(false);

  useEffect(() => {
    if (finished && !xpAwarded.current) {
      xpAwarded.current = true;
      onAwardXp?.(lesson.mins * 3 + 20);
    }
  }, [finished, lesson.mins, onAwardXp]);

  const section = sections[sectionIdx];
  const step = section.steps[stepIdx];
  const isLastStepInSection = stepIdx === section.steps.length - 1;
  const isLastSection = sectionIdx === sections.length - 1;
  const canAdvance = !step.checkpoint || checkpointCleared;

  const goToSection = (i: number) => {
    setSectionIdx(i);
    setStepIdx(0);
    setCheckpointCleared(false);
  };
  const { handlers, dragPx, dragging } = useSectionSwipe(sections.length, sectionIdx, goToSection);

  const advance = () => {
    if (!canAdvance) return;
    if (!isLastStepInSection) {
      setStepIdx((i) => i + 1);
      setCheckpointCleared(false);
    } else if (!isLastSection) {
      goToSection(sectionIdx + 1);
    } else {
      setFinished(true);
    }
  };
  const goBack = () => {
    if (stepIdx > 0) { setStepIdx((i) => i - 1); setCheckpointCleared(true); }
    else if (sectionIdx > 0) { setSectionIdx((i) => i - 1); setStepIdx(sections[sectionIdx - 1].steps.length - 1); setCheckpointCleared(true); }
    else onExit();
  };

  // overall progress across every step in every section, for the top bar
  const totalSteps = sections.reduce((a, s) => a + s.steps.length, 0);
  const stepsBefore = sections.slice(0, sectionIdx).reduce((a, s) => a + s.steps.length, 0) + stepIdx;
  const overallProgress = finished ? 1 : stepsBefore / totalSteps;

  if (finished) {
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 30, animation: "scaleFade .4s ease" }}>
        <div style={{ width: 90, height: 90, borderRadius: 30, background: `linear-gradient(135deg, ${subjectHue}, ${subjectHue}CC)`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 22, boxShadow: `0 16px 30px -12px ${subjectHue}88`, animation: "popIn .5s cubic-bezier(.16,1,.3,1)" }}>
          <Trophy size={38} color="#fff" />
        </div>
        <div className="display" style={{ fontSize: 22, fontWeight: 600, color: c.text, marginBottom: 6, textAlign: "center" }}>Lesson complete</div>
        <div style={{ fontSize: 13.5, color: c.textFaint, fontWeight: 500, marginBottom: 30, textAlign: "center" }}>{lesson.title}</div>
        <div style={{ width: "100%", display: "flex", gap: 10 }}>
          <button onClick={() => setActionsOpen(true)} className="btn-press" style={{ flex: 1, padding: 15, borderRadius: 18, border: `1.5px solid ${c.border}`, background: c.card, color: c.text, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <Share2 size={15} /> Save / share
          </button>
          <button onClick={onExit} className="btn-press" style={{ flex: 1, padding: 15, borderRadius: 18, border: "none", background: subjectHue, color: "#fff", fontWeight: 700, cursor: "pointer" }}>
            Done
          </button>
        </div>
        {actionsOpen && <LessonActionsSheet lesson={lesson} onClose={() => setActionsOpen(false)} c={c} />}
      </div>
    );
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", animation: "fadeIn .25s ease" }}>
      {/* Header: exit, overall progress, section dots, actions */}
      <div style={{ padding: "16px 18px 4px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <IconBtn icon={X} c={c} onClick={onExit} />
          <div style={{ flex: 1 }}>
            <ProgressBar value={overallProgress} color={subjectHue} track={c.chip} height={6} />
          </div>
          <IconBtn icon={Share2} c={c} onClick={() => setActionsOpen(true)} />
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
            <button onClick={() => sectionIdx > 0 && goToSection(sectionIdx - 1)} disabled={sectionIdx === 0} className="btn-press" style={{ border: "none", background: "none", padding: 2, cursor: sectionIdx > 0 ? "pointer" : "default", opacity: sectionIdx > 0 ? 1 : 0.25, flexShrink: 0 }}>
              <ChevronLeft size={16} color={c.textSoft} />
            </button>
            <span className="display" style={{ fontSize: 14.5, fontWeight: 600, color: c.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{section.heading}</span>
            <button onClick={() => sectionIdx < sections.length - 1 && goToSection(sectionIdx + 1)} disabled={sectionIdx === sections.length - 1} className="btn-press" style={{ border: "none", background: "none", padding: 2, cursor: sectionIdx < sections.length - 1 ? "pointer" : "default", opacity: sectionIdx < sections.length - 1 ? 1 : 0.25, flexShrink: 0 }}>
              <ChevronRight size={16} color={c.textSoft} />
            </button>
          </div>
          <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
            {sections.map((_, i) => (
              <div key={i} style={{ width: i === sectionIdx ? 16 : 6, height: 6, borderRadius: 99, background: i === sectionIdx ? subjectHue : c.chip, transition: "all .3s cubic-bezier(.4,0,.2,1)" }} />
            ))}
          </div>
        </div>
      </div>

      {/* Swipeable section body */}
      <div
        {...handlers}
        style={{ flex: 1, overflow: "hidden", touchAction: "pan-y", cursor: dragging ? "grabbing" : "grab" }}
      >
        <div
          className="app-scroll"
          key={`${sectionIdx}-${stepIdx}`}
          style={{
            height: "100%", overflowY: "auto", padding: "16px 18px 24px",
            transform: `translateX(${dragPx}px)`,
            transition: dragging ? "none" : "transform .3s cubic-bezier(.16,1,.3,1)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 14, animation: "fadeSlideUp .35s ease both" }}>
            {step.blocks.map((block, i) => (
              <div key={i}>
                <ContentBlockView block={block} c={c} subjectHue={subjectHue} />
              </div>
            ))}
            {step.checkpoint && (
              <div style={{ marginTop: 6, paddingTop: 18, borderTop: `1px dashed ${c.border}` }}>
                <div style={{ marginBottom: 10, fontSize: 11, fontWeight: 700, color: subjectHue, textTransform: "uppercase", letterSpacing: 0.5 }}>Quick check</div>
                <div className="display" style={{ fontSize: 16.5, fontWeight: 600, color: c.text, marginBottom: 16 }}>{step.checkpoint.q}</div>
                {step.checkpoint.type === "choice" && <ChoiceInput ex={step.checkpoint} onAnswer={(_g, ok) => setCheckpointCleared(ok || checkpointCleared)} />}
                {step.checkpoint.type === "blank" && <BlankInput ex={step.checkpoint} onAnswer={(_g, ok) => setCheckpointCleared(ok || checkpointCleared)} />}
                {step.checkpoint.type === "slider" && <SliderInput ex={step.checkpoint} onAnswer={(_g, ok) => setCheckpointCleared(ok || checkpointCleared)} />}
                {step.checkpoint.type === "order" && <OrderInput ex={step.checkpoint} onAnswer={(_g, ok) => setCheckpointCleared(ok || checkpointCleared)} />}
                {!canAdvance && <div style={{ marginTop: 10, fontSize: 11.5, color: c.textFaint, fontWeight: 600, textAlign: "center" }}>Answer to unlock &ldquo;Next&rdquo;</div>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Next / back footer */}
      <div style={{ padding: "10px 18px 18px", display: "flex", gap: 10 }}>
        <button onClick={goBack} className="btn-press" style={{ width: 52, flexShrink: 0, borderRadius: 18, border: `1.5px solid ${c.border}`, background: c.card, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ChevronLeft size={19} color={c.textSoft} />
        </button>
        <button
          onClick={advance}
          disabled={!canAdvance}
          className="btn-press"
          style={{
            flex: 1, padding: 15, borderRadius: 18, border: "none", cursor: canAdvance ? "pointer" : "default",
            background: canAdvance ? subjectHue : c.chip, color: canAdvance ? "#fff" : c.textFaint,
            fontWeight: 700, fontSize: 14.5, display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            transition: "background .25s",
          }}
        >
          {isLastStepInSection && isLastSection ? "Finish lesson" : "Next"}
          <ArrowRight size={16} />
        </button>
      </div>

      {actionsOpen && <LessonActionsSheet lesson={lesson} onClose={() => setActionsOpen(false)} c={c} />}
    </div>
  );
}

/* ================================================================== */
/*  SCREEN: CHAT (AI Tutor) — agentic, ChatGPT-style                    */
/* ================================================================== */

/** A structured result the "agent" attaches to its reply, distinct
 * from the natural-language text — e.g. a tappable lesson it found,
 * a dictionary definition it looked up, or a quiz it recommends. This
 * is the concrete shape of "sourcing data and lessons from the app"
 * rather than just returning prose that mentions them. */
type ChatSourceCard =
  | { kind: "lesson"; subject: SubjectId; lesson: Lesson }
  | { kind: "word"; entry: WordEntry }
  | { kind: "quiz"; quiz: Quiz };

interface ChatMessage {
  id: string;
  from: "user" | "bot";
  text: string;
  cards?: ChatSourceCard[];
  /** Short labels shown above the reply, e.g. "Searched lessons" —
   * a lightweight visible trace of what the agent looked up, so the
   * tool use is legible rather than invisible. */
  toolTrace?: string[];
}

const SUGGESTED_PROMPTS = [
  "Explain limits like I'm new to calculus",
  "Quiz me on Newton's Laws",
  "What does covalent mean?",
  "Recommend my next biology lesson",
];

/** Every lesson across every subject, flattened with its subject id,
 * so the agent can search across the whole catalogue in one pass. */
const ALL_LESSONS_FLAT: { subject: SubjectId; lesson: Lesson }[] = Object.entries(LESSONS_BY_SUBJECT).flatMap(
  ([subj, lessons]) => lessons.map((lesson) => ({ subject: subj as SubjectId, lesson }))
);

const SUBJECT_KEYWORDS: Record<SubjectId, string[]> = {
  math: ["math", "algebra", "calculus", "limit", "derivative", "integral", "function", "equation", "quadratic"],
  physics: ["physics", "newton", "force", "energy", "motion", "wave", "velocity", "mechanics", "electromagnet"],
  chemistry: ["chemistry", "bond", "atom", "molecule", "reaction", "element", "covalent", "ionic", "organic"],
  biology: ["biology", "cell", "gene", "dna", "genetics", "ecosystem", "photosynthesis", "organism"],
};

/** Deterministic "agent" planner: inspects the user's message for
 * lesson titles, dictionary words, quiz intent, or subject keywords
 * already living in this app's own data, and returns a reply plus
 * whatever it found — the app-sourced equivalent of a tool-calling
 * loop, without depending on an external model API. */
function planTutorResponse(raw: string): { text: string; cards: ChatSourceCard[]; toolTrace: string[] } {
  const q = raw.toLowerCase();
  const cards: ChatSourceCard[] = [];
  const toolTrace: string[] = [];

  // 1. Quiz intent — always suggest the earliest quiz in that
  // subject's order, since a learner asking for "a quiz" wants to
  // start at the beginning of that sequence, not a random one.
  const wantsQuiz = /\bquiz\b|\btest me\b|\bpractice\b|\bchallenge\b/.test(q);
  if (wantsQuiz) {
    toolTrace.push("Searched quizzes");
    const subjectHit = (Object.keys(SUBJECT_KEYWORDS) as SubjectId[]).find((s) => SUBJECT_KEYWORDS[s].some((k) => q.includes(k)));
    const pool = subjectHit ? QUIZZES.filter((qz) => qz.subject === subjectHit) : QUIZZES;
    const quiz = pool.reduce((earliest, qz) => (qz.order < earliest.order ? qz : earliest), pool[0]);
    cards.push({ kind: "quiz", quiz });
    return {
      text: `Here's a quiz that fits — **${quiz.title}** (${quiz.questions} questions, ${quiz.difficulty.toLowerCase()}). Tap it below to jump straight in.`,
      cards,
      toolTrace,
    };
  }

  // 2. Direct lesson-title match, then fuzzy word overlap
  toolTrace.push("Searched lessons");
  const exactLesson = ALL_LESSONS_FLAT.find((l) => q.includes(l.lesson.title.toLowerCase()));
  const fuzzyLesson = !exactLesson
    ? ALL_LESSONS_FLAT.find((l) => l.lesson.title.toLowerCase().split(" ").some((w) => w.length > 3 && q.includes(w)))
    : undefined;
  const matchedLesson = exactLesson ?? fuzzyLesson;

  // 3. Dictionary word match
  const words = q.replace(/[^a-z\s]/g, " ").split(/\s+/).filter(Boolean);
  toolTrace.push("Checked dictionary");
  const matchedWord = WORD_BANK.find((w) => words.includes(w.word.toLowerCase()));

  if (matchedWord && /what (is|does|means?)|define|meaning/.test(q)) {
    cards.push({ kind: "word", entry: matchedWord });
    return {
      text: `**${matchedWord.word}** (${matchedWord.partOfSpeech}) — ${matchedWord.definition}\n\nFor example: *${matchedWord.example}*`,
      cards,
      toolTrace,
    };
  }

  if (matchedLesson) {
    cards.push({ kind: "lesson", subject: matchedLesson.subject, lesson: matchedLesson.lesson });
    const subjectName = SUBJECTS.find((s) => s.id === matchedLesson.subject)?.name ?? matchedLesson.subject;
    return {
      text: `Good topic. **${matchedLesson.lesson.title}** in ${subjectName} covers exactly this, with worked examples and a couple of quick checks along the way. Want to open it?`,
      cards,
      toolTrace,
    };
  }

  // 4. "Recommend my next lesson" — surface the first not-done, active-ish lesson
  if (/recommend|what.*next|continue/.test(q)) {
    const subjectHit = (Object.keys(SUBJECT_KEYWORDS) as SubjectId[]).find((s) => SUBJECT_KEYWORDS[s].some((k) => q.includes(k)));
    const pool = subjectHit ? ALL_LESSONS_FLAT.filter((l) => l.subject === subjectHit) : ALL_LESSONS_FLAT;
    const next = pool.find((l) => l.lesson.active) ?? pool.find((l) => !l.lesson.done) ?? pool[0];
    if (next) {
      cards.push({ kind: "lesson", subject: next.subject, lesson: next.lesson });
      return {
        text: `Based on your progress, **${next.lesson.title}** looks like the right next step — about ${next.lesson.mins} minutes.`,
        cards,
        toolTrace,
      };
    }
  }

  // 5. General subject-keyword fallback with an explanatory answer
  const subjectMatch = (Object.keys(SUBJECT_KEYWORDS) as SubjectId[]).find((s) => SUBJECT_KEYWORDS[s].some((k) => q.includes(k)));
  const GENERAL_ANSWERS: Record<SubjectId, string> = {
    math: "Think of it step by step: isolate what you're solving for first, then work outward from there. If you tell me the specific problem, I can walk through it with you.",
    physics: "Most physics problems come down to identifying which quantities you know and which law connects them — force, energy, or motion equations. What's the setup?",
    chemistry: "A good first move is checking what type of bond or reaction you're dealing with — that usually points to the right rule to apply.",
    biology: "Biology often clicks once you see the structure behind the process — cause, mechanism, effect. What part is tripping you up?",
  };
  if (subjectMatch) {
    return { text: GENERAL_ANSWERS[subjectMatch], cards, toolTrace: [] };
  }

  toolTrace.length = 0;
  return {
    text: "Good question — I can dig into any of your Math, Physics, Chemistry, or Biology lessons, look up a term in the dictionary, or set up a quiz. Try asking about a specific topic, like \u201cexplain covalent bonds\u201d or \u201cquiz me on genetics.\u201d",
    cards: [],
    toolTrace: [],
  };
}

/** Minimal inline markdown: **bold**, *italic*, and `code` — enough
 * for a tutor's replies to read like formatted chat rather than a
 * single flat run of text, without pulling in a markdown library. */
function InlineMarkdown({ text, c }: { text: string; c: Palette }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g).filter(Boolean);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i} style={{ fontWeight: 800, color: c.text }}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code key={i} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.92em", background: c.chip, padding: "1px 6px", borderRadius: 6, color: c.ember }}>
              {part.slice(1, -1)}
            </code>
          );
        }
        if (part.startsWith("*") && part.endsWith("*")) {
          return <em key={i} style={{ color: c.textSoft }}>{part.slice(1, -1)}</em>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

/** Renders a chat message's free text as paragraphs + bullet lines,
 * each run through InlineMarkdown — a small but real "markup for
 * details" layer distinct from a flat text blob. */
function ChatText({ text, c }: { text: string; c: Palette }) {
  const lines = text.split("\n").filter((l) => l.trim().length > 0);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {lines.map((line, i) => {
        const isBullet = /^[-*]\s+/.test(line.trim());
        return (
          <p key={i} style={{ margin: 0, display: "flex", gap: isBullet ? 8 : 0 }}>
            {isBullet && <span style={{ color: c.ember, flexShrink: 0 }}>&bull;</span>}
            <span><InlineMarkdown text={isBullet ? line.trim().replace(/^[-*]\s+/, "") : line} c={c} /></span>
          </p>
        );
      })}
    </div>
  );
}

/** Tappable "source card" the agent attaches beneath its reply —
 * a lesson, a dictionary entry, or a quiz, styled consistently with
 * the rest of the app (SubjectBadge, subject hues) so it reads as
 * pulled from real in-app data rather than a generic chat attachment. */
function ChatSourceCardView({ card, c, onOpenSubject, onStartQuiz }: { card: ChatSourceCard; c: Palette; onOpenSubject: (s: Subject) => void; onStartQuiz: (q: ActiveQuiz) => void }) {
  if (card.kind === "lesson") {
    const subject = SUBJECTS.find((s) => s.id === card.subject)!;
    const hue = subjectColor(card.subject, c);
    return (
      <button
        onClick={() => onOpenSubject(subject)}
        className="btn-press hover-lift"
        style={{ textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, width: "100%", background: c.card, border: `1px solid ${hue}33`, borderRadius: 18, padding: 12 }}
      >
        <SubjectBadge subject={card.subject} size={38} c={c} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: hue, textTransform: "uppercase", letterSpacing: 0.4 }}>Lesson &bull; {subject.name}</div>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: c.text }}>{card.lesson.title}</div>
          <div style={{ fontSize: 11, color: c.textFaint, fontWeight: 500 }}>{card.lesson.mins} min</div>
        </div>
        <ArrowRight size={16} color={hue} style={{ flexShrink: 0 }} />
      </button>
    );
  }
  if (card.kind === "word") {
    return (
      <div style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 18, padding: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <BookMarked size={13} color={c.ember} />
          <span style={{ fontSize: 10.5, fontWeight: 700, color: c.ember, textTransform: "uppercase", letterSpacing: 0.4 }}>Dictionary</span>
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: c.text }}>{card.entry.word}</div>
        <div style={{ fontSize: 12, color: c.textFaint, fontWeight: 500 }}>{card.entry.partOfSpeech}</div>
      </div>
    );
  }
  const hue = c.gold;
  return (
    <button
      onClick={() => onStartQuiz({ quiz: card.quiz, index: 0, score: 0, exercises: card.quiz.exerciseSet })}
      className="btn-press hover-lift"
      style={{ textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, width: "100%", background: c.card, border: `1px solid ${hue}33`, borderRadius: 18, padding: 12 }}
    >
      <div style={{ width: 38, height: 38, borderRadius: 13, background: `${hue}1E`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <ListChecks size={17} color={hue} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, color: hue, textTransform: "uppercase", letterSpacing: 0.4 }}>Quiz &bull; #{card.quiz.order} in sequence</div>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: c.text }}>{card.quiz.title}</div>
        <div style={{ fontSize: 11, color: c.textFaint, fontWeight: 500 }}>{card.quiz.questions} questions &bull; {card.quiz.difficulty}</div>
      </div>
      <ArrowRight size={16} color={hue} style={{ flexShrink: 0 }} />
    </button>
  );
}

function ChatScreen({ onOpenSubject, onStartQuiz }: { onOpenSubject: (s: Subject) => void; onStartQuiz: (q: ActiveQuiz) => void }) {
  const { c } = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "m1",
      from: "bot",
      text: "Hey, I'm your study tutor. I can pull up lessons, look up terms in the dictionary, or start a quiz — right from this chat. What do you want to work on?",
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const send = (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text) return;
    const userMsg: ChatMessage = { id: `u${Date.now()}`, from: "user", text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTyping(true);
    const plan = planTutorResponse(text);
    setTimeout(() => {
      setMessages((m) => [...m, { id: `b${Date.now()}`, from: "bot", text: plan.text, cards: plan.cards, toolTrace: plan.toolTrace }]);
      setTyping(false);
    }, 700 + Math.random() * 500);
  };

  const autoGrow = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header — modern assistant style, no bubble chrome */}
      <div style={{ padding: "18px 18px 12px", display: "flex", alignItems: "center", gap: 12, borderBottom: `1px solid ${c.border}` }}>
        <div style={{ position: "relative", width: 38, height: 38, borderRadius: 13, background: `linear-gradient(135deg, ${c.signal}, ${c.ember})`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Bot size={18} color="#fff" />
          <div style={{ position: "absolute", bottom: -2, right: -2, width: 12, height: 12, borderRadius: "50%", background: c.mint, border: `2px solid ${c.bg}` }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="display" style={{ fontSize: 15.5, fontWeight: 600, color: c.text }}>Study Tutor</div>
          <div style={{ fontSize: 11, color: c.textFaint, fontWeight: 600 }}>Can search your lessons &amp; dictionary</div>
        </div>
        <IconBtn
          icon={RefreshCw}
          c={c}
          size={32}
          onClick={() => setMessages([{ id: "reset", from: "bot", text: "Fresh start — what would you like to work on?" }])}
        />
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="app-scroll" style={{ flex: 1, overflowY: "auto", padding: "16px 16px 8px" }}>
        {messages.map((m, i) => (
          <div key={m.id} style={{ marginBottom: 20, animation: `fadeSlideUp .3s ease ${i === messages.length - 1 ? 0 : 0}s both` }}>
            {m.from === "user" ? (
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <div
                  style={{
                    maxWidth: "82%", padding: "11px 15px", borderRadius: "18px 18px 4px 18px",
                    background: c.ember, color: "#fff", fontSize: 13.5, fontWeight: 500, lineHeight: 1.5,
                  }}
                >
                  {m.text}
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div style={{ width: 26, height: 26, borderRadius: 9, background: `linear-gradient(135deg, ${c.signal}, ${c.ember})`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                  <Bot size={13} color="#fff" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {m.toolTrace && m.toolTrace.length > 0 && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                      {m.toolTrace.map((t) => (
                        <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 700, color: c.textFaint, background: c.chip, padding: "3px 9px", borderRadius: 99 }}>
                          <Search size={9} /> {t}
                        </span>
                      ))}
                    </div>
                  )}
                  <div style={{ fontSize: 13.5, color: c.text, fontWeight: 500, lineHeight: 1.65 }}>
                    <ChatText text={m.text} c={c} />
                  </div>
                  {m.cards && m.cards.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
                      {m.cards.map((card, ci) => (
                        <ChatSourceCardView key={ci} card={card} c={c} onOpenSubject={onOpenSubject} onStartQuiz={onStartQuiz} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        {typing && (
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 20 }}>
            <div style={{ width: 26, height: 26, borderRadius: 9, background: `linear-gradient(135deg, ${c.signal}, ${c.ember})`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Bot size={13} color="#fff" />
            </div>
            <div style={{ display: "flex", gap: 4, alignItems: "center", paddingTop: 6 }}>
              {[0, 1, 2].map((d) => (
                <span key={d} style={{ width: 6, height: 6, borderRadius: "50%", background: c.textFaint, display: "inline-block", animation: `floatY 1s ease-in-out ${d * 0.15}s infinite` }} />
              ))}
            </div>
          </div>
        )}

        {/* Suggested prompts — only before the first user message */}
        {messages.length === 1 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
            {SUGGESTED_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => send(p)}
                className="btn-press"
                style={{ textAlign: "left", cursor: "pointer", border: `1px solid ${c.border}`, background: c.cardAlt, color: c.textSoft, fontSize: 12, fontWeight: 600, padding: "9px 13px", borderRadius: 14 }}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Input — pinned above the tab bar, never covered by it */}
      <div style={{ padding: `10px 16px ${NAV_CLEARANCE}px`, borderTop: `1px solid ${c.border}` }}>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end", background: c.card, border: `1.5px solid ${c.border}`, borderRadius: 22, padding: "6px 6px 6px 16px" }}>
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => { setInput(e.target.value); autoGrow(); }}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Message your tutor..."
            style={{ flex: 1, resize: "none", border: "none", outline: "none", background: "transparent", color: c.text, fontSize: 13.5, fontWeight: 500, padding: "9px 0", maxHeight: 120, fontFamily: "inherit", lineHeight: 1.4 }}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim()}
            className="btn-press"
            style={{ width: 38, height: 38, borderRadius: 14, border: "none", cursor: input.trim() ? "pointer" : "default", background: input.trim() ? c.ember : c.chip, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginBottom: 2 }}
          >
            <Send size={16} color={input.trim() ? "#fff" : c.textFaint} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  SCREEN: PROFILE                                                     */
/* ================================================================== */

interface Achievement { icon: LucideIcon; label: string; color: ColorKey; earned: boolean; }

/** Achievement earned-status is computed from real session state —
 * never hardcoded — so a brand-new learner at zero XP genuinely sees
 * every badge as un-earned, and badges light up the moment their
 * real condition is met. */
function computeAchievements(xp: XpState): Achievement[] {
  const perfectQuiz = xp.quizAttempts.some((a) => a.scorePct === 100);
  const threeQuizzes = xp.quizAttempts.length >= 3;
  const avg = quizAttemptsAvgNumber(xp);
  return [
    { icon: Flame, label: "7-Day Streak", color: "gold", earned: xp.streak >= 7 },
    { icon: Trophy, label: "Quiz Master", color: "ember", earned: threeQuizzes },
    { icon: Target, label: "Sharp Shooter", color: "mint", earned: avg !== null && avg >= 80 },
    { icon: Medal, label: "Fast Learner", color: "signal", earned: xp.level >= 3 },
    { icon: Star, label: "Top 10%", color: "gold", earned: xp.totalXp >= 500 },
    { icon: ShieldCheck, label: "Perfectionist", color: "mint", earned: perfectQuiz },
  ];
}

/** 14-day XP bar chart with day-of-week labels and a hover/tap
 * tooltip. Pure SVG (no chart library) so it stays dependency-free
 * and themeable through the palette like everything else here. */
function XpBarChart({ days, color, track, c }: { days: DayXp[]; color: string; track: string; c: Palette }) {
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(...days.map((d) => d.xp), 20);
  const w = 100 / days.length;
  const dayLabel = (iso: string) => new Date(iso + "T00:00:00").toLocaleDateString(undefined, { weekday: "narrow" });

  return (
    <div>
      <div style={{ position: "relative", height: 110, display: "flex", alignItems: "flex-end", gap: "2%" }}>
        {days.map((d, i) => {
          const h = Math.max(3, (d.xp / max) * 100);
          const isActive = active === i;
          const isToday = i === days.length - 1;
          return (
            <div
              key={d.date}
              onClick={() => setActive(isActive ? null : i)}
              style={{ flex: 1, height: "100%", display: "flex", alignItems: "flex-end", position: "relative", cursor: "pointer" }}
            >
              {isActive && (
                <div
                  style={{
                    position: "absolute", bottom: `calc(${h}% + 8px)`, left: "50%", transform: "translateX(-50%)",
                    background: c.text, color: c.bg, fontSize: 10.5, fontWeight: 800, padding: "4px 8px", borderRadius: 8,
                    whiteSpace: "nowrap", zIndex: 2, animation: "popIn .15s ease", boxShadow: "0 8px 16px -6px rgba(0,0,0,0.4)",
                  }}
                >
                  {d.xp} XP
                </div>
              )}
              <div
                style={{
                  width: "100%", height: `${h}%`, borderRadius: 6,
                  background: isToday ? color : isActive ? color : `${color}55`,
                  transition: "height .8s cubic-bezier(.16,1,.3,1), background .2s ease",
                  boxShadow: isToday ? `0 4px 10px -4px ${color}aa` : "none",
                }}
              />
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: "2%", marginTop: 6 }}>
        {days.map((d, i) => (
          <div key={d.date} style={{ flex: 1, textAlign: "center", fontSize: 9.5, fontWeight: 700, color: i === days.length - 1 ? color : c.textFaint }}>
            {dayLabel(d.date)}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Compact stat card used in the Profile grid — smaller footprint
 * than the original so more information fits without scrolling. */
function CompactStat({ icon: Icon, label, value, color, c, delay }: { icon: LucideIcon; label: string; value: string; color: ColorKey; c: Palette; delay: number }) {
  return (
    <div style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 16, padding: "10px 8px", textAlign: "center", animation: `fadeSlideUp .4s ease ${delay}s both` }}>
      <Icon size={15} color={c[color]} style={{ marginBottom: 4 }} />
      <div className="display" style={{ fontSize: 13.5, fontWeight: 600, color: c.text, lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 9, color: c.textFaint, fontWeight: 600, marginTop: 1 }}>{label}</div>
    </div>
  );
}

function ProfileScreen({ onOpenSettings, displayName, xp }: { onOpenSettings: () => void; displayName: string; xp: XpState }) {
  const { c } = useTheme();
  const totalDone = SUBJECTS.reduce((a, s) => a + s.done, 0);
  const totalLessons = SUBJECTS.reduce((a, s) => a + s.lessons, 0);
  const last7 = xp.history.slice(-XP_HISTORY_DAYS);
  const levelPct = xp.forLevel > 0 ? xp.intoLevel / xp.forLevel : 0;
  // Real average score comes from actual quiz attempts this session —
  // shown as "—" rather than a fabricated number until the learner
  // has taken at least one quiz.
  const avgScoreLabel = quizAttemptsAvg(xp) ?? "—";

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "18px 18px 4px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div className="display" style={{ fontSize: 18, fontWeight: 600, color: c.text }}>Profile</div>
        <IconBtn icon={PaletteIcon} c={c} onClick={onOpenSettings} size={34} />
      </div>
      <div className="app-scroll" style={{ flex: 1, overflowY: "auto", padding: `10px 18px ${NAV_CLEARANCE}px` }}>
        {/* Compact identity row */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16, animation: "fadeSlideUp .4s ease both" }}>
          <Avatar initial={displayName[0]} c={c} size={62} ring />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="display" style={{ fontSize: 16.5, fontWeight: 600, color: c.text }}>{displayName}</div>
            <div style={{ fontSize: 11.5, color: c.textFaint, fontWeight: 500, marginBottom: 6 }}>Level {xp.level} &bull; Just getting started</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ flex: 1 }}>
                <ProgressBar value={levelPct} color={c.gold} track={c.chip} height={6} />
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, color: c.textFaint, flexShrink: 0 }}>{xp.intoLevel}/{xp.forLevel}</span>
            </div>
          </div>
        </div>

        {/* Compact 3-up stat row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 18 }}>
          <CompactStat icon={BookOpen} label="Lessons" value={`${totalDone}/${totalLessons}`} color="ember" c={c} delay={0} />
          <CompactStat icon={Flame} label="Streak" value={`${xp.streak}d`} color="gold" c={c} delay={0.05} />
          <CompactStat icon={TrendingUp} label="Avg score" value={avgScoreLabel} color="mint" c={c} delay={0.1} />
          <CompactStat icon={Zap} label="Total XP" value={xp.totalXp >= 1000 ? `${(xp.totalXp / 1000).toFixed(1)}k` : `${xp.totalXp}`} color="signal" c={c} delay={0.15} />
        </div>

        {/* XP graph — 7-day window, matching the Learn screen sparkline */}
        <div style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 20, padding: 16, marginBottom: 18, animation: "fadeSlideUp .4s ease .1s both" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: c.text }}>XP — last 7 days</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: c.ember }}>{last7.reduce((a, d) => a + d.xp, 0)} XP</span>
          </div>
          <XpBarChart days={last7} color={c.ember} track={c.chip} c={c} />
        </div>

        <SectionTitle c={c}>Subject mastery</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
          {SUBJECTS.map((s) => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, background: c.card, border: `1px solid ${c.border}`, borderRadius: 16, padding: 10 }}>
              <SubjectBadge subject={s.id} size={32} c={c} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: c.text }}>{s.name}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: c.textFaint }}>{Math.round(s.progress * 100)}%</span>
                </div>
                <ProgressBar value={s.progress} color={c[s.color]} track={c.chip} height={5} />
              </div>
            </div>
          ))}
        </div>

        <SectionTitle c={c}>Achievements</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          {computeAchievements(xp).map((a, i) => (
            <div
              key={a.label}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: 10, borderRadius: 16,
                background: a.earned ? c.card : c.cardAlt, border: `1px solid ${c.border}`, opacity: a.earned ? 1 : 0.45,
                animation: `popIn .4s ease ${i * 0.05}s both`,
              }}
            >
              <div style={{ width: 32, height: 32, borderRadius: 11, background: a.earned ? c[a.color] + "22" : c.chip, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <a.icon size={15} color={a.earned ? c[a.color] : c.textFaint} />
              </div>
              <span style={{ fontSize: 8.5, fontWeight: 700, color: c.text, textAlign: "center", lineHeight: 1.2 }}>{a.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  SETTINGS SCREEN                                                     */
/* ================================================================== */

function SettingsRow({ icon: Icon, label, sub, right, onClick, c }: { icon: LucideIcon; label: string; sub?: string; right?: ReactNode; onClick?: () => void; c: Palette }) {
  return (
    <div
      onClick={onClick}
      className={onClick ? "btn-press" : undefined}
      style={{ display: "flex", alignItems: "center", gap: 13, padding: "13px 4px", cursor: onClick ? "pointer" : "default" }}
    >
      <div style={{ width: 36, height: 36, borderRadius: 12, background: c.cardAlt, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={16} color={c.textSoft} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: c.text }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: c.textFaint, fontWeight: 500 }}>{sub}</div>}
      </div>
      {right ?? <ChevronRight size={16} color={c.textFaint} />}
    </div>
  );
}

function Toggle({ on, onClick, c }: { on: boolean; onClick: () => void; c: Palette }) {
  return (
    <button
      onClick={onClick}
      className="btn-press"
      style={{ width: 42, height: 25, borderRadius: 99, border: "none", cursor: "pointer", background: on ? c.ember : c.chip, position: "relative", transition: "background .25s", flexShrink: 0 }}
    >
      <div style={{ position: "absolute", top: 2.5, left: on ? 19.5 : 2.5, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left .25s cubic-bezier(.4,0,.2,1)", boxShadow: "0 2px 4px rgba(0,0,0,0.25)" }} />
    </button>
  );
}

/** Row of tappable color dots for picking an accent hue. Selected dot
 * gets a ring + checkmark; each dot uses that accent's own "main"
 * shade for the current mode so the picker always shows true colors. */
function AccentSwatchRow({ mode, accent, onPick }: { mode: ThemeMode; accent: AccentId; onPick: (a: AccentId) => void }) {
  return (
    <div style={{ display: "flex", gap: 12, padding: "10px 4px 16px", flexWrap: "wrap" }}>
      {(Object.keys(ACCENTS) as AccentId[]).map((id) => {
        const hue = ACCENTS[id][mode][0];
        const active = accent === id;
        return (
          <button
            key={id}
            onClick={() => onPick(id)}
            className="btn-press"
            aria-label={ACCENTS[id].label}
            style={{
              width: 44, height: 44, borderRadius: 16, border: active ? `2.5px solid ${hue}` : `2.5px solid transparent`, padding: 3,
              background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <div style={{ width: "100%", height: "100%", borderRadius: 12, background: hue, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 10px -4px ${hue}99` }}>
              {active && <Check size={16} color="#fff" strokeWidth={3} />}
            </div>
          </button>
        );
      })}
    </div>
  );
}

/** List of selectable font pairs, each rendered in its own display
 * face so picking a font is a live preview rather than plain text. */
function FontOptionRow({ c, current, onPick }: { c: Palette; current: FontId; onPick: (f: FontId) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "8px 4px 16px" }}>
      {(Object.keys(FONT_PAIRS) as FontId[]).map((id) => {
        const pair = FONT_PAIRS[id];
        const active = current === id;
        return (
          <button
            key={id}
            onClick={() => onPick(id)}
            className="btn-press"
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between", textAlign: "left", cursor: "pointer",
              padding: "13px 15px", borderRadius: 16, border: `1.5px solid ${active ? c.ember : c.border}`,
              background: active ? c.emberSoft : c.card,
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: pair.display, fontSize: 16, fontWeight: 600, color: c.text, marginBottom: 2 }}>{pair.label}</div>
              <div style={{ fontFamily: pair.body, fontSize: 11, color: c.textFaint, fontWeight: 500, marginBottom: 1 }}>The quick brown fox jumps</div>
              <div style={{ fontSize: 10, color: c.textFaint, fontWeight: 500, opacity: 0.75 }}>{pair.desc}</div>
            </div>
            {active && <Check size={17} color={c.ember} strokeWidth={2.6} style={{ flexShrink: 0 }} />}
          </button>
        );
      })}
    </div>
  );
}

function SettingsScreen({ onBack, displayName, onChangeDisplayName }: { onBack: () => void; displayName: string; onChangeDisplayName: (n: string) => void }) {
  const { c, mode, toggle, accent, setAccent, fontId, setFontId, uniformFont, setUniformFont } = useTheme();
  const [notifs, setNotifs] = useState(true);
  const [sound, setSound] = useState(true);
  const [haptics, setHaptics] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(displayName);
  const [colorOpen, setColorOpen] = useState(false);
  const [fontOpen, setFontOpen] = useState(false);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", animation: "fadeIn .3s ease" }}>
      <div style={{ padding: "18px 18px 6px", display: "flex", alignItems: "center", gap: 12 }}>
        <IconBtn icon={ChevronLeft} c={c} onClick={onBack} />
        <div className="display" style={{ flex: 1, fontSize: 17, fontWeight: 600, color: c.text }}>Settings</div>
      </div>

      <div className="app-scroll" style={{ flex: 1, overflowY: "auto", padding: "10px 18px 30px" }}>
        <div style={{ marginBottom: 6, fontSize: 11, fontWeight: 700, color: c.textFaint, textTransform: "uppercase", letterSpacing: 0.5 }}>Account</div>
        {editingName ? (
          <div style={{ display: "flex", gap: 8, padding: "8px 4px 14px" }}>
            <input
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              autoFocus
              style={{ flex: 1, padding: "10px 13px", borderRadius: 14, border: `1px solid ${c.border}`, background: c.card, color: c.text, fontSize: 13.5, fontWeight: 600, outline: "none" }}
            />
            <button
              onClick={() => { onChangeDisplayName(nameDraft.trim() || displayName); setEditingName(false); }}
              className="btn-press"
              style={{ padding: "10px 16px", borderRadius: 14, border: "none", background: c.ember, color: "#fff", fontWeight: 700, fontSize: 12.5, cursor: "pointer" }}
            >
              Save
            </button>
          </div>
        ) : (
          <SettingsRow icon={UserIcon} label="Display name" sub={displayName} c={c} onClick={() => { setNameDraft(displayName); setEditingName(true); }} />
        )}
        <SettingsRow icon={Globe} label="Language" sub="English (US)" c={c} onClick={() => {}} />
        <SettingsRow icon={Lock} label="Privacy" sub="Manage your data" c={c} onClick={() => {}} />

        <div style={{ height: 1, background: c.border, margin: "14px 0" }} />

        <div style={{ marginBottom: 6, fontSize: 11, fontWeight: 700, color: c.textFaint, textTransform: "uppercase", letterSpacing: 0.5 }}>Appearance</div>
        <SettingsRow
          icon={mode === "dark" ? Moon : Sun}
          label="Theme"
          sub={mode === "dark" ? "Dark" : "Light"}
          c={c}
          right={<Toggle on={mode === "dark"} onClick={toggle} c={c} />}
        />
        <SettingsRow
          icon={PaletteIcon}
          label="Accent color"
          sub={ACCENTS[accent].label}
          c={c}
          onClick={() => setColorOpen((v) => !v)}
          right={<ChevronRight size={16} color={c.textFaint} style={{ transform: colorOpen ? "rotate(90deg)" : "none", transition: "transform .2s ease" }} />}
        />
        {colorOpen && <AccentSwatchRow mode={mode} accent={accent} onPick={setAccent} />}
        <SettingsRow
          icon={TypeIcon}
          label="Font"
          sub={FONT_PAIRS[fontId].label}
          c={c}
          onClick={() => setFontOpen((v) => !v)}
          right={<ChevronRight size={16} color={c.textFaint} style={{ transform: fontOpen ? "rotate(90deg)" : "none", transition: "transform .2s ease" }} />}
        />
        {fontOpen && <FontOptionRow c={c} current={fontId} onPick={setFontId} />}
        <SettingsRow
          icon={TypeIcon}
          label="Use one font everywhere"
          sub={uniformFont ? "Headings match body text" : "Headings use the display face"}
          c={c}
          right={<Toggle on={uniformFont} onClick={() => setUniformFont(!uniformFont)} c={c} />}
        />

        <div style={{ height: 1, background: c.border, margin: "14px 0" }} />

        <div style={{ marginBottom: 6, fontSize: 11, fontWeight: 700, color: c.textFaint, textTransform: "uppercase", letterSpacing: 0.5 }}>Notifications</div>
        <SettingsRow icon={Bell} label="Push notifications" sub="Reminders & streaks" c={c} right={<Toggle on={notifs} onClick={() => setNotifs((v) => !v)} c={c} />} />
        <SettingsRow icon={Volume2} label="Sound effects" c={c} right={<Toggle on={sound} onClick={() => setSound((v) => !v)} c={c} />} />
        <SettingsRow icon={Vibrate} label="Haptic feedback" c={c} right={<Toggle on={haptics} onClick={() => setHaptics((v) => !v)} c={c} />} />

        <div style={{ height: 1, background: c.border, margin: "14px 0" }} />

        <div style={{ marginBottom: 6, fontSize: 11, fontWeight: 700, color: c.textFaint, textTransform: "uppercase", letterSpacing: 0.5 }}>Support</div>
        <SettingsRow icon={HelpCircle} label="Help center" c={c} onClick={() => {}} />
        <SettingsRow icon={Share2} label="Share app" c={c} onClick={() => {}} />
        <SettingsRow icon={Info} label="About" sub="Version 2.0.0" c={c} onClick={() => {}} />

        <div style={{ height: 1, background: c.border, margin: "14px 0" }} />

        <SettingsRow icon={Trash2} label="Clear cache" c={c} onClick={() => {}} />
        <SettingsRow icon={LogOut} label="Sign out" c={c} onClick={() => {}} right={<span />} />
      </div>
    </div>
  );
}

/* ================================================================== */
/*  SEARCH OVERLAY                                                      */
/* ================================================================== */

interface SearchResult { title: string; subject: SubjectId; mins: number; }

const ALL_LESSONS: SearchResult[] = Object.entries(LESSONS_BY_SUBJECT).flatMap(([subj, lessons]) =>
  lessons.map((l) => ({ title: l.title, subject: subj as SubjectId, mins: l.mins }))
);

function SearchOverlay({ onClose, onOpenSubject, c }: { onClose: () => void; onOpenSubject: (s: Subject) => void; c: Palette }) {
  const [q, setQ] = useState("");
  const results = useMemo(() => {
    if (!q.trim()) return [];
    return ALL_LESSONS.filter((l) => l.title.toLowerCase().includes(q.toLowerCase()));
  }, [q]);

  return (
    <div style={{ position: "absolute", inset: 0, background: c.bg, zIndex: 60, animation: "fadeIn .25s ease", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "18px 18px 12px" }}>
        <IconBtn icon={ChevronLeft} c={c} onClick={onClose} />
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, background: c.card, border: `1px solid ${c.border}`, borderRadius: 16, padding: "11px 14px" }}>
          <Search size={16} color={c.textFaint} />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search lessons..."
            style={{ flex: 1, border: "none", outline: "none", background: "transparent", color: c.text, fontSize: 13.5, fontWeight: 600 }}
          />
          {q && <IconBtn icon={X} c={c} size={22} onClick={() => setQ("")} />}
        </div>
      </div>
      <div className="app-scroll" style={{ flex: 1, overflowY: "auto", padding: "4px 18px 20px" }}>
        {!q && (
          <div style={{ textAlign: "center", marginTop: 60, color: c.textFaint }}>
            <Search size={26} style={{ marginBottom: 10, opacity: 0.4 }} />
            <div style={{ fontSize: 13, fontWeight: 600 }}>Search across every subject</div>
          </div>
        )}
        {q && results.length === 0 && (
          <div style={{ textAlign: "center", marginTop: 60, color: c.textFaint }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>No results for &ldquo;{q}&rdquo;</div>
          </div>
        )}
        {results.map((r, i) => (
          <div
            key={r.title}
            onClick={() => { const subject = SUBJECTS.find((s) => s.id === r.subject); if (subject) { onOpenSubject(subject); onClose(); } }}
            className="btn-press"
            style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, borderRadius: 16, background: c.card, border: `1px solid ${c.border}`, marginBottom: 8, animation: `fadeSlideUp .3s ease ${i * 0.05}s both`, cursor: "pointer" }}
          >
            <SubjectBadge subject={r.subject} size={36} c={c} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: c.text }}>{r.title}</div>
              <div style={{ fontSize: 11, color: c.textFaint, textTransform: "capitalize" }}>{r.subject} &bull; {r.mins} min</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  NOTIFICATIONS OVERLAY                                               */
/* ================================================================== */

interface NotificationItem { id: string; icon: LucideIcon; color: string; title: string; sub: string; unread: boolean; }

function NotificationsOverlay({ onClose, c }: { onClose: () => void; c: Palette }) {
  const [items, setItems] = useState<NotificationItem[]>([
    { id: "n1", icon: Flame, color: c.gold, title: "7-day streak! \ud83d\udd25", sub: "Keep it going \u2014 finish a lesson today", unread: true },
    { id: "n2", icon: Trophy, color: c.ember, title: "Quiz score improved", sub: "Kinematics Challenge: 87% (+12%)", unread: true },
    { id: "n3", icon: BookOpen, color: c.mint, title: "New lesson unlocked", sub: "Integral Calculus is now available", unread: false },
    { id: "n4", icon: Star, color: c.signal, title: "Achievement earned", sub: "You unlocked \u201cFast Learner\u201d", unread: false },
  ]);
  const dismiss = (id: string) => setItems((prev) => prev.filter((n) => n.id !== id));
  const markAllRead = () => setItems((prev) => prev.map((n) => ({ ...n, unread: false })));

  return (
    <div style={{ position: "absolute", inset: 0, background: c.bg, zIndex: 60, animation: "fadeIn .25s ease", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "18px 18px 14px" }}>
        <IconBtn icon={ChevronLeft} c={c} onClick={onClose} />
        <div className="display" style={{ flex: 1, fontSize: 18, fontWeight: 600, color: c.text }}>Notifications</div>
        {items.some((n) => n.unread) && (
          <button onClick={markAllRead} className="btn-press" style={{ border: "none", background: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, color: c.ember, padding: 0 }}>
            Mark all read
          </button>
        )}
      </div>
      <div className="app-scroll" style={{ flex: 1, overflowY: "auto", padding: "4px 18px 20px" }}>
        {items.length === 0 && (
          <div style={{ textAlign: "center", marginTop: 70, color: c.textFaint, animation: "fadeIn .3s ease" }}>
            <Info size={30} style={{ marginBottom: 10, opacity: 0.5 }} />
            <div style={{ fontSize: 13, fontWeight: 600 }}>You&rsquo;re all caught up</div>
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {items.map((n, i) => (
            <div key={n.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: 13, borderRadius: 20, background: n.unread ? c.emberSoft : c.card, border: `1px solid ${n.unread ? c.ember + "33" : c.border}`, animation: `fadeSlideUp .35s ease ${i * 0.05}s both` }}>
              <div style={{ width: 36, height: 36, borderRadius: 13, background: n.color + "22", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <n.icon size={16} color={n.color} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: c.text }}>{n.title}</div>
                <div style={{ fontSize: 11.5, color: c.textFaint, marginTop: 1 }}>{n.sub}</div>
              </div>
              <button onClick={() => dismiss(n.id)} className="btn-press" aria-label="Dismiss" style={{ border: "none", background: "none", cursor: "pointer", padding: 4, color: c.textFaint, flexShrink: 0 }}>
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  APP SHELL                                                          */
/* ================================================================== */

function AppInner() {
  const { c } = useTheme();
  const [tab, setTab] = useState<TabId>("learn");
  const [subjectOpen, setSubjectOpen] = useState<Subject | null>(null);
  const [lessonOpen, setLessonOpen] = useState<Lesson | null>(null);
  const [quizActive, setQuizActive] = useState<ActiveQuiz | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [displayName, setDisplayName] = useState("Leon");
  const [xpState, setXpState] = useXpState();

  const openSubjectFromAnywhere = (s: Subject) => { setSubjectOpen(s); setTab("learn"); };

  let content: ReactNode;
  if (settingsOpen) {
    content = <SettingsScreen onBack={() => setSettingsOpen(false)} displayName={displayName} onChangeDisplayName={setDisplayName} />;
  } else if (quizActive) {
    content = <QuizPlayer quiz={quizActive} onExit={() => setQuizActive(null)} onAwardXp={xpState.award} onRecordAttempt={xpState.recordQuizAttempt} />;
  } else if (lessonOpen && subjectOpen) {
    content = (
      <LessonPlayer
        lesson={lessonOpen}
        subject={subjectOpen}
        onExit={() => setLessonOpen(null)}
        onAwardXp={xpState.award}
      />
    );
  } else if (subjectOpen) {
    content = (
      <SubjectDetail
        subject={subjectOpen}
        onBack={() => setSubjectOpen(null)}
        onStartQuiz={(qz) => setQuizActive(qz)}
        onOpenLesson={(l) => setLessonOpen(l)}
      />
    );
  } else if (tab === "learn") {
    content = (
      <LearnScreen
        onOpenSubject={setSubjectOpen}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenProfile={() => setTab("profile")}
        onOpenNotifications={() => setNotificationsOpen(true)}
        userName={displayName}
        xp={xpState}
      />
    );
  } else if (tab === "quiz") {
    content = <QuizListScreen onStartQuiz={setQuizActive} />;
  } else if (tab === "chat") {
    content = <ChatScreen onOpenSubject={openSubjectFromAnywhere} onStartQuiz={(qz) => setQuizActive(qz)} />;
  } else {
    content = <ProfileScreen onOpenSettings={() => setSettingsOpen(true)} displayName={displayName} xp={xpState} />;
  }

  const showNav = !subjectOpen && !quizActive && !settingsOpen;

  return (
    <div
      className="app-root"
      style={{
        width: "100%", maxWidth: 480, height: "100%", margin: "0 auto", position: "relative",
        background: c.bgGrad, overflow: "hidden",
      }}
    >
      <div style={{ height: "100%" }}>
        {content}
      </div>
      {showNav && <PillNav tab={tab} setTab={setTab} c={c} />}
      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} onOpenSubject={setSubjectOpen} c={c} />}
      {notificationsOpen && <NotificationsOverlay onClose={() => setNotificationsOpen(false)} c={c} />}
    </div>
  );
}

function Shell() {
  const { c } = useTheme();
  return (
    <div style={{ width: "100vw", height: "100vh", background: c.bg, transition: "background .4s ease" }}>
      <AppInner />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  );
}

/** Reads fonts from context to feed GlobalStyle — split out so the
 * font `@import` swaps live-reactively when the person changes it in
 * Settings, without restructuring the provider itself. */
function ThemedApp() {
  const { fonts, uniformFont } = useTheme();
  return (
    <>
      <GlobalStyle fonts={fonts} uniformFont={uniformFont} />
      <Shell />
    </>
  );
}
