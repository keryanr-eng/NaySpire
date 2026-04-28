// EMBERVOW — top-level game store (zustand).
//
// Holds:
//   - current Screen
//   - MetaState (lightweight; saved to localStorage under SAVE_KEY_META)
//   - RunState (saved to SAVE_KEY_RUN when mid-run)
//   - CombatState (not persisted — combat always resolves in a single session)
//   - RewardState after combat
//
// Persistence strategy: save after each node transition, after reward resolution,
// and after combat end. On load, if a run exists, we resume on the map screen
// (we do NOT persist mid-combat to avoid half-consistent states in MVP).

import { create } from 'zustand';
import type {
  CardInstance, ClassId, CombatState, MetaState, RelicDef, RewardState, RunState, Screen,
} from '../types';
import { ALL_CARDS, getCard, rewardPool, startingDeck } from '../data/cards';
import { ALL_RELICS, getRelic, relicRewardPool } from '../data/relics';
import { ALL_POTIONS, getPotion, potionRewardPool } from '../data/potions';
import { generateMap, nextChoices, parseEncounter } from '../systems/map';
import { getEvent } from '../data/events';
import {
  buildCombat, beginPlayerTurn, endPlayerTurn, playCard, usePotion,
} from '../systems/combat';
import { makeRng, mix, pickN, randInt, shuffle } from '../systems/rng';

// ---------- save keys ----------
const SAVE_KEY_RUN = 'embervow.run.v1';
const SAVE_KEY_META = 'embervow.meta.v1';

// ---------- helpers ----------
function newCardInstance(defId: string, upgraded = false): CardInstance {
  return { uid: `c_${Date.now()}_${Math.random().toString(36).slice(2, 8)}_${Math.floor(Math.random()*1e6).toString(36)}`, defId, upgraded };
}

function startingMaxHp(classId: ClassId): number {
  if (classId === 'vowbreaker') return 75;
  if (classId === 'sealbinder') return 65;
  if (classId === 'whisperer') return 62;
  if (classId === 'summoner') return 58;
  return 60;
}

function starterRelicId(classId: ClassId): string {
  if (classId === 'vowbreaker') return 'rel_shard_of_first_vow';
  if (classId === 'sealbinder') return 'rel_gavel_of_judgement';
  if (classId === 'whisperer') return 'rel_censer_of_echoes';
  if (classId === 'summoner') return 'rel_bell_of_the_bound';
  return 'rel_oracle_lens';
}

function makeStartingDeck(classId: ClassId): CardInstance[] {
  return startingDeck(classId).map((id) => newCardInstance(id));
}

function loadMeta(): MetaState {
  try {
    const raw = localStorage.getItem(SAVE_KEY_META);
    if (!raw) throw new Error('none');
    return JSON.parse(raw) as MetaState;
  } catch {
    return { wins: { vowbreaker: 0, sealbinder: 0, whisperer: 0, auger: 0, summoner: 0 }, losses: 0, seenCards: [], seenRelics: [], achievements: [] };
  }
}

function saveMeta(meta: MetaState) {
  try { localStorage.setItem(SAVE_KEY_META, JSON.stringify(meta)); } catch {/*noop*/}
}

function saveRun(run: RunState | null) {
  try {
    if (!run) localStorage.removeItem(SAVE_KEY_RUN);
    else localStorage.setItem(SAVE_KEY_RUN, JSON.stringify(run));
  } catch {/*noop*/}
}

function loadRun(): RunState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY_RUN);
    if (!raw) return null;
    return JSON.parse(raw) as RunState;
  } catch { return null; }
}

// ---------- store shape ----------
interface Store {
  screen: Screen;
  meta: MetaState;
  run: RunState | null;
  combat: CombatState | null;
  rewards: RewardState | null;
  modal: null | { kind: 'deck' } | { kind: 'confirm'; text: string; onYes: () => void } | { kind: 'pick_card_to_upgrade'; onPick: (uid: string) => void } | { kind: 'pick_card_to_remove'; onPick: (uid: string) => void };
  // seed used for "next combat" content rolls
  _tickle: number;

  // --- navigation ---
  setScreen: (s: Screen) => void;
  openModal: (m: Store['modal']) => void;
  closeModal: () => void;

  // --- run lifecycle ---
  newRun: (classId: ClassId, seed?: number) => void;
  abandonRun: () => void;
  resumeIfExists: () => boolean;
  persist: () => void;

  // --- map ---
  chooseNode: (nodeId: string) => void;
  finishNode: () => void;    // after a node resolves, returns to map

  // --- combat actions ---
  startCombatForNode: () => void;
  combatPlayCard: (uid: string, targetId?: string, xEmber?: number) => void;
  combatEndTurn: () => void;
  combatUsePotion: (slot: number, targetId?: string) => void;
  combatFinish: () => void;  // clean up and move to rewards/game over

  // --- rewards / shops / rest / events ---
  takeReward: (type: 'gold' | 'cards' | 'relic' | 'potion', payload?: any) => void;
  skipCardReward: () => void;
  rollShop: () => ShopState;
  buyShop: (itemIdx: number) => void;
  leaveShop: () => void;
  rest: (choice: 'heal' | 'upgrade') => void;
  resolveEventOption: (optionIdx: number) => void;
  takeTreasure: () => void;

  // --- deck ops (rest campfire / events) ---
  upgradeCard: (uid: string) => void;
  removeCardFromDeck: (uid: string) => void;
}

export interface ShopState {
  cards: Array<{ uid: string; defId: string; price: number }>;
  relics: Array<{ relicId: string; price: number }>;
  potions: Array<{ potionId: string; price: number }>;
  removeService: { price: number; used: boolean };
}

// Utility — compute gold reward by node tier
function goldForCombat(tier: 'normal' | 'elite' | 'boss', rng: () => number, run: RunState): number {
  const base = tier === 'boss' ? randInt(rng, 40, 55) : tier === 'elite' ? randInt(rng, 22, 32) : randInt(rng, 10, 18);
  const bonus = run.relics.includes('rel_alms_purse') ? Math.ceil(base * 0.25) : 0;
  return base + bonus;
}

function shopPriceMod(run: RunState): number {
  return run.relics.includes('rel_iron_merchants_seal') ? 0.85 : 1.0;
}

// ---------- store ----------
export const useGame = create<Store>((set, get) => ({
  screen: 'menu',
  meta: loadMeta(),
  run: null,
  combat: null,
  rewards: null,
  modal: null,
  _tickle: 0,

  setScreen: (s) => set({ screen: s }),
  openModal: (m) => set({ modal: m }),
  closeModal: () => set({ modal: null }),

  newRun: (classId, seed) => {
    const s = seed ?? Math.floor(Math.random() * 1e9);
    const map = generateMap(s);
    const run: RunState = {
      seed: s,
      classId,
      hp: startingMaxHp(classId),
      maxHp: startingMaxHp(classId),
      gold: 99,
      deck: makeStartingDeck(classId),
      relics: [starterRelicId(classId)],
      potions: [null, null, null],
      potionSlots: 3,
      map,
      currentNodeId: null,
      floor: 0,
      act: 1,
      seen: { enemies: [], events: [] },
      flags: {},
      history: [`Tentative lancée avec ${
        classId === 'vowbreaker' ? 'Vowbreaker' :
        classId === 'sealbinder' ? 'Sealbinder' :
        classId === 'whisperer' ? 'Whisperer' :
        classId === 'summoner' ? 'Summoner' : 'Auger'
      } (seed ${s}).`],
    };
    // Apply max-HP relic effect (doesn't appear in starter but future-proof)
    if (run.relics.includes('rel_ashworn_ring')) { run.maxHp += 7; run.hp += 7; }
    saveRun(run);
    set({ run, screen: 'map', combat: null, rewards: null });
  },

  abandonRun: () => {
    saveRun(null);
    set({ run: null, combat: null, rewards: null, screen: 'menu' });
  },

  resumeIfExists: () => {
    const r = loadRun();
    if (!r) return false;
    set({ run: r, screen: 'map' });
    return true;
  },

  persist: () => {
    const { run } = get();
    saveRun(run);
  },

  chooseNode: (nodeId) => {
    const { run } = get();
    if (!run) return;
    const node = run.map.nodes[nodeId];
    if (!node) return;
    const reachable = nextChoices(run.map, run.currentNodeId).map((n) => n.id);
    if (!reachable.includes(nodeId)) return;
    run.currentNodeId = nodeId;
    node.visited = true;
    run.floor = node.floor;
    set({ run: { ...run } });
    // dispatch to the appropriate screen
    if (node.kind === 'combat' || node.kind === 'elite' || node.kind === 'boss') {
      get().startCombatForNode();
    } else if (node.kind === 'event') {
      set({ screen: 'event' });
    } else if (node.kind === 'merchant') {
      set({ screen: 'shop' });
    } else if (node.kind === 'rest') {
      set({ screen: 'rest' });
    } else if (node.kind === 'treasure') {
      set({ screen: 'treasure' });
    }
    get().persist();
  },

  finishNode: () => {
    const { run } = get();
    if (!run) return;
    // If we just defeated boss, game is won.
    const currentNode = run.currentNodeId ? run.map.nodes[run.currentNodeId] : null;
    if (currentNode?.kind === 'boss') {
      const meta = get().meta;
      meta.wins[run.classId] = (meta.wins[run.classId] ?? 0) + 1;
      saveMeta(meta);
      saveRun(null);
      set({ screen: 'victory', meta, combat: null, rewards: null });
      return;
    }
    set({ screen: 'map', combat: null, rewards: null });
    get().persist();
  },

  startCombatForNode: () => {
    const { run } = get();
    if (!run || !run.currentNodeId) return;
    const node = run.map.nodes[run.currentNodeId];
    const encounter = parseEncounter(node.data?.encounterId ?? '');
    const tier: 'normal' | 'elite' | 'boss' = node.kind === 'boss' ? 'boss' : node.kind === 'elite' ? 'elite' : 'normal';
    const combat = buildCombat({
      seed: mix(run.seed, node.seed),
      encounter,
      playerHp: run.hp,
      playerMaxHp: run.maxHp,
      relics: run.relics.slice(),
      deck: run.deck.map((c) => ({ uid: c.uid, defId: getCard(c.defId).upgradeTo && c.upgraded ? (getCard(c.defId).upgradeTo as string) : c.defId, upgraded: c.upgraded })),
      classId: run.classId,
      tier,
    });
    set({ combat, screen: 'combat' });
  },

  combatPlayCard: (uid, targetId, xEmber) => {
    const { combat, run } = get();
    if (!combat || !run) return;
    if (combat.phase !== 'player') return;
    const rng = makeRng(mix(run.seed, combat.turn, combat.hand.length, 7));
    const res = playCard(combat, rng, run.relics, uid, targetId, xEmber);
    if (!res.played) return;
    set({ combat: { ...combat } });
    if ((combat.phase as string) === 'ended') {
      // On victory, hold the combat screen briefly so the victory banner +
      // fanfare can play before we swap to the reward screen. On death,
      // transition immediately — nothing to celebrate.
      if (combat.victory) {
        setTimeout(() => get().combatFinish(), 1400);
      } else {
        get().combatFinish();
      }
    }
  },

  combatEndTurn: () => {
    const { combat, run } = get();
    if (!combat || !run) return;
    if (combat.phase !== 'player') return;
    const rng = makeRng(mix(run.seed, combat.turn, 13));
    endPlayerTurn(combat, rng, run.relics);
    set({ combat: { ...combat } });
    if ((combat.phase as string) === 'ended') {
      // On victory, hold the combat screen briefly so the victory banner +
      // fanfare can play before we swap to the reward screen. On death,
      // transition immediately — nothing to celebrate.
      if (combat.victory) {
        setTimeout(() => get().combatFinish(), 1400);
      } else {
        get().combatFinish();
      }
    }
  },

  combatUsePotion: (slot, targetId) => {
    const { combat, run } = get();
    if (!combat || !run) return;
    const pid = run.potions[slot];
    if (!pid) return;
    const rng = makeRng(mix(run.seed, combat.turn, slot + 1, 71));
    usePotion(combat, rng, run.relics, pid, targetId);
    // Wick Flask: first potion each combat refills. We emulate by not clearing the slot if flag unset.
    if (run.relics.includes('rel_wick_flask') && !(combat.player.status as any)._potion_refilled) {
      (combat.player.status as any)._potion_refilled = 1;
    } else {
      run.potions[slot] = null;
    }
    set({ combat: { ...combat }, run: { ...run } });
  },

  combatFinish: () => {
    const { combat, run, meta } = get();
    if (!combat || !run) return;
    // Sync player HP back to run
    run.hp = Math.max(0, combat.player.hp);
    if (!combat.victory) {
      // death
      meta.losses += 1;
      saveMeta(meta);
      saveRun(null);
      set({ screen: 'game_over', combat: null, run: null, meta });
      return;
    }
    // Heal 2 after combat (Cinder Cloak)
    if (run.relics.includes('rel_cinder_cloak')) run.hp = Math.min(run.maxHp, run.hp + 2);
    // Boss full-heal relic
    const current = run.currentNodeId ? run.map.nodes[run.currentNodeId] : null;
    if (current?.kind === 'boss' && run.relics.includes('rel_reclaimed_vow')) run.hp = run.maxHp;

    // Track seen
    for (const e of combat.enemies.map((x) => x.defId)) if (!run.seen.enemies.includes(e)) run.seen.enemies.push(e);

    // Compose reward
    const rng = makeRng(mix(run.seed, combat.turn, 31));
    const tier: 'normal' | 'elite' | 'boss' = current?.kind === 'boss' ? 'boss' : current?.kind === 'elite' ? 'elite' : 'normal';
    const gold = goldForCombat(tier, rng, run);

    // Card rewards: 3 cards, weighted by rarity. Elite/Boss skew higher.
    const pool = rewardPool(run.classId);
    const rarity = (): 'common' | 'uncommon' | 'rare' => {
      let r = rng();
      if (tier === 'boss') r *= 0.4;   // skew higher
      else if (tier === 'elite') r *= 0.7;
      if (r < 0.6) return 'common';
      if (r < 0.92) return 'uncommon';
      return 'rare';
    };
    const rolls: string[] = [];
    const bag = pool.slice();
    while (rolls.length < 3 && bag.length > 0) {
      const target = rarity();
      const eligible = bag.filter((c) => c.rarity === target);
      const src = eligible.length ? eligible : bag;
      const idx = Math.floor(rng() * src.length);
      const pick = src[idx];
      rolls.push(pick.id);
      // remove from bag to avoid dupes in a single reward screen
      const bagIdx = bag.findIndex((c) => c.id === pick.id);
      if (bagIdx >= 0) bag.splice(bagIdx, 1);
    }

    const relic = tier !== 'normal' ? pickN(rng, relicRewardPool().filter((r) => !run.relics.includes(r.id) && r.tier !== 'starter'), 1)[0]?.id : undefined;
    const potion = (tier === 'normal' && rng() < 0.4) || tier !== 'normal'
      ? pickN(rng, potionRewardPool(), 1)[0]?.id
      : undefined;

    const pending: RewardState['pending'] = ['cards'];
    if (relic) pending.push('relic');
    if (potion) pending.push('potion');

    const rewards: RewardState = { gold, cards: rolls, relic, potion, pending };
    // Gold handed out immediately — simpler UX
    run.gold += gold;

    set({ combat: null, rewards, screen: 'reward', run: { ...run } });
    get().persist();
  },

  takeReward: (type, payload) => {
    const { rewards, run } = get();
    if (!rewards || !run) return;
    if (type === 'cards' && payload?.defId) {
      const def = getCard(payload.defId);
      run.deck.push(newCardInstance(def.id));
      rewards.pending = rewards.pending.filter((x) => x !== 'cards');
    }
    if (type === 'relic' && rewards.relic) {
      run.relics.push(rewards.relic);
      // Apply pickup-time effects
      const relicDef = getRelic(rewards.relic);
      if (relicDef.hook === 'max_hp_plus_7') { run.maxHp += 7; run.hp += 7; }
      rewards.pending = rewards.pending.filter((x) => x !== 'relic');
    }
    if (type === 'potion' && rewards.potion) {
      const slot = run.potions.findIndex((p) => !p);
      if (slot >= 0) run.potions[slot] = rewards.potion;
      rewards.pending = rewards.pending.filter((x) => x !== 'potion');
    }
    set({ rewards: { ...rewards }, run: { ...run } });
    if (rewards.pending.length === 0) get().finishNode();
    get().persist();
  },

  skipCardReward: () => {
    const { rewards } = get();
    if (!rewards) return;
    rewards.pending = rewards.pending.filter((x) => x !== 'cards');
    set({ rewards: { ...rewards } });
    if (rewards.pending.length === 0) get().finishNode();
  },

  rollShop: () => {
    const { run } = get();
    if (!run) throw new Error('no run');
    // Deterministic per-node shop content
    const node = run.map.nodes[run.currentNodeId!];
    const rng = makeRng(mix(run.seed, node.seed, 41));
    const priceMod = shopPriceMod(run);
    const cards = pickN(rng, rewardPool(run.classId), 5).map((c) => ({
      uid: newCardInstance(c.id).uid,
      defId: c.id,
      price: Math.round(priceFor(c.rarity, rng) * priceMod),
    }));
    const relics = pickN(rng, relicRewardPool().filter((r) => !run.relics.includes(r.id)), 2).map((r) => ({
      relicId: r.id, price: Math.round(priceForRelic(r.tier, rng) * priceMod),
    }));
    const potions = pickN(rng, ALL_POTIONS, 2).map((p) => ({
      potionId: p.id, price: Math.round(priceForPotion(p.rarity, rng) * priceMod),
    }));
    const removeService = { price: Math.round(75 * priceMod), used: false };
    return { cards, relics, potions, removeService };
  },

  buyShop: (itemIdx: number) => {
    // Shop transactions are handled in the component against the rolled shop; this is just a helper to decrement gold.
    void itemIdx;
  },

  leaveShop: () => {
    get().finishNode();
  },

  rest: (choice) => {
    const { run } = get();
    if (!run) return;
    if (choice === 'heal') {
      let heal = Math.floor(run.maxHp * 0.3);
      if (run.relics.includes('rel_hearth_of_sanctum')) heal += 10;
      if (run.flags.full_heal_next_rest) { run.hp = run.maxHp; delete run.flags.full_heal_next_rest; }
      else run.hp = Math.min(run.maxHp, run.hp + heal);
      set({ run: { ...run } });
      get().finishNode();
    } else {
      // upgrade -> open card upgrade modal
      set({
        modal: {
          kind: 'pick_card_to_upgrade',
          onPick: (uid: string) => {
            get().upgradeCard(uid);
            get().closeModal();
            get().finishNode();
          },
        },
      });
    }
  },

  resolveEventOption: (optionIdx: number) => {
    const { run } = get();
    if (!run || !run.currentNodeId) return;
    const node = run.map.nodes[run.currentNodeId];
    const evId = node.data?.eventId;
    if (!evId) { get().finishNode(); return; }
    const ev = getEvent(evId);
    const opt = ev.options[optionIdx];
    if (!opt) return;
    if (opt.disabled?.(run)) return;
    const rng = makeRng(mix(run.seed, node.seed, 83));
    const msg = opt.resolve(run, rng);
    run.history.push(msg);
    if (run.flags.pending_common_relic) {
      const pool = ALL_RELICS.filter((r) => r.tier === 'common' && !run.relics.includes(r.id) && !r.classId);
      const rng2 = makeRng(mix(run.seed, node.seed, 17));
      const picked = pool[Math.floor(rng2() * pool.length)];
      if (picked) run.relics.push(picked.id);
      delete run.flags.pending_common_relic;
    }
    set({ run: { ...run } });
    get().finishNode();
  },

  takeTreasure: () => {
    const { run } = get();
    if (!run || !run.currentNodeId) return;
    const node = run.map.nodes[run.currentNodeId];
    const rng = makeRng(mix(run.seed, node.seed, 191));
    // Coin pile + either a relic or a potion
    const gold = randInt(rng, 20, 45);
    run.gold += gold;
    const pickRelic = rng() < 0.5;
    if (pickRelic) {
      const pool = relicRewardPool().filter((r) => !run.relics.includes(r.id));
      const picked = pool[Math.floor(rng() * pool.length)];
      if (picked) {
        run.relics.push(picked.id);
        if (picked.hook === 'max_hp_plus_7') { run.maxHp += 7; run.hp += 7; }
      }
    } else {
      const picked = ALL_POTIONS[Math.floor(rng() * ALL_POTIONS.length)];
      const slot = run.potions.findIndex((p) => !p);
      if (slot >= 0) run.potions[slot] = picked.id;
    }
    set({ run: { ...run } });
    get().finishNode();
  },

  upgradeCard: (uid) => {
    const { run } = get();
    if (!run) return;
    const idx = run.deck.findIndex((c) => c.uid === uid);
    if (idx < 0) return;
    const def = getCard(run.deck[idx].defId);
    if (!def.upgradeTo) return;
    run.deck[idx] = { ...run.deck[idx], defId: def.upgradeTo, upgraded: true };
    set({ run: { ...run } });
    get().persist();
  },

  removeCardFromDeck: (uid) => {
    const { run } = get();
    if (!run) return;
    run.deck = run.deck.filter((c) => c.uid !== uid);
    set({ run: { ...run } });
    get().persist();
  },
}));

// ---------- shop pricing helpers ----------
function priceFor(rarity: string, rng: () => number): number {
  if (rarity === 'common') return 45 + Math.floor(rng() * 10);
  if (rarity === 'uncommon') return 70 + Math.floor(rng() * 15);
  if (rarity === 'rare') return 130 + Math.floor(rng() * 20);
  return 60;
}
function priceForRelic(tier: string, rng: () => number): number {
  if (tier === 'common') return 140 + Math.floor(rng() * 20);
  if (tier === 'uncommon') return 200 + Math.floor(rng() * 25);
  if (tier === 'rare') return 260 + Math.floor(rng() * 40);
  return 180;
}
function priceForPotion(rarity: string, rng: () => number): number {
  if (rarity === 'common') return 50 + Math.floor(rng() * 10);
  if (rarity === 'uncommon') return 70 + Math.floor(rng() * 10);
  return 95 + Math.floor(rng() * 10);
}
