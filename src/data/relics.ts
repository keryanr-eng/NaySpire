// EMBERVOW — Reliques.
// Les effets sont résolus par systems/combat.ts (crochets de combat)
// et state/game.ts (crochets de partie) en utilisant le champ 'hook' comme clef.

import type { RelicDef } from '../types';

const def = (r: RelicDef): RelicDef => r;

export const ALL_RELICS: RelicDef[] = [
  // --- DE DÉPART (liée à la classe) ---
  def({
    id: 'rel_shard_of_first_vow',
    name: 'Éclat du Premier Vœu',
    tier: 'starter',
    classId: 'vowbreaker',
    description: 'À ta première attaque de chaque tour, inflige +2 dégâts.',
    hook: 'first_attack_plus_2',
  }),
  def({
    id: 'rel_gavel_of_judgement',
    name: 'Maillet du Jugement',
    tier: 'starter',
    classId: 'sealbinder',
    description: 'La première fois que tu appliques un Sceau chaque tour, gagne 2 Garde.',
    hook: 'first_seal_per_turn_2_ward',
  }),
  def({
    id: 'rel_censer_of_echoes',
    name: 'Encensoir des Échos',
    tier: 'starter',
    classId: 'whisperer',
    description: 'Au début du combat, pioche 1 carte de plus.',
    hook: 'start_combat_draw_1',
  }),
  def({
    id: 'rel_oracle_lens',
    name: 'Lentille de l’Augure',
    tier: 'starter',
    classId: 'auger',
    description: 'Au début du combat, gagne 3 Garde.',
    hook: 'start_combat_3_ward',
  }),

  def({
    id: 'rel_bell_of_the_bound',
    name: 'Cloche des Liés',
    tier: 'starter',
    classId: 'summoner',
    description: 'Au début du combat, invoque 1 Serviteur lié.',
    hook: 'start_combat_summon_1',
  }),

  // --- COMMUNES ---
  def({ id: 'rel_pilgrims_bell',      name: 'Cloche du Pèlerin',    tier: 'common', description: 'Au début du combat, pioche 1.',                                               hook: 'start_combat_draw_1' }),
  def({ id: 'rel_oath_bracer',        name: 'Brassard du Serment',  tier: 'common', description: 'Au début du combat, gagne 2 Garde.',                                         hook: 'start_combat_2_ward' }),
  def({ id: 'rel_cinder_cloak',       name: 'Manteau de Cendres',   tier: 'common', description: 'Après chaque combat, soigne 2 PV.',                                          hook: 'heal_2_after_combat' }),
  def({ id: 'rel_hollow_chalice',     name: 'Calice Creux',         tier: 'common', description: 'La première fois que tu reçois un Statut, une Malédiction ou une carte injouable chaque combat, gagne 1 Braise.', hook: 'gain_1_ember_on_enemy_death' }),
  def({ id: 'rel_widow_stone',        name: 'Pierre de la Veuve',   tier: 'common', description: 'À ta première compétence de chaque tour, gagne +2 Garde.',                    hook: 'first_skill_plus_2_ward' }),
  def({ id: 'rel_rust_medallion',     name: 'Médaillon Rouillé',    tier: 'common', description: 'À ta première attaque de chaque tour, applique 1 Fragile.',                   hook: 'first_attack_per_turn_applies_1_brittle' }),

  // --- PEU COMMUNES ---
  def({ id: 'rel_brass_thurible',     name: 'Encensoir de Laiton',  tier: 'uncommon', description: 'Au début du combat, gagne 3 Garde.',                                        hook: 'start_combat_3_ward' }),
  def({ id: 'rel_ashworn_ring',       name: 'Anneau Cendreux',      tier: 'uncommon', description: '+7 PV max.',                                                                 hook: 'max_hp_plus_7' }),
  def({ id: 'rel_ember_thorn',        name: 'Ronce de Braise',      tier: 'uncommon', description: 'Le premier Saignement infligé chaque combat est doublé.',                    hook: 'double_first_bleed_per_combat' }),
  def({ id: 'rel_forged_sigil',       name: 'Sigille Forgée',       tier: 'uncommon', description: 'La première carte améliorée jouée chaque combat coûte 1 de moins.',          hook: 'upgraded_cards_cost_neg_1_once_per_combat' }),
  def({ id: 'rel_alms_purse',         name: 'Bourse d\u2019Aumônes', tier: 'uncommon', description: 'Gagne 25 % d\u2019or en plus.',                                             hook: 'gold_gain_plus_25pct' }),
  def({ id: 'rel_wick_flask',         name: 'Fiole à Mèche',        tier: 'uncommon', description: 'Ta première potion de chaque combat revient après usage.',                  hook: 'first_potion_each_combat_refills' }),
  def({ id: 'rel_tattered_breviary',  name: 'Bréviaire en Lambeaux',tier: 'uncommon', description: 'Chaque fois qu\u2019une carte est Bannie, gagne 1 Fracture.',                hook: 'whenever_banish_gain_1_fracture' }),

  // --- RARES ---
  def({ id: 'rel_crown_of_echoes',    name: 'Couronne d\u2019Échos',tier: 'rare', description: 'Au début de chaque tour, si ta main est vide, gagne 1 Braise.',                  hook: 'start_of_turn_gain_1_ember_if_0_cards_in_hand' }),
  def({ id: 'rel_bleeding_icon',      name: 'Icône Saignante',      tier: 'rare', description: 'Le Saignement inflige +1 dégât par tick.',                                       hook: 'bleed_tick_plus_1' }),
  def({ id: 'rel_gilded_halo',        name: 'Halo Doré',            tier: 'rare', description: 'Chaque fois que tu appliques un malus, gagne 1 Garde.',                          hook: 'whenever_status_applied_gain_1_ward' }),
  def({ id: 'rel_iron_merchants_seal',name: 'Sceau du Marchand de Fer',tier: 'rare', description: 'Tous les prix des boutiques sont réduits de 15 %.',                           hook: 'shop_prices_minus_15pct' }),

  // --- BOSS (récompense après le boss de l'Acte 1 ; reste un drop rare en MVP) ---
  def({ id: 'rel_sundered_oath',      name: 'Serment Brisé',        tier: 'boss', description: 'Au début de ton tour, si ta main compte 5+ cartes, gagne 1 Élan.',               hook: 'at_turn_start_if_hand_5_plus_gain_1_momentum' }),
  def({ id: 'rel_reclaimed_vow',      name: 'Vœu Repris',           tier: 'boss', description: 'Après avoir vaincu un boss, soin complet.',                                      hook: 'on_boss_complete_heal_full' }),
  def({ id: 'rel_hearth_of_sanctum',  name: 'Âtre du Sanctuaire',   tier: 'boss', description: 'Le repos soigne +10 PV.',                                                        hook: 'on_rest_heal_plus_10' }),
];

export const RELIC_MAP: Record<string, RelicDef> = Object.fromEntries(
  ALL_RELICS.map((r) => [r.id, r]),
);

export function getRelic(id: string): RelicDef {
  const r = RELIC_MAP[id];
  if (!r) throw new Error(`Unknown relic id: ${id}`);
  return r;
}

// Réservoir utilisable pour les récompenses génériques — exclut les reliques de départ.
export function relicRewardPool(): RelicDef[] {
  return ALL_RELICS.filter((r) => r.tier !== 'starter');
}
