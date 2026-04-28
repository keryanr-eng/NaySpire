// EMBERVOW — ennemis de l'Acte 1 (Le Berceau du Chœur).
// L'IA est un simple sélecteur de patterns. pickMove() doit être déterministe étant donné son ctx.rng.

import type { EnemyDef, EnemyAICtx } from '../types';

const def = (e: EnemyDef): EnemyDef => e;

// Utilitaire : choisit parmi des moves en évitant 2+ répétitions si besoin.
function rotate(moves: string[], ctx: EnemyAICtx): string {
  const idx = (ctx.turn - 1) % moves.length;
  return moves[idx];
}

// ---- NORMAUX ----

const NORMAL: EnemyDef[] = [
  def({
    id: 'e_ash_pilgrim',
    name: 'Pèlerin de Cendres',
    tier: 'normal',
    hpRange: [12, 15],
    description: 'Un zélote aux yeux creux tenant un encensoir de fer.',
    moves: {
      swing: { id: 'swing', intent: { kind: 'attack', value: 7, description: 'Coup d\u2019encensoir — 7' }, ops: [{ kind: 'damage', amount: 7 }] },
      pray:  { id: 'pray', intent: { kind: 'buff', description: 'Murmure une prière — +3 dégâts au prochain tour' }, ops: [{ kind: 'status', id: 'fury', amount: 3, target: 'self' }] },
    },
    pickMove: (ctx) => (ctx.turn % 3 === 0 ? 'pray' : 'swing'),
  }),
  def({
    id: 'e_wick_rat',
    name: 'Rat-Mèche',
    tier: 'normal',
    hpRange: [9, 12],
    description: 'Un rat fait de cire fondue, qui ronge les fidèles.',
    moves: {
      bite: { id: 'bite', intent: { kind: 'attack', value: 3, hits: 2, description: 'Morsure — 3×2' }, ops: [{ kind: 'damage', amount: 3, hits: 2 }] },
      scurry: { id: 'scurry', intent: { kind: 'debuff', description: 'Applique 2 Flétri' }, ops: [{ kind: 'status', id: 'faded', amount: 2, target: 'enemy' }] },
    },
    pickMove: (ctx) => {
      if (ctx.lastMove === 'bite' && ctx.rng() < 0.5) return 'scurry';
      return 'bite';
    },
  }),
  def({
    id: 'e_sconce_imp',
    name: 'Diablotin d\u2019Applique',
    tier: 'normal',
    hpRange: [14, 18],
    description: 'Un diablotin aux ailes de cire crachant des langues de feu.',
    moves: {
      spit: { id: 'spit', intent: { kind: 'attack', value: 6, description: 'Crachat de Braise — 6' }, ops: [{ kind: 'damage', amount: 6 }, { kind: 'status', id: 'ignite', amount: 1, target: 'enemy' }] },
      flare: { id: 'flare', intent: { kind: 'special', description: 'Applique 2 Embrasement' }, ops: [{ kind: 'status', id: 'ignite', amount: 2, target: 'enemy' }] },
    },
    pickMove: (ctx) => (ctx.turn % 2 === 0 ? 'flare' : 'spit'),
  }),
  def({
    id: 'e_hollow_chanter',
    name: 'Chantre Creux',
    tier: 'normal',
    hpRange: [16, 20],
    description: 'Une silhouette encapuchonnée à la bouche cousue de psaumes.',
    moves: {
      chant: { id: 'chant', intent: { kind: 'debuff', description: 'Applique 2 Fragile' }, ops: [{ kind: 'status', id: 'brittle', amount: 2, target: 'enemy' }] },
      swing: { id: 'swing', intent: { kind: 'attack', value: 9, description: 'Coup d\u2019encensoir — 9' }, ops: [{ kind: 'damage', amount: 9 }] },
    },
    pickMove: (ctx) => (ctx.turn === 1 ? 'chant' : 'swing'),
  }),
  def({
    id: 'e_reliquary_guard',
    name: 'Garde du Reliquaire',
    tier: 'normal',
    hpRange: [22, 28],
    description: 'Armure de plaques-prières, épée de fer sanctifié.',
    moves: {
      guard: { id: 'guard', intent: { kind: 'defend', value: 8, description: 'Garde — +8 Garde' }, ops: [{ kind: 'ward', amount: 8, target: 'self' }] },
      hew: { id: 'hew', intent: { kind: 'attack', value: 11, description: 'Taille — 11' }, ops: [{ kind: 'damage', amount: 11 }] },
    },
    pickMove: (ctx) => (ctx.turn % 2 === 1 ? 'guard' : 'hew'),
  }),
  def({
    id: 'e_splinter_shade',
    name: 'Ombre d\u2019Éclat',
    tier: 'normal',
    hpRange: [11, 14],
    description: 'Un tesson de miroir brisé qui refuse d\u2019oublier.',
    moves: {
      cut: { id: 'cut', intent: { kind: 'attack', value: 4, description: 'Entaille de verre — 4 (+1 Saignement)' }, ops: [{ kind: 'damage', amount: 4 }, { kind: 'status', id: 'bleed', amount: 1, target: 'enemy' }] },
      reflect: { id: 'reflect', intent: { kind: 'buff', description: 'Gagne 2 Épines' }, ops: [{ kind: 'status', id: 'thorns', amount: 2, target: 'self' }] },
    },
    pickMove: (ctx) => (ctx.turn === 1 ? 'reflect' : (ctx.lastMove === 'cut' ? (ctx.rng() < 0.35 ? 'reflect' : 'cut') : 'cut')),
  }),
  def({
    id: 'e_limb_of_choir',
    name: 'Membre du Chœur',
    tier: 'normal',
    hpRange: [18, 22],
    description: 'Un bras unique, détaché mais chantant encore.',
    moves: {
      strike: { id: 'strike', intent: { kind: 'attack', value: 8, description: 'Frappe — 8' }, ops: [{ kind: 'damage', amount: 8 }] },
      grasp:  { id: 'grasp',  intent: { kind: 'debuff', description: 'Applique 1 Entravé' }, ops: [{ kind: 'status', id: 'chained', amount: 1, target: 'enemy' }] },
    },
    pickMove: (ctx) => rotate(['strike', 'strike', 'grasp'], ctx),
  }),
  def({
    id: 'e_candlewight',
    name: 'Spectre de Cierge',
    tier: 'normal',
    hpRange: [10, 13],
    description: 'Un feu follet qui a la forme d\u2019un saint en pleurs.',
    moves: {
      kiss: { id: 'kiss', intent: { kind: 'attack', value: 5, description: 'Baiser de Flamme — 5' }, ops: [{ kind: 'damage', amount: 5 }, { kind: 'status', id: 'ignite', amount: 1, target: 'enemy' }] },
      guide: { id: 'guide', intent: { kind: 'buff', description: 'Gagne 5 Garde' }, ops: [{ kind: 'ward', amount: 5, target: 'self' }] },
    },
    pickMove: (ctx) => (ctx.hpPct < 0.4 ? 'guide' : 'kiss'),
  }),
];

// ---- ÉLITES ----

const ELITE: EnemyDef[] = [
  def({
    id: 'e_warden_of_ashes',
    name: 'Gardien des Cendres',
    tier: 'elite',
    hpRange: [55, 65],
    description: 'Un géant de plaques incandescentes qui scelle les vœux brisés.',
    moves: {
      cleaver: { id: 'cleaver', intent: { kind: 'attack', value: 14, description: 'Couperet — 14' }, ops: [{ kind: 'damage', amount: 14 }] },
      shell:   { id: 'shell',   intent: { kind: 'defend', value: 14, description: 'Carapace de Cendres — +14 Garde, gagne 2 Furie' }, ops: [{ kind: 'ward', amount: 14, target: 'self' }, { kind: 'status', id: 'fury', amount: 2, target: 'self' }] },
      brand:   { id: 'brand',   intent: { kind: 'debuff', description: 'Marquage — 6 dégâts + 2 Fragile' }, ops: [{ kind: 'damage', amount: 6 }, { kind: 'status', id: 'brittle', amount: 2, target: 'enemy' }] },
    },
    pickMove: (ctx) => {
      if (ctx.turn === 1) return 'brand';
      const last = ctx.lastMove;
      if (last === 'cleaver') return 'shell';
      if (last === 'shell') return 'brand';
      return 'cleaver';
    },
  }),
  def({
    id: 'e_matron_of_bells',
    name: 'Matrone des Cloches',
    tier: 'elite',
    hpRange: [50, 60],
    description: 'Elle fait sonner des cloches de fer dont le son déchire la chair.',
    moves: {
      toll: { id: 'toll', intent: { kind: 'attack_multi', value: 3, hits: 4, description: 'Glas — 3×4' }, ops: [{ kind: 'damage', amount: 3, hits: 4 }] },
      peal: { id: 'peal', intent: { kind: 'debuff', description: 'Applique 2 Flétri, 2 Fragile' }, ops: [{ kind: 'status', id: 'faded', amount: 2, target: 'enemy' }, { kind: 'status', id: 'brittle', amount: 2, target: 'enemy' }] },
      clangor: { id: 'clangor', intent: { kind: 'attack', value: 10, description: 'Clameur — 10' }, ops: [{ kind: 'damage', amount: 10 }] },
    },
    pickMove: (ctx) => {
      const r = ctx.rng();
      if (ctx.turn === 1) return 'peal';
      if (ctx.lastMove === 'toll') return r < 0.5 ? 'clangor' : 'peal';
      if (ctx.lastMove === 'clangor') return 'toll';
      return 'toll';
    },
  }),
  def({
    id: 'e_mouth_of_the_vault',
    name: 'Bouche du Caveau',
    tier: 'elite',
    hpRange: [60, 70],
    description: 'Un gouffre en forme de mâchoire béante, nourri par l\u2019oubli.',
    moves: {
      swallow: { id: 'swallow', intent: { kind: 'attack', value: 9, description: 'Engloutit — 9 (ajoute des Scories à la défausse)' }, ops: [{ kind: 'damage', amount: 9 }, { kind: 'add_card_to_discard', cardId: 'status_dross', amount: 1 }] },
      maw:     { id: 'maw',     intent: { kind: 'attack', value: 16, description: 'Gueule — 16' }, ops: [{ kind: 'damage', amount: 16 }] },
      echo:    { id: 'echo',    intent: { kind: 'buff', description: 'Gagne 12 Garde' }, ops: [{ kind: 'ward', amount: 12, target: 'self' }] },
    },
    pickMove: (ctx) => {
      if (ctx.turn === 1) return 'swallow';
      const hist = ctx.history.slice(-2).join(',');
      if (hist.endsWith('maw')) return 'echo';
      if (hist.endsWith('echo')) return 'maw';
      return ctx.rng() < 0.6 ? 'swallow' : 'maw';
    },
  }),
];

// ---- BOSS ----

const BOSSES: EnemyDef[] = [
  def({
    id: 'e_broken_choirmaster',
    name: 'Le Maître de Chœur Brisé',
    tier: 'boss',
    hpRange: [140, 160],
    description: 'Il dirige un chœur composé de tes propres serments oubliés.',
    moves: {
      crescendo: { id: 'crescendo', intent: { kind: 'attack_multi', value: 4, hits: 3, description: 'Crescendo — 4×3' }, ops: [{ kind: 'damage', amount: 4, hits: 3 }] },
      verse:     { id: 'verse',     intent: { kind: 'attack', value: 14, description: 'Verset de Fer — 14' }, ops: [{ kind: 'damage', amount: 14 }] },
      antiphon:  { id: 'antiphon',  intent: { kind: 'debuff', description: 'Applique 3 Fragile, 3 Flétri' }, ops: [{ kind: 'status', id: 'brittle', amount: 3, target: 'enemy' }, { kind: 'status', id: 'faded', amount: 3, target: 'enemy' }] },
      hymn:      { id: 'hymn',      intent: { kind: 'special', description: 'Lève Garde 18, gagne 3 Furie' }, ops: [{ kind: 'ward', amount: 18, target: 'self' }, { kind: 'status', id: 'fury', amount: 3, target: 'self' }] },
      finale:    { id: 'finale',    intent: { kind: 'attack', value: 24, description: 'Finale — 24 (phase 2)' }, ops: [{ kind: 'damage', amount: 24 }] },
    },
    pickMove: (ctx) => {
      // Phase 1 au-dessus de 50 % PV : verse → crescendo → antiphon → hymn avec variations.
      // Phase 2 en dessous de 50 % PV : finale alterne avec crescendo.
      if (ctx.hpPct < 0.5) {
        if (ctx.lastMove === 'finale') return 'crescendo';
        if (ctx.lastMove === 'crescendo') return 'antiphon';
        return 'finale';
      }
      const cycle = ['antiphon', 'verse', 'crescendo', 'hymn'];
      return cycle[(ctx.turn - 1) % cycle.length];
    },
  }),
];

export const ALL_ENEMIES: EnemyDef[] = [...NORMAL, ...ELITE, ...BOSSES];

export const ENEMY_MAP: Record<string, EnemyDef> = Object.fromEntries(
  ALL_ENEMIES.map((e) => [e.id, e]),
);

export function getEnemy(id: string): EnemyDef {
  const e = ENEMY_MAP[id];
  if (!e) throw new Error(`Unknown enemy id: ${id}`);
  return e;
}

// Groupes de rencontres pour l'Acte 1 (combats normaux).
export const NORMAL_ENCOUNTERS: string[][] = [
  ['e_ash_pilgrim'],
  ['e_wick_rat', 'e_wick_rat'],
  ['e_candlewight', 'e_candlewight'],
  ['e_sconce_imp'],
  ['e_ash_pilgrim', 'e_wick_rat'],
  ['e_hollow_chanter'],
  ['e_splinter_shade', 'e_splinter_shade'],
  ['e_sconce_imp', 'e_candlewight'],
  ['e_reliquary_guard'],
  ['e_limb_of_choir', 'e_wick_rat'],
  ['e_hollow_chanter', 'e_candlewight'],
  ['e_ash_pilgrim', 'e_ash_pilgrim', 'e_wick_rat'],
];

// Les rencontres du premier étage sont calibrées plus faciles.
export const EARLY_ENCOUNTERS: string[][] = [
  ['e_ash_pilgrim'],
  ['e_wick_rat', 'e_wick_rat'],
  ['e_candlewight'],
  ['e_sconce_imp'],
];

export const ELITE_ENCOUNTERS: string[][] = [
  ['e_warden_of_ashes'],
  ['e_matron_of_bells'],
  ['e_mouth_of_the_vault'],
];

export const BOSS_ENCOUNTERS: string[][] = [
  ['e_broken_choirmaster'],
];
