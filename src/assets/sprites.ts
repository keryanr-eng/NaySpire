// EMBERVOW — sprite sheet coordinates for public/assets/ui_sheet.png
// All coordinates are in native sheet pixels. Sheet is 1536x1024.
//
// These are initial best-estimate values; expect to nudge them after
// visually inspecting in-game. Each Rect is {x, y, w, h} in sheet pixels.

import { publicAsset } from './paths';

export const SHEET_URL = publicAsset('assets/ui_sheet.png');
export const SHEET_W = 1536;
export const SHEET_H = 1024;

export type Rect = { x: number; y: number; w: number; h: number };

// --- Player & enemies -----------------------------------------------------
// Top-left panel contains a single "Vowbreaker" player portrait.
// Top-right panel shows 3 rat skins: wick_rat, ragged_wick_rat, wick_brute.

export const SPRITES: Record<string, Rect> = {
  // Character portraits intentionally omitted — the project uses inline
  // SVG art (CharacterArt) for the player and enemies. Only HUD elements
  // (status icons, potions, relics, map nodes, card frames) come from the sheet.

  // --- Map node icons (row ~y 420, 7 circular badges) -------------------
  node_combat:   { x: 55,  y: 420, w: 80, h: 80 },
  node_elite:    { x: 150, y: 420, w: 80, h: 80 },
  node_boss:     { x: 245, y: 420, w: 80, h: 80 },
  node_event:    { x: 340, y: 420, w: 80, h: 80 },
  node_merchant: { x: 435, y: 420, w: 80, h: 80 },
  node_rest:     { x: 530, y: 420, w: 80, h: 80 },
  node_treasure: { x: 625, y: 420, w: 80, h: 80 },

  // --- Status icons (row ~y 420, 8 circular badges) ---------------------
  status_brittle:  { x: 780,  y: 420, w: 80, h: 80 },
  status_faded:    { x: 875,  y: 420, w: 80, h: 80 },
  status_bleed:    { x: 970,  y: 420, w: 80, h: 80 },
  status_ignite:   { x: 1065, y: 420, w: 80, h: 80 },
  status_sealed:   { x: 1160, y: 420, w: 80, h: 80 },
  status_fracture: { x: 1255, y: 420, w: 80, h: 80 },
  status_fury:     { x: 1350, y: 420, w: 80, h: 80 },
  status_poise:    { x: 1445, y: 420, w: 80, h: 80 },

  // --- Potions (2x4 grid in middle-right) -------------------------------
  pot_healing:    { x: 480, y: 585, w: 100, h: 115 },
  pot_strength:   { x: 590, y: 585, w: 100, h: 115 },
  pot_dexterity:  { x: 700, y: 585, w: 100, h: 115 },
  pot_focus:      { x: 810, y: 585, w: 100, h: 115 },
  pot_fire_bomb:  { x: 480, y: 710, w: 100, h: 115 },
  pot_frost_flask:{ x: 590, y: 710, w: 100, h: 115 },
  pot_poison_vial:{ x: 700, y: 710, w: 100, h: 115 },
  pot_smoke_bomb: { x: 810, y: 710, w: 100, h: 115 },

  // --- Relics (2x4 grid far right) --------------------------------------
  rel_ember_shard:      { x: 965,  y: 585, w: 115, h: 115 },
  rel_bloodied_blade:   { x: 1090, y: 585, w: 115, h: 115 },
  rel_chain_signet:     { x: 1215, y: 585, w: 115, h: 115 },
  rel_wardens_idol:     { x: 1340, y: 585, w: 115, h: 115 },
  rel_fractured_cuirass:{ x: 965,  y: 710, w: 115, h: 115 },
  rel_seal_keeper:      { x: 1090, y: 710, w: 115, h: 115 },
  rel_burning_brand:    { x: 1215, y: 710, w: 115, h: 115 },
  rel_oath_fragment:    { x: 1340, y: 710, w: 115, h: 115 },

  // --- Ember icon (bottom-left, energy) ---------------------------------
  icon_ember: { x: 55, y: 885, w: 70, h: 70 },

  // --- Card frames (examples) -------------------------------------------
  // These are full card face templates; use w/h as-is.
  card_frame_attack: { x: 680, y: 870, w: 170, h: 120 },
  card_frame_skill:  { x: 860, y: 870, w: 170, h: 120 },
  card_frame_power:  { x: 1040, y: 870, w: 170, h: 120 },
};

// Alias table: in-game ids → sprite sheet key. Used when the data layer
// names something differently from the art layer. Best-effort thematic map.
export const SPRITE_ALIAS: Record<string, string> = {
  // --- Potions --------------------------------------------------------
  pot_mend: 'pot_healing',
  pot_surge: 'pot_focus',
  pot_insight: 'pot_focus',
  pot_flame: 'pot_fire_bomb',
  pot_iron: 'pot_frost_flask',
  pot_fury: 'pot_strength',
  pot_brittle: 'pot_poison_vial',
  pot_seal: 'pot_smoke_bomb',
  pot_cleanse: 'pot_smoke_bomb',
  pot_last_breath: 'pot_frost_flask',

  // --- Relics ---------------------------------------------------------
  rel_shard_of_first_vow:  'rel_ember_shard',
  rel_gavel_of_judgement:  'rel_bloodied_blade',
  rel_pilgrims_bell:       'rel_chain_signet',
  rel_oath_bracer:         'rel_wardens_idol',
  rel_cinder_cloak:        'rel_fractured_cuirass',
  rel_hollow_chalice:      'rel_oath_fragment',
  rel_widow_stone:         'rel_seal_keeper',
  rel_rust_medallion:      'rel_chain_signet',
  rel_brass_thurible:      'rel_burning_brand',
  rel_ashworn_ring:        'rel_chain_signet',
  rel_ember_thorn:         'rel_burning_brand',
  rel_forged_sigil:        'rel_seal_keeper',
  rel_alms_purse:          'rel_fractured_cuirass',
  rel_wick_flask:          'rel_ember_shard',
  rel_tattered_breviary:   'rel_oath_fragment',
  rel_crown_of_echoes:     'rel_wardens_idol',
  rel_bleeding_icon:       'rel_bloodied_blade',
  rel_gilded_halo:         'rel_wardens_idol',
  rel_iron_merchants_seal: 'rel_seal_keeper',
  rel_sundered_oath:       'rel_oath_fragment',
  rel_reclaimed_vow:       'rel_oath_fragment',
  rel_hearth_of_sanctum:   'rel_burning_brand',
};

/** Resolve a game-id to a sheet key, applying aliases. Returns null if nothing matches. */
export function resolveSprite(id: string): string | null {
  if (SPRITES[id]) return id;
  const alias = SPRITE_ALIAS[id];
  if (alias && SPRITES[alias]) return alias;
  return null;
}
