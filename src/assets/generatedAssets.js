export const POTION_ART = {
    pot_mend: '/assets/generated/potions/health_potion.png',
    pot_surge: '/assets/generated/potions/ember_potion.png',
    pot_insight: '/assets/generated/potions/insight_potion.png',
    pot_flame: '/assets/generated/potions/flame_potion.png',
    pot_iron: '/assets/generated/potions/iron_potion.png',
    pot_fury: '/assets/generated/potions/fury_potion.png',
    pot_brittle: '/assets/generated/potions/brittle_potion.png',
    pot_seal: '/assets/generated/potions/seal_potion.png',
    pot_cleanse: '/assets/generated/potions/cleanse_potion.png',
    pot_last_breath: '/assets/generated/potions/last_breath_potion.png',
};
export const RELIC_ART = {
    rel_shard_of_first_vow: '/assets/generated/relics/shard_of_first_vow.png',
    rel_gavel_of_judgement: '/assets/generated/relics/gavel_of_judgement.png',
    rel_censer_of_echoes: '/assets/generated/relics/censer_of_echoes.png',
    rel_oracle_lens: '/assets/generated/relics/oracle_lens.png',
    rel_bell_of_the_bound: '/assets/generated/relics/pilgrims_bell.png',
    rel_pilgrims_bell: '/assets/generated/relics/pilgrims_bell.png',
    rel_oath_bracer: '/assets/generated/relics/oath_bracer.png',
    rel_cinder_cloak: '/assets/generated/relics/cinder_cloak.png',
    rel_hollow_chalice: '/assets/generated/relics/hollow_chalice.png',
    rel_widow_stone: '/assets/generated/relics/widow_stone.png',
    rel_rust_medallion: '/assets/generated/relics/rust_medallion.png',
    rel_brass_thurible: '/assets/generated/relics/brass_thurible.png',
    rel_ashworn_ring: '/assets/generated/relics/ashworn_ring.png',
    rel_ember_thorn: '/assets/generated/relics/ember_thorn.png',
    rel_forged_sigil: '/assets/generated/relics/forged_sigil.png',
    rel_alms_purse: '/assets/generated/relics/alms_purse.png',
    rel_wick_flask: '/assets/generated/relics/wick_flask.png',
    rel_tattered_breviary: '/assets/generated/relics/tattered_breviary.png',
    rel_crown_of_echoes: '/assets/generated/relics/crown_of_echoes.png',
    rel_bleeding_icon: '/assets/generated/relics/bleeding_icon.png',
    rel_gilded_halo: '/assets/generated/relics/gilded_halo.png',
    rel_iron_merchants_seal: '/assets/generated/relics/iron_merchants_seal.png',
    rel_sundered_oath: '/assets/generated/relics/sundered_oath.png',
    rel_reclaimed_vow: '/assets/generated/relics/reclaimed_vow.png',
    rel_hearth_of_sanctum: '/assets/generated/relics/hearth_of_sanctum.png',
};
export function getPotionArt(id) {
    return id ? POTION_ART[id] : undefined;
}
export function getRelicArt(id) {
    return id ? RELIC_ART[id] : undefined;
}
export function getItemArt(id) {
    if (!id)
        return undefined;
    return POTION_ART[id] ?? RELIC_ART[id];
}
