// EMBERVOW — painted character portraits (PNG with alpha channel).
// These replace the inline SVG CharacterArt for the few characters we have
// finished illustrations for. Anything not listed here falls back to SVG.
// ---------------------------------------------------------------
// Player portraits, keyed by `playerArt` id used in Combat.tsx
// ---------------------------------------------------------------
export const PLAYER_PORTRAITS = {
    player_vowbreaker: {
        url: '/assets/generated/characters/vowbreaker.png',
        sheetW: 768,
        sheetH: 1024,
    },
    player_sealbinder: {
        url: '/assets/generated/characters/sealbinder.png',
        sheetW: 768,
        sheetH: 1024,
    },
    player_whisperer: {
        url: '/assets/generated/characters/whisperer.png',
        sheetW: 768,
        sheetH: 1024,
    },
    player_auger: {
        url: '/assets/generated/characters/auger.png',
        sheetW: 768,
        sheetH: 1024,
    },
    player_summoner: {
        url: '/assets/generated/characters/summoner.png',
        sheetW: 768,
        sheetH: 1024,
    },
};
// ---------------------------------------------------------------
// Enemy portraits, keyed by enemy `defId`.
// ---------------------------------------------------------------
const enemyPortrait = (file, mirrorInCombat = false) => ({
    url: `/assets/generated/enemies/${file}.png`,
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
export const ENEMY_PORTRAITS = {
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
export function getPlayerPortrait(id) {
    return PLAYER_PORTRAITS[id];
}
/**
 * Always returns a portrait. Unknown ids fall back to the armored rat for
 * "heavy"-sounding names, otherwise the flaming wick rat. Guarantees the
 * combat scene never silently drops to the SVG placeholder art.
 */
export function getEnemyPortrait(defId) {
    const direct = ENEMY_PORTRAITS[defId];
    if (direct)
        return direct;
    const heavy = /warden|choirmaster|guard|reliquary|broken/i.test(defId);
    return heavy ? RELIQUARY_GUARD_PORTRAIT : WICK_RAT_PORTRAIT;
}
