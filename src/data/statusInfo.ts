// EMBERVOW — descriptions lisibles des statuts pour les infobulles.
// Clef = StatusId. Les valeurs acceptent le marqueur {n}, remplacé par
// le nombre de charges courantes au moment de l'affichage.

export interface StatusInfo {
  label: string;
  kind: 'buff' | 'debuff' | 'neutral' | 'class';
  /** Description courte. Utiliser `{n}` pour injecter le nombre de charges. */
  desc: string;
}

export const STATUS_INFO: Record<string, StatusInfo> = {
  // --- bonus -----------------------------------------------------------
  fury:     { label: 'Furie',         kind: 'buff',  desc: '+{n} dégâts à chaque attaque pour ce combat.' },
  poise:    { label: 'Aplomb',        kind: 'buff',  desc: '+{n} Garde gagnée par les compétences qui en donnent.' },
  sigil:    { label: 'Sigille',       kind: 'buff',  desc: 'Annule les {n} prochaines applications de malus.' },
  regen:    { label: 'Régénération',  kind: 'buff',  desc: 'Soigne {n} PV à la fin de ton tour. Diminue de 1.' },
  momentum: { label: 'Élan',          kind: 'buff',  desc: 'Gagne +{n} Braise au prochain tour.' },
  thorns:   { label: 'Épines',        kind: 'buff',  desc: 'Renvoie {n} dégâts aux attaquants.' },
  // --- malus -----------------------------------------------------------
  brittle:  { label: 'Fragile',       kind: 'debuff', desc: 'Subit +50 % de dégâts des attaques. Diminue de 1 par tour. ({n} restants)' },
  faded:    { label: 'Flétri',        kind: 'debuff', desc: 'Inflige −25 % de dégâts. Diminue de 1 par tour. ({n} restants)' },
  bleed:    { label: 'Saignement',    kind: 'debuff', desc: 'Au début du tour du porteur, subit {n} dégâts. Ne diminue pas.' },
  ignite:   { label: 'Embrasement',   kind: 'debuff', desc: 'À la fin du tour, subit {n} dégâts. Réduit de moitié chaque tour (arrondi inférieur).' },
  chained:  { label: 'Entravé',       kind: 'debuff', desc: 'Ne peut pas gagner de Garde ce tour.' },
  marked:   { label: 'Marqué',        kind: 'debuff', desc: 'Pioche 1 carte supplémentaire quand tu attaques cet ennemi.' },
  // --- spécifique aux classes ------------------------------------------
  fracture: { label: 'Fracture',      kind: 'class', desc: 'Jauge du Briseur de Vœux. Dépensée par certaines cartes pour des effets bonus. ({n} en réserve)' },
  seal:     { label: 'Sceau',         kind: 'class', desc: 'Marque du Lieur de Sceaux. Certaines cartes consomment ou interagissent avec les ennemis Scellés. ({n} en réserve)' },
  echo:     { label: 'Écho',          kind: 'class', desc: 'Montée en puissance de la réserve. ({n} en réserve)' },
  summon:   { label: 'Serviteur lié', kind: 'class', desc: 'Puissance {n}. Au début de ton tour, ton serviteur frappe un ennemi aléatoire pour autant de dégâts.' },
};

/** Remplace {n} dans desc par le nombre de charges. */
export function describeStatus(id: string, n: number): { label: string; kind: StatusInfo['kind']; desc: string } {
  const info = STATUS_INFO[id];
  if (!info) return { label: id, kind: 'neutral', desc: `${n} charges` };
  return { label: info.label, kind: info.kind, desc: info.desc.replace(/\{n\}/g, String(n)) };
}
