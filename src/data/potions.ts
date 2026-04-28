// EMBERVOW — Potions (consommables). Utilisées depuis l'UI en combat ou sur la carte.

import type { Potion } from '../types';

const def = (p: Potion): Potion => p;

export const ALL_POTIONS: Potion[] = [
  def({ id: 'pot_mend',       name: 'Philtre de Suture',   rarity: 'common',   description: 'Soigne 15 PV.',                            needsTarget: false, apply: { kind: 'heal', amount: 15 } }),
  def({ id: 'pot_surge',      name: 'Flambée de Braise',   rarity: 'common',   description: 'Gagne 2 Braises ce tour.',                 needsTarget: false, apply: { kind: 'ember', amount: 2 } }),
  def({ id: 'pot_insight',    name: 'Clairvoyance du Scribe', rarity: 'common',description: 'Pioche 3.',                                 needsTarget: false, apply: { kind: 'draw', amount: 3 } }),
  def({ id: 'pot_flame',      name: 'Fiole de Flamme',     rarity: 'common',   description: 'Inflige 20 dégâts à un ennemi.',           needsTarget: true,  apply: { kind: 'damage', amount: 20 } }),
  def({ id: 'pot_iron',       name: 'Teinture de Fer',     rarity: 'common',   description: 'Gagne 16 Garde.',                          needsTarget: false, apply: { kind: 'ward', amount: 16 } }),
  def({ id: 'pot_fury',       name: 'Élixir de Furie',     rarity: 'uncommon', description: 'Gagne 4 Furie.',                           needsTarget: false, apply: { kind: 'status_self', id: 'fury', amount: 4 } }),
  def({ id: 'pot_brittle',    name: 'Éclat Fragile',       rarity: 'uncommon', description: 'Applique 4 Fragile à un ennemi.',          needsTarget: true,  apply: { kind: 'status_enemy', id: 'brittle', amount: 4 } }),
  def({ id: 'pot_seal',       name: 'Fil du Vœu',          rarity: 'uncommon', description: 'Applique 3 Sceau à un ennemi.',            needsTarget: true,  apply: { kind: 'status_enemy', id: 'seal', amount: 3 } }),
  def({ id: 'pot_cleanse',    name: 'Vapeur Purifiante',   rarity: 'uncommon', description: 'Retire tous tes malus.',                   needsTarget: false, apply: { kind: 'cleanse' } }),
  def({ id: 'pot_last_breath',name: 'Dernier Souffle',     rarity: 'rare',     description: 'Gagne 30 Garde et 2 Aplomb.',              needsTarget: false, apply: { kind: 'ward', amount: 30 } }),
];

export const POTION_MAP: Record<string, Potion> = Object.fromEntries(
  ALL_POTIONS.map((p) => [p.id, p]),
);

export function getPotion(id: string): Potion {
  const p = POTION_MAP[id];
  if (!p) throw new Error(`Unknown potion id: ${id}`);
  return p;
}

export function potionRewardPool(): Potion[] {
  return ALL_POTIONS;
}
