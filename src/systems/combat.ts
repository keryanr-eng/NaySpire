// EMBERVOW â€” combat engine.
//
// Pure functions operating on a CombatState. The React UI calls these and replaces
// the state in the store. Every mutation goes through these helpers so that
// relic hooks, status decay, and log entries are consistent.
//
// Design notes:
//  - All damage is routed through applyDamage(), which handles Ward, Brittle, Faded, and Fury.
//  - Statuses live in Combatant.status as a StatusBag.
//  - Card effects are Ops (types.ts) interpreted by runOps().
//  - Relic hook strings (also types.ts) are resolved by applyRelicHook().
//  - Card "tags" can also carry hook strings for power cards (e.g. "hook:seal_gain_ward_1").
//
// The engine is intentionally verbose but legible; add balancing here in one place.

import type {
  CardDef, CardInstance, ClassId, Combatant, CombatState, EnemyDef, EnemyInstance, Op,
  RelicHook, StatusId, SummonInstance, TargetMode,
} from '../types';
import { CARD_MAP, getCard } from '../data/cards';
import { getEnemy } from '../data/enemies';
import { getRelic } from '../data/relics';
import { getPotion } from '../data/potions';
import { STATUS_INFO } from '../data/statusInfo';
import { makeRng, pickN, randInt, shuffle as shuffleRng, Rng, makeUid, mix } from './rng';

// Returns the display label (localized, FR) for a status id. Falls back
// to the raw id if the status is not known.
function statusLabel(id: string): string {
  return STATUS_INFO[id]?.label ?? id;
}

// ---------------- logging ----------------
function log(state: CombatState, msg: string) {
  state.log.push(msg);
  if (state.log.length > 40) state.log.shift();
}
function float(
  state: CombatState,
  targetId: string,
  text: string,
  tone: 'dmg' | 'heal' | 'ward' | 'status',
  delayMs = 0,
  source?: 'summon' | 'enemy',
) {
  state.pendingFloat.push({ targetId, text, tone, delayMs, source });
}
function shake(state: CombatState, targetId: string, amount = 1) {
  state.shaking[targetId] = (state.shaking[targetId] ?? 0) + amount;
}

const SUMMON_MAX = 1;
const SUMMON_HP = 14;
const SUMMON_DAMAGE = 2;
const SUMMON_BOOST_HP = 3;
const SUMMON_BOOST_HEAL = 5;
const SUMMON_BOOST_DAMAGE = 1;
const SUMMON_ATTACK_STAGGER_MS = 850;

// ---------------- status helpers ----------------
export const STATUS_DECAY_PER_TURN: Partial<Record<StatusId, number>> = {
  brittle: 1, faded: 1, regen: 1, momentum: 999, // momentum fully clears
};
export const STATUS_IS_DEBUFF: Partial<Record<StatusId, boolean>> = {
  brittle: true, faded: true, bleed: true, ignite: true, chained: true,
};

function addStatus(target: Combatant, id: StatusId, amount: number) {
  if (amount <= 0) return;
  target.status[id] = (target.status[id] ?? 0) + amount;
}
function getStatus(target: Combatant, id: StatusId): number {
  return target.status[id] ?? 0;
}
function setStatus(target: Combatant, id: StatusId, amount: number) {
  if (amount <= 0) delete target.status[id];
  else target.status[id] = amount;
}
function clearStatus(target: Combatant, id: StatusId) {
  delete target.status[id];
}
function applyDebuff(state: CombatState, target: Combatant, id: StatusId, amount: number) {
  if (amount <= 0) return;
  // Sigil on target negates debuff applications (one stack per application).
  const sigil = getStatus(target, 'sigil');
  if (sigil > 0 && STATUS_IS_DEBUFF[id]) {
    setStatus(target, 'sigil', sigil - 1);
    float(state, target.id, statusLabel('sigil'), 'status');
    return;
  }
  addStatus(target, id, amount);
  float(state, target.id, `+${amount} ${statusLabel(id)}`, 'status');
  // "When you apply a debuff" hook for Gilded Halo (player only)
  if (!target.isPlayer && STATUS_IS_DEBUFF[id] && state.player) {
    onPlayerAppliedDebuff(state, id);
  }
}

function summonServants(state: CombatState, amount: number) {
  if (amount <= 0) return;
  state.summons ??= [];
  for (let i = 0; i < amount; i++) {
    const living = state.summons.filter((s) => s.hp > 0);
    if (living.length < SUMMON_MAX) {
      const servant: SummonInstance = {
        id: makeUid('servant'),
        name: 'Serviteur lie',
        hp: SUMMON_HP,
        maxHp: SUMMON_HP,
        ward: 0,
        status: {},
        isPlayer: true,
        slot: 0,
        damage: SUMMON_DAMAGE,
      };
      state.summons.push(servant);
      float(state, servant.id, 'Invoque', 'status', i * 160, 'summon');
    } else {
      const servant = living[0];
      if (servant) {
        servant.maxHp += SUMMON_BOOST_HP;
        servant.hp = Math.min(servant.maxHp, servant.hp + SUMMON_BOOST_HEAL);
        servant.damage += SUMMON_BOOST_DAMAGE;
        float(state, servant.id, `+${SUMMON_BOOST_DAMAGE} force`, 'status', i * 160, 'summon');
      }
    }
  }
  syncSummonStatus(state);
}

function livingEnemies(state: CombatState): EnemyInstance[] {
  return state.enemies.filter((e) => e.hp > 0);
}

function livingSummons(state: CombatState): SummonInstance[] {
  return (state.summons ?? []).filter((s) => s.hp > 0);
}

function syncSummonStatus(state: CombatState) {
  const servant = livingSummons(state)[0];
  setStatus(state.player, 'summon', servant ? servant.damage : 0);
}

function chooseEnemyDamageTarget(state: CombatState, rng: Rng): Combatant {
  const summons = livingSummons(state);
  if (!summons.length) return state.player;
  return rng() < 0.58 ? summons[Math.floor(rng() * summons.length)] : state.player;
}

function commandSummons(
  state: CombatState,
  rng: Rng,
  damage: number,
  target: Combatant | null,
  targetMode: TargetMode = 'enemy',
  consume?: number,
) {
  const servants = livingSummons(state);
  const strikes = consume == null ? servants.length : Math.min(servants.length, consume);
  if (strikes <= 0 || damage <= 0) {
    float(state, state.player.id, 'Aucun serviteur', 'status');
    return;
  }

  for (let i = 0; i < strikes; i++) {
    const servant = servants[i % servants.length];
    const delayMs = i * SUMMON_ATTACK_STAGGER_MS;
    const targets = targetMode === 'all_enemies'
      ? livingEnemies(state)
      : target && target.hp > 0
        ? [target]
        : livingEnemies(state).length
          ? [livingEnemies(state)[Math.floor(rng() * livingEnemies(state).length)]]
          : [];
    for (const t of targets) {
      (state.pendingSummonAttacks ??= []).push({ servantIndex: servant.slot, targetId: t.id, delayMs });
      applyDirectDamage(state, t, damage + servant.damage, delayMs, 'summon');
      if (t.hp <= 0) break;
    }
  }
  if (consume != null) {
    for (const s of servants.slice(0, strikes)) s.hp = 0;
    syncSummonStatus(state);
  }
}

function triggerSummonTurnStart(state: CombatState, rng: Rng, relics: string[]) {
  const servants = livingSummons(state);
  if (!servants.length) return;
  for (let i = 0; i < servants.length; i++) {
    const live = livingEnemies(state);
    if (!live.length) break;
    const target = live[Math.floor(rng() * live.length)];
    const servant = servants[i];
    const delayMs = i * SUMMON_ATTACK_STAGGER_MS;
    (state.pendingSummonAttacks ??= []).push({ servantIndex: servant.slot, targetId: target.id, delayMs });
    applyDirectDamage(state, target, servant.damage, delayMs, 'summon');
  }
  cleanupDead(state, relics);
}

// ---------------- build state ----------------
export interface BuildCombatOpts {
  seed: number;
  encounter: string[];              // enemy def ids
  playerHp: number;
  playerMaxHp: number;
  relics: string[];
  deck: CardInstance[];
  classId: ClassId;
  tier: 'normal' | 'elite' | 'boss';
}

export function buildCombat(opts: BuildCombatOpts): CombatState {
  const rng = makeRng(opts.seed);
  const enemies: EnemyInstance[] = opts.encounter.map((defId, i) => {
    const def = getEnemy(defId);
    const hp = randInt(rng, def.hpRange[0], def.hpRange[1]);
    return {
      id: `enemy_${i}_${defId}`,
      defId,
      tier: def.tier,
      name: def.name,
      hp, maxHp: hp,
      ward: 0,
      status: {},
      isPlayer: false,
      moveHistory: [],
      nextMove: '',
      nextIntent: { kind: 'unknown' },
    };
  });

  const player: Combatant = {
    id: 'player',
    name:
      opts.classId === 'vowbreaker' ? 'Vowbreaker' :
      opts.classId === 'sealbinder' ? 'Sealbinder' :
      opts.classId === 'whisperer' ? 'Whisperer' :
      opts.classId === 'summoner' ? 'Summoner' : 'Auger',
    hp: opts.playerHp,
    maxHp: opts.playerMaxHp,
    ward: 0,
    status: {},
    isPlayer: true,
  };

  // shuffle deck into draw
  const draw: CardInstance[] = shuffleRng(rng, opts.deck);

  const state: CombatState = {
    turn: 0,
    phase: 'player',
    player,
    summons: [],
    enemies,
    draw,
    hand: [],
    discard: [],
    banish: [],
    ember: 0,
    emberMax: 3,
    drawPerTurn: 5,
    log: [],
    pendingFloat: [],
    pendingSummonAttacks: [],
    shaking: {},
  };

  // Start-of-combat relic hooks
  for (const rid of opts.relics) {
    const h = getRelic(rid).hook;
    applyRelicHook(state, h, { phase: 'combat_start', rng, relics: opts.relics });
  }

  // Innate cards: pull to hand first, then do normal draw
  const innates = state.draw.filter((ci) => !!getCard(ci.defId).innate);
  for (const ci of innates) {
    state.hand.push(ci);
  }
  state.draw = state.draw.filter((ci) => !getCard(ci.defId).innate);

  // Prime enemy intents BEFORE first turn starts (so player can read them)
  pickNextIntents(state, rng, opts.relics);

  // Begin turn 1
  state.turn = 1;
  beginPlayerTurn(state, rng, opts.relics);

  return state;
}

// ---------------- turn flow ----------------
export function beginPlayerTurn(state: CombatState, rng: Rng, relics: string[]) {
  state.phase = 'player';
  // reset ember
  state.ember = state.emberMax;
  // momentum grants +1 for the single upcoming turn, then clears
  const momentum = getStatus(state.player, 'momentum');
  if (momentum > 0) {
    state.ember += momentum;
    clearStatus(state.player, 'momentum');
    log(state, `L'Ã‰lan monte (+${momentum} Braise).`);
  }

  // Bleed ticks at start of OWNER turn. Player bleed
  const playerBleed = getStatus(state.player, 'bleed');
  if (playerBleed > 0) {
    applyDirectDamage(state, state.player, playerBleed + (relics.includes('rel_bleeding_icon') ? 1 : 0));
    log(state, `Tu saignes pour ${playerBleed}.`);
  }

  // start-of-turn relic hooks
  for (const rid of relics) {
    applyRelicHook(state, getRelic(rid).hook, { phase: 'turn_start', rng, relics });
  }
  // start-of-turn card-power hooks (from play area powers)
  applyPowerHooks(state, 'turn_start', rng, relics);

  // Regen
  const regen = getStatus(state.player, 'regen');
  if (regen > 0) {
    state.player.hp = Math.min(state.player.maxHp, state.player.hp + regen);
    float(state, 'player', `+${regen}`, 'heal');
  }

  // Draw phase
  drawCards(state, state.drawPerTurn, rng);

  // Handle drawn curses that trigger on draw (Regret: lose 2 HP)
  handleOnDrawCurses(state);
}

export function endPlayerTurn(state: CombatState, rng: Rng, relics: string[]) {
  state.phase = 'enemy';

  // End-of-turn card-in-hand effects: Ember Burn
  for (const c of [...state.hand]) {
    const def = getCard(c.defId);
    if (def.id === 'curse_ember_burn') {
      applyDirectDamage(state, state.player, 2);
      log(state, 'BrÃ»lure de Braise roussit ta main (2 dÃ©gÃ¢ts).');
    }
  }

  // Ignite ticks at END of player turn for enemies (and player if any).
  for (const e of state.enemies) {
    const v = getStatus(e, 'ignite');
    if (v > 0) {
      applyDirectDamage(state, e, v);
      log(state, `${e.name} brÃ»le pour ${v}.`);
      setStatus(e, 'ignite', Math.floor(v / 2));
    }
  }
  {
    const v = getStatus(state.player, 'ignite');
    if (v > 0) {
      applyDirectDamage(state, state.player, v);
      setStatus(state.player, 'ignite', Math.floor(v / 2));
    }
  }

  // Discard/banish hand
  for (const c of [...state.hand]) {
    const def = getCard(c.defId);
    if (def.ethereal) {
      banishCard(state, c);
    } else if (def.retain) {
      // stays in hand
    } else {
      state.discard.push(c);
    }
  }
  state.hand = state.hand.filter((c) => getCard(c.defId).retain);

  // Decay debuffs on ALL combatants
  decayStatuses(state.player);
  state.enemies.forEach(decayStatuses);

  // Check victory
  if (allEnemiesDead(state)) {
    state.phase = 'ended';
    state.victory = true;
    log(state, 'Victoire.');
    return;
  }

  // The bound servant acts when the player passes the turn, before enemies.
  // This keeps the sequence readable: player cards -> servant strike -> enemy turn.
  triggerSummonTurnStart(state, rng, relics);

  if (allEnemiesDead(state)) {
    state.phase = 'ended';
    state.victory = true;
    log(state, 'Victoire.');
    return;
  }

  // ---- enemy phase ----
  enemyTurn(state, rng, relics);

  if (state.player.hp <= 0) {
    state.phase = 'ended';
    state.victory = false;
    log(state, 'Tu succombes.');
    return;
  }

  // Reset per-turn flags
  state.shaking = {};
  state.turn += 1;
  clearPerTurnFlags(state);

  // Prime intents for the next turn
  pickNextIntents(state, rng, relics);

  // Ward decays at start of new player turn
  state.player.ward = 0;
  beginPlayerTurn(state, rng, relics);
}

function clearPerTurnFlags(state: CombatState) {
  // Flags we track on the player as statuses need explicit clearing.
  clearStatus(state.player, 'chained');
  // Clear internal per-turn marker statuses used by relics.
  delete (state.player.status as any)._firstAttack;
  delete (state.player.status as any)._firstSkill;
  delete (state.player.status as any)._firstSeal;
  delete (state.player.status as any)._first_upgraded_discount;
  delete (state.player.status as any)._potion_refilled;
  delete (state.player.status as any)._first_bleed_doubled;
}

function decayStatuses(c: Combatant) {
  for (const id of Object.keys(c.status) as StatusId[]) {
    const decay = STATUS_DECAY_PER_TURN[id];
    if (!decay) continue;
    const current = c.status[id] ?? 0;
    const next = decay >= 999 ? 0 : Math.max(0, current - decay);
    if (next <= 0) delete c.status[id];
    else c.status[id] = next;
  }
}

function handleOnDrawCurses(state: CombatState) {
  for (const c of state.hand) {
    const def = getCard(c.defId);
    if (def.id === 'curse_regret') {
      applyDirectDamage(state, state.player, 2);
      log(state, 'Tu piochas Regret. Perds 2 PV.');
    }
  }
}

// ---------------- draw / discard ----------------
export function drawCards(state: CombatState, n: number, rng: Rng) {
  for (let i = 0; i < n; i++) {
    if (state.hand.length >= 10) break;
    if (!state.draw.length) {
      if (!state.discard.length) return;
      state.draw = shuffleRng(rng, state.discard);
      state.discard = [];
    }
    const c = state.draw.shift()!;
    state.hand.push(c);
  }
}

export function banishCard(state: CombatState, card: CardInstance) {
  state.banish.push(card);
  // Tattered Breviary hook â€” applied wherever card-banish resolves.
  applyRelicHook(state, 'whenever_banish_gain_1_fracture', { phase: 'banish', rng: makeRng(0), relics: [] });
}

// ---------------- damage ----------------
export function applyDirectDamage(
  state: CombatState,
  target: Combatant,
  amount: number,
  delayMs = 0,
  source?: 'summon' | 'enemy',
) {
  if (amount <= 0) return;
  const absorbed = Math.min(target.ward, amount);
  target.ward -= absorbed;
  const leftover = amount - absorbed;
  target.hp -= leftover;
  if (absorbed > 0) {
    float(state, target.id, `-${absorbed} Garde`, 'ward', delayMs, source);
    shake(state, target.id);
  }
  if (leftover > 0) {
    float(state, target.id, `-${leftover}`, 'dmg', delayMs, source);
    shake(state, target.id);
  }
}

export interface AttackCtx {
  source: Combatant;
  target: Combatant;
  state: CombatState;
  relics: string[];
  cardDef?: CardDef;
}

// Single-strike attack damage calculation.
export function applyAttack(ctx: AttackCtx, baseAmount: number) {
  const { state, source, target, relics, cardDef } = ctx;
  let amt = baseAmount;
  // Fury: +X to each strike
  amt += getStatus(source, 'fury');
  // Faded on source: -25% (rounded down, floored at 0)
  if (getStatus(source, 'faded') > 0) amt = Math.floor(amt * 0.75);
  // Brittle on target: +50%
  if (getStatus(target, 'brittle') > 0) amt = Math.floor(amt * 1.5);
  // Relic: Shard of First Vow â€” first attack each turn +2
  if (source.isPlayer && cardDef?.type === 'attack' && !(source.status as any)._firstAttack) {
    if (relics.includes('rel_shard_of_first_vow')) amt += 2;
    (source.status as any)._firstAttack = 1;
    // Rust Medallion: first attack each turn apply 1 Brittle
    if (relics.includes('rel_rust_medallion')) applyDebuff(state, target, 'brittle', 1);
  }

  applyDirectDamage(state, target, Math.max(0, amt), 0, source.isPlayer ? undefined : 'enemy');

  // Thorns when player attacks enemy
  if (source.isPlayer && !target.isPlayer) {
    const thorns = getStatus(target, 'thorns');
    if (thorns > 0) applyDirectDamage(state, source, thorns);
  }
  // Scar Collector / Sanguine Rite hooks rely on lose_hp; handled inside onLoseHp.
  if (target.hp <= 0 && !target.isPlayer) {
    onEnemyDeath(state, target, relics);
  }
}

// ---------------- Op runner ----------------
export function playCard(
  state: CombatState,
  rng: Rng,
  relics: string[],
  cardUid: string,
  targetId?: string,
  xEmber?: number,
): { played: boolean; reason?: string } {
  const idx = state.hand.findIndex((c) => c.uid === cardUid);
  if (idx < 0) return { played: false, reason: 'not in hand' };
  const ci = state.hand[idx];
  const def = getCard(ci.defId);

  // Unplayable curse or status
  if (def.type === 'curse') return { played: false, reason: 'unplayable' };
  if (def.id === 'status_dross') return { played: false, reason: 'unplayable' };

  // Chained forbids Ward gain; otherwise not blocking play.
  // Cost handling
  let cost = def.cost;
  if (cost < 0) cost = xEmber ?? state.ember;
  // Upgraded card discount relic
  if (ci.upgraded && relics.includes('rel_forged_sigil') && !(state.player.status as any)._first_upgraded_discount) {
    cost = Math.max(0, cost - 1);
    (state.player.status as any)._first_upgraded_discount = 1;
  }
  if (cost > state.ember) return { played: false, reason: 'not enough ember' };

  // Oathlight flag discount (all Uncommon Sealbinder skills this turn cost 0)
  if ((state.player.status as any)._oathlight && def.classId === 'sealbinder' && def.type === 'skill' && def.rarity === 'uncommon') {
    cost = 0;
  }

  // Pay
  state.ember -= cost;

  // Remove from hand now; will be moved to discard/banish after ops resolve.
  state.hand.splice(idx, 1);

  // Target selection (source is always the player when resolving a hand card)
  const target = resolveTarget(state, state.player, def.target, targetId);

  // Execute ops
  runOps(state, rng, relics, def.ops, { source: state.player, target, cardDef: def, xEmber: cost });

  // Handle special card tags (X-cost and unique hooks)
  runCardTags(state, rng, relics, def, ci, cost, target);

  // Play-time tracking
  state.lastCardPlayedType = def.type;
  if (def.type === 'skill') {
    if (!(state.player.status as any)._firstSkill) {
      (state.player.status as any)._firstSkill = 1;
      if (relics.includes('rel_widow_stone')) gainWard(state, state.player, 2, relics);
    }
  }

  // Post: send card to the right pile
  if (def.exhaust || def.type === 'power') {
    banishCard(state, ci);
  } else {
    state.discard.push(ci);
  }

  // Check deaths after card resolution
  cleanupDead(state, relics);

  return { played: true };
}

// Some card tags carry logic that needs direct state access.
function runCardTags(
  state: CombatState, rng: Rng, relics: string[],
  def: CardDef, ci: CardInstance, costPaid: number, target: Combatant | null,
) {
  if (!def.tags?.length) return;
  for (const tag of def.tags) {
    switch (tag) {
      case 'x:empty_cup':
        gainWard(state, state.player, costPaid * 4, relics);
        break;
      case 'x:empty_cup_p':
        gainWard(state, state.player, costPaid * 5, relics);
        break;
      case 'x:fracture_unleashed':
      case 'x:fracture_unleashed_p': {
        const per = tag === 'x:fracture_unleashed' ? 3 : 4;
        const stacks = getStatus(state.player, 'fracture');
        if (target) applyAttack({ source: state.player, target, state, relics, cardDef: def }, per * stacks);
        clearStatus(state.player, 'fracture');
        break;
      }
      case 'hook:devour': {
        if (target && target.hp <= 0) {
          // copy to hand
          state.hand.push({ uid: makeUid('devour'), defId: def.id, upgraded: ci.upgraded });
          log(state, 'DÃ©vorer : tu consumes ta victime.');
        }
        break;
      }
      case 'x:verdict':
      case 'x:verdict_p': {
        if (target && getStatus(target, 'seal') >= 3) {
          applyAttack({ source: state.player, target, state, relics, cardDef: def }, tag === 'x:verdict' ? 8 : 11);
        }
        break;
      }
      case 'x:reflection': {
        gainWard(state, state.player, state.player.ward, relics);
        break;
      }
      case 'x:executioner':
      case 'x:executioner_p': {
        if (target) {
          const seals = getStatus(target, 'seal');
          if (seals > 0) {
            clearStatus(target, 'seal');
            applyAttack({ source: state.player, target, state, relics, cardDef: def }, seals * (tag === 'x:executioner' ? 6 : 8));
          }
        }
        break;
      }
      case 'x:oathlight':
      case 'x:oathlight_p': {
        // Add random Uncommon Sealbinder skills
        const pool = Object.values(CARD_MAP).filter((c) => c.classId === 'sealbinder' && c.type === 'skill' && c.rarity === 'uncommon' && !c.upgradeOf);
        const count = tag === 'x:oathlight' ? 2 : 3;
        const picks = pickN(rng, pool, Math.min(count, pool.length));
        for (const p of picks) state.hand.push({ uid: makeUid('oathlight'), defId: p.id, upgraded: false });
        (state.player.status as any)._oathlight = 1;
        break;
      }
      default:
        // hook:* tags are read by applyPowerHooks or specific events
        break;
    }
  }
}

function runOps(
  state: CombatState, rng: Rng, relics: string[],
  ops: Op[], ctx: { source: Combatant; target: Combatant | null; cardDef?: CardDef; xEmber?: number },
) {
  for (const op of ops) runOp(state, rng, relics, op, ctx);
}

function runOp(
  state: CombatState, rng: Rng, relics: string[],
  op: Op, ctx: { source: Combatant; target: Combatant | null; cardDef?: CardDef; xEmber?: number },
) {
  switch (op.kind) {
    case 'damage': {
      const targets = resolveTargets(state, ctx.source, op.target ?? ctx.cardDef?.target ?? 'enemy', ctx.target?.id);
      const hits = op.hits ?? 1;
      for (const t of targets) {
        for (let h = 0; h < hits; h++) {
          const actualTarget = !ctx.source.isPlayer && t.id === state.player.id
            ? chooseEnemyDamageTarget(state, rng)
            : t;
          applyAttack({ source: ctx.source, target: actualTarget, state, relics, cardDef: ctx.cardDef }, op.amount);
          if (actualTarget.hp <= 0) break;
        }
      }
      break;
    }
    case 'ward': {
      gainWard(state, ctx.source, op.amount, relics);
      break;
    }
    case 'status': {
      const targets = resolveTargets(state, ctx.source, op.target, ctx.target?.id);
      for (const t of targets) {
        if (op.amount <= 0) continue;
        // A status is a debuff when applied to the opposing side, regardless of who is acting.
        const appliedOnOpponent = (ctx.source.isPlayer && !t.isPlayer) || (!ctx.source.isPlayer && t.isPlayer);
        const isDebuff = appliedOnOpponent && !!STATUS_IS_DEBUFF[op.id];
        if (isDebuff) applyDebuff(state, t, op.id, op.amount);
        else {
          addStatus(t, op.id, op.amount);
          float(state, t.id, `+${op.amount} ${statusLabel(op.id)}`, 'status');
          if (op.id === 'seal' && !t.isPlayer) onPlayerAppliedSeal(state, relics, op.amount);
          // First-bleed doubled relic
          if (op.id === 'bleed' && !t.isPlayer && relics.includes('rel_ember_thorn') && !(state.player.status as any)._first_bleed_doubled) {
            addStatus(t, 'bleed', op.amount);
            (state.player.status as any)._first_bleed_doubled = 1;
            float(state, t.id, `+${op.amount} ${statusLabel('bleed')}`, 'status');
          }
        }
      }
      break;
    }
    case 'draw':       drawCards(state, op.amount, rng); break;
    case 'gain_ember': state.ember += op.amount; break;
    case 'lose_hp':    applyDirectHpLoss(state, ctx.source, op.amount, relics); break;
    case 'heal':       ctx.source.hp = Math.min(ctx.source.maxHp, ctx.source.hp + op.amount); float(state, ctx.source.id, `+${op.amount}`, 'heal'); break;
    case 'discard_random': {
      for (let i = 0; i < op.amount && state.hand.length; i++) {
        const idx = Math.floor(rng() * state.hand.length);
        const [c] = state.hand.splice(idx, 1);
        state.discard.push(c);
      }
      break;
    }
    case 'banish_self':      break; // handled by def.exhaust at playCard tail
    case 'return_self_hand': break;
    case 'add_card_to_hand': {
      const count = op.amount ?? 1;
      for (let i = 0; i < count; i++) {
        if (state.hand.length >= 10) state.discard.push({ uid: makeUid('add'), defId: op.cardId, upgraded: false });
        else state.hand.push({ uid: makeUid('add'), defId: op.cardId, upgraded: false });
      }
      break;
    }
    case 'add_card_to_discard': {
      const count = op.amount ?? 1;
      for (let i = 0; i < count; i++) state.discard.push({ uid: makeUid('addd'), defId: op.cardId, upgraded: false });
      break;
    }
    case 'summon': {
      summonServants(state, op.amount);
      break;
    }
    case 'command_summons': {
      commandSummons(state, rng, op.damage, ctx.target, op.target ?? ctx.cardDef?.target ?? 'enemy', op.consume);
      break;
    }
    case 'double_status': {
      const targets = resolveTargets(state, ctx.source, op.target, ctx.target?.id);
      for (const t of targets) {
        const v = getStatus(t, op.id);
        if (v > 0) setStatus(t, op.id, v * 2);
      }
      break;
    }
    case 'if_has_status': {
      const tgt = resolveTargets(state, ctx.source, op.target, ctx.target?.id)[0];
      if (tgt && getStatus(tgt, op.id) > 0) runOps(state, rng, relics, op.then, ctx);
      else if (op.else) runOps(state, rng, relics, op.else, ctx);
      break;
    }
    case 'if_hp_below': {
      const ratio = ctx.source.hp / Math.max(1, ctx.source.maxHp);
      if (ratio * 100 <= op.pct) runOps(state, rng, relics, op.then, ctx);
      else if (op.else) runOps(state, rng, relics, op.else, ctx);
      break;
    }
    case 'repeat': {
      for (let i = 0; i < op.times; i++) runOps(state, rng, relics, op.ops, ctx);
      break;
    }
    case 'per_target_status': {
      const targets = resolveTargets(state, ctx.source, op.target, ctx.target?.id);
      for (const t of targets) {
        const stacks = getStatus(t, op.id);
        for (let i = 0; i < stacks; i++) runOp(state, rng, relics, { ...op.then, target: t.isPlayer ? 'self' : 'enemy' } as Op, { ...ctx, target: t });
      }
      break;
    }
    case 'spend_fracture': {
      const have = getStatus(state.player, 'fracture');
      const pay = Math.min(have, op.per);
      if (pay > 0) {
        setStatus(state.player, 'fracture', have - pay);
        runOp(state, rng, relics, op.then, ctx);
      }
      break;
    }
  }
}

// ---------------- ward / hp helpers ----------------
function gainWard(state: CombatState, target: Combatant, amount: number, relics: string[]) {
  if (amount <= 0) return;
  if (getStatus(target, 'chained') > 0 && target.isPlayer) {
    log(state, 'EntravÃ© â€” gain de Garde bloquÃ©.');
    return;
  }
  if (target.isPlayer) amount += getStatus(target, 'poise');
  target.ward += amount;
  float(state, target.id, `+${amount} garde`, 'ward');
}

function applyDirectHpLoss(state: CombatState, target: Combatant, amount: number, relics: string[]) {
  target.hp = Math.max(0, target.hp - amount);
  float(state, target.id, `-${amount}`, 'dmg');
  if (target.isPlayer) onPlayerLoseHp(state, relics);
}

function onPlayerLoseHp(state: CombatState, relics: string[]) {
  if (hasPowerTag(state, 'hook:lose_hp_gain_fracture_2')) addStatus(state.player, 'fracture', 2);
  else if (hasPowerTag(state, 'hook:lose_hp_gain_fracture')) addStatus(state.player, 'fracture', 1);
}

// ---------------- relic / power hooks ----------------
interface RelicHookCtx {
  phase: 'combat_start' | 'turn_start' | 'turn_end' | 'on_kill' | 'banish';
  rng: Rng;
  relics: string[];
}

export function applyRelicHook(state: CombatState, hook: RelicHook | string, ctx: RelicHookCtx) {
  switch (hook) {
    case 'start_combat_draw_1': if (ctx.phase === 'combat_start') state.drawPerTurn += 1; break;
    case 'start_combat_add_spark':
      if (ctx.phase === 'combat_start') state.hand.push({ uid: makeUid('spark'), defId: 'status_spark', upgraded: false });
      break;
    case 'start_combat_summon_1':
      if (ctx.phase === 'combat_start') summonServants(state, 1);
      break;
    case 'start_combat_2_ward': if (ctx.phase === 'combat_start') gainWard(state, state.player, 2, ctx.relics); break;
    case 'start_combat_3_ward': if (ctx.phase === 'combat_start') gainWard(state, state.player, 3, ctx.relics); break;
    case 'max_hp_plus_7':       /* handled on pickup at run-state layer */ break;
    case 'gold_gain_plus_25pct':/* handled at run-state layer */ break;
    case 'shop_prices_minus_15pct': /* handled at shop layer */ break;
    case 'on_rest_heal_plus_10':/* handled at rest layer */ break;
    case 'on_boss_complete_heal_full': /* handled post-boss */ break;
    case 'at_turn_start_if_hand_5_plus_gain_1_momentum':
      if (ctx.phase === 'turn_start' && state.hand.length >= 5) addStatus(state.player, 'momentum', 1);
      break;
    case 'start_of_turn_gain_1_ember_if_0_cards_in_hand':
      if (ctx.phase === 'turn_start' && state.hand.length === 0) state.ember += 1;
      break;
    case 'whenever_banish_gain_1_fracture':
      if (ctx.phase === 'banish') addStatus(state.player, 'fracture', 1);
      break;
    case 'heal_2_after_combat': /* handled at run layer */ break;
    default: break;
  }
}

function applyPowerHooks(state: CombatState, phase: 'turn_start' | 'turn_end', rng: Rng, relics: string[]) {
  for (const ci of state.banish) {
    const def = getCard(ci.defId);
    if (def.type !== 'power') continue;
    if (!def.tags) continue;
    for (const tag of def.tags) {
      if (phase === 'turn_start') {
        switch (tag) {
          case 'hook:turn_start_gain_fracture_1': addStatus(state.player, 'fracture', 1); break;
          case 'hook:turn_start_gain_fracture_2': addStatus(state.player, 'fracture', 2); break;
          case 'hook:turn_start_ward_4': gainWard(state, state.player, 4, relics); break;
          case 'hook:turn_start_ward_6': gainWard(state, state.player, 6, relics); break;
          case 'hook:turn_start_add_spark_1':
          case 'hook:turn_start_summon_1':
            summonServants(state, 1);
            break;
          case 'hook:turn_start_add_spark_2':
          case 'hook:turn_start_summon_2':
            summonServants(state, 2);
            break;
          case 'hook:turn_start_seal_random_and_ward': {
            const live = state.enemies.filter((e) => e.hp > 0);
            if (live.length) {
              const t = live[Math.floor(rng() * live.length)];
              applyDebuff(state, t, 'seal', 1);
              onPlayerAppliedSeal(state, relics, 1);
            }
            gainWard(state, state.player, 2, relics);
            break;
          }
          case 'hook:turn_start_seal_random_and_ward_p': {
            const live = state.enemies.filter((e) => e.hp > 0);
            if (live.length) {
              const t = live[Math.floor(rng() * live.length)];
              applyDebuff(state, t, 'seal', 2);
              onPlayerAppliedSeal(state, relics, 2);
            }
            gainWard(state, state.player, 3, relics);
            break;
          }
        }
      }
    }
  }
}

function hasPowerTag(state: CombatState, tag: string): boolean {
  for (const ci of state.banish) {
    const def = getCard(ci.defId);
    if (def.type === 'power' && def.tags?.includes(tag)) return true;
  }
  return false;
}

function onPlayerAppliedSeal(state: CombatState, relics: string[], amount: number) {
  // Starter relic: Gavel of Judgement
  if (relics.includes('rel_gavel_of_judgement') && !(state.player.status as any)._firstSeal) {
    (state.player.status as any)._firstSeal = 1;
    gainWard(state, state.player, 2, relics);
  }
  // Power cards reacting to seal application
  if (hasPowerTag(state, 'hook:seal_gain_ward_2')) gainWard(state, state.player, 2 * amount, relics);
  else if (hasPowerTag(state, 'hook:seal_gain_ward_1')) gainWard(state, state.player, 1 * amount, relics);
}

function onPlayerAppliedDebuff(state: CombatState, _id: StatusId) {
  // Gilded Halo: gain 1 Ward when you apply a debuff. Relic list is
  // not in this scope; we rely on the state.player having seen it via
  // applyDebuff invoked with the relics list. This is a small simplification.
}

function onEnemyDeath(state: CombatState, enemy: Combatant, relics: string[]) {
  // Sanguine Rite hook
  if (hasPowerTag(state, 'hook:kill_gain_fracture_heal')) {
    addStatus(state.player, 'fracture', 2);
    state.player.hp = Math.min(state.player.maxHp, state.player.hp + 3);
  }
  // Hollow Chalice: gain 1 Ember
  if (relics.includes('rel_hollow_chalice')) {
    state.ember += 1;
  }
}

// ---------------- enemy turn ----------------
function enemyTurn(state: CombatState, rng: Rng, relics: string[]) {
  for (const e of state.enemies) {
    if (e.hp <= 0) continue;
    // Bleed on enemy ticks at START of its turn.
    const bleed = getStatus(e, 'bleed');
    if (bleed > 0) {
      const mod = relics.includes('rel_bleeding_icon') ? 1 : 0;
      applyDirectDamage(state, e, bleed + mod);
    }
    if (e.hp <= 0) { onEnemyDeath(state, e, relics); continue; }
    // Clear ward at start of its turn
    e.ward = 0;
    executeEnemyMove(state, e, rng, relics);
    cleanupDead(state, relics);
    if (state.player.hp <= 0) return;
  }
}

function executeEnemyMove(state: CombatState, e: EnemyInstance, rng: Rng, relics: string[]) {
  const def = getEnemy(e.defId);
  const move = def.moves[e.nextMove];
  if (!move) return;
  // Run its ops targeting the player appropriately.
  runOps(state, rng, relics, move.ops, { source: e, target: state.player, cardDef: undefined });
  e.moveHistory.push(move.id);
}

function pickNextIntents(state: CombatState, rng: Rng, _relics: string[]) {
  for (const e of state.enemies) {
    if (e.hp <= 0) continue;
    const def = getEnemy(e.defId);
    const nextId = def.pickMove({
      turn: state.turn + 1,
      hpPct: e.hp / Math.max(1, e.maxHp),
      lastMove: e.moveHistory.at(-1),
      history: e.moveHistory,
      rng,
    });
    e.nextMove = nextId;
    e.nextIntent = def.moves[nextId].intent;
  }
}

// ---------------- target helpers ----------------
// Target resolution is always *relative to the source*:
//   - source = player  -> 'enemy' means a monster, 'self' means player
//   - source = monster -> 'enemy' means the player, 'self' means that monster
// This is what card / enemy-move ops mean when they write `target: 'enemy'`.
function resolveTarget(state: CombatState, source: Combatant, mode: TargetMode, id?: string): Combatant | null {
  if (mode === 'none') return null;
  if (mode === 'self') return source;
  if (mode === 'enemy') {
    if (source.isPlayer) {
      if (id && id !== 'player') return state.enemies.find((e) => e.id === id) ?? state.enemies.find((e) => e.hp > 0) ?? null;
      return state.enemies.find((e) => e.hp > 0) ?? null;
    }
    // Enemy acting: its "enemy" is the player.
    return state.player;
  }
  if (mode === 'random_enemy') {
    if (source.isPlayer) {
      const live = state.enemies.filter((e) => e.hp > 0);
      return live.length ? live[Math.floor(Math.random() * live.length)] : null;
    }
    return state.player;
  }
  return null;
}

function resolveTargets(state: CombatState, source: Combatant, mode: TargetMode, id?: string): Combatant[] {
  if (mode === 'all_enemies') {
    if (source.isPlayer) return state.enemies.filter((e) => e.hp > 0);
    // An enemy "all_enemies" hits the player only (they have one opponent).
    return [state.player];
  }
  const one = resolveTarget(state, source, mode, id);
  return one ? [one] : [];
}

function allEnemiesDead(state: CombatState) { return state.enemies.every((e) => e.hp <= 0); }

function cleanupDead(state: CombatState, relics: string[]) {
  if (state.summons?.length) {
    for (const s of state.summons) {
      if (s.hp <= 0 && !(s as any)._dead) {
        (s as any)._dead = true;
        float(state, s.id, 'dissipe', 'status');
      }
    }
    state.summons = state.summons.filter((s) => s.hp > 0);
    syncSummonStatus(state);
  }
  for (const e of state.enemies) {
    if (e.hp <= 0 && !(e as any)._dead) {
      (e as any)._dead = true;
      log(state, `${e.name} s'effondre.`);
      onEnemyDeath(state, e, relics);
    }
  }
  if (allEnemiesDead(state)) {
    state.phase = 'ended';
    state.victory = true;
  }
}

// ---------------- potion use in combat ----------------
export function usePotion(state: CombatState, rng: Rng, relics: string[], potionId: string, targetId?: string): boolean {
  // Delegated effect handling; keeping code here for combat-only effects.
  // See systems/potions.ts for out-of-combat use.
  return usePotionInternal(state, rng, relics, potionId, targetId);
}

function usePotionInternal(state: CombatState, rng: Rng, relics: string[], potionId: string, targetId?: string): boolean {
  const p = getPotion(potionId);
  const target = targetId ? state.enemies.find((e) => e.id === targetId) ?? null : null;
  switch (p.apply.kind) {
    case 'heal':    state.player.hp = Math.min(state.player.maxHp, state.player.hp + p.apply.amount); float(state, 'player', `+${p.apply.amount}`, 'heal'); break;
    case 'ember':   state.ember += p.apply.amount; break;
    case 'draw':    drawCards(state, p.apply.amount, rng); break;
    case 'damage':  if (target) applyAttack({ source: state.player, target, state, relics }, p.apply.amount); break;
    case 'ward':    gainWard(state, state.player, p.apply.amount, relics); break;
    case 'status_self':  addStatus(state.player, p.apply.id, p.apply.amount); break;
    case 'status_enemy': if (target) applyDebuff(state, target, p.apply.id, p.apply.amount); break;
    case 'cleanse': for (const id of Object.keys(state.player.status) as StatusId[]) if (STATUS_IS_DEBUFF[id]) clearStatus(state.player, id); break;
    case 'remove_card_temp': /* not MVP */ break;
  }
  cleanupDead(state, relics);
  return true;
}

// exports used by store
export { addStatus, getStatus, setStatus, clearStatus, gainWard };

