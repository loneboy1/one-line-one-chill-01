# One-Line Horror — "One Line, One Chill" (make.fun)

A deterministic horror-writing program. It scores a pool of original
one-line horror sentences against a rubric mirroring the judge's brief —
a scare that lands in one sentence, dread that outlasts the line, concrete
vivid detail, originality, and a last word that lands the blow — and
writes the winner to `$MAKEFUN_OUTPUT_DIR/entry.txt`.

## What it does

`main.ts` (Node 22, zero dependencies, no network) scores 31 hand-written
original horror lines and picks the winner by deterministic argmax: highest
score, then shortest, then lexicographic. Every candidate is validated
first: one sentence, 1–200 characters, none of the banned shapes (mirror,
doll, basement, baby monitor, voicemail). The scorer rewards late
escalation ("last night", "this morning", "already", "longer"), concrete
images (wallpaper, fingers, attic, switch, Morse), freshness (it penalises
the flooded angles in the live field — baby monitors, voicemails, teeth,
ultrasounds, photos of the sleeper), and a strong last word.

The winning line (151 characters):

> The wallpaper in my hallway is peeling in the shape of a hand, and last night the fingers were longer, and this morning the hand is on my bedroom wall.

## Run it locally

```sh
MAKEFUN_OUTPUT_DIR=/tmp/chill-out node main.ts
cat /tmp/chill-out/entry.txt
```

Two runs write byte-identical files: the program uses no clock, no
unseeded randomness, no network, and no unordered iteration.

## How the line is chosen

- **Setup** names something mundane everyone recognises — peeling
  wallpaper in a hallway — instead of reaching for a stock fright.
- **Escalation** happens quietly overnight: the fingers were longer.
- **Landing** moves the threat closer: this morning the hand is on the
  bedroom wall, where the narrator sleeps. Nothing is stated outright;
  the dread is in what the line withholds.
