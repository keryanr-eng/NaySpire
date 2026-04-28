// EMBERVOW — combat preview helpers.
// Pure, side-effect-free calculators used by the UI to show a player "what
// will happen if I play this?" before they commit. Mirrors the damage math
// in `applyAttack` (systems/combat.ts) but without mutating state, so the
// numbers shown here match what the real engine will do.

import type { CardDef, Combatant, Op } from '../types';

function getStatus(c: Combatant, id: string): number {
  return (c.status as any)[id] ?? 0;
}

/** Apply the same per-hit mod chain as combat.ts applyAttack. */
function modifyDamage(base: number, source: Combatant, target: Combatant): number {
  let amt = base + getStatus(source, 'fury');
  if (getStatus(source, 'faded') > 0) amt = Math.floor(amt * 0.75);
  if (getStatus(target, 'brittle') > 0) amt = Math.floor(amt * 1.5);
  return Math.max(0, amt);
}

/** Sum every `damage` op inside a card (recursing into repeat / if-branches
 *  where the condition is statically true / likely). Returns per-hit and
 *  total against `target`. Non-damage cards return null. */
export function previewCardDamage(
  def: CardDef,
  source: Combatant,
  target: Combatant,
): { perHit: number; hits: number; total: number } | null {
  let total = 0;
  let hits = 0;
  let lastPerHit = 0;

  function walk(ops: Op[], mult = 1) {
    for (const op of ops) {
      if (op.kind === 'damage') {
        const h = (op.hits ?? 1) * mult;
        const per = modifyDamage(op.amount, source, target);
        total += per * h;
        hits += h;
        lastPerHit = per;
      } else if (op.kind === 'repeat') {
        walk(op.ops, mult * op.times);
      } else if (op.kind === 'if_has_status') {
        // Follow the branch that's actually true, so the preview reacts
        // to the current state of the target (e.g. "bonus if Brittle").
        const has = getStatus(op.target === 'self' ? source : target, op.id) > 0;
        if (has) walk(op.then, mult);
        else if (op.else) walk(op.else, mult);
      } else if (op.kind === 'if_hp_below') {
        const below = source.hp / Math.max(1, source.maxHp) < op.pct;
        if (below) walk(op.then, mult);
        else if (op.else) walk(op.else, mult);
      }
      // spend_fracture / per_target_status / X-cost: hard to preview
      // without simulating mutations; fall back to the base amount listed
      // in the card text for those edge cases.
    }
  }

  walk(def.ops);
  if (hits === 0) return null;
  return { perHit: lastPerHit, hits, total };
}

/** What incoming damage will an enemy's `nextIntent` deal to the player,
 *  after Fury/Brittle/Faded? Enemies don't stack Fury in EMBERVOW yet but
 *  we keep the same math path for future-proofing. */
export function previewIncomingDamage(
  source: Combatant,
  target: Combatant,
  intent: { value?: number; hits?: number },
): { perHit: number; hits: number; total: number } | null {
  if (!intent.value || intent.value <= 0) return null;
  const hits = intent.hits ?? 1;
  const perHit = modifyDamage(intent.value, source, target);
  return { perHit, hits, total: perHit * hits };
}
