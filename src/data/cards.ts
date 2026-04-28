// EMBERVOW — définitions de cartes.
// Chaque carte est une entrée de données pure. Les effets runtime sont interprétés par systems/combat.ts.
// Les améliorations sont écrites comme entrées séparées pour garder les patchs chirurgicaux.

import type { CardDef } from '../types';

const def = (c: CardDef): CardDef => c;

// =======================================================
// CARTES NEUTRES / STATUT / MALÉDICTION
// =======================================================

const NEUTRAL: CardDef[] = [
  def({
    id: 'neutral_ignite_flask',
    name: 'Fiole de Braise', cost: 1, type: 'skill', rarity: 'uncommon', classId: 'neutral', target: 'enemy',
    text: 'Applique 3 Embrasement.',
    ops: [{ kind: 'status', id: 'ignite', amount: 3, target: 'enemy' }],
    upgradeTo: 'neutral_ignite_flask_p',
  }),
  def({
    id: 'neutral_ignite_flask_p',
    name: 'Fiole de Braise+', cost: 1, type: 'skill', rarity: 'uncommon', classId: 'neutral', target: 'enemy',
    text: 'Applique 5 Embrasement.',
    ops: [{ kind: 'status', id: 'ignite', amount: 5, target: 'enemy' }],
    upgradeOf: 'neutral_ignite_flask',
  }),
  def({
    id: 'neutral_stolen_prayer',
    name: 'Prière Volée', cost: 0, type: 'skill', rarity: 'rare', classId: 'neutral', target: 'none',
    text: 'Pioche 2. Bannir.',
    ops: [{ kind: 'draw', amount: 2 }], exhaust: true,
    upgradeTo: 'neutral_stolen_prayer_p',
  }),
  def({
    id: 'neutral_stolen_prayer_p',
    name: 'Prière Volée+', cost: 0, type: 'skill', rarity: 'rare', classId: 'neutral', target: 'none',
    text: 'Pioche 3. Bannir.',
    ops: [{ kind: 'draw', amount: 3 }], exhaust: true,
    upgradeOf: 'neutral_stolen_prayer',
  }),
  def({
    id: 'neutral_iron_will',
    name: 'Volonté de Fer', cost: 1, type: 'skill', rarity: 'common', classId: 'neutral', target: 'self',
    text: 'Gagne 6 Garde.',
    ops: [{ kind: 'ward', amount: 6 }],
    upgradeTo: 'neutral_iron_will_p',
  }),
  def({
    id: 'neutral_iron_will_p',
    name: 'Volonté de Fer+', cost: 1, type: 'skill', rarity: 'common', classId: 'neutral', target: 'self',
    text: 'Gagne 9 Garde.',
    ops: [{ kind: 'ward', amount: 9 }],
    upgradeOf: 'neutral_iron_will',
  }),
];

// Malédictions : encombrent le deck, seule une Bannissement ou un retrait dédié peut les effacer.
const CURSES: CardDef[] = [
  def({
    id: 'curse_regret',
    name: 'Regret', cost: 1, type: 'curse', rarity: 'curse', classId: 'status', target: 'none',
    text: 'Injouable. Perds 2 PV quand piochée.',
    ops: [],
  }),
  def({
    id: 'curse_ember_burn',
    name: 'Brûlure de Braise', cost: 0, type: 'curse', rarity: 'curse', classId: 'status', target: 'none',
    text: 'Injouable. À la fin du tour, subis 2 dégâts si en main.',
    ops: [],
  }),
];

// Cartes de statut générées en plein combat
const STATUS: CardDef[] = [
  def({
    id: 'status_dross',
    name: 'Scories', cost: -1, type: 'status', rarity: 'status', classId: 'status', target: 'none',
    text: 'Injouable. Est bannie à la fin du tour.',
    ops: [],
    ethereal: true,
  }),
  def({
    id: 'status_spark',
    name: 'Étincelle', cost: 0, type: 'skill', rarity: 'special', classId: 'status', target: 'enemy',
    text: 'Inflige 3 dégâts. Bannir.',
    ops: [{ kind: 'damage', amount: 3 }], exhaust: true,
  }),
];

// =======================================================
// BRISEUR DE VŒUX — Échelle Fracture / Saignement / Furie.
// Signature : compteur de Fracture (statut personnel cumulable). Beaucoup de cartes dépensent la Fracture.
// =======================================================

const VOWBREAKER: CardDef[] = [
  // Cartes de départ
  def({
    id: 'vb_cleave',
    name: 'Taillade', cost: 1, type: 'attack', rarity: 'starter', classId: 'vowbreaker', target: 'enemy',
    text: 'Inflige 6 dégâts.',
    ops: [{ kind: 'damage', amount: 6 }],
    upgradeTo: 'vb_cleave_p',
  }),
  def({
    id: 'vb_cleave_p',
    name: 'Taillade+', cost: 1, type: 'attack', rarity: 'starter', classId: 'vowbreaker', target: 'enemy',
    text: 'Inflige 9 dégâts.',
    ops: [{ kind: 'damage', amount: 9 }],
    upgradeOf: 'vb_cleave',
  }),
  def({
    id: 'vb_brace',
    name: 'Renforcement', cost: 1, type: 'skill', rarity: 'starter', classId: 'vowbreaker', target: 'self',
    text: 'Gagne 5 Garde.',
    ops: [{ kind: 'ward', amount: 5 }],
    upgradeTo: 'vb_brace_p',
  }),
  def({
    id: 'vb_brace_p',
    name: 'Renforcement+', cost: 1, type: 'skill', rarity: 'starter', classId: 'vowbreaker', target: 'self',
    text: 'Gagne 8 Garde.',
    ops: [{ kind: 'ward', amount: 8 }],
    upgradeOf: 'vb_brace',
  }),
  def({
    id: 'vb_hollow_strike',
    name: 'Frappe Creuse', cost: 1, type: 'attack', rarity: 'starter', classId: 'vowbreaker', target: 'enemy',
    text: 'Inflige 5 dégâts. Gagne 1 Fracture.',
    ops: [
      { kind: 'damage', amount: 5 },
      { kind: 'status', id: 'fracture', amount: 1, target: 'self' },
    ],
    upgradeTo: 'vb_hollow_strike_p',
  }),
  def({
    id: 'vb_hollow_strike_p',
    name: 'Frappe Creuse+', cost: 1, type: 'attack', rarity: 'starter', classId: 'vowbreaker', target: 'enemy',
    text: 'Inflige 7 dégâts. Gagne 2 Fracture.',
    ops: [
      { kind: 'damage', amount: 7 },
      { kind: 'status', id: 'fracture', amount: 2, target: 'self' },
    ],
    upgradeOf: 'vb_hollow_strike',
  }),

  // Communes
  def({
    id: 'vb_vengeful_cut',
    name: 'Entaille Vengeresse', cost: 1, type: 'attack', rarity: 'common', classId: 'vowbreaker', target: 'enemy',
    text: 'Inflige 7 dégâts. Si la cible saigne, inflige 4 de plus.',
    ops: [
      { kind: 'damage', amount: 7 },
      { kind: 'if_has_status', id: 'bleed', target: 'enemy', then: [{ kind: 'damage', amount: 4 }] },
    ],
    upgradeTo: 'vb_vengeful_cut_p',
  }),
  def({
    id: 'vb_vengeful_cut_p',
    name: 'Entaille Vengeresse+', cost: 1, type: 'attack', rarity: 'common', classId: 'vowbreaker', target: 'enemy',
    text: 'Inflige 9 dégâts. Si la cible saigne, inflige 6 de plus.',
    ops: [
      { kind: 'damage', amount: 9 },
      { kind: 'if_has_status', id: 'bleed', target: 'enemy', then: [{ kind: 'damage', amount: 6 }] },
    ],
    upgradeOf: 'vb_vengeful_cut',
  }),
  def({
    id: 'vb_gore',
    name: 'Encornage', cost: 1, type: 'attack', rarity: 'common', classId: 'vowbreaker', target: 'enemy',
    text: 'Inflige 6 dégâts. Applique 2 Saignement.',
    ops: [{ kind: 'damage', amount: 6 }, { kind: 'status', id: 'bleed', amount: 2, target: 'enemy' }],
    upgradeTo: 'vb_gore_p',
  }),
  def({
    id: 'vb_gore_p',
    name: 'Encornage+', cost: 1, type: 'attack', rarity: 'common', classId: 'vowbreaker', target: 'enemy',
    text: 'Inflige 8 dégâts. Applique 3 Saignement.',
    ops: [{ kind: 'damage', amount: 8 }, { kind: 'status', id: 'bleed', amount: 3, target: 'enemy' }],
    upgradeOf: 'vb_gore',
  }),
  def({
    id: 'vb_double_cleave',
    name: 'Double Taillade', cost: 1, type: 'attack', rarity: 'common', classId: 'vowbreaker', target: 'enemy',
    text: 'Inflige 4 dégâts deux fois.',
    ops: [{ kind: 'damage', amount: 4, hits: 2 }],
    upgradeTo: 'vb_double_cleave_p',
  }),
  def({
    id: 'vb_double_cleave_p',
    name: 'Double Taillade+', cost: 1, type: 'attack', rarity: 'common', classId: 'vowbreaker', target: 'enemy',
    text: 'Inflige 5 dégâts deux fois.',
    ops: [{ kind: 'damage', amount: 5, hits: 2 }],
    upgradeOf: 'vb_double_cleave',
  }),
  def({
    id: 'vb_iron_devotion',
    name: 'Dévotion de Fer', cost: 1, type: 'power', rarity: 'common', classId: 'vowbreaker', target: 'self',
    text: 'Gagne 2 Furie.',
    ops: [{ kind: 'status', id: 'fury', amount: 2, target: 'self' }],
    upgradeTo: 'vb_iron_devotion_p',
  }),
  def({
    id: 'vb_iron_devotion_p',
    name: 'Dévotion de Fer+', cost: 1, type: 'power', rarity: 'common', classId: 'vowbreaker', target: 'self',
    text: 'Gagne 3 Furie.',
    ops: [{ kind: 'status', id: 'fury', amount: 3, target: 'self' }],
    upgradeOf: 'vb_iron_devotion',
  }),
  def({
    id: 'vb_deflect',
    name: 'Parade', cost: 1, type: 'skill', rarity: 'common', classId: 'vowbreaker', target: 'self',
    text: 'Gagne 6 Garde. Pioche 1.',
    ops: [{ kind: 'ward', amount: 6 }, { kind: 'draw', amount: 1 }],
    upgradeTo: 'vb_deflect_p',
  }),
  def({
    id: 'vb_deflect_p',
    name: 'Parade+', cost: 1, type: 'skill', rarity: 'common', classId: 'vowbreaker', target: 'self',
    text: 'Gagne 9 Garde. Pioche 1.',
    ops: [{ kind: 'ward', amount: 9 }, { kind: 'draw', amount: 1 }],
    upgradeOf: 'vb_deflect',
  }),
  def({
    id: 'vb_defiant_roar',
    name: 'Rugissement Défiant', cost: 1, type: 'skill', rarity: 'common', classId: 'vowbreaker', target: 'all_enemies',
    text: 'Applique 2 Flétri à TOUS les ennemis.',
    ops: [{ kind: 'status', id: 'faded', amount: 2, target: 'all_enemies' }],
    upgradeTo: 'vb_defiant_roar_p',
  }),
  def({
    id: 'vb_defiant_roar_p',
    name: 'Rugissement Défiant+', cost: 1, type: 'skill', rarity: 'common', classId: 'vowbreaker', target: 'all_enemies',
    text: 'Applique 3 Flétri à TOUS les ennemis.',
    ops: [{ kind: 'status', id: 'faded', amount: 3, target: 'all_enemies' }],
    upgradeOf: 'vb_defiant_roar',
  }),
  def({
    id: 'vb_bloodletter',
    name: 'Saignée', cost: 1, type: 'skill', rarity: 'common', classId: 'vowbreaker', target: 'self',
    text: 'Perds 3 PV. Pioche 3.',
    ops: [{ kind: 'lose_hp', amount: 3 }, { kind: 'draw', amount: 3 }],
    upgradeTo: 'vb_bloodletter_p',
  }),
  def({
    id: 'vb_bloodletter_p',
    name: 'Saignée+', cost: 0, type: 'skill', rarity: 'common', classId: 'vowbreaker', target: 'self',
    text: 'Perds 3 PV. Pioche 3.',
    ops: [{ kind: 'lose_hp', amount: 3 }, { kind: 'draw', amount: 3 }],
    upgradeOf: 'vb_bloodletter',
  }),
  def({
    id: 'vb_pyre_slash',
    name: 'Taillade Ardente', cost: 2, type: 'attack', rarity: 'common', classId: 'vowbreaker', target: 'enemy',
    text: 'Inflige 11 dégâts. Applique 2 Embrasement.',
    ops: [{ kind: 'damage', amount: 11 }, { kind: 'status', id: 'ignite', amount: 2, target: 'enemy' }],
    upgradeTo: 'vb_pyre_slash_p',
  }),
  def({
    id: 'vb_pyre_slash_p',
    name: 'Taillade Ardente+', cost: 2, type: 'attack', rarity: 'common', classId: 'vowbreaker', target: 'enemy',
    text: 'Inflige 14 dégâts. Applique 3 Embrasement.',
    ops: [{ kind: 'damage', amount: 14 }, { kind: 'status', id: 'ignite', amount: 3, target: 'enemy' }],
    upgradeOf: 'vb_pyre_slash',
  }),
  def({
    id: 'vb_scar_collector',
    name: 'Collectionneur de Cicatrices', cost: 1, type: 'power', rarity: 'common', classId: 'vowbreaker', target: 'self',
    text: 'Chaque fois que tu perds des PV, gagne 1 Fracture.',
    ops: [{ kind: 'status', id: 'fracture', amount: 0, target: 'self' }],
    tags: ['hook:lose_hp_gain_fracture'],
    upgradeTo: 'vb_scar_collector_p',
  }),
  def({
    id: 'vb_scar_collector_p',
    name: 'Collectionneur de Cicatrices+', cost: 1, type: 'power', rarity: 'common', classId: 'vowbreaker', target: 'self',
    text: 'Chaque fois que tu perds des PV, gagne 2 Fracture.',
    ops: [],
    tags: ['hook:lose_hp_gain_fracture_2'],
    upgradeOf: 'vb_scar_collector',
  }),

  // Peu communes
  def({
    id: 'vb_sundering_blow',
    name: 'Coup Fracassant', cost: 2, type: 'attack', rarity: 'uncommon', classId: 'vowbreaker', target: 'enemy',
    text: 'Inflige 12 dégâts. Applique 2 Fragile.',
    ops: [{ kind: 'damage', amount: 12 }, { kind: 'status', id: 'brittle', amount: 2, target: 'enemy' }],
    upgradeTo: 'vb_sundering_blow_p',
  }),
  def({
    id: 'vb_sundering_blow_p',
    name: 'Coup Fracassant+', cost: 2, type: 'attack', rarity: 'uncommon', classId: 'vowbreaker', target: 'enemy',
    text: 'Inflige 15 dégâts. Applique 3 Fragile.',
    ops: [{ kind: 'damage', amount: 15 }, { kind: 'status', id: 'brittle', amount: 3, target: 'enemy' }],
    upgradeOf: 'vb_sundering_blow',
  }),
  def({
    id: 'vb_wound_ritual',
    name: 'Rituel des Plaies', cost: 1, type: 'skill', rarity: 'uncommon', classId: 'vowbreaker', target: 'all_enemies',
    text: 'Double le Saignement sur TOUS les ennemis.',
    ops: [{ kind: 'double_status', id: 'bleed', target: 'all_enemies' }],
    upgradeTo: 'vb_wound_ritual_p',
  }),
  def({
    id: 'vb_wound_ritual_p',
    name: 'Rituel des Plaies+', cost: 0, type: 'skill', rarity: 'uncommon', classId: 'vowbreaker', target: 'all_enemies',
    text: 'Double le Saignement sur TOUS les ennemis.',
    ops: [{ kind: 'double_status', id: 'bleed', target: 'all_enemies' }],
    upgradeOf: 'vb_wound_ritual',
  }),
  def({
    id: 'vb_thunder_vow',
    name: 'Vœu de Tonnerre', cost: 1, type: 'attack', rarity: 'uncommon', classId: 'vowbreaker', target: 'all_enemies',
    text: 'Inflige 4 dégâts à TOUS les ennemis.',
    ops: [{ kind: 'damage', amount: 4, target: 'all_enemies' }],
    upgradeTo: 'vb_thunder_vow_p',
  }),
  def({
    id: 'vb_thunder_vow_p',
    name: 'Vœu de Tonnerre+', cost: 1, type: 'attack', rarity: 'uncommon', classId: 'vowbreaker', target: 'all_enemies',
    text: 'Inflige 6 dégâts à TOUS les ennemis.',
    ops: [{ kind: 'damage', amount: 6, target: 'all_enemies' }],
    upgradeOf: 'vb_thunder_vow',
  }),
  def({
    id: 'vb_relentless',
    name: 'Implacable', cost: 1, type: 'power', rarity: 'uncommon', classId: 'vowbreaker', target: 'self',
    text: 'Au début de chaque tour, gagne 1 Fracture.',
    ops: [],
    tags: ['hook:turn_start_gain_fracture_1'],
    upgradeTo: 'vb_relentless_p',
  }),
  def({
    id: 'vb_relentless_p',
    name: 'Implacable+', cost: 1, type: 'power', rarity: 'uncommon', classId: 'vowbreaker', target: 'self',
    text: 'Au début de chaque tour, gagne 2 Fracture.',
    ops: [],
    tags: ['hook:turn_start_gain_fracture_2'],
    upgradeOf: 'vb_relentless',
  }),
  def({
    id: 'vb_empty_cup',
    name: 'Coupe Vide', cost: -1, type: 'skill', rarity: 'uncommon', classId: 'vowbreaker', target: 'self',
    text: 'Gagne X×4 Garde.',
    ops: [],
    tags: ['x:empty_cup'],
    upgradeTo: 'vb_empty_cup_p',
  }),
  def({
    id: 'vb_empty_cup_p',
    name: 'Coupe Vide+', cost: -1, type: 'skill', rarity: 'uncommon', classId: 'vowbreaker', target: 'self',
    text: 'Gagne X×5 Garde.',
    ops: [],
    tags: ['x:empty_cup_p'],
    upgradeOf: 'vb_empty_cup',
  }),
  def({
    id: 'vb_pact_of_iron',
    name: 'Pacte de Fer', cost: 2, type: 'skill', rarity: 'uncommon', classId: 'vowbreaker', target: 'self',
    text: 'Gagne 10 Garde. Gagne 1 Aplomb.',
    ops: [{ kind: 'ward', amount: 10 }, { kind: 'status', id: 'poise', amount: 1, target: 'self' }],
    upgradeTo: 'vb_pact_of_iron_p',
  }),
  def({
    id: 'vb_pact_of_iron_p',
    name: 'Pacte de Fer+', cost: 2, type: 'skill', rarity: 'uncommon', classId: 'vowbreaker', target: 'self',
    text: 'Gagne 13 Garde. Gagne 2 Aplomb.',
    ops: [{ kind: 'ward', amount: 13 }, { kind: 'status', id: 'poise', amount: 2, target: 'self' }],
    upgradeOf: 'vb_pact_of_iron',
  }),
  def({
    id: 'vb_ember_blade',
    name: 'Lame de Braise', cost: 1, type: 'attack', rarity: 'uncommon', classId: 'vowbreaker', target: 'enemy',
    text: 'Inflige 8 dégâts. Ajoute une Étincelle à ta main. Bannir.',
    ops: [
      { kind: 'damage', amount: 8 },
      { kind: 'add_card_to_hand', cardId: 'status_spark', amount: 1 },
    ],
    exhaust: true,
    upgradeTo: 'vb_ember_blade_p',
  }),
  def({
    id: 'vb_ember_blade_p',
    name: 'Lame de Braise+', cost: 1, type: 'attack', rarity: 'uncommon', classId: 'vowbreaker', target: 'enemy',
    text: 'Inflige 11 dégâts. Ajoute 2 Étincelles à ta main. Bannir.',
    ops: [
      { kind: 'damage', amount: 11 },
      { kind: 'add_card_to_hand', cardId: 'status_spark', amount: 2 },
    ],
    exhaust: true,
    upgradeOf: 'vb_ember_blade',
  }),

  // Rares
  def({
    id: 'vb_final_vow',
    name: 'Vœu Ultime', cost: 2, type: 'attack', rarity: 'rare', classId: 'vowbreaker', target: 'enemy',
    text: 'Inflige 22 dégâts. Bannir.',
    ops: [{ kind: 'damage', amount: 22 }], exhaust: true,
    upgradeTo: 'vb_final_vow_p',
  }),
  def({
    id: 'vb_final_vow_p',
    name: 'Vœu Ultime+', cost: 2, type: 'attack', rarity: 'rare', classId: 'vowbreaker', target: 'enemy',
    text: 'Inflige 28 dégâts. Bannir.',
    ops: [{ kind: 'damage', amount: 28 }], exhaust: true,
    upgradeOf: 'vb_final_vow',
  }),
  def({
    id: 'vb_crown_of_ash',
    name: 'Couronne de Cendres', cost: 2, type: 'power', rarity: 'rare', classId: 'vowbreaker', target: 'self',
    text: 'Gagne 3 Furie. Applique 2 Flétri à TOUS les ennemis.',
    ops: [
      { kind: 'status', id: 'fury', amount: 3, target: 'self' },
      { kind: 'status', id: 'faded', amount: 2, target: 'all_enemies' },
    ],
    upgradeTo: 'vb_crown_of_ash_p',
  }),
  def({
    id: 'vb_crown_of_ash_p',
    name: 'Couronne de Cendres+', cost: 2, type: 'power', rarity: 'rare', classId: 'vowbreaker', target: 'self',
    text: 'Gagne 4 Furie. Applique 3 Flétri à TOUS les ennemis.',
    ops: [
      { kind: 'status', id: 'fury', amount: 4, target: 'self' },
      { kind: 'status', id: 'faded', amount: 3, target: 'all_enemies' },
    ],
    upgradeOf: 'vb_crown_of_ash',
  }),
  def({
    id: 'vb_sanguine_rite',
    name: 'Rite Sanguinaire', cost: 2, type: 'power', rarity: 'rare', classId: 'vowbreaker', target: 'self',
    text: 'Chaque fois qu\u2019un ennemi meurt, gagne 2 Fracture et soigne 3 PV.',
    ops: [],
    tags: ['hook:kill_gain_fracture_heal'],
    upgradeTo: 'vb_sanguine_rite_p',
  }),
  def({
    id: 'vb_sanguine_rite_p',
    name: 'Rite Sanguinaire+', cost: 1, type: 'power', rarity: 'rare', classId: 'vowbreaker', target: 'self',
    text: 'Chaque fois qu\u2019un ennemi meurt, gagne 2 Fracture et soigne 3 PV.',
    ops: [],
    tags: ['hook:kill_gain_fracture_heal'],
    upgradeOf: 'vb_sanguine_rite',
  }),
  def({
    id: 'vb_fracture_unleashed',
    name: 'Fracture Libérée', cost: 2, type: 'attack', rarity: 'rare', classId: 'vowbreaker', target: 'enemy',
    text: 'Inflige 3 dégâts par Fracture que tu as. Perds toute ta Fracture.',
    ops: [],
    tags: ['x:fracture_unleashed'],
    upgradeTo: 'vb_fracture_unleashed_p',
  }),
  def({
    id: 'vb_fracture_unleashed_p',
    name: 'Fracture Libérée+', cost: 2, type: 'attack', rarity: 'rare', classId: 'vowbreaker', target: 'enemy',
    text: 'Inflige 4 dégâts par Fracture que tu as. Perds toute ta Fracture.',
    ops: [],
    tags: ['x:fracture_unleashed_p'],
    upgradeOf: 'vb_fracture_unleashed',
  }),
  def({
    id: 'vb_devour',
    name: 'Dévorer', cost: 1, type: 'attack', rarity: 'rare', classId: 'vowbreaker', target: 'enemy',
    text: 'Inflige 7 dégâts. Si cela tue, ajoute une copie à ta main.',
    ops: [{ kind: 'damage', amount: 7 }],
    tags: ['hook:devour'],
    upgradeTo: 'vb_devour_p',
  }),
  def({
    id: 'vb_devour_p',
    name: 'Dévorer+', cost: 1, type: 'attack', rarity: 'rare', classId: 'vowbreaker', target: 'enemy',
    text: 'Inflige 9 dégâts. Si cela tue, ajoute une copie à ta main.',
    ops: [{ kind: 'damage', amount: 9 }],
    tags: ['hook:devour'],
    upgradeOf: 'vb_devour',
  }),
];

// =======================================================
// LIEUR DE SCEAUX — Charges de Sceau + contrôle Garde/malus.
// Signature : applique Sceau. Certaines cartes consomment les Sceaux pour effets bonus.
// =======================================================

const SEALBINDER: CardDef[] = [
  // Cartes de départ
  def({
    id: 'sb_toll',
    name: 'Glas', cost: 1, type: 'attack', rarity: 'starter', classId: 'sealbinder', target: 'enemy',
    text: 'Inflige 5 dégâts. Applique 1 Sceau.',
    ops: [
      { kind: 'damage', amount: 5 },
      { kind: 'status', id: 'seal', amount: 1, target: 'enemy' },
    ],
    upgradeTo: 'sb_toll_p',
  }),
  def({
    id: 'sb_toll_p',
    name: 'Glas+', cost: 1, type: 'attack', rarity: 'starter', classId: 'sealbinder', target: 'enemy',
    text: 'Inflige 7 dégâts. Applique 1 Sceau.',
    ops: [
      { kind: 'damage', amount: 7 },
      { kind: 'status', id: 'seal', amount: 1, target: 'enemy' },
    ],
    upgradeOf: 'sb_toll',
  }),
  def({
    id: 'sb_veil',
    name: 'Voile', cost: 1, type: 'skill', rarity: 'starter', classId: 'sealbinder', target: 'self',
    text: 'Gagne 5 Garde.',
    ops: [{ kind: 'ward', amount: 5 }],
    upgradeTo: 'sb_veil_p',
  }),
  def({
    id: 'sb_veil_p',
    name: 'Voile+', cost: 1, type: 'skill', rarity: 'starter', classId: 'sealbinder', target: 'self',
    text: 'Gagne 8 Garde.',
    ops: [{ kind: 'ward', amount: 8 }],
    upgradeOf: 'sb_veil',
  }),
  def({
    id: 'sb_bind',
    name: 'Lier', cost: 1, type: 'skill', rarity: 'starter', classId: 'sealbinder', target: 'enemy',
    text: 'Gagne 4 Garde. Applique 1 Sceau.',
    ops: [
      { kind: 'ward', amount: 4 },
      { kind: 'status', id: 'seal', amount: 1, target: 'enemy' },
    ],
    upgradeTo: 'sb_bind_p',
  }),
  def({
    id: 'sb_bind_p',
    name: 'Lier+', cost: 1, type: 'skill', rarity: 'starter', classId: 'sealbinder', target: 'enemy',
    text: 'Gagne 6 Garde. Applique 2 Sceau.',
    ops: [
      { kind: 'ward', amount: 6 },
      { kind: 'status', id: 'seal', amount: 2, target: 'enemy' },
    ],
    upgradeOf: 'sb_bind',
  }),

  // Communes
  def({
    id: 'sb_judgement',
    name: 'Jugement', cost: 1, type: 'attack', rarity: 'common', classId: 'sealbinder', target: 'enemy',
    text: 'Inflige 4 dégâts. Inflige 2 de plus par Sceau sur la cible.',
    ops: [
      { kind: 'damage', amount: 4 },
      { kind: 'per_target_status', id: 'seal', target: 'enemy', then: { kind: 'damage', amount: 2 } },
    ],
    upgradeTo: 'sb_judgement_p',
  }),
  def({
    id: 'sb_judgement_p',
    name: 'Jugement+', cost: 1, type: 'attack', rarity: 'common', classId: 'sealbinder', target: 'enemy',
    text: 'Inflige 6 dégâts. Inflige 3 de plus par Sceau sur la cible.',
    ops: [
      { kind: 'damage', amount: 6 },
      { kind: 'per_target_status', id: 'seal', target: 'enemy', then: { kind: 'damage', amount: 3 } },
    ],
    upgradeOf: 'sb_judgement',
  }),
  def({
    id: 'sb_hallowed_ward',
    name: 'Garde Sanctifiée', cost: 1, type: 'skill', rarity: 'common', classId: 'sealbinder', target: 'self',
    text: 'Gagne 7 Garde.',
    ops: [{ kind: 'ward', amount: 7 }],
    upgradeTo: 'sb_hallowed_ward_p',
  }),
  def({
    id: 'sb_hallowed_ward_p',
    name: 'Garde Sanctifiée+', cost: 1, type: 'skill', rarity: 'common', classId: 'sealbinder', target: 'self',
    text: 'Gagne 10 Garde.',
    ops: [{ kind: 'ward', amount: 10 }],
    upgradeOf: 'sb_hallowed_ward',
  }),
  def({
    id: 'sb_consecrate',
    name: 'Consécration', cost: 1, type: 'skill', rarity: 'common', classId: 'sealbinder', target: 'all_enemies',
    text: 'Applique 1 Sceau à TOUS les ennemis.',
    ops: [{ kind: 'status', id: 'seal', amount: 1, target: 'all_enemies' }],
    upgradeTo: 'sb_consecrate_p',
  }),
  def({
    id: 'sb_consecrate_p',
    name: 'Consécration+', cost: 1, type: 'skill', rarity: 'common', classId: 'sealbinder', target: 'all_enemies',
    text: 'Applique 2 Sceau à TOUS les ennemis.',
    ops: [{ kind: 'status', id: 'seal', amount: 2, target: 'all_enemies' }],
    upgradeOf: 'sb_consecrate',
  }),
  def({
    id: 'sb_litany',
    name: 'Litanie', cost: 1, type: 'skill', rarity: 'common', classId: 'sealbinder', target: 'self',
    text: 'Pioche 2.',
    ops: [{ kind: 'draw', amount: 2 }],
    upgradeTo: 'sb_litany_p',
  }),
  def({
    id: 'sb_litany_p',
    name: 'Litanie+', cost: 0, type: 'skill', rarity: 'common', classId: 'sealbinder', target: 'self',
    text: 'Pioche 2.',
    ops: [{ kind: 'draw', amount: 2 }],
    upgradeOf: 'sb_litany',
  }),
  def({
    id: 'sb_rebuke',
    name: 'Réprimande', cost: 1, type: 'attack', rarity: 'common', classId: 'sealbinder', target: 'enemy',
    text: 'Inflige 6 dégâts. Applique 2 Flétri.',
    ops: [
      { kind: 'damage', amount: 6 },
      { kind: 'status', id: 'faded', amount: 2, target: 'enemy' },
    ],
    upgradeTo: 'sb_rebuke_p',
  }),
  def({
    id: 'sb_rebuke_p',
    name: 'Réprimande+', cost: 1, type: 'attack', rarity: 'common', classId: 'sealbinder', target: 'enemy',
    text: 'Inflige 8 dégâts. Applique 3 Flétri.',
    ops: [
      { kind: 'damage', amount: 8 },
      { kind: 'status', id: 'faded', amount: 3, target: 'enemy' },
    ],
    upgradeOf: 'sb_rebuke',
  }),
  def({
    id: 'sb_thorn_hymn',
    name: 'Hymne d\u2019Épines', cost: 1, type: 'power', rarity: 'common', classId: 'sealbinder', target: 'self',
    text: 'Gagne 2 Épines.',
    ops: [{ kind: 'status', id: 'thorns', amount: 2, target: 'self' }],
    upgradeTo: 'sb_thorn_hymn_p',
  }),
  def({
    id: 'sb_thorn_hymn_p',
    name: 'Hymne d\u2019Épines+', cost: 1, type: 'power', rarity: 'common', classId: 'sealbinder', target: 'self',
    text: 'Gagne 3 Épines.',
    ops: [{ kind: 'status', id: 'thorns', amount: 3, target: 'self' }],
    upgradeOf: 'sb_thorn_hymn',
  }),
  def({
    id: 'sb_penance',
    name: 'Pénitence', cost: 0, type: 'skill', rarity: 'common', classId: 'sealbinder', target: 'enemy',
    text: 'Applique 2 Sceau. Perds 2 PV.',
    ops: [
      { kind: 'status', id: 'seal', amount: 2, target: 'enemy' },
      { kind: 'lose_hp', amount: 2 },
    ],
    upgradeTo: 'sb_penance_p',
  }),
  def({
    id: 'sb_penance_p',
    name: 'Pénitence+', cost: 0, type: 'skill', rarity: 'common', classId: 'sealbinder', target: 'enemy',
    text: 'Applique 3 Sceau. Perds 1 PV.',
    ops: [
      { kind: 'status', id: 'seal', amount: 3, target: 'enemy' },
      { kind: 'lose_hp', amount: 1 },
    ],
    upgradeOf: 'sb_penance',
  }),

  // Peu communes
  def({
    id: 'sb_verdict',
    name: 'Verdict', cost: 2, type: 'attack', rarity: 'uncommon', classId: 'sealbinder', target: 'enemy',
    text: 'Inflige 10 dégâts. Si la cible a 3+ Sceau, inflige 8 de plus.',
    ops: [
      { kind: 'damage', amount: 10 },
      { kind: 'if_has_status', id: 'seal', target: 'enemy', then: [{ kind: 'damage', amount: 0 }] },
    ],
    tags: ['x:verdict'],
    upgradeTo: 'sb_verdict_p',
  }),
  def({
    id: 'sb_verdict_p',
    name: 'Verdict+', cost: 2, type: 'attack', rarity: 'uncommon', classId: 'sealbinder', target: 'enemy',
    text: 'Inflige 13 dégâts. Si la cible a 3+ Sceau, inflige 11 de plus.',
    ops: [{ kind: 'damage', amount: 13 }],
    tags: ['x:verdict_p'],
    upgradeOf: 'sb_verdict',
  }),
  def({
    id: 'sb_reflection',
    name: 'Réflexion', cost: 1, type: 'skill', rarity: 'uncommon', classId: 'sealbinder', target: 'self',
    text: 'Gagne autant de Garde que ta Garde actuelle.',
    ops: [],
    tags: ['x:reflection'],
    upgradeTo: 'sb_reflection_p',
  }),
  def({
    id: 'sb_reflection_p',
    name: 'Réflexion+', cost: 0, type: 'skill', rarity: 'uncommon', classId: 'sealbinder', target: 'self',
    text: 'Gagne autant de Garde que ta Garde actuelle.',
    ops: [],
    tags: ['x:reflection'],
    upgradeOf: 'sb_reflection',
  }),
  def({
    id: 'sb_chain_of_oaths',
    name: 'Chaîne des Serments', cost: 1, type: 'skill', rarity: 'uncommon', classId: 'sealbinder', target: 'all_enemies',
    text: 'Applique 2 Sceau à TOUS les ennemis. Applique 1 Fragile à TOUS les ennemis.',
    ops: [
      { kind: 'status', id: 'seal', amount: 2, target: 'all_enemies' },
      { kind: 'status', id: 'brittle', amount: 1, target: 'all_enemies' },
    ],
    upgradeTo: 'sb_chain_of_oaths_p',
  }),
  def({
    id: 'sb_chain_of_oaths_p',
    name: 'Chaîne des Serments+', cost: 1, type: 'skill', rarity: 'uncommon', classId: 'sealbinder', target: 'all_enemies',
    text: 'Applique 3 Sceau à TOUS les ennemis. Applique 2 Fragile à TOUS les ennemis.',
    ops: [
      { kind: 'status', id: 'seal', amount: 3, target: 'all_enemies' },
      { kind: 'status', id: 'brittle', amount: 2, target: 'all_enemies' },
    ],
    upgradeOf: 'sb_chain_of_oaths',
  }),
  def({
    id: 'sb_gilded_prayer',
    name: 'Prière Dorée', cost: 1, type: 'power', rarity: 'uncommon', classId: 'sealbinder', target: 'self',
    text: 'Chaque fois que tu appliques un Sceau, gagne 1 Garde.',
    ops: [],
    tags: ['hook:seal_gain_ward_1'],
    upgradeTo: 'sb_gilded_prayer_p',
  }),
  def({
    id: 'sb_gilded_prayer_p',
    name: 'Prière Dorée+', cost: 1, type: 'power', rarity: 'uncommon', classId: 'sealbinder', target: 'self',
    text: 'Chaque fois que tu appliques un Sceau, gagne 2 Garde.',
    ops: [],
    tags: ['hook:seal_gain_ward_2'],
    upgradeOf: 'sb_gilded_prayer',
  }),
  def({
    id: 'sb_chime',
    name: 'Carillon', cost: 0, type: 'skill', rarity: 'uncommon', classId: 'sealbinder', target: 'enemy',
    text: 'Applique 2 Sceau. Pioche 1.',
    ops: [
      { kind: 'status', id: 'seal', amount: 2, target: 'enemy' },
      { kind: 'draw', amount: 1 },
    ],
    upgradeTo: 'sb_chime_p',
  }),
  def({
    id: 'sb_chime_p',
    name: 'Carillon+', cost: 0, type: 'skill', rarity: 'uncommon', classId: 'sealbinder', target: 'enemy',
    text: 'Applique 3 Sceau. Pioche 1.',
    ops: [
      { kind: 'status', id: 'seal', amount: 3, target: 'enemy' },
      { kind: 'draw', amount: 1 },
    ],
    upgradeOf: 'sb_chime',
  }),
  def({
    id: 'sb_lantern_oath',
    name: 'Serment de la Lanterne', cost: 1, type: 'skill', rarity: 'uncommon', classId: 'sealbinder', target: 'self',
    text: 'Gagne 2 Aplomb. Gagne 4 Garde.',
    ops: [
      { kind: 'status', id: 'poise', amount: 2, target: 'self' },
      { kind: 'ward', amount: 4 },
    ],
    upgradeTo: 'sb_lantern_oath_p',
  }),
  def({
    id: 'sb_lantern_oath_p',
    name: 'Serment de la Lanterne+', cost: 1, type: 'skill', rarity: 'uncommon', classId: 'sealbinder', target: 'self',
    text: 'Gagne 3 Aplomb. Gagne 6 Garde.',
    ops: [
      { kind: 'status', id: 'poise', amount: 3, target: 'self' },
      { kind: 'ward', amount: 6 },
    ],
    upgradeOf: 'sb_lantern_oath',
  }),

  // Rares
  def({
    id: 'sb_executioner',
    name: 'Bourreau', cost: 2, type: 'attack', rarity: 'rare', classId: 'sealbinder', target: 'enemy',
    text: 'Consomme tous les Sceaux de la cible. Inflige 6 dégâts par Sceau consommé.',
    ops: [],
    tags: ['x:executioner'],
    upgradeTo: 'sb_executioner_p',
  }),
  def({
    id: 'sb_executioner_p',
    name: 'Bourreau+', cost: 2, type: 'attack', rarity: 'rare', classId: 'sealbinder', target: 'enemy',
    text: 'Consomme tous les Sceaux de la cible. Inflige 8 dégâts par Sceau consommé.',
    ops: [],
    tags: ['x:executioner_p'],
    upgradeOf: 'sb_executioner',
  }),
  def({
    id: 'sb_aegis',
    name: 'Égide', cost: 2, type: 'power', rarity: 'rare', classId: 'sealbinder', target: 'self',
    text: 'Gagne 2 Sigille. Au début du tour, gagne 4 Garde.',
    ops: [{ kind: 'status', id: 'sigil', amount: 2, target: 'self' }],
    tags: ['hook:turn_start_ward_4'],
    upgradeTo: 'sb_aegis_p',
  }),
  def({
    id: 'sb_aegis_p',
    name: 'Égide+', cost: 2, type: 'power', rarity: 'rare', classId: 'sealbinder', target: 'self',
    text: 'Gagne 3 Sigille. Au début du tour, gagne 6 Garde.',
    ops: [{ kind: 'status', id: 'sigil', amount: 3, target: 'self' }],
    tags: ['hook:turn_start_ward_6'],
    upgradeOf: 'sb_aegis',
  }),
  def({
    id: 'sb_bell_of_dusk',
    name: 'Cloche du Crépuscule', cost: 1, type: 'attack', rarity: 'rare', classId: 'sealbinder', target: 'all_enemies',
    text: 'Inflige 5 dégâts à TOUS les ennemis. Applique 1 Sceau à TOUS les ennemis.',
    ops: [
      { kind: 'damage', amount: 5, target: 'all_enemies' },
      { kind: 'status', id: 'seal', amount: 1, target: 'all_enemies' },
    ],
    upgradeTo: 'sb_bell_of_dusk_p',
  }),
  def({
    id: 'sb_bell_of_dusk_p',
    name: 'Cloche du Crépuscule+', cost: 1, type: 'attack', rarity: 'rare', classId: 'sealbinder', target: 'all_enemies',
    text: 'Inflige 7 dégâts à TOUS les ennemis. Applique 2 Sceau à TOUS les ennemis.',
    ops: [
      { kind: 'damage', amount: 7, target: 'all_enemies' },
      { kind: 'status', id: 'seal', amount: 2, target: 'all_enemies' },
    ],
    upgradeOf: 'sb_bell_of_dusk',
  }),
  def({
    id: 'sb_crown_of_vows',
    name: 'Couronne des Vœux', cost: 2, type: 'power', rarity: 'rare', classId: 'sealbinder', target: 'self',
    text: 'Au début de chaque tour, applique 1 Sceau à un ennemi aléatoire et gagne 2 Garde.',
    ops: [],
    tags: ['hook:turn_start_seal_random_and_ward'],
    upgradeTo: 'sb_crown_of_vows_p',
  }),
  def({
    id: 'sb_crown_of_vows_p',
    name: 'Couronne des Vœux+', cost: 2, type: 'power', rarity: 'rare', classId: 'sealbinder', target: 'self',
    text: 'Au début de chaque tour, applique 2 Sceau à un ennemi aléatoire et gagne 3 Garde.',
    ops: [],
    tags: ['hook:turn_start_seal_random_and_ward_p'],
    upgradeOf: 'sb_crown_of_vows',
  }),
  def({
    id: 'sb_oathlight',
    name: 'Éclat du Serment', cost: 1, type: 'skill', rarity: 'rare', classId: 'sealbinder', target: 'self',
    text: 'Ajoute 2 compétences Peu Communes aléatoires du Lieur de Sceaux à ta main. Elles coûtent 0 ce tour.',
    ops: [],
    tags: ['x:oathlight'],
    upgradeTo: 'sb_oathlight_p',
  }),
  def({
    id: 'sb_oathlight_p',
    name: 'Éclat du Serment+', cost: 1, type: 'skill', rarity: 'rare', classId: 'sealbinder', target: 'self',
    text: 'Ajoute 3 compétences Peu Communes aléatoires du Lieur de Sceaux à ta main. Elles coûtent 0 ce tour.',
    ops: [],
    tags: ['x:oathlight_p'],
    upgradeOf: 'sb_oathlight',
  }),
];

// =======================================================
// WHISPERER — échos, invocation légère, tempo par la pioche
// =======================================================

const WHISPERER: CardDef[] = [
  def({
    id: 'wh_echo_cut',
    name: 'Coupe d’Écho', cost: 1, type: 'attack', rarity: 'starter', classId: 'whisperer', target: 'enemy',
    text: 'Inflige 5 dégâts. Gagne 1 Écho.',
    ops: [{ kind: 'damage', amount: 5 }, { kind: 'status', id: 'echo', amount: 1, target: 'self' }],
    upgradeTo: 'wh_echo_cut_p',
  }),
  def({
    id: 'wh_echo_cut_p',
    name: 'Coupe d’Écho+', cost: 1, type: 'attack', rarity: 'starter', classId: 'whisperer', target: 'enemy',
    text: 'Inflige 7 dégâts. Gagne 1 Écho.',
    ops: [{ kind: 'damage', amount: 7 }, { kind: 'status', id: 'echo', amount: 1, target: 'self' }],
    upgradeOf: 'wh_echo_cut',
  }),
  def({
    id: 'wh_veil_step',
    name: 'Pas Voilé', cost: 1, type: 'skill', rarity: 'starter', classId: 'whisperer', target: 'self',
    text: 'Gagne 5 Garde. Pioche 1.',
    ops: [{ kind: 'ward', amount: 5 }, { kind: 'draw', amount: 1 }],
    upgradeTo: 'wh_veil_step_p',
  }),
  def({
    id: 'wh_veil_step_p',
    name: 'Pas Voilé+', cost: 1, type: 'skill', rarity: 'starter', classId: 'whisperer', target: 'self',
    text: 'Gagne 8 Garde. Pioche 1.',
    ops: [{ kind: 'ward', amount: 8 }, { kind: 'draw', amount: 1 }],
    upgradeOf: 'wh_veil_step',
  }),
  def({
    id: 'wh_saint_murmur',
    name: 'Murmure du Saint', cost: 1, type: 'skill', rarity: 'starter', classId: 'whisperer', target: 'enemy',
    text: 'Applique 2 Saignement. Gagne 1 Écho.',
    ops: [{ kind: 'status', id: 'bleed', amount: 2, target: 'enemy' }, { kind: 'status', id: 'echo', amount: 1, target: 'self' }],
    upgradeTo: 'wh_saint_murmur_p',
  }),
  def({
    id: 'wh_saint_murmur_p',
    name: 'Murmure du Saint+', cost: 1, type: 'skill', rarity: 'starter', classId: 'whisperer', target: 'enemy',
    text: 'Applique 3 Saignement. Gagne 1 Écho.',
    ops: [{ kind: 'status', id: 'bleed', amount: 3, target: 'enemy' }, { kind: 'status', id: 'echo', amount: 1, target: 'self' }],
    upgradeOf: 'wh_saint_murmur',
  }),
  def({
    id: 'wh_echo_burst',
    name: 'Décharge d’Échos', cost: 2, type: 'attack', rarity: 'common', classId: 'whisperer', target: 'enemy',
    text: 'Inflige 8 dégâts. Répète 2 dégâts pour chaque Écho.',
    ops: [{ kind: 'damage', amount: 8 }, { kind: 'per_target_status', id: 'echo', target: 'self', then: { kind: 'damage', amount: 2 } }],
    upgradeTo: 'wh_echo_burst_p',
  }),
  def({
    id: 'wh_echo_burst_p',
    name: 'Décharge d’Échos+', cost: 2, type: 'attack', rarity: 'common', classId: 'whisperer', target: 'enemy',
    text: 'Inflige 10 dégâts. Répète 3 dégâts pour chaque Écho.',
    ops: [{ kind: 'damage', amount: 10 }, { kind: 'per_target_status', id: 'echo', target: 'self', then: { kind: 'damage', amount: 3 } }],
    upgradeOf: 'wh_echo_burst',
  }),
  def({
    id: 'wh_grave_chorus',
    name: 'Chœur des Tombes', cost: 1, type: 'power', rarity: 'uncommon', classId: 'whisperer', target: 'self',
    text: 'Au début de chaque tour, gagne 1 Fracture.',
    ops: [],
    tags: ['hook:turn_start_gain_fracture_1'],
    upgradeTo: 'wh_grave_chorus_p',
  }),
  def({
    id: 'wh_grave_chorus_p',
    name: 'Chœur des Tombes+', cost: 1, type: 'power', rarity: 'uncommon', classId: 'whisperer', target: 'self',
    text: 'Au début de chaque tour, gagne 2 Fracture.',
    ops: [],
    tags: ['hook:turn_start_gain_fracture_2'],
    upgradeOf: 'wh_grave_chorus',
  }),
  def({
    id: 'wh_borrowed_hand',
    name: 'Main Empruntée', cost: 0, type: 'skill', rarity: 'rare', classId: 'whisperer', target: 'self',
    text: 'Ajoute 2 Étincelles à ta main. Bannir.',
    ops: [{ kind: 'add_card_to_hand', cardId: 'status_spark', amount: 2 }],
    exhaust: true,
    upgradeTo: 'wh_borrowed_hand_p',
  }),
  def({
    id: 'wh_borrowed_hand_p',
    name: 'Main Empruntée+', cost: 0, type: 'skill', rarity: 'rare', classId: 'whisperer', target: 'self',
    text: 'Ajoute 3 Étincelles à ta main. Bannir.',
    ops: [{ kind: 'add_card_to_hand', cardId: 'status_spark', amount: 3 }],
    exhaust: true,
    upgradeOf: 'wh_borrowed_hand',
  }),
];

// =======================================================
// AUGER — prédiction, pioche, fragile et contrôle du tempo
// =======================================================

const AUGER: CardDef[] = [
  def({
    id: 'au_omen_strike',
    name: 'Frappe d’Augure', cost: 1, type: 'attack', rarity: 'starter', classId: 'auger', target: 'enemy',
    text: 'Inflige 6 dégâts. Si la cible est Fragile, pioche 1.',
    ops: [{ kind: 'damage', amount: 6 }, { kind: 'if_has_status', id: 'brittle', target: 'enemy', then: [{ kind: 'draw', amount: 1 }] }],
    upgradeTo: 'au_omen_strike_p',
  }),
  def({
    id: 'au_omen_strike_p',
    name: 'Frappe d’Augure+', cost: 1, type: 'attack', rarity: 'starter', classId: 'auger', target: 'enemy',
    text: 'Inflige 8 dégâts. Si la cible est Fragile, pioche 1.',
    ops: [{ kind: 'damage', amount: 8 }, { kind: 'if_has_status', id: 'brittle', target: 'enemy', then: [{ kind: 'draw', amount: 1 }] }],
    upgradeOf: 'au_omen_strike',
  }),
  def({
    id: 'au_guarded_reading',
    name: 'Lecture Gardée', cost: 1, type: 'skill', rarity: 'starter', classId: 'auger', target: 'self',
    text: 'Gagne 6 Garde.',
    ops: [{ kind: 'ward', amount: 6 }],
    upgradeTo: 'au_guarded_reading_p',
  }),
  def({
    id: 'au_guarded_reading_p',
    name: 'Lecture Gardée+', cost: 1, type: 'skill', rarity: 'starter', classId: 'auger', target: 'self',
    text: 'Gagne 9 Garde.',
    ops: [{ kind: 'ward', amount: 9 }],
    upgradeOf: 'au_guarded_reading',
  }),
  def({
    id: 'au_crack_fate',
    name: 'Fêler le Destin', cost: 1, type: 'skill', rarity: 'starter', classId: 'auger', target: 'enemy',
    text: 'Applique 1 Fragile. Pioche 1.',
    ops: [{ kind: 'status', id: 'brittle', amount: 1, target: 'enemy' }, { kind: 'draw', amount: 1 }],
    upgradeTo: 'au_crack_fate_p',
  }),
  def({
    id: 'au_crack_fate_p',
    name: 'Fêler le Destin+', cost: 1, type: 'skill', rarity: 'starter', classId: 'auger', target: 'enemy',
    text: 'Applique 2 Fragile. Pioche 1.',
    ops: [{ kind: 'status', id: 'brittle', amount: 2, target: 'enemy' }, { kind: 'draw', amount: 1 }],
    upgradeOf: 'au_crack_fate',
  }),
  def({
    id: 'au_second_sight',
    name: 'Seconde Vue', cost: 0, type: 'skill', rarity: 'common', classId: 'auger', target: 'self',
    text: 'Pioche 2. Défausse 1 carte aléatoire.',
    ops: [{ kind: 'draw', amount: 2 }, { kind: 'discard_random', amount: 1 }],
    upgradeTo: 'au_second_sight_p',
  }),
  def({
    id: 'au_second_sight_p',
    name: 'Seconde Vue+', cost: 0, type: 'skill', rarity: 'common', classId: 'auger', target: 'self',
    text: 'Pioche 2.',
    ops: [{ kind: 'draw', amount: 2 }],
    upgradeOf: 'au_second_sight',
  }),
  def({
    id: 'au_black_star',
    name: 'Étoile Noire', cost: 2, type: 'attack', rarity: 'uncommon', classId: 'auger', target: 'all_enemies',
    text: 'Inflige 5 dégâts à tous les ennemis. Applique 1 Flétri.',
    ops: [{ kind: 'damage', amount: 5, target: 'all_enemies' }, { kind: 'status', id: 'faded', amount: 1, target: 'all_enemies' }],
    upgradeTo: 'au_black_star_p',
  }),
  def({
    id: 'au_black_star_p',
    name: 'Étoile Noire+', cost: 2, type: 'attack', rarity: 'uncommon', classId: 'auger', target: 'all_enemies',
    text: 'Inflige 7 dégâts à tous les ennemis. Applique 1 Flétri.',
    ops: [{ kind: 'damage', amount: 7, target: 'all_enemies' }, { kind: 'status', id: 'faded', amount: 1, target: 'all_enemies' }],
    upgradeOf: 'au_black_star',
  }),
  def({
    id: 'au_inevitable',
    name: 'Inévitable', cost: 1, type: 'power', rarity: 'rare', classId: 'auger', target: 'self',
    text: 'Au début de chaque tour, gagne 4 Garde.',
    ops: [],
    tags: ['hook:turn_start_ward_4'],
    upgradeTo: 'au_inevitable_p',
  }),
  def({
    id: 'au_inevitable_p',
    name: 'Inévitable+', cost: 1, type: 'power', rarity: 'rare', classId: 'auger', target: 'self',
    text: 'Au début de chaque tour, gagne 6 Garde.',
    ops: [],
    tags: ['hook:turn_start_ward_6'],
    upgradeOf: 'au_inevitable',
  }),
];

// =======================================================
// SUMMONER - une invocation persistante, renforcee au fil du combat
// =======================================================

const SUMMONER: CardDef[] = [
  def({
    id: 'su_wraith_cut',
    name: 'Coupe du Serviteur', cost: 1, type: 'attack', rarity: 'starter', classId: 'summoner', target: 'enemy',
    text: 'Inflige 5 degats. Invoque ou renforce ton Serviteur lie.',
    ops: [{ kind: 'damage', amount: 5 }, { kind: 'summon', amount: 1 }],
    upgradeTo: 'su_wraith_cut_p',
  }),
  def({
    id: 'su_wraith_cut_p',
    name: 'Coupe du Serviteur+', cost: 1, type: 'attack', rarity: 'starter', classId: 'summoner', target: 'enemy',
    text: 'Inflige 7 degats. Invoque ou renforce ton Serviteur lie.',
    ops: [{ kind: 'damage', amount: 7 }, { kind: 'summon', amount: 1 }],
    upgradeOf: 'su_wraith_cut',
  }),
  def({
    id: 'su_bone_ward',
    name: 'Garde d Os', cost: 1, type: 'skill', rarity: 'starter', classId: 'summoner', target: 'self',
    text: 'Gagne 5 Garde. Invoque ou renforce ton Serviteur lie.',
    ops: [{ kind: 'ward', amount: 5 }, { kind: 'summon', amount: 1 }],
    upgradeTo: 'su_bone_ward_p',
  }),
  def({
    id: 'su_bone_ward_p',
    name: 'Garde d Os+', cost: 1, type: 'skill', rarity: 'starter', classId: 'summoner', target: 'self',
    text: 'Gagne 8 Garde. Invoque ou renforce ton Serviteur lie.',
    ops: [{ kind: 'ward', amount: 8 }, { kind: 'summon', amount: 1 }],
    upgradeOf: 'su_bone_ward',
  }),
  def({
    id: 'su_call_spark',
    name: 'Appel Mineur', cost: 1, type: 'skill', rarity: 'starter', classId: 'summoner', target: 'self',
    text: 'Invoque ou renforce 2 fois ton Serviteur lie. Gagne 1 Echo.',
    ops: [{ kind: 'summon', amount: 2 }, { kind: 'status', id: 'echo', amount: 1, target: 'self' }],
    upgradeTo: 'su_call_spark_p',
  }),
  def({
    id: 'su_call_spark_p',
    name: 'Appel Mineur+', cost: 1, type: 'skill', rarity: 'starter', classId: 'summoner', target: 'self',
    text: 'Invoque ou renforce 3 fois ton Serviteur lie. Gagne 1 Echo.',
    ops: [{ kind: 'summon', amount: 3 }, { kind: 'status', id: 'echo', amount: 1, target: 'self' }],
    upgradeOf: 'su_call_spark',
  }),
  def({
    id: 'su_little_servants',
    name: 'Petits Lies', cost: 1, type: 'skill', rarity: 'common', classId: 'summoner', target: 'self',
    text: 'Invoque ou renforce 2 fois ton Serviteur lie.',
    ops: [{ kind: 'summon', amount: 2 }],
    upgradeTo: 'su_little_servants_p',
  }),
  def({
    id: 'su_little_servants_p',
    name: 'Petits Lies+', cost: 1, type: 'skill', rarity: 'common', classId: 'summoner', target: 'self',
    text: 'Invoque ou renforce 3 fois ton Serviteur lie.',
    ops: [{ kind: 'summon', amount: 3 }],
    upgradeOf: 'su_little_servants',
  }),
  def({
    id: 'su_bound_order',
    name: 'Ordre aux Lies', cost: 1, type: 'attack', rarity: 'common', classId: 'summoner', target: 'enemy',
    text: 'Inflige 4 degats. Ton Serviteur lie frappe aussi cette cible avec +3 degats.',
    ops: [{ kind: 'damage', amount: 4 }, { kind: 'command_summons', damage: 3 }],
    upgradeTo: 'su_bound_order_p',
  }),
  def({
    id: 'su_bound_order_p',
    name: 'Ordre aux Lies+', cost: 1, type: 'attack', rarity: 'common', classId: 'summoner', target: 'enemy',
    text: 'Inflige 6 degats. Ton Serviteur lie frappe aussi cette cible avec +4 degats.',
    ops: [{ kind: 'damage', amount: 6 }, { kind: 'command_summons', damage: 4 }],
    upgradeOf: 'su_bound_order',
  }),
  def({
    id: 'su_ash_guardian',
    name: 'Gardien de Cendre', cost: 1, type: 'skill', rarity: 'common', classId: 'summoner', target: 'self',
    text: 'Gagne 4 Garde. Invoque ou renforce ton Serviteur lie.',
    ops: [{ kind: 'ward', amount: 4 }, { kind: 'summon', amount: 1 }],
    upgradeTo: 'su_ash_guardian_p',
  }),
  def({
    id: 'su_ash_guardian_p',
    name: 'Gardien de Cendre+', cost: 1, type: 'skill', rarity: 'common', classId: 'summoner', target: 'self',
    text: 'Gagne 7 Garde. Invoque ou renforce 2 fois ton Serviteur lie.',
    ops: [{ kind: 'ward', amount: 7 }, { kind: 'summon', amount: 2 }],
    upgradeOf: 'su_ash_guardian',
  }),
  def({
    id: 'su_many_hands',
    name: 'Mains Nombreuses', cost: 2, type: 'skill', rarity: 'uncommon', classId: 'summoner', target: 'self',
    text: 'Invoque ou renforce 3 fois ton Serviteur lie. Gagne 1 Braise.',
    ops: [{ kind: 'summon', amount: 3 }, { kind: 'gain_ember', amount: 1 }],
    upgradeTo: 'su_many_hands_p',
  }),
  def({
    id: 'su_many_hands_p',
    name: 'Mains Nombreuses+', cost: 2, type: 'skill', rarity: 'uncommon', classId: 'summoner', target: 'self',
    text: 'Invoque ou renforce 4 fois ton Serviteur lie. Gagne 1 Braise.',
    ops: [{ kind: 'summon', amount: 4 }, { kind: 'gain_ember', amount: 1 }],
    upgradeOf: 'su_many_hands',
  }),
  def({
    id: 'su_grave_procession',
    name: 'Procession Grave', cost: 2, type: 'attack', rarity: 'uncommon', classId: 'summoner', target: 'all_enemies',
    text: 'Inflige 4 degats a tous les ennemis. Invoque ou renforce 2 fois ton Serviteur lie.',
    ops: [{ kind: 'damage', amount: 4, target: 'all_enemies' }, { kind: 'summon', amount: 2 }],
    upgradeTo: 'su_grave_procession_p',
  }),
  def({
    id: 'su_grave_procession_p',
    name: 'Procession Grave+', cost: 2, type: 'attack', rarity: 'uncommon', classId: 'summoner', target: 'all_enemies',
    text: 'Inflige 6 degats a tous les ennemis. Invoque ou renforce 3 fois ton Serviteur lie.',
    ops: [{ kind: 'damage', amount: 6, target: 'all_enemies' }, { kind: 'summon', amount: 3 }],
    upgradeOf: 'su_grave_procession',
  }),
  def({
    id: 'su_open_gate',
    name: 'Ouvrir le Seuil', cost: 2, type: 'power', rarity: 'rare', classId: 'summoner', target: 'self',
    text: 'Au debut de chaque tour, invoque ou renforce ton Serviteur lie.',
    ops: [],
    tags: ['hook:turn_start_summon_1'],
    upgradeTo: 'su_open_gate_p',
  }),
  def({
    id: 'su_open_gate_p',
    name: 'Ouvrir le Seuil+', cost: 2, type: 'power', rarity: 'rare', classId: 'summoner', target: 'self',
    text: 'Au debut de chaque tour, invoque ou renforce 2 fois ton Serviteur lie.',
    ops: [],
    tags: ['hook:turn_start_summon_2'],
    upgradeOf: 'su_open_gate',
  }),
];

// =======================================================
// REGISTRE
// =======================================================

export const ALL_CARDS: CardDef[] = [
  ...NEUTRAL,
  ...CURSES,
  ...STATUS,
  ...VOWBREAKER,
  ...SEALBINDER,
  ...WHISPERER,
  ...AUGER,
  ...SUMMONER,
];

export const CARD_MAP: Record<string, CardDef> = Object.fromEntries(
  ALL_CARDS.map((c) => [c.id, c]),
);

export function getCard(id: string): CardDef {
  const c = CARD_MAP[id];
  if (!c) throw new Error(`Unknown card id: ${id}`);
  return c;
}

export function cardsByClass(classId: CardDef['classId']): CardDef[] {
  return ALL_CARDS.filter((c) => c.classId === classId);
}

// Réservoir de cartes éligibles aux récompenses (ignore cartes de départ, malédictions, statuts, doublons améliorés).
export function rewardPool(classId: CardDef['classId']): CardDef[] {
  return ALL_CARDS.filter(
    (c) =>
      (c.classId === classId || c.classId === 'neutral') &&
      c.rarity !== 'starter' &&
      c.rarity !== 'curse' &&
      c.rarity !== 'status' &&
      c.rarity !== 'special' &&
      !c.upgradeOf,
  );
}

export function startingDeck(classId: CardDef['classId']): string[] {
  if (classId === 'vowbreaker') {
    return [
      'vb_cleave','vb_cleave','vb_cleave','vb_cleave','vb_cleave',
      'vb_brace','vb_brace','vb_brace','vb_brace',
      'vb_hollow_strike',
    ];
  }
  if (classId === 'sealbinder') return [
    'sb_toll','sb_toll','sb_toll','sb_toll',
    'sb_veil','sb_veil','sb_veil','sb_veil',
    'sb_bind','sb_bind',
  ];
  if (classId === 'whisperer') return [
    'wh_echo_cut','wh_echo_cut','wh_echo_cut','wh_echo_cut',
    'wh_veil_step','wh_veil_step','wh_veil_step','wh_veil_step',
    'wh_saint_murmur','wh_saint_murmur',
  ];
  if (classId === 'auger') return [
    'au_omen_strike','au_omen_strike','au_omen_strike','au_omen_strike',
    'au_guarded_reading','au_guarded_reading','au_guarded_reading','au_guarded_reading',
    'au_crack_fate','au_crack_fate',
  ];
  return [
    'su_wraith_cut','su_wraith_cut','su_wraith_cut','su_wraith_cut',
    'su_bone_ward','su_bone_ward','su_bone_ward','su_bone_ward',
    'su_call_spark','su_call_spark',
  ];
}
