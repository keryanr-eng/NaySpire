// EMBERVOW — painted character portraits (PNG with alpha channel).
// These replace the inline SVG CharacterArt for the few characters we have
// finished illustrations for. Anything not listed here falls back to SVG.

export type PortraitRect = { x: number; y: number; w: number; h: number };

import { publicAsset } from './paths';

export interface Portrait {
  /** Absolute URL (served from /public) */
  url: string;
  /** Natural size of the source image. */
  sheetW: number;
  sheetH: number;
  /** Optional crop within the image. Defaults to the full sheet. */
  rect?: PortraitRect;
  /** Flip horizontally when the portrait is placed on the enemy side. */
  mirrorInCombat?: boolean;
}

// ---------------------------------------------------------------
// Player portraits, keyed by `playerArt` id used in Combat.tsx
// ---------------------------------------------------------------
export const PLAYER_PORTRAITS: Record<string, Portrait> = {
  player_vowbreaker: {
    url: publicAsset('assets/generated/characters/vowbreaker.png'),
    sheetW: 768,
    sheetH: 1024,
  },
  player_sealbinder: {
    url: publicAsset('assets/generated/characters/sealbinder.png'),
    sheetW: 768,
    sheetH: 1024,
  },
  player_whisperer: {
    url: publicAsset('assets/generated/characters/whisperer.png'),
    sheetW: 768,
    sheetH: 1024,
  },
  player_auger: {
    url: publicAsset('assets/generated/characters/auger.png'),
    sheetW: 768,
    sheetH: 1024,
  },
  player_summoner: {
    url: publicAsset('assets/generated/characters/summoner.png'),
    sheetW: 768,
    sheetH: 1024,
  },
};

// ---------------------------------------------------------------
// Enemy portraits, keyed by enemy `defId`.
// ---------------------------------------------------------------
const enemyPortrait = (file: string, mirrorInCombat = false): Portrait => ({
  url: publicAsset(`assets/generated/enemies/${file}.png`),
  sheetW: 768,
  sheetH: 768,
  mirrorInCombat,
});

const ASH_PILGRIM_PORTRAIT = enemyPortrait('ash_pilgrim', true);
const WICK_RAT_PORTRAIT = enemyPortrait('wick_rat');
const SCONCE_IMP_PORTRAIT = enemyPortrait('sconce_imp');
const HOLLOW_CHANTER_PORTRAIT = enemyPortrait('hollow_chanter', true);
const RELIQUARY_GUARD_PORTRAIT = enemyPortrait('reliquary_guard', true);
const SPLINTER_SHADE_PORTRAIT = enemyPortrait('splinter_shade');

export const ENEMY_PORTRAITS: Record<string, Portrait> = {
  // Top half — the flaming rat. Small / fast / zealot enemies.
  e_wick_rat: WICK_RAT_PORTRAIT,
  e_ash_pilgrim: ASH_PILGRIM_PORTRAIT,
  e_sconce_imp: SCONCE_IMP_PORTRAIT,
  e_hollow_chanter: HOLLOW_CHANTER_PORTRAIT,
  e_splinter_shade: SPLINTER_SHADE_PORTRAIT,
  e_candlewight: SPLINTER_SHADE_PORTRAIT,
  // Bottom half — the armored spiked rat. Heavy / elite / boss enemies.
  e_reliquary_guard: RELIQUARY_GUARD_PORTRAIT,
  e_limb_of_choir: HOLLOW_CHANTER_PORTRAIT,
  e_warden_of_ashes: RELIQUARY_GUARD_PORTRAIT,
  e_matron_of_bells: HOLLOW_CHANTER_PORTRAIT,
  e_mouth_of_the_vault: SPLINTER_SHADE_PORTRAIT,
  e_broken_choirmaster: RELIQUARY_GUARD_PORTRAIT,
};

export function getPlayerPortrait(id: string): Portrait | undefined {
  return PLAYER_PORTRAITS[id];
}
/**
 * Always returns a portrait. Unknown ids fall back to the armored rat for
 * "heavy"-sounding names, otherwise the flaming wick rat. Guarantees the
 * combat scene never silently drops to the SVG placeholder art.
 */
export function getEnemyPortrait(defId: string): Portrait {
  const direct = ENEMY_PORTRAITS[defId];
  if (direct) return direct;
  const heavy = /warden|choirmaster|guard|reliquary|broken/i.test(defId);
  return heavy ? RELIQUARY_GUARD_PORTRAIT : WICK_RAT_PORTRAIT;
}

