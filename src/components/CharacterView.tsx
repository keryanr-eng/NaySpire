// EMBERVOW — animated character portrait wrapper.
// Composes a CharacterArt with HP bar, Ward pill, status badges, and
// reactions to hits/heals via hitSignal (a monotonically increasing number).

import React, { useEffect, useState } from 'react';
import { CharacterArt } from './CharacterArt';

export type ReactionKind = 'hit' | 'heal' | 'ward' | 'buff' | 'debuff' | 'death' | null;

interface Props {
  artId: string;
  name: string;
  hp: number;
  maxHp: number;
  ward: number;
  status: Record<string, number | undefined>;
  hitSignal?: number;                      // bump to trigger a reaction
  reactionKind?: ReactionKind;
  facing?: 'left' | 'right';
  selected?: boolean;                      // when being targeted
  highlighted?: boolean;                   // when a target must be picked
  compact?: boolean;                       // smaller portrait
  onClick?: () => void;
  intent?: React.ReactNode;                // for enemies — rendered above
  subtitle?: string;
  disabled?: boolean;
}

const STATUS_GLYPH: Record<string, { glyph: string; tint: string; label: string }> = {
  fury:     { glyph: '✦', tint: 'text-vow-blood',    label: 'Furie' },
  poise:    { glyph: '◈', tint: 'text-vow-seal',     label: 'Aplomb' },
  sigil:    { glyph: '☉', tint: 'text-vow-gold',     label: 'Sigille' },
  brittle:  { glyph: '✷', tint: 'text-ember-400',    label: 'Fragile' },
  faded:    { glyph: '◐', tint: 'text-ember-500',    label: 'Flétri' },
  bleed:    { glyph: '♥', tint: 'text-vow-blood',    label: 'Saignement' },
  ignite:   { glyph: '🜂', tint: 'text-ember-400',    label: 'Embrasement' },
  fracture: { glyph: '⚡', tint: 'text-vow-blood',    label: 'Fracture' },
  seal:     { glyph: '◉', tint: 'text-vow-seal',     label: 'Sceau' },
  chained:  { glyph: '⛓', tint: 'text-ash-200',      label: 'Entravé' },
  thorns:   { glyph: '⚘', tint: 'text-emerald-400',  label: 'Épines' },
  momentum: { glyph: '»', tint: 'text-vow-gold',     label: 'Élan' },
};

const StatusRow: React.FC<{ status: Record<string, number | undefined>; compact?: boolean }> = ({ status, compact }) => {
  const entries = Object.entries(status).filter(([k, v]) => !k.startsWith('_') && (v ?? 0) > 0);
  if (!entries.length) return null;
  return (
    <div className="flex flex-wrap gap-1 justify-center">
      {entries.map(([id, n]) => {
        const meta = STATUS_GLYPH[id] ?? { glyph: '•', tint: 'text-ash-100', label: id };
        return (
          <span
            key={id}
            title={`${meta.label} ${n}`}
            className={[
              'flex items-center gap-0.5 rounded border border-ash-400 bg-ash-700/90',
              compact ? 'text-[10px] px-1 py-[1px]' : 'text-xs px-1.5 py-0.5',
              meta.tint,
            ].join(' ')}
          >
            <span>{meta.glyph}</span>
            <span className="text-vow-gold font-semibold">{n}</span>
          </span>
        );
      })}
    </div>
  );
};

const HPBar: React.FC<{ hp: number; max: number; ward: number }> = ({ hp, max, ward }) => {
  const pct = Math.max(0, Math.min(100, (hp / Math.max(1, max)) * 100));
  return (
    <div className="w-full flex flex-col items-center gap-1">
      <div className="relative h-3 w-full rounded bg-ash-900 overflow-hidden border border-ash-500 shadow-inner">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-vow-blood via-ember-600 to-ember-400 transition-[width] duration-300"
          style={{ width: `${pct}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-ash-100 tracking-wide drop-shadow">
          {hp} / {max}
        </div>
      </div>
      {ward > 0 && (
        <div className="flex items-center gap-1 text-vow-seal text-xs font-semibold">
          <span aria-hidden>🛡</span>
          <span>{ward} Garde</span>
        </div>
      )}
    </div>
  );
};

export const CharacterView: React.FC<Props> = ({
  artId, name, hp, maxHp, ward, status,
  hitSignal = 0, reactionKind,
  facing = 'left', selected, highlighted, compact, onClick, intent, subtitle, disabled,
}) => {
  const [fx, setFx] = useState<ReactionKind>(null);

  useEffect(() => {
    if (!hitSignal) return;
    setFx(reactionKind ?? 'hit');
    const t = setTimeout(() => setFx(null), 420);
    return () => clearTimeout(t);
  }, [hitSignal, reactionKind]);

  const dead = hp <= 0;

  const portraitSize = compact ? 'w-24 h-32' : 'w-32 h-44';

  const fxClass =
    fx === 'hit'   ? 'animate-hit-flash' :
    fx === 'heal'  ? 'animate-heal-flash' :
    fx === 'ward'  ? 'animate-ward-flash' :
    fx === 'buff'  ? 'animate-buff-pulse' :
    fx === 'debuff'? 'animate-debuff-pulse' :
    fx === 'death' ? 'animate-death-fade' : '';

  const shakeClass = fx === 'hit' ? 'animate-portrait-hit' : 'animate-idle-float';

  const Wrapper: any = onClick ? 'button' : 'div';

  return (
    <Wrapper
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      disabled={onClick ? disabled : undefined}
      className={[
        'group relative flex flex-col items-center gap-2 p-2 rounded-lg transition-all',
        onClick && !disabled ? 'cursor-pointer' : '',
        highlighted ? 'ring-2 ring-ember-500 shadow-glow' : 'ring-1 ring-ash-500/30',
        selected ? 'ring-2 ring-vow-gold' : '',
        dead ? 'opacity-35 grayscale pointer-events-none' : '',
      ].join(' ')}
      style={{ background: 'radial-gradient(ellipse at center bottom, rgba(249,115,22,0.08), transparent 65%)' }}
    >
      {/* Name + subtitle */}
      <div className="text-center leading-tight">
        <div className="font-display text-vow-bone text-base truncate max-w-[180px]">{name}</div>
        {subtitle && <div className="text-[10px] uppercase tracking-widest text-ash-300">{subtitle}</div>}
      </div>

      {/* Intent slot (enemies) */}
      {intent && (
        <div className="text-xs flex items-center gap-1 px-2 py-1 rounded bg-ash-900/80 border border-ash-500 max-w-[180px]">
          {intent}
        </div>
      )}

      {/* Portrait */}
      <div className={['relative', portraitSize, shakeClass].join(' ')}
           style={{ transform: facing === 'right' ? 'scaleX(-1)' : undefined }}>
        <CharacterArt artId={artId} className={['w-full h-full', fxClass].join(' ')} />
        {/* selection ground ring */}
        {highlighted && (
          <div className="absolute inset-x-0 bottom-0 h-2 pointer-events-none">
            <div className="mx-auto w-24 h-2 rounded-full bg-ember-500/40 blur-sm animate-pulse" />
          </div>
        )}
      </div>

      {/* HP + Ward */}
      <div className="w-full max-w-[180px]">
        <HPBar hp={Math.max(0, hp)} max={maxHp} ward={ward} />
      </div>

      {/* Status */}
      <StatusRow status={status} compact={compact} />
    </Wrapper>
  );
};
