# NaySpire

An original browser roguelike deckbuilder. You are a Vowbearer, descending the collapsing
Choir's Cradle to reclaim a severed Oath. Build a deck run by run; every card is a
broken promise turned into a weapon.

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
```

Production build:

```bash
npm run build
npm run preview    # http://localhost:4173
```

## Tech stack

- TypeScript + React 18 + Vite + Tailwind + Zustand
- Pure-function combat engine (`src/systems/combat.ts`)
- Data-driven content (`src/data/*`)
- Deterministic seeded RNG (`src/systems/rng.ts`)
- LocalStorage save/load

## Project shape

```
src/
  components/   UI screens and widgets (React)
  data/         cards.ts, enemies.ts, relics.ts, potions.ts, events.ts
  state/        zustand store, save/load, run lifecycle
  systems/      combat.ts, map.ts, rng.ts — engine code, framework-agnostic
  types.ts      shared type definitions
```

## MVP content

- **2 playable classes** (Vowbreaker, Sealbinder) — 4 planned
- **1 act, 15 floors, branching map**
- **8 normal enemies · 3 elites · 1 boss**
- **60+ cards** (with upgraded variants)
- **18 relics** (tiered: starter / common / uncommon / rare / boss)
- **10 potions**
- **5 random events** + merchant + rest + treasure

## Design pillars

1. **Legible tactical combat.** Clear intents, decisive resources.
2. **Distinct class fantasies.** Fracture (aggression) vs Seals (control).
3. **Build-defining relics.** Relics rewrite how your deck plays.
4. **Meaningful pathing.** Every node is a tradeoff.

## Status lexicon (original)

| Original       | Effect                                                            |
| -------------- | ----------------------------------------------------------------- |
| Ember          | Action points per turn (resets to 3)                              |
| Ward           | Absorbs damage; decays at start of next turn                      |
| Fury           | +X to every strike you make                                       |
| Poise          | Skills that grant Ward grant +X extra Ward                        |
| Sigil          | Negates next X debuffs applied to you                             |
| Brittle        | Target takes +50% attack damage; decays 1/turn                    |
| Faded          | Target deals 25% less damage; decays 1/turn                       |
| Bleed          | At start of target's turn, take X damage (persistent)             |
| Ignite         | At end of turn, take X damage, halved each turn                   |
| Fracture       | Vowbreaker resource; spent by specific cards for massive effects  |
| Seal           | Sealbinder mark on enemies; many cards consume or scale from it   |
| Chained        | Cannot gain Ward this turn                                        |
| Thorns         | Reflect X damage when attacked                                    |
| Momentum       | +X Ember on your next turn only                                   |

## Balance & QA notes

- **Degenerate combos to watch:** *Wound Ritual* + *Ember Thorn* + Bleed spam; *Reflection* snowball with Poise; *Executioner* with any Seal stacker.
- **Readability risks:** Intents show the precise damage tooltip. Status badges stack at the top of each enemy; hover to see the full name.
- **Save/load:** Run state persists to localStorage after every node transition and every reward claim. Mid-combat state is intentionally NOT persisted in MVP to avoid half-resolved mutations; reloading during combat returns the player to the map of the node they entered (a known trade-off).
- **Map generation test:** Every non-boss floor has ≥1 inbound edge; boss is always reachable from every floor-14 node; variety constraint on floor 0 prevents uniform openings.
- **Combat invariants:**
  - Damage is never negative; absorbed by Ward first, then HP.
  - Brittle multiplier is applied BEFORE Fury add (in this engine, Fury is additive per strike; Brittle is multiplicative on total).
  - Ignite ticks end-of-turn and halves (floor), so a 5-stack burns 5 → 2 → 1 → 0.
  - Bleed does NOT decay; only removed by death or specific effects.

## Post-MVP roadmap

1. **Acts 2 and 3** — new enemy sets, biome reskin, new event pool.
2. **Whisperer** class (Echoes summons) and **Auger** class (Prophecy cards).
3. **Ascension levels** — +difficulty modifiers unlockable after wins.
4. **Codex / compendium** — in-UI glossary of all cards/relics/enemies seen.
5. **Run statistics + achievements.**
6. **Audio + particle polish.**

## Implementation roadmap (done phases marked ✅)

1. ✅ Foundation (Vite/React/TS/Tailwind/Zustand scaffolding, types, RNG)
2. ✅ Combat prototype (engine, statuses, card ops, enemy AI)
3. ✅ Map/progression (generator, node kinds, branching)
4. ✅ Content integration (cards, relics, potions, enemies, events)
5. ✅ Polish/UI (card visual, combat screen, map view, shops/rest/event/treasure)
6. 🟡 Balancing (values are tuned for a first playable; iterate with telemetry)
7. ✅ Persistence (localStorage run + meta)
8. 🟡 Release prep (audio, additional acts, ascension)

## License / legal

All names, lore, art direction, mechanics and card wording are original to NaySpire and are not
borrowed from any existing commercial deckbuilder. The genre conventions (energy system,
map nodes, relics) are shared across the genre.
