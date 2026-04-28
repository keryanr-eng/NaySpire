// EMBERVOW — Card view. Used in combat hand, deck viewer, shops, and reward screens.
// Purely presentational: the parent passes a CardDef and callbacks.
// Polish pass: bigger ember-cost orb, playable glow, smoother hover, play animation.

import React from 'react';
import type { CardDef } from '../types';
import { sfx } from '../systems/sound';

interface Props {
  def: CardDef;
  upgraded?: boolean;
  disabled?: boolean;
  affordable?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  selected?: boolean;
  footer?: React.ReactNode;
  dim?: boolean;
  playing?: boolean;           // briefly animate upward as card is spent
}

const sizeMap = {
  sm: 'w-32 h-44 text-xs',
  md: 'w-44 h-60 text-sm',
  lg: 'w-56 h-72 text-base',
};

const rarityClass: Record<string, string> = {
  starter: 'card-rarity-common',
  common: 'card-rarity-common',
  uncommon: 'card-rarity-uncommon',
  rare: 'card-rarity-rare',
  curse: 'card-rarity-curse',
  status: 'card-rarity-curse',
  special: 'card-rarity-uncommon',
};

const typeBadgeClass: Record<string, string> = {
  attack: 'bg-vow-blood/70 text-ash-100',
  skill: 'bg-vow-seal/60 text-ash-100',
  power: 'bg-vow-gold/80 text-ash-900',
  curse: 'bg-vow-blood/90 text-ash-100',
  status: 'bg-ash-500/80 text-ash-100',
};

const typeGlyph: Record<string, string> = {
  attack: '⚔',
  skill: '◈',
  power: '✦',
  curse: '☠',
  status: '•',
};

const typeLabel: Record<string, string> = {
  attack: 'Attaque',
  skill: 'Compétence',
  power: 'Pouvoir',
  curse: 'Malédiction',
  status: 'Statut',
};

export const CardView: React.FC<Props> = ({
  def, upgraded, disabled, affordable = true, onClick,
  size = 'md', selected, footer, dim, playing,
}) => {
  const rarityCss = rarityClass[def.rarity] ?? 'card-rarity-common';
  const isPlayable = affordable && !disabled;
  const isLarge = size === 'lg';
  return (
    <button
      type="button"
      onMouseEnter={() => isPlayable && sfx.cardHover()}
      onClick={onClick}
      disabled={disabled}
      data-card-root
      className={[
        'card-face', rarityCss, sizeMap[size],
        'relative rounded-lg flex flex-col text-left transition-all duration-150',
        isLarge ? 'px-4 py-4' : 'px-2 py-2',
        isPlayable ? 'card-playable hover:-translate-y-2' : 'card-unplayable cursor-not-allowed',
        selected ? 'ring-2 ring-vow-gold -translate-y-3 shadow-glow' : '',
        dim ? 'opacity-50' : '',
        playing ? 'animate-card-play' : '',
      ].join(' ')}
    >
      {/* Ember cost orb — small, anchored TOP-LEFT corner. The old big
          mid-left orb dominated the card face and cut the description in
          half; a smaller top-left coin reads like a classic TCG mana cost
          and leaves the whole card face free for art + text. */}
      <div className={isLarge ? 'absolute -left-3 -top-3 z-10' : 'absolute -left-2 -top-2 z-10'}>
        <div className={[
          'rounded-full flex items-center justify-center font-display font-bold border-2',
          isLarge ? 'w-10 h-10 text-lg' : 'w-8 h-8 text-base',
          def.cost < 0
            ? 'bg-gradient-to-br from-vow-gold via-ember-500 to-ember-700 text-ash-900 border-vow-gold'
            : affordable
              ? 'bg-gradient-to-br from-ember-400 via-ember-600 to-ember-900 text-ash-100 border-vow-gold'
              : 'bg-ash-700 text-ash-300 border-ash-400',
        ].join(' ')}
             style={{ boxShadow: affordable ? '0 2px 6px rgba(0,0,0,0.8), 0 0 10px rgba(249,115,22,0.55)' : '0 2px 6px rgba(0,0,0,0.8)' }}>
          {def.cost < 0 ? 'X' : def.cost}
        </div>
      </div>

      {/* Type badge top-right */}
      <div className={isLarge ? 'flex justify-end mb-3' : 'flex justify-end mb-1'}>
        <span className={[
          'uppercase tracking-wider rounded flex items-center gap-1',
          isLarge ? 'text-[12px] px-2 py-1' : 'text-[10px] px-1.5 py-0.5',
          typeBadgeClass[def.type],
        ].join(' ')}>
          <span aria-hidden>{typeGlyph[def.type] ?? '•'}</span>
          <span>{typeLabel[def.type] ?? def.type}</span>
        </span>
      </div>

      {/* title */}
      <div className={[
        'font-display text-vow-bone leading-tight',
        isLarge ? 'text-[22px]' : 'text-[13px] md:text-[15px]',
      ].join(' ')}>
        {def.name}{upgraded && !def.upgradeOf ? '+' : ''}
      </div>
      {/* separator */}
      <div className={isLarge ? 'h-px bg-ash-500 my-2 opacity-70' : 'h-px bg-ash-500 my-1 opacity-70'} />
      {/* text */}
      <div className={[
        'text-ash-200 whitespace-pre-wrap',
        isLarge ? 'text-[16px] leading-relaxed' : 'text-[11px] md:text-[12px] leading-snug flex-1',
      ].join(' ')}>
        {def.text}
      </div>
      {footer}
    </button>
  );
};
