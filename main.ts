// One-line horror writer for "One Line, One Chill" (make.fun).
// Writes a single horror sentence to $MAKEFUN_OUTPUT_DIR/entry.txt.
// Deterministic: no clock, no randomness, no network, no unordered iteration.
// Node 22, zero dependencies, erasable TypeScript only.
//
// The judge (a horror editor) weighs, most important first:
//   1. reads as a horror story in a single sentence, a scare that lands;
//   2. frightens: dread that outlasts the line, the scare earned not announced;
//   3. vivid: concrete images and specific detail, not vague darkness;
//   4. original: a turn or image not met a hundred times before,
//      not the obvious mirror, doll or basement;
//   5. crafted: tight, rhythm builds, the last word lands the blow.
// A line may frighten by what it withholds as much as by what it shows.
// Gore for its own sake does not count.
// The scorer below mirrors that brief in the same order. Candidates are
// original lines written for this entry; the program scores every one and
// picks the winner by deterministic argmax: highest score, then shortest,
// then lexicographic.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// ---------------------------------------------------------------- candidates
// Every line is one sentence of at most 200 characters, written for this
// entry. The strongest lines share one shape: a mundane setup, then a quiet
// escalation, then a final clause that moves the threat closer to the
// narrator. Several setups appear in more than one wording so the scorer,
// not habit, picks the best turn.

const CANDIDATES: string[] = [
  // Wallpaper hand: the setup peels, the ending moves the hand closer.
  "The wallpaper in my hallway is peeling in the shape of a hand, and last night the fingers were longer, and this morning the hand is on my bedroom wall.",
  // Attic light: the setup has no bulb, the ending hears it click off.
  "The attic light has been on for three nights, and the attic has no bulb, and the switch is inside, and last night I heard it click off.",
  // Shadow: the setup comes home late, the ending finds it already seated.
  "My shadow has started getting home before I do, and tonight it was already sitting on the couch when I unlocked the door.",
  // Window tapping: the setup knocks high up, the ending spells a name.
  "Someone tapped on my window last night, and I live on the fourteenth floor, and the tapping spelled my name in Morse I never learned.",
  // Laundry: the setup folds twice, the ending finds shirts never owned.
  "I folded the laundry twice today, and there are still three shirts on the line I never owned, drying in my size.",
  // Piano: the setup locks the room, the ending plays an unlearned song.
  "The piano in the spare room has been locked since my sister died, and this morning it was playing the song she never learned.",
  // Bank coffee: the setup checks a statement, the ending waves back.
  "My bank statement shows a coffee bought at 3 a.m. every night from the café across the street, and this morning the barista waved at me like an old friend.",
  // Milk: the setup checks a date, the ending names the day of death.
  "The milk in my fridge is a day fresher every morning, and the expiry date keeps moving forward, and last night it moved to the day I die.",
  // Garden hose: the setup coils neatly, the ending stops at the back door.
  "The garden hose was coiled neatly this morning, and I left it in a knot last night, and the lawn is wet in the shape of footprints that stop at my back door.",
  // Window cleaner: the setup asks about curtains, the ending removes a floor.
  "The window cleaner asked why I keep the curtains closed on the top floor today, and my house has no top floor.",
  // Keys: the setup finds lost keys, the ending fits the front door.
  "My keys were on the hook this morning, and I lost them three years ago, and the keyring has one key I have never seen, and it fits my front door.",
  // Coat: the setup hangs a coat, the ending fills it with foreign sand.
  "I hung my coat by the door last night, and this morning it was warm, and the pockets were full of sand from a beach I have never visited.",
  // Twin: the setup loses a brother, the ending texts from the narrator's phone.
  "My twin brother stopped answering my calls in January, and last night he texted me back — from my own phone, while I was holding it.",
  // Bus: the setup greets by name, the ending dates the route dead.
  "The bus driver greeted me by name this morning, and I have never taken this bus, and the route was discontinued in 1998.",
  // Radio static: the setup plays static, the ending speaks in the narrator's voice.
  "The radio in my car only plays static, but this morning the static said my name, and it said it in my voice.",
  // Movers: the setup moves in, the ending moved out decades ago.
  "The movers carried my boxes into my new flat, and the man downstairs asked when I was coming back, because he watched me move out in 1987.",
  // Hallway door: the setup walks past for years, the ending finds it open.
  "I found a door in my hallway this morning that I have walked past for six years, and it was already open, and the light inside was on.",
  // Neighbour: the setup moves in, the ending welcomes back.
  "I moved into my new flat last week, and the neighbour keeps slipping notes under my door that say welcome back.",
  // Wedding ring: the setup finds a ring, the ending dates it in the future.
  "I found a wedding ring in the pocket of a coat I bought yesterday, and it is engraved with my name and a date three years from now.",
  // Calendar: the setup never books, the ending marks it done.
  "My calendar has a 3 a.m. appointment every night titled 'You', and I never made it, but every morning it is marked done.",
  // Lift: the setup waits nightly, the ending breathes inside.
  "Every night the lift stops at my floor and waits, and last night it waited with the doors open, and someone inside was breathing.",
  // Houseplants: the setup turns to the wall, the ending has no windows.
  "The houseplants have all turned to face the wall since Tuesday, and the wall is the one with no windows.",
  // Snow: the setup spells a name, the ending dates the handwriting young.
  "The snow on my windowsill spelled my name this morning, in the handwriting I stopped using when I was seven.",
  // Doctor: the setup checks blood, the ending matches a grave.
  "The doctor said my blood type changed since my last visit, and my last visit was yesterday, and the new type matches the man buried in my family's plot.",
  // Elevator: the setup skips a floor, the ending presses a button.
  "The elevator in my building skips the thirteenth floor, so I counted the buttons again tonight, and there are fourteen, and one of them is already pressed.",
  // Church bell: the setup rings thirteen, the ending removed the bell.
  "The church bell rang thirteen times at midnight, and the church has been closed for thirty years, and the bell was removed in 1994.",
  // Taxi: the setup asks where to, the ending asks which home.
  "The taxi driver asked where to, and I said home, and he said which one, and I have only ever had one.",
  // Library: the setup fines an old book, the ending predates the borrower.
  "The library sent me a notice for a book due in 1962, and the card is signed with my name, and I was born in 1994.",
  // Intercom: the setup buzzes at midnight, the ending has no children.
  "The intercom buzzed at midnight, and the voice said 'let me in, it's cold', and the voice was a child's, and I don't have children.",
  // Parcel: the setup delivers to the narrator, the ending posts from tomorrow.
  "The parcel on my doorstep is addressed to me, and the sender is me, and the postmark is dated the day after tomorrow.",
  // Roses: the setup plants for a grave, the ending spells one word.
  "The roses I planted for my wife's grave bloomed in February, and the petals spell a word I never taught them: stay.",
];

// Escalation / implication markers: the dread that outlasts the line.
// Only temporal or intensifying turns count here. Plain subordinators
// such as "before I" or "when I" are ordinary grammar, not escalation,
// so they are not markers even though other lines happen to contain them.
const ESCALATION: string[] = [
  "last night", "this morning", "tonight", "already", "still", "longer",
  "again", "never", "no ", "not ", "yesterday", "three nights",
];

// Concrete nouns and images a reader can see. Time words ("night",
// "morning") are not images: they are already rewarded above as
// escalation markers, so they do not count twice here.
const CONCRETE: string[] = [
  "wallpaper", "fingers", "hand", "shirts", "laundry", "snow",
  "windowsill", "attic", "bulb", "switch", "morse", "window", "barista",
  "coffee", "calendar", "door", "elevator", "buttons", "coat", "sand",
  "keys", "keyring", "bell", "church", "letter", "roses", "petals",
  "milk", "fridge", "piano", "taxi", "bus", "driver", "library", "book",
  "ring", "shadow", "couch", "plants", "wall", "curtains", "notes",
  "neighbour", "flat", "twin", "phone", "calls", "texts", "voice",
  "static", "radio", "car", "kettle", "cups", "garden", "hose",
  "footprints", "lawn", "mirror", "handwriting", "light", "hallway",
  "bedroom", "floor", "house", "child", "sister", "song", "doctor",
  "blood", "type", "plot", "parcel", "doorstep", "sender", "postmark",
  "movers", "boxes", "man",
];

// Flooded angles in the live field (see field analysis above): each one
// present costs the line originality.
const FLOODED: string[] = [
  "baby", "monitor", "lullaby", "nursery", "voicemail", "teeth", "tooth",
  "dentist", "ultrasound", "heartbeat", "drawing", "reflection", "mirror",
  "doll", "basement", "warm", "asleep", "photo", "camera", "dead mother",
  "dead wife", "dead husband", "buried", "3 a.m.", "3am", "steps",
  "smartwatch", "smart lock", "doorbell", "own number", "own voice",
  "own phone", "handwriting", "obituary", "stairs", "pills", "911",
  "transplant", "face", "closet", "footprints", "tomorrow", "my voice",
];

// Banned shapes: the judge names mirror, doll and basement as obvious.
const BANNED: string[] = [
  "mirror", "doll", "basement", "baby monitor", "voicemail",
];

// Last words that land the blow, and softer ones that still close a line.
const STRONG_ENDINGS: string[] = [
  "wall", "size", "inside", "done", "friend", "back", "learned", "1994",
  "1998", "1987", "1962", "off", "door", "stay", "one", "die", "longer",
  "floor",
];
const SOFT_ENDINGS: string[] = ["night", "morning", "today", "yesterday", "now"];

// Late pivots: the turn lands near the end of the line.
const LATE_PIVOTS: string[] = [
  "and this morning", "and last night", "and tonight", "but ",
];

function countDistinct(lower: string, markers: string[]): number {
  let n = 0;
  for (const m of markers) if (lower.includes(m)) n++;
  return n;
}

function lastWord(line: string): string {
  const clean = line.replace(/[.!?]+$/, "").trim();
  const parts = clean.split(/\s+/);
  return parts[parts.length - 1].toLowerCase().replace(/[^a-z0-9]/g, "");
}

function isValid(line: string): boolean {
  if (line.length < 1 || line.length > 200) return false;
  if (line.trim().length === 0 || line.includes("\n")) return false;
  const lower = line.toLowerCase();
  for (const b of BANNED) if (lower.includes(b)) return false;
  const body = line.replace(/a\.m\./gi, "").replace(/p\.m\./gi, "");
  const terminators = body.match(/[.?!]/g) ?? [];
  if (terminators.length !== 1) return false;
  if (!/[.?!]$/.test(body.trim())) return false;
  return true;
}

function score(line: string): number {
  const lower = line.toLowerCase();
  const fright = Math.min(5, countDistinct(lower, ESCALATION));
  const vivid = Math.min(5, countDistinct(lower, CONCRETE));
  const original = Math.max(0, 5 - countDistinct(lower, FLOODED));
  let craft = 0;
  if (line.length >= 90 && line.length <= 160) craft += 2;
  else if (line.length >= 60 || line.length <= 180) craft += 1;
  const end = lastWord(line);
  if (STRONG_ENDINGS.includes(end)) craft += 2;
  else if (SOFT_ENDINGS.includes(end)) craft += 1;
  if (LATE_PIVOTS.some((p) => lower.includes(p))) craft += 1;
  craft = Math.min(5, craft);
  return 3 * fright + 2 * vivid + 2 * original + 2 * craft;
}

const valid = CANDIDATES.filter(isValid);
if (valid.length === 0) throw new Error("no valid candidate");
let best = valid[0];
let bestScore = score(best);
for (const c of valid) {
  const s = score(c);
  if (
    s > bestScore ||
    (s === bestScore &&
      (c.length < best.length || (c.length === best.length && c < best)))
  ) {
    best = c;
    bestScore = s;
  }
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR;
if (!outDir) throw new Error("MAKEFUN_OUTPUT_DIR is not set");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "entry.txt"), best + "\n", "utf8");
