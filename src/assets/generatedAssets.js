import { publicAsset } from './paths';
export const POTION_ART = {
    pot_mend: publicAsset('assets/generated/potions/health_potion.png'),
    pot_surge: publicAsset('assets/generated/potions/ember_potion.png'),
    pot_insight: publicAsset('assets/generated/potions/insight_potion.png'),
    pot_flame: publicAsset('assets/generated/potions/flame_potion.png'),
    pot_iron: publicAsset('assets/generated/potions/iron_potion.png'),
    pot_fury: publicAsset('assets/generated/potions/fury_potion.png'),
    pot_brittle: publicAsset('assets/generated/potions/brittle_potion.png'),
    pot_seal: publicAsset('assets/generated/potions/seal_potion.png'),
    pot_cleanse: publicAsset('assets/generated/potions/cleanse_potion.png'),
    pot_last_breath: publicAsset('assets/generated/potions/last_breath_potion.png'),
};
export const RELIC_ART = {
    rel_shard_of_first_vow: publicAsset('assets/generated/relics/shard_of_first_vow.png'),
    rel_gavel_of_judgement: publicAsset('assets/generated/relics/gavel_of_judgement.png'),
    rel_censer_of_echoes: publicAsset('assets/generated/relics/censer_of_echoes.png'),
    rel_oracle_lens: publicAsset('assets/generated/relics/oracle_lens.png'),
    rel_bell_of_the_bound: publicAsset('assets/generated/relics/pilgrims_bell.png'),
    rel_pilgrims_bell: publicAsset('assets/generated/relics/pilgrims_bell.png'),
    rel_oath_bracer: publicAsset('assets/generated/relics/oath_bracer.png'),
    rel_cinder_cloak: publicAsset('assets/generated/relics/cinder_cloak.png'),
    rel_hollow_chalice: publicAsset('assets/generated/relics/hollow_chalice.png'),
    rel_widow_stone: publicAsset('assets/generated/relics/widow_stone.png'),
    rel_rust_medallion: publicAsset('assets/generated/relics/rust_medallion.png'),
    rel_brass_thurible: publicAsset('assets/generated/relics/brass_thurible.png'),
    rel_ashworn_ring: publicAsset('assets/generated/relics/ashworn_ring.png'),
    rel_ember_thorn: publicAsset('assets/generated/relics/ember_thorn.png'),
    rel_forged_sigil: publicAsset('assets/generated/relics/forged_sigil.png'),
    rel_alms_purse: publicAsset('assets/generated/relics/alms_purse.png'),
    rel_wick_flask: publicAsset('assets/generated/relics/wick_flask.png'),
    rel_tattered_breviary: publicAsset('assets/generated/relics/tattered_breviary.png'),
    rel_crown_of_echoes: publicAsset('assets/generated/relics/crown_of_echoes.png'),
    rel_bleeding_icon: publicAsset('assets/generated/relics/bleeding_icon.png'),
    rel_gilded_halo: publicAsset('assets/generated/relics/gilded_halo.png'),
    rel_iron_merchants_seal: publicAsset('assets/generated/relics/iron_merchants_seal.png'),
    rel_sundered_oath: publicAsset('assets/generated/relics/sundered_oath.png'),
    rel_reclaimed_vow: publicAsset('assets/generated/relics/reclaimed_vow.png'),
    rel_hearth_of_sanctum: publicAsset('assets/generated/relics/hearth_of_sanctum.png'),
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
