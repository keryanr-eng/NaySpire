// EMBERVOW — combat screen.
// Top HUD with class name + wide HP bar + ember + gold + potion slots.
// Arena: hero scene-left, enemies scene-right (each with HP pill + intent pill).
// Hand bottom. Footer: pile counts + End Turn.

import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../state/game';
import { getCard } from '../data/cards';
import { getPotion } from '../data/potions';
import type { EnemyInstance, IntentKind, SummonInstance } from '../types';
import { CardView } from './Card';
import { CharacterArt } from './CharacterArt';
import type { ReactionKind } from './CharacterView';
import { sfx } from '../systems/sound';
import { previewCardDamage } from '../systems/preview';
import { EmberPlaque, GoldPlaque } from './StatPlaques';
import { SceneBackdrop, StageFloor } from './SceneBackdrop';
import { Sprite } from './Sprite';
import { SPRITES, resolveSprite } from '../assets/sprites';
import { PortraitImage } from './PortraitImage';
import { getPlayerPortrait, getEnemyPortrait } from '../assets/portraits';
import { getPotionArt, getRelicArt } from '../assets/generatedAssets';
import { Tooltip, TooltipBody } from './Tooltip';
import { describeStatus } from '../data/statusInfo';
import { getRelic } from '../data/relics';

const tierLabel: Record<string, string> = {
  starter: 'Départ',
  common: 'Commun',
  uncommon: 'Peu commun',
  rare: 'Rare',
  boss: 'Boss',
};

function hasSprite(id: string): boolean {
  return !!SPRITES[id];
}

const intentColor: Record<IntentKind, string> = {
  attack: 'text-vow-blood',
  attack_multi: 'text-vow-blood',
  defend: 'text-vow-seal',
  buff: 'text-vow-gold',
  debuff: 'text-ember-500',
  summon: 'text-ash-200',
  special: 'text-ember-400',
  unknown: 'text-ash-300',
};
const intentGlyph: Record<IntentKind, string> = {
  attack: '⚔', attack_multi: '⚔⚔', defend: '🛡', buff: '✦', debuff: '☠', summon: '◈', special: '◉', unknown: '?',
};

const FLOAT_KEEP_MS = 1700;
const ENEMY_ATTACK_STAGGER_MS = 700;
const ENEMY_ATTACK_SEQUENCE_PAD_MS = 900;
const SUMMON_ATTACK_SEQUENCE_MS = 1250;

type SlashFx = {
  id: number;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  tone: 'hero' | 'enemy';
};

const SUMMON_SERVANT_ART = '/assets/generated/summons/bound_servant.png';

// ---------------- Status row ----------------

const STATUS_GLYPH: Record<string, { glyph: string; tint: string; label: string }> = {
  fury:     { glyph: '✦', tint: 'text-vow-blood', label: 'Furie' },
  poise:    { glyph: '◈', tint: 'text-vow-seal',  label: 'Aplomb' },
  sigil:    { glyph: '☉', tint: 'text-vow-gold',  label: 'Sigille' },
  brittle:  { glyph: '✷', tint: 'text-ember-400', label: 'Fragile' },
  faded:    { glyph: '◐', tint: 'text-ember-500', label: 'Flétri' },
  bleed:    { glyph: '♥', tint: 'text-vow-blood', label: 'Saignement' },
  ignite:   { glyph: '🜂', tint: 'text-ember-400', label: 'Embrasement' },
  fracture: { glyph: '⚡', tint: 'text-vow-blood', label: 'Fracture' },
  seal:     { glyph: '◉', tint: 'text-vow-seal',  label: 'Sceau' },
  chained:  { glyph: '⛓', tint: 'text-ash-200',   label: 'Entravé' },
  thorns:   { glyph: '⚘', tint: 'text-emerald-400', label: 'Épines' },
  momentum: { glyph: '»', tint: 'text-vow-gold',  label: 'Élan' },
  echo:     { glyph: '◇', tint: 'text-purple-300', label: 'Echo' },
  summon:   { glyph: '✦', tint: 'text-purple-300', label: 'Serviteur lie' },
};

const StatusRow: React.FC<{ status: Record<string, number | undefined>; align?: 'left' | 'center' | 'right'; size?: 'sm' | 'lg' }> = ({ status, align = 'center', size = 'sm' }) => {
  const entries = Object.entries(status).filter(([k, v]) => !k.startsWith('_') && (v ?? 0) > 0);
  if (!entries.length) return null;
  const large = size === 'lg';
  return (
    <div className={['flex flex-wrap', large ? 'gap-2' : 'gap-1', align === 'center' ? 'justify-center' : align === 'right' ? 'justify-end' : 'justify-start'].join(' ')}>
      {entries.map(([id, n]) => {
        const m = STATUS_GLYPH[id] ?? { glyph: '•', tint: 'text-ash-100', label: id };
        const spriteId = `status_${id}`;
        const useSprite = hasSprite(spriteId);
        const info = describeStatus(id, n as number);
        const kindTint =
          info.kind === 'buff'   ? 'text-emerald-300' :
          info.kind === 'debuff' ? 'text-vow-blood'   :
          info.kind === 'class'  ? 'text-vow-gold'    : 'text-ash-200';
        const tooltipText = `${info.label} ${n}\n${info.kind.toUpperCase()}\n${info.desc}`;
        return (
          <span
            key={id}
            title={tooltipText}
            tabIndex={0}
            className={[
              'relative group/status flex items-center rounded border border-vow-gold/50 bg-ash-900/90 cursor-help shadow-[0_3px_10px_rgba(0,0,0,0.65)] outline-none focus-visible:ring-2 focus-visible:ring-vow-gold',
              large ? 'gap-2 px-2.5 py-1.5 text-sm' : 'gap-1 px-1.5 py-0.5 text-xs',
              m.tint,
            ].join(' ')}>
            {useSprite
              ? <Sprite id={spriteId} w={large ? 26 : 18} h={large ? 26 : 18} />
              : <span className={large ? 'text-xl leading-none' : ''}>{m.glyph}</span>}
            <span className={['font-display font-bold leading-none', large ? 'text-lg' : 'text-xs', kindTint].join(' ')}>{n}</span>
            <span className={[
              'invisible opacity-0 group-hover/status:visible group-hover/status:opacity-100 group-focus-visible/status:visible group-focus-visible/status:opacity-100',
              'absolute left-1/2 bottom-full mb-2 -translate-x-1/2 z-[90] w-72 pointer-events-none transition-opacity duration-150',
              'rounded-md border border-vow-gold/70 bg-ash-900/95 px-3 py-2 text-left text-ash-100 shadow-[0_8px_24px_rgba(0,0,0,0.85)]',
            ].join(' ')}>
              <TooltipBody title={`${info.label} ${n}`} subtitle={info.kind.toUpperCase()} desc={info.desc} />
            </span>
          </span>
        );
      })}
    </div>
  );
};

const SummonServants: React.FC<{
  summons: SummonInstance[];
  activeAttack: { slot: number; nonce: number } | null;
  hitSignals: Record<string, number>;
  floats: Array<{ id: number; targetId: string; text: string; tone: string }>;
  registerRef?: (slot: number, el: HTMLDivElement | null) => void;
}> = ({ summons, activeAttack, hitSignals, floats, registerRef }) => {
  const living = summons.filter((s) => s.hp > 0).sort((a, b) => a.slot - b.slot);
  if (!living.length) return null;
  return (
    <div className="relative flex-shrink-0 w-[22rem] h-[34vh] max-h-[22rem] flex items-end justify-center pointer-events-none">
      <div className="flex items-end justify-center gap-3">
        {living.map((s) => {
          const attacking = activeAttack?.slot === s.slot;
          const hitSignal = hitSignals[s.id] ?? 0;
          const hpPct = Math.max(0, Math.min(100, (s.hp / Math.max(1, s.maxHp)) * 100));
          return (
            <div key={s.id} className="relative flex flex-col items-center">
              <div
                ref={(el) => registerRef?.(s.slot, el)}
                key={`${s.id}-${attacking ? activeAttack?.nonce : hitSignal ? `hit-${hitSignal}` : 'idle'}`}
                className={[
                  'summon-unit-shell',
                  attacking ? 'animate-hero-strike summon-unit-hero-strike' : hitSignal ? 'animate-summon-unit-hit' : 'animate-summon-unit-idle',
                  s.slot === 1 ? 'translate-y-[-0.75rem]' : '',
                ].join(' ')}
              >
                <img src={SUMMON_SERVANT_ART} alt="" className="summon-unit-img" draggable={false} />
                {hitSignal > 0 && !attacking && <span className="summon-hit-burst" aria-hidden="true" />}
                {attacking && (
                  <>
                    <span className="summon-attack-wake" aria-hidden="true" />
                    <span className="summon-attack-impact" aria-hidden="true" />
                  </>
                )}
                <div className="absolute inset-x-0 top-[22%] flex flex-col items-center pointer-events-none z-30">
                  {floats.filter((f) => f.targetId === s.id).map((f) => (
                    <span key={f.id} className={[
                      f.tone === 'dmg' ? 'animate-damage-number damage-number text-4xl' : 'animate-float text-2xl font-bold drop-shadow',
                      f.tone === 'dmg' ? 'text-[#fff1cf]' : f.tone === 'heal' ? 'text-emerald-400' : f.tone === 'ward' ? 'text-vow-seal' : 'text-vow-gold',
                    ].join(' ')}>{f.text}</span>
                  ))}
                </div>
              </div>
              <div className="relative -mt-4 h-6 w-24 overflow-hidden rounded-md border border-purple-300/70 bg-black/80 shadow-[0_3px_12px_rgba(0,0,0,0.85)]">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-900 via-purple-600 to-purple-300"
                  style={{ width: `${hpPct}%` }}
                />
                <div className="relative flex h-full items-center justify-center text-[0.8rem] font-display font-bold text-ash-100 drop-shadow">
                  {Math.max(0, s.hp)}/{s.maxHp}
                </div>
              </div>
              <div className="mt-1 rounded-md border border-purple-300/45 bg-black/75 px-2 py-0.5 font-display text-[0.82rem] font-bold text-purple-100 shadow-[0_0_12px_rgba(126,34,206,0.35)]">
                ATQ {s.damage}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const BurstFx: React.FC<{ kind: ReactionKind; signal: number; compact?: boolean }> = ({ kind, signal, compact }) => {
  if (!kind) return null;
  const count = kind === 'death' ? 18 : kind === 'hit' ? 12 : 10;
  const className =
    kind === 'hit' ? 'combat-spark combat-spark-hit' :
    kind === 'death' ? 'combat-spark combat-spark-death' :
    kind === 'heal' ? 'combat-spark combat-spark-heal' :
    kind === 'ward' ? 'combat-spark combat-spark-ward' :
    'combat-spark combat-spark-status';

  return (
    <div key={`${kind}-${signal}`} className="absolute inset-0 pointer-events-none z-40 overflow-visible">
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * Math.PI * 2;
        const radius = compact ? 38 : 54;
        const dx = Math.cos(angle) * radius;
        const dy = Math.sin(angle) * radius * 0.72;
        const delay = (i % 5) * 22;
        return (
          <span
            key={i}
            className={className}
            style={{
              left: `${46 + Math.cos(angle) * 8}%`,
              top: `${48 + Math.sin(angle) * 6}%`,
              ['--dx' as string]: `${dx}px`,
              ['--dy' as string]: `${dy}px`,
              animationDelay: `${delay}ms`,
            }}
          />
        );
      })}
    </div>
  );
};

// ---------------- Scene enemy card ----------------

const SceneEnemy: React.FC<{
  e: EnemyInstance;
  hitSignal: number;
  reaction: ReactionKind;
  targeting: boolean;
  onClick: () => void;
  onHover?: (enemyId: string | null) => void;
  floats: Array<{ id: number; text: string; tone: string }>;
  compact: boolean;
  /** Previewed total damage against this enemy from the card the player is
   *  currently targeting. `null` to hide the chip. */
  damagePreview?: number | null;
  /** True on the enemy's own turn — the intent pill pulses harder to
   *  telegraph that the blow is imminent. */
  imminent?: boolean;
  /** True when this enemy is the keyboard-focused target (Tab to cycle). */
  keyboardTarget?: boolean;
  /** Opaque registration callback so the parent can aim the arrow. */
  registerRef?: (id: string, el: HTMLButtonElement | null) => void;
  /** Increments when this enemy performs an attack — triggers a lunge
   *  animation on the portrait so the strike is physically visible. */
  attackSignal?: number;
}> = ({ e, hitSignal, reaction, targeting, onClick, onHover, floats, compact, damagePreview, imminent, keyboardTarget, registerRef, attackSignal }) => {
  const [fx, setFx] = useState<ReactionKind>(null);
  useEffect(() => {
    if (!hitSignal) return;
    setFx(reaction);
    const t = setTimeout(() => setFx(null), 420);
    return () => clearTimeout(t);
  }, [hitSignal, reaction]);

  // Lunge animation — runs for ~520ms when attackSignal increments.
  // Kept separate from `fx` so the hit-flash the enemy receives from the
  // player's counter-attack doesn't cancel its own strike motion.
  const [lunging, setLunging] = useState(false);
  useEffect(() => {
    if (!attackSignal) return;
    setLunging(true);
    const t = setTimeout(() => setLunging(false), 520);
    return () => clearTimeout(t);
  }, [attackSignal]);

  const dead = e.hp <= 0;
  // Fully unmount the enemy once its death fade has played. Without this
  // the button stayed in the DOM with `opacity-30 grayscale`, which left a
  // grey silhouette sitting on the battlefield. Now we fade the whole
  // button to opacity-0 immediately, then drop it out of the render a
  // moment later so the other enemies can reflow and fill the gap.
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    if (!dead) { setHidden(false); return; }
    const t = setTimeout(() => setHidden(true), 500);
    return () => clearTimeout(t);
  }, [dead]);
  if (hidden) return null;
  const hpPct = Math.max(0, Math.min(100, (e.hp / Math.max(1, e.maxHp)) * 100));
  // Lunge takes precedence: when the enemy strikes, we play the lunge
  // animation on the animation wrapper even if it also got counter-hit
  // on the same frame. Hit flash is a separate overlay so the red flash
  // still reads.
  const fxClass = lunging
    ? 'animate-enemy-lunge'
    : fx === 'hit' ? 'animate-hit-flash animate-enemy-damage-recoil' :
      fx === 'heal' ? 'animate-heal-flash' :
      fx === 'ward' ? 'animate-ward-flash' :
      fx === 'death' ? 'animate-death-fade' : 'animate-idle-float';

  const c = intentColor[e.nextIntent.kind];
  const g = intentGlyph[e.nextIntent.kind];

  // Enemy portrait source is landscape (1024×768 = 4:3), so use landscape
  // containers so the rat fills the box instead of shrinking inside tall
  // letterboxed padding. Heights are viewport-relative with a rem max, so
  // the rats scale to the available arena on any window size without ever
  // forcing the page to scroll.
  const size = compact
    ? 'w-[14rem] h-[20vh] max-h-[12rem]'
    : 'w-[18rem] h-[26vh] max-h-[16rem]';

  // When the player is targeting, we hint which enemy is pickable via a
  // soft orange drop-shadow on the PORTRAIT only (not a hard ring wrapping
  // the whole column, which created a big ugly rectangle around the
  // intent pill + HP bar too). When hovered or keyboard-selected, the
  // glow intensifies.
  const targetableGlow =
    targeting && !dead
      ? 'drop-shadow(0 0 10px rgba(249,115,22,0.55))'
      : '';
  const activeGlow =
    !dead && (keyboardTarget || targeting)
      ? keyboardTarget
        ? 'drop-shadow(0 0 18px rgba(212,162,76,0.9))'
        : ''
      : '';

  return (
    <button
      type="button"
      ref={(el) => registerRef?.(e.id, el)}
      onClick={onClick}
      onMouseEnter={() => onHover?.(e.id)}
      onMouseLeave={() => onHover?.(null)}
      disabled={dead}
      className={[
        'group relative flex flex-col items-center gap-2 p-1 rounded-lg transition-all duration-300',
        dead ? 'opacity-0 scale-90 pointer-events-none' : '',
        targeting && !dead ? 'cursor-crosshair' : '',
      ].join(' ')}
    >
      {/* Status badges — floated ABOVE the portrait (over the head),
          so the HP pill can be the LAST element in this column. That's
          what lets every combatant's HP bar line up at the same y, since
          the outer arena uses `items-end` to bottom-align columns. */}
      

      {/* Intent pill — also above portrait for the same alignment reason.
          Classic RPG convention: "next move" floats over the enemy's head.
          Idle breathing pulse draws the eye; swaps to a harder red pulse
          on the enemy's own turn to telegraph that the blow is imminent. */}
      {!dead && (
        <div
          className={[
            'flex items-center gap-2 rounded-lg bg-ash-900/95 border-2 px-3 py-1.5 shadow-xl max-w-[220px]',
            imminent ? 'border-vow-blood/80 animate-intent-imminent' : 'border-vow-gold/50 animate-intent-breathe',
            c,
          ].join(' ')}
          style={{ boxShadow: '0 4px 10px rgba(0,0,0,0.7)' }}
          title={e.nextIntent.description}
        >
          <span className="text-lg leading-none">{g}</span>
          <span className="text-sm font-display font-semibold leading-tight">{e.nextIntent.description ?? e.nextIntent.kind}</span>
          {/* Damage badge — when the intent is an attack, show the exact
              hit value so the player can plan their ward/heal without
              having to parse the label. */}
          {(e.nextIntent.kind === 'attack' || e.nextIntent.kind === 'attack_multi') && e.nextIntent.value != null && (
            <span className="ml-1 px-1.5 py-0.5 rounded bg-vow-blood/30 border border-vow-blood/70 text-ash-100 font-display font-bold text-sm leading-none">
              {e.nextIntent.value}{e.nextIntent.hits && e.nextIntent.hits > 1 ? `×${e.nextIntent.hits}` : ''}
            </span>
          )}
        </div>
      )}

      <div
        className={['relative', size].join(' ')}
        style={{
          filter: [activeGlow, targetableGlow].filter(Boolean).join(' ') || undefined,
          transition: 'filter 200ms ease-out',
        }}
      >
        {/* True ground shadow — an ellipse painted AT the container bottom
            (= ground line), not below it. Tighter and darker in the center,
            falling to transparent at the edges, so the rat looks anchored. */}
        <div
          className="absolute left-1/2 bottom-0 -translate-x-1/2 w-[78%] h-7 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 55%, transparent 100%)',
            filter: 'blur(4px)',
          }}
        />
        {/* Soft wider halo — extends contact shadow without lifting the unit */}
        <div
          className="absolute left-1/2 bottom-0 -translate-x-1/2 w-[100%] h-10 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 55% 45% at 50% 60%, rgba(0,0,0,0.35) 0%, transparent 70%)',
            filter: 'blur(8px)',
          }}
        />
        {/* Animation layer — enemy portraits declare whether they need a
            horizontal flip to face the player on screen-left. Hit shake /
            death fade / idle float animations apply directly on this wrapper. */}
        <div className={['absolute inset-0', fxClass].join(' ')}>
          {(() => {
            const portrait = getEnemyPortrait(e.defId);
            return (
              <PortraitImage
                portrait={portrait}
                mirror={portrait.mirrorInCombat}
                className="w-full h-full drop-shadow-[0_22px_26px_rgba(0,0,0,0.9)]"
                style={{ objectPosition: 'center calc(100% + 5vh)' }}
                title={e.name}
              />
            );
          })()}
        </div>

        {/* Impact FX — fires once per hit, unflipped, above the portrait.
            Two layered effects: a red radial flash that pops and fades, and
            a burst of orange streaks emitted from the center. `key={hitSignal}`
            remounts the elements on every hit so the CSS animations replay. */}
        {fx === 'hit' && (
          <>
            <div
              key={`flash-${hitSignal}`}
              className="absolute inset-0 pointer-events-none z-20 animate-impact-flash"
              style={{
                background:
                  'radial-gradient(circle at 50% 58%, rgba(255,80,40,0.85) 0%, rgba(255,140,60,0.5) 22%, rgba(255,80,40,0) 60%)',
                mixBlendMode: 'screen',
              }}
            />
            <svg
              key={`sparks-${hitSignal}`}
              className="absolute inset-0 pointer-events-none z-20"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <g className="animate-spark-burst" style={{ transformOrigin: '50% 58%' }}>
                {Array.from({ length: 8 }).map((_, i) => {
                  const angle = (i * 45 - 90) * (Math.PI / 180);
                  const r1 = 6, r2 = 22;
                  const x1 = 50 + Math.cos(angle) * r1;
                  const y1 = 58 + Math.sin(angle) * r1;
                  const x2 = 50 + Math.cos(angle) * r2;
                  const y2 = 58 + Math.sin(angle) * r2;
                  return (
                    <line
                      key={i}
                      x1={x1} y1={y1} x2={x2} y2={y2}
                      stroke="#ffd089"
                      strokeWidth={0.8}
                      strokeLinecap="round"
                      opacity={0.9}
                    />
                  );
                })}
                <circle cx="50" cy="58" r="3" fill="#fff1cf" opacity="0.95" />
              </g>
            </svg>
          </>
        )}

        {/* Damage preview chip — shown when the player is targeting an
            attack card and hovering this enemy. Large red number anchored
            at the top so it's readable at a glance. */}
        <BurstFx kind={fx ?? (dead ? 'death' : null)} signal={hitSignal} compact={compact} />

        {damagePreview != null && damagePreview > 0 && (
          <div className="absolute left-1/2 -translate-x-1/2 top-2 z-30 pointer-events-none animate-dmg-preview">
            <div className="flex items-center gap-1 px-3 py-1 rounded-md bg-vow-blood/90 border-2 border-vow-gold/60 shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
              <span className="text-ash-100 text-base leading-none">⚔</span>
              <span className="font-display font-black text-2xl text-ash-100 leading-none tracking-tight drop-shadow-[0_2px_3px_rgba(0,0,0,0.9)]">
                −{damagePreview}
              </span>
            </div>
          </div>
        )}

        {/* Float overlay — rendered UNFLIPPED on top of everything. */}
        <div className="absolute inset-x-0 top-[18%] flex flex-col items-center pointer-events-none z-30">
          {floats.map((f) => (
            <span key={f.id} className={[
              f.tone === 'dmg' ? 'animate-damage-number damage-number text-5xl' : f.tone === 'ward' ? 'animate-damage-number damage-number text-4xl' : 'animate-float text-3xl font-bold drop-shadow',
              f.tone === 'dmg' ? 'text-[#fff1cf]' : f.tone === 'heal' ? 'text-emerald-400' : f.tone === 'ward' ? 'text-vow-seal' : 'text-vow-gold',
            ].join(' ')}>{f.text}</span>
          ))}
        </div>
      </div>

      {/* HP pill — bigger, bolder */}
      <div className="flex items-stretch gap-2">
      <div className="relative flex items-stretch h-9 rounded-lg overflow-hidden border-2 border-vow-gold/70 shadow-xl"
           style={{ boxShadow: '0 4px 14px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(212,162,76,0.4)' }}>
        {/* shield notch */}
        <div className="flex items-center justify-center px-2.5 bg-gradient-to-b from-vow-blood to-[#4a0f18] text-ash-100 border-r border-vow-gold/60">
          <span className="text-base leading-none">🛡</span>
        </div>
        <div className="relative w-36 bg-ash-900">
          <div className="absolute inset-y-0 left-0 transition-[width] duration-300"
               style={{
                 width: `${hpPct}%`,
                 background: 'linear-gradient(90deg, #8b1e2b 0%, #c2410c 60%, #fb923c 100%)',
                 boxShadow: 'inset 0 -4px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
               }} />
          <div className="relative flex items-center justify-center h-full">
            <span className="text-vow-blood text-base leading-none mr-1">⚔</span>
            <span className="text-ash-100 font-display font-bold text-base leading-none tracking-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
              {Math.max(0, e.hp)}/{e.maxHp}
            </span>
          </div>
        </div>
      </div>
      {e.ward > 0 && (
        <div className="relative flex items-stretch h-9 rounded-lg overflow-hidden border-2 border-vow-seal/80 shadow-xl animate-ward-appear"
             style={{ boxShadow: '0 4px 14px rgba(0,0,0,0.8), 0 0 14px rgba(59,130,246,0.35), inset 0 0 0 1px rgba(147,197,253,0.35)' }}>
          <div className="flex items-center justify-center px-2.5 bg-gradient-to-b from-[#1e3a8a] to-[#0f1e44] text-ash-100 border-r border-vow-seal/70">
            <span className="text-base leading-none">ðŸ›¡</span>
          </div>
          <div className="relative flex min-w-[3.25rem] items-center justify-center bg-ash-900 px-3">
            <span className="font-display text-base font-bold leading-none text-vow-seal drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
              {e.ward}
            </span>
          </div>
        </div>
      )}
      </div>
      <div className="absolute left-1/2 bottom-[-2.45rem] -translate-x-1/2 min-w-[16rem] pointer-events-auto z-20">
        <StatusRow status={e.status as any} align="center" size="lg" />
      </div>

    </button>
  );
};

// ---------------- Main combat screen ----------------

export const CombatScreen: React.FC = () => {
  const combat = useGame((s) => s.combat);
  const run = useGame((s) => s.run);
  const playCard = useGame((s) => s.combatPlayCard);
  const endTurn = useGame((s) => s.combatEndTurn);
  const usePotion = useGame((s) => s.combatUsePotion);
  const abandonRun = useGame((s) => s.abandonRun);

  const [targeting, setTargeting] = useState<null | { uid: string; forPotionSlot?: number }>(null);
  const [xCost, setXCost] = useState<number | null>(null);
  const [playingUid, setPlayingUid] = useState<string | null>(null);
  const [shaking, setShaking] = useState(false);
  const [showDeck, setShowDeck] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [openPile, setOpenPile] = useState<null | 'draw' | 'discard' | 'banish'>(null);
  const [hoveredCardUid, setHoveredCardUid] = useState<string | null>(null);
  const heroRef = useRef<HTMLDivElement | null>(null);
  const [heroStriking, setHeroStriking] = useState(false);
  const [heroAttackOffset, setHeroAttackOffset] = useState({ dx: 170, dy: -16 });
  const [slashFx, setSlashFx] = useState<SlashFx | null>(null);

  // Deltas → portrait reactions / sfx
  const prevPlayerHp = useRef(combat?.player.hp ?? 0);
  const prevPlayerWard = useRef(combat?.player.ward ?? 0);
  const [displayedPlayerVitals, setDisplayedPlayerVitals] = useState({
    hp: combat?.player.hp ?? 0,
    maxHp: combat?.player.maxHp ?? 1,
    ward: combat?.player.ward ?? 0,
  });
  const prevEnemyState = useRef<Record<string, { hp: number; ward: number }>>({});
  const prevSummonState = useRef<Record<string, { hp: number; ward: number }>>({});
  const [playerSignal, setPlayerSignal] = useState(0);
  const [playerReact, setPlayerReact] = useState<ReactionKind>(null);
  const [enemySignals, setEnemySignals] = useState<Record<string, { n: number; kind: ReactionKind }>>({});
  const [summonHitSignals, setSummonHitSignals] = useState<Record<string, number>>({});
  // Per-enemy "attack signal" — a monotonically increasing counter the
  // SceneEnemy watches to play its lunge animation. We fire these in a
  // staggered sequence when the player ends their turn, so each attacker
  // visibly winds up and strikes instead of the whole turn resolving in
  // one silent frame.
  const [attackSignals, setAttackSignals] = useState<Record<string, number>>({});
  const triggerEnemyAttacks = (enemies: EnemyInstance[], startDelay = 0) => {
    const attackers = enemies.filter((e) =>
      e.hp > 0 &&
      (e.nextIntent.kind === 'attack' || e.nextIntent.kind === 'attack_multi')
    );
    attackers.forEach((e, i) => {
      // Stagger so multiple attackers don't overlap — each lunge is
      // ~520ms, we leave a small gap between them.
      setTimeout(() => {
        setAttackSignals((prev) => ({ ...prev, [e.id]: (prev[e.id] ?? 0) + 1 }));
        triggerEnemySlash(e.id);
      }, startDelay + i * ENEMY_ATTACK_STAGGER_MS);
    });
    return attackers.length
      ? startDelay + (attackers.length - 1) * ENEMY_ATTACK_STAGGER_MS + ENEMY_ATTACK_SEQUENCE_PAD_MS
      : 0;
  };

  // Float text buffer
  const [floats, setFloats] = useState<Array<{ id: number; targetId: string; text: string; tone: string }>>([]);
  const pendingEnemyDisplayOffset = useRef(0);
  useEffect(() => {
    if (!combat) return;
    const next = {
      hp: combat.player.hp,
      maxHp: combat.player.maxHp,
      ward: combat.player.ward,
    };
    const isDamageReveal = next.hp < displayedPlayerVitals.hp || next.ward < displayedPlayerVitals.ward;
    const delay = isDamageReveal ? pendingEnemyDisplayOffset.current : 0;
    if (delay > 0) {
      setDisplayedPlayerVitals((prev) => ({ ...prev, maxHp: next.maxHp }));
      const t = window.setTimeout(() => setDisplayedPlayerVitals(next), delay);
      return () => window.clearTimeout(t);
    }
    setDisplayedPlayerVitals(next);
  }, [combat?.player.hp, combat?.player.maxHp, combat?.player.ward]);

  useEffect(() => {
    if (!combat?.pendingFloat?.length) return;
    const now = Date.now();
    const added = combat.pendingFloat.map((f, i) => ({ id: now + i, ...f }));
    combat.pendingFloat.length = 0;
    const timers: number[] = [];
    const enemyOffset = pendingEnemyDisplayOffset.current;
    for (const item of added) {
      const delay = (item.delayMs ?? 0) + (item.source === 'enemy' ? enemyOffset : 0);
      timers.push(window.setTimeout(() => {
        setFloats((prev) => [...prev, item]);
        timers.push(window.setTimeout(() => {
          setFloats((prev) => prev.filter((f) => f.id !== item.id));
        }, FLOAT_KEEP_MS));
      }, delay));
    }
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [combat?.pendingFloat?.length]);

  const [activeSummonAttack, setActiveSummonAttack] = useState<{ slot: number; nonce: number } | null>(null);
  useEffect(() => {
    if (!combat?.pendingSummonAttacks?.length) return;
    const attacks = [...combat.pendingSummonAttacks];
    combat.pendingSummonAttacks.length = 0;
    const timers: number[] = [];
    for (const a of attacks) {
      timers.push(window.setTimeout(() => {
        const nonce = Date.now() + a.servantIndex;
        setActiveSummonAttack({ slot: a.servantIndex, nonce });
        triggerSummonSlash(a.servantIndex, a.targetId);
        setEnemySignals((prev) => ({ ...prev, [a.targetId]: { n: (prev[a.targetId]?.n ?? 0) + 1, kind: 'hit' } }));
        sfx.damage();
        timers.push(window.setTimeout(() => {
          setActiveSummonAttack((current) => current?.nonce === nonce ? null : current);
        }, 980));
      }, a.delayMs));
    }
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [combat?.pendingSummonAttacks?.length]);

  useEffect(() => {
    if (!combat) return;
    const next: Record<string, number> = { ...summonHitSignals };
    let dirty = false;
    for (const s of combat.summons ?? []) {
      const prev = prevSummonState.current[s.id];
      if (!prev) { prevSummonState.current[s.id] = { hp: s.hp, ward: s.ward }; continue; }
      if (s.hp < prev.hp || s.ward < prev.ward) {
        next[s.id] = (next[s.id] ?? 0) + 1;
        dirty = true;
      }
      prevSummonState.current[s.id] = { hp: s.hp, ward: s.ward };
    }
    for (const id of Object.keys(prevSummonState.current)) {
      if (!(combat.summons ?? []).some((s) => s.id === id)) delete prevSummonState.current[id];
    }
    if (dirty) setSummonHitSignals(next);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [combat?.summons.map((s) => `${s.id}:${s.hp}:${s.ward}`).join('|')]);

  useEffect(() => {
    if (!combat) return;
    const hp = combat.player.hp, ward = combat.player.ward;
    const ph = prevPlayerHp.current, pw = prevPlayerWard.current;
    if (hp < ph) {
      const delay = pendingEnemyDisplayOffset.current;
      window.setTimeout(() => {
        setPlayerReact('hit'); setPlayerSignal((n) => n + 1);
        setShaking(true); sfx.damage();
        setTimeout(() => setShaking(false), 360);
      }, delay);
    } else if (ward < pw) {
      const delay = pendingEnemyDisplayOffset.current;
      window.setTimeout(() => {
        setPlayerReact('hit'); setPlayerSignal((n) => n + 1);
        setShaking(true); sfx.damage();
        setTimeout(() => setShaking(false), 300);
      }, delay);
    } else if (hp > ph) { setPlayerReact('heal'); setPlayerSignal((n) => n + 1); sfx.heal(); }
    else if (ward > pw) { setPlayerReact('ward'); setPlayerSignal((n) => n + 1); sfx.wardGain(); }
    prevPlayerHp.current = hp; prevPlayerWard.current = ward;
  }, [combat?.player.hp, combat?.player.ward]);

  useEffect(() => {
    if (!combat) return;
    const next: Record<string, { n: number; kind: ReactionKind }> = { ...enemySignals };
    let dirty = false;
    for (const e of combat.enemies) {
      const prev = prevEnemyState.current[e.id];
      if (!prev) { prevEnemyState.current[e.id] = { hp: e.hp, ward: e.ward }; continue; }
      if (e.hp < prev.hp) { next[e.id] = { n: (next[e.id]?.n ?? 0) + 1, kind: e.hp <= 0 ? 'death' : 'hit' }; sfx.attackHit(); dirty = true; }
      else if (e.ward > prev.ward) { next[e.id] = { n: (next[e.id]?.n ?? 0) + 1, kind: 'ward' }; dirty = true; }
      prevEnemyState.current[e.id] = { hp: e.hp, ward: e.ward };
    }
    if (dirty) setEnemySignals(next);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [combat?.enemies.map((e) => `${e.id}:${e.hp}:${e.ward}`).join('|')]);

  // -------- Targeting arrow (pointer + keyboard cycling) --------
  const [mouse, setMouse] = useState<{ x: number; y: number } | null>(null);
  const [hoveredEnemy, setHoveredEnemy] = useState<string | null>(null);
  const [keyboardTargetIdx, setKeyboardTargetIdx] = useState<number | null>(null);
  const enemyRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const registerEnemyRef = (id: string, el: HTMLButtonElement | null) => {
    enemyRefs.current[id] = el;
  };
  const summonRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const registerSummonRef = (slot: number, el: HTMLDivElement | null) => {
    summonRefs.current[slot] = el;
  };

  const triggerSlash = (from: DOMRect, to: DOMRect, tone: SlashFx['tone']) => {
    setSlashFx({
      id: Date.now(),
      fromX: tone === 'hero' ? from.left + from.width * 0.68 : from.left + from.width * 0.26,
      fromY: from.top + from.height * 0.48,
      toX: tone === 'hero' ? to.left + to.width * 0.48 : to.left + to.width * 0.60,
      toY: to.top + to.height * 0.44,
      tone,
    });
    window.setTimeout(() => setSlashFx(null), 560);
  };

  const triggerHeroSlash = (enemyId?: string) => {
    if (!enemyId) return;
    const hero = heroRef.current;
    const enemy = enemyRefs.current[enemyId];
    if (!hero || !enemy) return;
    const heroRect = hero.getBoundingClientRect();
    const enemyRect = enemy.getBoundingClientRect();
    const rawDx = enemyRect.left + enemyRect.width * 0.36 - (heroRect.left + heroRect.width * 0.62);
    const rawDy = enemyRect.top + enemyRect.height * 0.44 - (heroRect.top + heroRect.height * 0.52);
    const distance = Math.max(1, Math.hypot(rawDx, rawDy));
    const dash = Math.min(360, Math.max(155, distance * 0.54));
    const ratio = dash / distance;
    setHeroAttackOffset({ dx: rawDx * ratio, dy: rawDy * ratio });
    setHeroStriking(true);
    triggerSlash(heroRect, enemyRect, 'hero');
    window.setTimeout(() => setHeroStriking(false), 640);
  };

  const triggerEnemySlash = (enemyId: string) => {
    const enemy = enemyRefs.current[enemyId];
    const hero = heroRef.current;
    if (!enemy || !hero) return;
    window.setTimeout(() => {
      triggerSlash(enemy.getBoundingClientRect(), hero.getBoundingClientRect(), 'enemy');
    }, 160);
  };

  const triggerSummonSlash = (slot: number, enemyId: string) => {
    const summon = summonRefs.current[slot];
    const enemy = enemyRefs.current[enemyId];
    if (!summon || !enemy) return;
    summon.animate(
      [
        { transform: 'translate(0, 0) rotate(0deg) scale(1)', filter: 'brightness(1)' },
        { transform: 'translate(-34px, 8px) rotate(-4deg) scale(0.94)', filter: 'brightness(1.25)' },
        { transform: 'translate(95px, -7px) rotate(2deg) scale(1.06)', filter: 'brightness(1.55)' },
        { transform: 'translate(250px, -16px) rotate(5deg) scale(1.14)', filter: 'brightness(2.05)' },
        { transform: 'translate(215px, -10px) rotate(3deg) scale(1.08)', filter: 'brightness(1.65)' },
        { transform: 'translate(0, 0) rotate(0deg) scale(1)', filter: 'brightness(1)' },
      ],
      {
        duration: 760,
        easing: 'cubic-bezier(0.13, 0.87, 0.22, 1)',
      },
    );
    window.setTimeout(() => {
      triggerSlash(summon.getBoundingClientRect(), enemy.getBoundingClientRect(), 'hero');
    }, 170);
  };

  // Track mouse globally while targeting. Cheap — only attaches when needed.
  useEffect(() => {
    if (!targeting) { setMouse(null); return; }
    const h = (ev: MouseEvent) => setMouse({ x: ev.clientX, y: ev.clientY });
    window.addEventListener('mousemove', h);
    return () => window.removeEventListener('mousemove', h);
  }, [targeting]);

  // -------- Low-HP heartbeat: pulse a thud every 1.5s when HP < 30% --------
  useEffect(() => {
    if (!combat) return;
    const pct = displayedPlayerVitals.hp / Math.max(1, displayedPlayerVitals.maxHp);
    if (pct >= 0.3 || displayedPlayerVitals.hp <= 0) return;
    // Fire once immediately so the urgency lands right when HP crosses.
    sfx.heartbeat();
    const t = window.setInterval(() => sfx.heartbeat(), 1500);
    return () => window.clearInterval(t);
  }, [displayedPlayerVitals.hp, displayedPlayerVitals.maxHp]);

  // -------- Keyboard hotkeys --------
  // E / Space: end turn (or cancel targeting first)
  // 1..9: play hand card N (auto-targets keyboard-selected or first alive enemy)
  // Tab: cycle the keyboard-selected enemy target
  // Escape: cancel targeting / close menu
  // We call store actions directly via `useGame.getState()` so this effect
  // doesn't have to live below all the local handler declarations.
  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      const s = useGame.getState();
      const c = s.combat;
      if (!c || c.phase !== 'player') return;
      const tgt = ev.target as HTMLElement | null;
      if (tgt && (tgt.tagName === 'INPUT' || tgt.tagName === 'TEXTAREA' || (tgt as any).isContentEditable)) return;

      if (ev.key === 'Escape') {
        if (targeting) { setTargeting(null); setXCost(null); sfx.cardSelect(); ev.preventDefault(); return; }
        if (showMenu) { setShowMenu(false); ev.preventDefault(); return; }
      }
      if (ev.key === 'e' || ev.key === 'E' || ev.key === ' ') {
        if (targeting) return;
        ev.preventDefault();
        setXCost(null); sfx.endTurn();
        const servantWillAttack = c.summons.some((s) => s.hp > 0) && c.enemies.some((e) => e.hp > 0);
        const enemyStartDelay = servantWillAttack ? SUMMON_ATTACK_SEQUENCE_MS : 0;
        const enemyWindow = triggerEnemyAttacks(c.enemies, enemyStartDelay);
        pendingEnemyDisplayOffset.current = enemyStartDelay;
        if (enemyWindow > 0 || enemyStartDelay > 0) {
          window.setTimeout(() => {
            pendingEnemyDisplayOffset.current = 0;
          }, Math.max(enemyWindow, enemyStartDelay) + 3500);
        }
        s.combatEndTurn();
        return;
      }
      if (ev.key === 'Tab') {
        const alive = c.enemies.filter((e) => e.hp > 0);
        if (!alive.length) return;
        ev.preventDefault();
        setKeyboardTargetIdx((prev) => {
          const base = prev == null ? -1 : prev;
          return (base + 1) % alive.length;
        });
        sfx.cardHover();
        return;
      }
      const n = parseInt(ev.key, 10);
      if (!Number.isNaN(n) && n >= 1 && n <= 9) {
        const ci = c.hand[n - 1];
        if (!ci) return;
        const def = getCard(ci.defId);
        if (def.cost > c.ember && def.cost >= 0) return;
        if (def.type === 'curse' || def.id === 'status_dross') return;
        ev.preventDefault();
        const runPlay = (enemyId?: string) => {
          if (def.type === 'attack') triggerHeroSlash(enemyId);
          setPlayingUid(ci.uid); sfx.cardPlay(def.type);
          setTimeout(() => {
            s.combatPlayCard(ci.uid, enemyId, def.cost < 0 ? c.ember : undefined);
            setPlayingUid(null);
          }, 180);
        };
        if (def.target === 'enemy') {
          const alive = c.enemies.filter((e) => e.hp > 0);
          if (!alive.length) return;
          const chosen = keyboardTargetIdx != null && alive[keyboardTargetIdx] ? alive[keyboardTargetIdx] : alive[0];
          runPlay(chosen.id);
        } else {
          runPlay(undefined);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [targeting, showMenu, keyboardTargetIdx]);

  // If the currently keyboard-selected enemy died or the list shrank, snap
  // the index back to something valid (or null if no enemies remain).
  useEffect(() => {
    if (!combat) return;
    const alive = combat.enemies.filter((e) => e.hp > 0);
    if (keyboardTargetIdx != null && keyboardTargetIdx >= alive.length) {
      setKeyboardTargetIdx(alive.length > 0 ? 0 : null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [combat?.enemies.map((e) => `${e.id}:${e.hp}`).join('|')]);

  // Victory banner — mounts for ~1.4s between the last kill and the reward
  // screen swap. The store delays `combatFinish()` for us; we just detect the
  // moment `combat.phase === 'ended' && combat.victory` becomes true, play
  // the fanfare, and render the overlay until the store unmounts combat.
  const [showVictory, setShowVictory] = useState(false);
  const victoryPlayed = useRef(false);
  useEffect(() => {
    const ended = combat?.phase === 'ended' && !!combat?.victory;
    if (ended && !victoryPlayed.current) {
      victoryPlayed.current = true;
      setShowVictory(true);
      sfx.victory();
    }
  }, [combat?.phase, combat?.victory]);

  // Player portrait idle / reaction
  const [playerFx, setPlayerFx] = useState<ReactionKind>(null);
  useEffect(() => {
    if (!playerSignal) return;
    setPlayerFx(playerReact);
    const t = setTimeout(() => setPlayerFx(null), 420);
    return () => clearTimeout(t);
  }, [playerSignal, playerReact]);

  if (!combat || !run) return null;
  const hand = combat.hand;
  const crowdedHand = hand.length > 5;
  const summons = combat.summons ?? [];
  const className =
    run.classId === 'vowbreaker' ? 'Vowbreaker' :
    run.classId === 'sealbinder' ? 'Sealbinder' :
    run.classId === 'whisperer' ? 'Whisperer' :
    run.classId === 'summoner' ? 'Summoner' : 'Auger';
  const playerArt = `player_${run.classId}`;
  const playerFxClass =
    heroStriking ? 'animate-hero-strike' :
    playerFx === 'hit' ? 'animate-hit-flash animate-player-damage-recoil' :
    playerFx === 'heal' ? 'animate-heal-flash' :
    playerFx === 'ward' ? 'animate-ward-flash' :
    'animate-idle-float';

  const handleCardClick = (uid: string) => {
    const ci = combat.hand.find((c) => c.uid === uid)!;
    const def = getCard(ci.defId);
    if (def.cost > combat.ember && def.cost >= 0) return;
    if (def.cost < 0) setXCost(combat.ember);
    if (def.target === 'enemy') { setTargeting({ uid }); sfx.cardSelect(); return; }
    playTheCard(uid, undefined, def);
  };
  const playTheCard = (uid: string, enemyId: string | undefined, def: ReturnType<typeof getCard>) => {
    if (def.type === 'attack') triggerHeroSlash(enemyId);
    setPlayingUid(uid); sfx.cardPlay(def.type);
    setTimeout(() => {
      playCard(uid, enemyId, def.cost < 0 ? (xCost ?? combat.ember) : undefined);
      setPlayingUid(null);
    }, 180);
  };
  const handleEnemyClick = (enemyId: string) => {
    if (!targeting) return;
    if (typeof targeting.forPotionSlot === 'number') {
      usePotion(targeting.forPotionSlot, enemyId); sfx.potionUse(); setTargeting(null); return;
    }
    const ci = combat.hand.find((c) => c.uid === targeting.uid);
    if (!ci) { setTargeting(null); return; }
    const def = getCard(ci.defId);
    playTheCard(targeting.uid, enemyId, def);
    setTargeting(null); setXCost(null);
  };
  const handlePotion = (slot: number) => {
    const pid = run.potions[slot];
    if (!pid) return;
    const p = getPotion(pid);
    if (p.needsTarget) setTargeting({ uid: '', forPotionSlot: slot });
    else { usePotion(slot); sfx.potionUse(); }
  };
  const handleEndTurn = () => {
    setTargeting(null); setXCost(null); sfx.endTurn();
    // Capture the enemies' intents BEFORE endTurn() mutates them — we
    // want to animate the attack they *were about to do* during the
    // enemy phase. After endTurn(), pickNextIntents has already rolled
    // the next turn's move, so intents would point at the wrong thing.
    const servantWillAttack = !!combat?.summons?.some((s) => s.hp > 0) && !!combat?.enemies?.some((e) => e.hp > 0);
    const enemyStartDelay = servantWillAttack ? SUMMON_ATTACK_SEQUENCE_MS : 0;
    const enemyWindow = combat ? triggerEnemyAttacks(combat.enemies, enemyStartDelay) : 0;
    pendingEnemyDisplayOffset.current = enemyStartDelay;
    if (enemyWindow > 0 || enemyStartDelay > 0) {
      window.setTimeout(() => {
        pendingEnemyDisplayOffset.current = 0;
      }, Math.max(enemyWindow, enemyStartDelay) + 3500);
    }
    endTurn();
  };

  // Click-outside-to-cancel while targeting. We bind the handler on the
  // root div so any click that doesn't end up on a CardView, an enemy
  // button, or the "Select a target" cancel pill will drop the targeting
  // state. The child handlers (card click, enemy click, cancel button)
  // still fire first because this is the outer-most onClick in the tree;
  // we only cancel if we survive with `targeting` still set AFTER a tick.
  const handleRootClick = (ev: React.MouseEvent<HTMLDivElement>) => {
    if (!targeting) return;
    const t = ev.target as HTMLElement;
    // Any click inside a button / card / enemy in this screen has already
    // been handled by a more specific handler. This root-level handler is
    // just a safety net for clicks on the scene backdrop, empty arena
    // space, the status bar, etc.
    if (t.closest('button') || t.closest('[data-card-root]')) return;
    setTargeting(null);
    setXCost(null);
    sfx.cardSelect();
  };

  return (
    <div
      className={['h-screen overflow-hidden flex flex-col', shaking ? 'animate-screen-shake' : ''].join(' ')}
      onClick={handleRootClick}
    >
      {/* ============= TOP HUD =============
         Opaque dark panel so the HUD reads as UI chrome rather than part of
         the battlefield. Shadow underneath separates it from the arena. */}
      <div className="relative shrink-0 flex items-center gap-7 px-7 py-4 border-b-2 border-vow-gold/40 min-h-[5.25rem]"
           style={{
             background:
               'linear-gradient(180deg, rgba(16,10,7,0.98) 0%, rgba(16,10,7,0.95) 70%, rgba(14,9,6,0.85) 100%)',
             boxShadow: '0 8px 22px -10px rgba(0,0,0,0.9)',
           }}>
        {/* Class name flag */}
        <div className="flex flex-col items-start">
          <div className="font-display text-vow-gold text-4xl tracking-widest leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
            {className.toUpperCase()}
          </div>
          <div className="text-[11px] uppercase tracking-[0.3em] text-ash-300 mt-1.5">
            Vowbearer · Turn {combat.turn}
          </div>
        </div>

        {/* Gold + relics + potions + buttons cluster */}
        <div className="ml-auto flex items-center gap-3">
          <GoldPlaque gold={run.gold} />

          {/* Relics — always visible as sprite coins in the HUD, same
              grammar as the potions strip. Hover for name + description.
              Square border so players can visually tell them apart from
              the round potion buttons at a glance. */}
          {run.relics.length > 0 && (
            <>
              <div className="h-11 w-px bg-ash-500/60" />
              <div className="flex gap-2 flex-wrap max-w-[30rem]">
                {run.relics.map((rid) => {
                  const spriteId = resolveSprite(rid);
                  const artUrl = getRelicArt(rid);
                  let relicDef: ReturnType<typeof getRelic> | null = null;
                  try { relicDef = getRelic(rid); } catch { relicDef = null; }
                  const btn = (
                    <div
                      key={rid}
                      className="item-button w-12 h-12 rounded-md border-2 border-vow-gold/80 bg-ash-900/70 flex items-center justify-center overflow-hidden hover:scale-110 transition cursor-help shadow-[0_0_10px_rgba(212,162,76,0.35)]"
                      title={relicDef?.name}
                    >
                      {artUrl ? <img src={artUrl} alt={relicDef?.name ?? rid} className="asset-icon asset-icon-relic" /> : spriteId
                        ? <Sprite id={spriteId} fill title={relicDef?.name ?? rid} />
                        : <span className="text-vow-gold text-lg">✦</span>}
                    </div>
                  );
                  if (!relicDef) return <React.Fragment key={rid}>{btn}</React.Fragment>;
                  return (
                    <Tooltip
                      key={rid}
                      placement="bottom"
                      content={<TooltipBody title={relicDef.name} subtitle={tierLabel[relicDef.tier] ?? relicDef.tier} desc={relicDef.description} />}
                    >
                      {btn}
                    </Tooltip>
                  );
                })}
              </div>
              <div className="h-11 w-px bg-ash-500/60" />
            </>
          )}

          <div className="flex gap-2">
            {run.potions.map((pid, i) => {
              const spriteId = pid ? resolveSprite(pid) : null;
              const artUrl = getPotionArt(pid);
              const hasSpr = !!spriteId || !!artUrl;
              const potionDef = pid ? getPotion(pid) : null;
              const button = (
                <button
                  key={i}
                  onClick={() => handlePotion(i)}
                  disabled={!pid}
                  className={[
                    'item-button w-12 h-12 rounded-full border-2 flex items-center justify-center transition text-xl overflow-hidden',
                    pid
                      ? 'border-vow-gold hover:scale-110 text-vow-bone shadow-[0_0_14px_rgba(249,115,22,0.5)] cursor-help'
                      : 'border-ash-500 bg-ash-900/70 text-ash-400',
                    pid && !hasSpr ? 'bg-gradient-to-br from-ember-500 via-ember-700 to-ember-900' : '',
                    pid && hasSpr ? 'bg-ash-900/60' : '',
                  ].join(' ')}
                >
                  {pid && artUrl ? (
                    <img src={artUrl} alt={potionDef!.name} className="asset-icon asset-icon-potion" />
                  ) : pid && hasSpr && spriteId ? (
                    <Sprite id={spriteId} fill title={potionDef!.name} />
                  ) : pid ? '⚗' : '·'}
                </button>
              );
              if (!potionDef) return <React.Fragment key={i}>{button}</React.Fragment>;
              return (
                <Tooltip
                  key={i}
                  placement="bottom"
                  content={<TooltipBody title={potionDef.name} subtitle={tierLabel[potionDef.rarity] ?? potionDef.rarity} desc={potionDef.description} />}
                >
                  {button}
                </Tooltip>
              );
            })}
          </div>
          <button onClick={() => setShowDeck(true)}
                  className="px-5 py-3 rounded-md border-2 border-vow-gold/70 bg-gradient-to-b from-ash-800 to-ash-900 hover:from-ash-700 hover:to-ash-800 text-vow-bone font-display text-lg tracking-wide shadow-lg">
            Deck
          </button>
          <button onClick={() => setShowMenu(true)}
                  className="px-5 py-3 rounded-md border-2 border-ash-400 bg-gradient-to-b from-ash-800 to-ash-900 hover:from-ash-700 hover:to-ash-800 text-ash-100 font-display text-lg tracking-wide shadow-lg">
            Menu
          </button>
        </div>
      </div>

      {/* Status strip — turn counter + player status badges. Relics moved
          to the top HUD where they're always visible alongside potions,
          so this row only carries per-combat state now. */}
      {/* ============= ARENA =============
         Three compositional layers, from back to front:
           z-0 : SceneBackdrop  — painted arena, dark overlay, vignette
           z-1 : StageFloor     — ground glow + ground shadow + horizon fade
           z-10: Combatants     — player (left-anchor) + enemies (right-anchor) */}
      <div className="arena relative flex-1 min-h-0 overflow-hidden isolate">
        <SceneBackdrop />
        <StageFloor />
        {slashFx && (() => {
          const angle = slashFx.tone === 'hero' ? -22 : 158;
          return (
            <svg key={slashFx.id} className="fixed inset-0 z-40 pointer-events-none overflow-visible">
              <g className="weapon-slash-impact" transform={`translate(${slashFx.toX} ${slashFx.toY})`}>
                <g transform={`rotate(${angle})`}>
                  <path
                    d="M -34 -8 Q 0 -30 34 -8"
                    className={slashFx.tone === 'hero' ? 'weapon-contact-arc-hero' : 'weapon-contact-arc-enemy'}
                  />
                  <line
                    x1="-20"
                    y1="5"
                    x2="22"
                    y2="-16"
                    className={slashFx.tone === 'hero' ? 'weapon-contact-cut-hero' : 'weapon-contact-cut-enemy'}
                  />
                </g>
                <circle r="5" className={slashFx.tone === 'hero' ? 'weapon-impact-core-hero' : 'weapon-impact-core-enemy'} />
                {Array.from({ length: 6 }).map((_, i) => {
                  const angle = (i / 8) * Math.PI * 2;
                  const x = Math.cos(angle) * 22;
                  const y = Math.sin(angle) * 17;
                  return (
                    <line
                      key={i}
                      x1={Math.cos(angle) * 7}
                      y1={Math.sin(angle) * 5}
                      x2={x}
                      y2={y}
                      className={slashFx.tone === 'hero' ? 'weapon-impact-spark-hero' : 'weapon-impact-spark-enemy'}
                    />
                  );
                })}
              </g>
            </svg>
          );
        })()}

        {/* Combat layer — flex row stretched across the arena, combatants
            pinned to the bottom. Each column ends with its HP pill, and the
            outer `items-end` bottom-aligns those columns, so every HP bar
            lines up at the same y regardless of how tall the portrait is or
            how much status / intent sits above it. Small `pb` keeps the
            fighters low in the frame, close to the hand. */}
        <div
          className="absolute inset-0 z-10 flex items-end justify-center gap-[4rem] pointer-events-none pb-14"
        >
          {/* Hero anchor — left side, but clearly shifted inward */}
          <div className="relative flex-shrink-0 flex flex-col items-center gap-3 pointer-events-auto">
            {/* Player portrait container — aspect ~2:3 matches the source PNG
                so the character fills the box instead of shrinking in it.
                Height is viewport-relative (vh) with a rem max so the hero
                always fits the available arena, whatever the user's window
                size, and the page never needs horizontal/vertical scroll.
                Natural position: the column's `items-end` bottom-aligns the
                portrait container with the enemies' containers, so the hero
                stands at the same height as the rats and keeps a visible
                gap between his feet and the HP pill, same as them. */}
            <div
              ref={heroRef}
              className={['relative w-[18rem] h-[40vh] max-h-[26rem]', playerFxClass].join(' ')}
              style={{
                ['--attack-dx' as string]: `${heroAttackOffset.dx}px`,
                ['--attack-dy' as string]: `${heroAttackOffset.dy}px`,
              }}
            >
              {/* True ground shadow — painted AT container bottom (= ground
                  line), tight ellipse darker in the centre. */}
              <div
                className="absolute left-1/2 bottom-0 -translate-x-1/2 w-[72%] h-10 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.35) 55%, transparent 100%)',
                  filter: 'blur(5px)',
                }}
              />
              {/* Softer contact halo extending the shadow outward */}
              <div
                className="absolute left-1/2 bottom-0 -translate-x-1/2 w-[100%] h-14 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(ellipse 55% 45% at 50% 60%, rgba(0,0,0,0.4) 0%, transparent 70%)',
                  filter: 'blur(10px)',
                }}
              />
              {(() => {
                const portrait = getPlayerPortrait(playerArt);
                if (portrait) {
                  // The Vowbreaker PNG has a thick band of transparent
                  // pixels below the character's feet. `object-position`
                  // pushes the image further down inside its box, so the
                  // transparent band is clipped off the bottom and the
                  // painted feet land on the container's bottom edge —
                  // the same spot where the rats' feet sit. vh scales so
                  // the offset stays right across window sizes.
                  return (
                    <PortraitImage
                      portrait={portrait}
                      className="w-full h-full drop-shadow-[0_26px_32px_rgba(0,0,0,0.92)]"
                      style={{ objectPosition: 'center calc(100% + 5vh)' }}
                      title={className}
                    />
                  );
                }
                return <CharacterArt artId={playerArt} className="w-full h-full drop-shadow-[0_26px_32px_rgba(0,0,0,0.92)]" />;
              })()}

              {/* Impact FX — symmetric with the enemy version. Fires a red
                  radial flash + orange spark streaks whenever the player
                  takes a hit. Keyed by `playerSignal` so the animations
                  restart on every new damage event. */}
              {playerFx === 'hit' && (
                <>
                  <div
                    key={`player-flash-${playerSignal}`}
                    className="absolute inset-0 pointer-events-none z-20 animate-impact-flash"
                    style={{
                      background:
                        'radial-gradient(circle at 50% 55%, rgba(255,80,40,0.85) 0%, rgba(255,140,60,0.5) 22%, rgba(255,80,40,0) 60%)',
                      mixBlendMode: 'screen',
                    }}
                  />
                  <svg
                    key={`player-sparks-${playerSignal}`}
                    className="absolute inset-0 pointer-events-none z-20"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                  >
                    <g className="animate-spark-burst" style={{ transformOrigin: '50% 55%' }}>
                      {Array.from({ length: 8 }).map((_, i) => {
                        const angle = (i * 45 - 90) * (Math.PI / 180);
                        const r1 = 6, r2 = 22;
                        const x1 = 50 + Math.cos(angle) * r1;
                        const y1 = 55 + Math.sin(angle) * r1;
                        const x2 = 50 + Math.cos(angle) * r2;
                        const y2 = 55 + Math.sin(angle) * r2;
                        return (
                          <line
                            key={i}
                            x1={x1} y1={y1} x2={x2} y2={y2}
                            stroke="#ffd089"
                            strokeWidth={0.8}
                            strokeLinecap="round"
                            opacity={0.9}
                          />
                        );
                      })}
                      <circle cx="50" cy="55" r="3" fill="#fff1cf" opacity="0.95" />
                    </g>
                  </svg>
                </>
              )}
              {/* Tight warm ember floor glow — smaller + dimmer so it reads
                  as contact warmth, not a halo lifting the hero off the ground */}
              <BurstFx kind={playerFx} signal={playerSignal} />
              <div className="absolute left-1/2 bottom-0 -translate-x-1/2 w-48 h-3 rounded-full bg-ember-500/25 blur-lg pointer-events-none" />
              {/* player floats */}
              <div className="absolute inset-x-0 top-[18%] flex flex-col items-center pointer-events-none z-30">
                {floats.filter((f) => f.targetId === 'player').map((f) => (
                  <span key={f.id} className={[
                    f.tone === 'dmg' ? 'animate-damage-number damage-number text-6xl' : f.tone === 'ward' ? 'animate-damage-number damage-number text-5xl' : 'animate-float text-4xl font-bold drop-shadow',
                    f.tone === 'dmg' ? 'text-[#fff1cf]' : f.tone === 'heal' ? 'text-emerald-400' : f.tone === 'ward' ? 'text-vow-seal' : 'text-vow-gold',
                  ].join(' ')}>{f.text}</span>
                ))}
              </div>
            </div>

          {/* Player HP + Ward pills — two pills side-by-side, same height, each readable at a glance */}
          {(() => {
            const hp = displayedPlayerVitals.hp;
            const maxHp = displayedPlayerVitals.maxHp;
            const ward = displayedPlayerVitals.ward;
            const hpPct = Math.max(0, Math.min(100, (hp / Math.max(1, maxHp)) * 100));
            return (
              <div className="relative flex flex-col items-center">
                <div className="flex items-stretch gap-2">
                {/* HP pill — red/orange */}
                <Tooltip
                  placement="top"
                  content={<TooltipBody title={`PV ${hp}/${maxHp}`} subtitle="VIE" desc="Tes points de vie. À 0, la tentative est perdue." />}
                >
                  <div className="relative flex items-stretch h-10 rounded-lg overflow-hidden border-2 border-vow-gold/70 shadow-xl cursor-help"
                       style={{ boxShadow: '0 4px 14px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(212,162,76,0.4)' }}>
                    {/* heart notch */}
                    <div className="flex items-center justify-center px-3 bg-gradient-to-b from-vow-blood to-[#4a0f18] text-ash-100 border-r border-vow-gold/60">
                      <span className="text-lg leading-none">♥</span>
                    </div>
                    <div className="relative w-48 bg-ash-900">
                      <div className="absolute inset-y-0 left-0 transition-[width] duration-300"
                           style={{
                             width: `${hpPct}%`,
                             background: 'linear-gradient(90deg, #8b1e2b 0%, #c2410c 60%, #fb923c 100%)',
                             boxShadow: 'inset 0 -4px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
                           }} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-ash-100 font-display font-bold text-lg leading-none tracking-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                          {Math.max(0, hp)}/{maxHp}
                        </span>
                      </div>
                    </div>
                  </div>
                </Tooltip>

                {/* Ward pill — blue, only when ward > 0 */}
                {ward > 0 && (
                  <Tooltip
                    placement="top"
                    content={<TooltipBody title={`Garde ${ward}`} subtitle="BONUS" desc="Absorbe les dégâts avant les PV. Disparaît au début de ton tour." />}
                  >
                    <div className="relative flex items-stretch h-10 rounded-lg overflow-hidden border-2 border-vow-seal/80 shadow-xl cursor-help animate-ward-appear"
                         style={{ boxShadow: '0 4px 14px rgba(0,0,0,0.8), 0 0 14px rgba(59,130,246,0.35), inset 0 0 0 1px rgba(147,197,253,0.35)' }}>
                      {/* shield notch */}
                      <div className="flex items-center justify-center px-3 bg-gradient-to-b from-[#1e3a8a] to-[#0f1e44] text-ash-100 border-r border-vow-seal/70">
                        <span className="text-lg leading-none">🛡</span>
                      </div>
                      <div className="relative min-w-[3rem] px-3 bg-ash-900">
                        <div className="absolute inset-0"
                             style={{
                               background: 'linear-gradient(90deg, #1e3a8a 0%, #2563eb 60%, #60a5fa 100%)',
                               boxShadow: 'inset 0 -4px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
                             }} />
                        <div className="relative flex items-center justify-center h-full">
                          <span className="text-ash-100 font-display font-bold text-lg leading-none tracking-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                            {ward}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Tooltip>
                )}
                </div>
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 min-w-[18rem] pointer-events-auto z-20">
                  <StatusRow status={combat.player.status as any} align="center" size="lg" />
                </div>
              </div>
            );
          })()}
        </div>

          {/* Enemies anchor — cluster takes natural size and sits right of
              the hero, so both sides gravitate toward the centre of the
              screen instead of drifting to the frame edges. */}
          <SummonServants
            summons={summons}
            activeAttack={activeSummonAttack}
            hitSignals={summonHitSignals}
            floats={floats}
            registerRef={registerSummonRef}
          />

          <div className="relative flex items-end justify-start gap-6 flex-wrap pointer-events-auto">
            {(() => {
              // Which card (if any) is currently targeting? We use its def
              // to compute damage previews against the hovered / keyboard
              // enemy, so the player can see "-8" before committing.
              const targetingCi = targeting ? combat.hand.find((c) => c.uid === targeting.uid) : null;
              const targetingDef = targetingCi ? getCard(targetingCi.defId) : null;
              const alive = combat.enemies.filter((en) => en.hp > 0);
              const kbEnemy = keyboardTargetIdx != null ? alive[keyboardTargetIdx] : null;
              return combat.enemies.map((e) => {
                const sig = enemySignals[e.id];
                const myFloats = floats.filter((f) => f.targetId === e.id);
                // Preview fires for the mouse-hovered enemy OR the keyboard
                // target if none is hovered — so Tab-cycling gives the same
                // tactical readout as pointing the mouse.
                const showPreview =
                  !!targetingDef && e.hp > 0 &&
                  (hoveredEnemy === e.id || (hoveredEnemy == null && kbEnemy?.id === e.id));
                const previewTotal = showPreview && targetingDef
                  ? (previewCardDamage(targetingDef, combat.player, e)?.total ?? null)
                  : null;
                return (
                  <SceneEnemy
                    key={e.id}
                    e={e}
                    hitSignal={sig?.n ?? 0}
                    reaction={sig?.kind ?? null}
                    targeting={!!targeting}
                    onClick={() => handleEnemyClick(e.id)}
                    onHover={setHoveredEnemy}
                    floats={myFloats}
                    compact={combat.enemies.length > 2}
                    damagePreview={previewTotal}
                    imminent={combat.phase === 'enemy'}
                    keyboardTarget={kbEnemy?.id === e.id}
                    registerRef={registerEnemyRef}
                    attackSignal={attackSignals[e.id] ?? 0}
                  />
                );
              });
            })()}
          </div>
        </div>
      </div>

      {/* ============= HAND =============
         Dark translucent panel separates the card layer from the battlefield
         above and the footer below, so the hand reads as its own UI zone. */}
      <div
        className="relative shrink-0 min-h-[344px] border-t border-vow-gold/25"
        style={{
          background:
            'linear-gradient(180deg, rgba(10,8,7,0.0) 0%, rgba(12,9,7,0.55) 25%, rgba(14,10,8,0.85) 60%, rgba(14,10,8,0.95) 100%)',
          boxShadow: 'inset 0 18px 30px -18px rgba(0,0,0,0.8)',
        }}
      >
        {/* Ember plaque — pinned to the left of the hand, vertically centred
            against the cards. Absolute so it doesn't shift the `justify-center`
            flow that keeps the hand centred on the screen. */}
        <div className="absolute left-6 top-1/2 -translate-y-1/2 z-10 flex flex-col items-start gap-3">
          <EmberPlaque ember={combat.ember} max={combat.emberMax} />
          <PileButton
            label="Pioche"
            desc="Les cartes que tu vas piocher, dans un ordre mélangé."
            icon={<PileIcon variant="draw" />}
            count={combat.draw.length}
            onClick={() => setOpenPile('draw')}
          />
        </div>

        <div
          className={[
            'relative z-0 flex items-end w-full pt-5 pb-6 min-h-[344px] overflow-y-visible',
            crowdedHand
              ? 'justify-start gap-0 flex-nowrap overflow-x-auto scrollbar-ember px-[13rem]'
              : 'justify-center gap-5 flex-wrap px-[10rem]',
          ].join(' ')}
        >
          {hand.map((ci, index) => {
            const def = getCard(ci.defId);
            const affordable = def.cost <= combat.ember || def.cost < 0;
            const unplayable = def.type === 'curse' || def.id === 'status_dross';
            return (
              <div
                key={ci.uid}
                className="animate-rise shrink-0 transition-transform duration-150 hover:-translate-y-4"
                data-card-uid={ci.uid}
                onMouseEnter={() => setHoveredCardUid(ci.uid)}
                onMouseLeave={() => setHoveredCardUid((current) => current === ci.uid ? null : current)}
                style={{
                  marginLeft: crowdedHand && index > 0 ? -28 : undefined,
                  zIndex: hoveredCardUid === ci.uid || targeting?.uid === ci.uid ? 100 : index,
                }}
              >
                <CardView
                  def={def}
                  upgraded={ci.upgraded}
                  size="lg"
                  affordable={affordable && !unplayable}
                  disabled={!affordable || unplayable}
                  onClick={() => handleCardClick(ci.uid)}
                  selected={targeting?.uid === ci.uid}
                  playing={playingUid === ci.uid}
                />
              </div>
            );
          })}
        </div>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 z-10 flex flex-col items-end gap-3">
          <button
            onClick={handleEndTurn}
            className="px-8 py-4 rounded-md font-display text-2xl text-ash-100 font-bold tracking-wide transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(180deg, #c2410c 0%, #7c2d12 100%)',
              border: '2px solid rgba(212,162,76,0.8)',
              boxShadow: '0 4px 18px rgba(0,0,0,0.75), 0 0 24px rgba(249,115,22,0.55)',
            }}
          >
            Fin du tour
          </button>
          <div className="flex flex-col gap-2">
            <PileButton
              label="Défausse"
              desc="Les cartes jouées ou dépensées. Elles sont remélangées dans la pioche quand elle est vide."
              icon={<PileIcon variant="discard" />}
              count={combat.discard.length}
              onClick={() => setOpenPile('discard')}
            />
            <PileButton
              label="Bannissement"
              desc="Les cartes retirées de ce combat. Elles ne sont pas remélangées."
              icon={<PileIcon variant="banish" />}
              count={combat.banish.length}
              onClick={() => setOpenPile('banish')}
            />
          </div>
        </div>
      </div>

      {/* ============= FOOTER ============= */}
      <div className="hidden">
        <div className="flex gap-2">
          <PileButton
            label="Pioche"
            desc="Les cartes que tu vas piocher, dans un ordre mélangé."
            icon={<PileIcon variant="draw" />}
            count={combat.draw.length}
            onClick={() => setOpenPile('draw')}
          />
          <PileButton
            label="Défausse"
            desc="Les cartes jouées ou dépensées. Elles sont remélangées dans la pioche quand elle est vide."
            icon={<PileIcon variant="discard" />}
            count={combat.discard.length}
            onClick={() => setOpenPile('discard')}
          />
          <PileButton
            label="Bannissement"
            desc="Les cartes retirées de ce combat. Elles ne sont pas remélangées."
            icon={<PileIcon variant="banish" />}
            count={combat.banish.length}
            onClick={() => setOpenPile('banish')}
          />
        </div>
        <button
          onClick={handleEndTurn}
          className="ml-auto px-8 py-2.5 rounded-md font-display text-lg text-ash-100 font-bold tracking-wide transition-all hover:scale-105"
          style={{
            background: 'linear-gradient(180deg, #c2410c 0%, #7c2d12 100%)',
            border: '2px solid rgba(212,162,76,0.7)',
            boxShadow: '0 4px 14px rgba(0,0,0,0.6), 0 0 20px rgba(249,115,22,0.45)',
          }}
        >
          Fin du tour
        </button>
      </div>

      {/* Targeting arrow — thin glowing curve from the selected card up to
          the mouse (or the locked enemy). Kept intentionally subtle: a
          solid 2px line with a soft halo underlay and a small arrow head,
          instead of a chunky dashed line that fights with the scene. */}
      {targeting && (() => {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        // Start from the actual selected card so the arrow visibly grows
        // out of the chosen card instead of some generic screen point.
        let startX = vw / 2;
        let startY = vh - 110;
        const cardEl = document.querySelector(`[data-card-uid="${targeting.uid}"]`) as HTMLElement | null;
        if (cardEl) {
          const r = cardEl.getBoundingClientRect();
          startX = r.left + r.width / 2;
          startY = r.top + 12;
        }
        // End point: locked enemy (hover wins, else keyboard), else mouse.
        let endX = mouse?.x ?? startX;
        let endY = mouse?.y ?? startY - 200;
        const lockedId = hoveredEnemy ?? (() => {
          const alive = combat.enemies.filter((en) => en.hp > 0);
          return keyboardTargetIdx != null && alive[keyboardTargetIdx] ? alive[keyboardTargetIdx].id : null;
        })();
        if (lockedId) {
          const el = enemyRefs.current[lockedId];
          if (el) {
            const r = el.getBoundingClientRect();
            endX = r.left + r.width / 2;
            endY = r.top + r.height * 0.45;
          }
        }
        // Bowed arc — control point lifted above both endpoints so the
        // curve reads as a clean overhead strike line, not a sagging wire.
        const midX = (startX + endX) / 2;
        const arcLift = Math.min(160, Math.max(60, Math.abs(endY - startY) * 0.5));
        const midY = Math.min(startY, endY) - arcLift;
        const path = `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`;
        // A handful of small dots along the path act as breadcrumbs —
        // reads as "energy flowing toward the target" without the
        // jarring barber-pole effect of a dashed animation.
        const dots = [0.25, 0.45, 0.63, 0.78].map((t) => {
          const mt = 1 - t;
          const x = mt * mt * startX + 2 * mt * t * midX + t * t * endX;
          const y = mt * mt * startY + 2 * mt * t * midY + t * t * endY;
          return { x, y, t };
        });
        return (
          <svg
            className="fixed inset-0 z-30 pointer-events-none"
            width={vw}
            height={vh}
            viewBox={`0 0 ${vw} ${vh}`}
          >
            <defs>
              <marker
                id="target-arrow-head"
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="5.5"
                markerHeight="5.5"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 Z" fill="#fb923c" />
              </marker>
            </defs>
            {/* Soft halo underlayer so the arrow reads on dark + bright bg */}
            <path d={path} stroke="rgba(249,115,22,0.22)" strokeWidth={8} fill="none" strokeLinecap="round" />
            {/* Crisp core line — thin + solid, not dashed. */}
            <path
              d={path}
              stroke="#fb923c"
              strokeWidth={1.75}
              fill="none"
              strokeLinecap="round"
              markerEnd="url(#target-arrow-head)"
              opacity={0.95}
            />
            {/* Origin dot — small warm glow on the selected card. */}
            <circle cx={startX} cy={startY} r={4} fill="#fed7aa" opacity={0.9}>
              <animate attributeName="r" values="3;5;3" dur="1.4s" repeatCount="indefinite" />
            </circle>
            {/* Breadcrumbs along the path — fade out toward the target. */}
            {dots.map((d, i) => (
              <circle
                key={i}
                className="target-arrow-dot"
                cx={d.x}
                cy={d.y}
                r={1.5}
                fill="#ffd089"
                opacity={0.55 + d.t * 0.3}
                style={{ animationDelay: `${i * 90}ms` }}
              />
            ))}
          </svg>
        );
      })()}

      {/* Low-HP vignette — throbs red around the edge when HP < 30%. Fixed
          overlay above the arena but below modals. pointer-events-none so
          it never steals input from the game. */}
      {(() => {
        const pct = displayedPlayerVitals.hp / Math.max(1, displayedPlayerVitals.maxHp);
        if (pct >= 0.3 || displayedPlayerVitals.hp <= 0) return null;
        return (
          <div
            className="fixed inset-0 z-20 pointer-events-none animate-low-hp-vignette"
            aria-hidden="true"
          />
        );
      })()}

      {/* Victory banner — shown between the last enemy death and the reward
          screen. Purely decorative: the store fires `combatFinish()` on a
          timer and will unmount this screen shortly after it appears. */}
      {showVictory && (
        <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none">
          <div
            className="absolute inset-0 animate-victory-glow"
            style={{
              background:
                'radial-gradient(ellipse at 50% 45%, rgba(212,162,76,0.35) 0%, rgba(212,162,76,0.12) 30%, rgba(0,0,0,0) 65%)',
            }}
          />
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 34 }).map((_, i) => (
              <span
                key={i}
                className="victory-ember"
                style={{
                  left: `${8 + ((i * 23) % 86)}%`,
                  bottom: `${-8 - (i % 5) * 4}%`,
                  animationDelay: `${(i % 11) * 85}ms`,
                  animationDuration: `${1100 + (i % 7) * 120}ms`,
                  ['--drift' as string]: `${((i % 9) - 4) * 14}px`,
                }}
              />
            ))}
          </div>
          <div className="relative flex flex-col items-center gap-2 animate-victory-banner">
            <span className="font-display uppercase text-vow-gold text-7xl font-bold tracking-[0.3em] drop-shadow-[0_4px_14px_rgba(0,0,0,0.95)]">
              Victoire
            </span>
            <span className="font-display uppercase text-ash-200 text-sm tracking-[0.5em]">
              Le serment tient bon
            </span>
          </div>
        </div>
      )}

      {/* Log panel (bottom-right, small) */}
      <div className="fixed bottom-20 right-3 max-w-xs max-h-40 overflow-y-auto scrollbar-ember panel p-2 text-xs text-ash-200 opacity-60 hover:opacity-100 transition">
        {combat.log.slice(-6).map((l, i) => <div key={i}>{l}</div>)}
      </div>

      {targeting && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 panel px-4 py-1 text-sm text-vow-gold animate-pulse z-20">
          Choisis une cible
          <button className="ml-3 btn-ghost text-xs" onClick={() => setTargeting(null)}>Annuler</button>
        </div>
      )}

      {/* Deck peek overlay */}
      {showDeck && (
        <DeckPeek onClose={() => setShowDeck(false)} />
      )}
      {/* Pile viewer overlay (Draw / Discard / Banish) */}
      {openPile && (
        <PileViewer
          title={openPile === 'draw' ? 'Pioche' : openPile === 'discard' ? 'Défausse' : 'Bannissement'}
          cards={openPile === 'draw' ? combat.draw : openPile === 'discard' ? combat.discard : combat.banish}
          shuffled={openPile === 'draw'}
          onClose={() => setOpenPile(null)}
        />
      )}
      {/* Menu overlay */}
      {showMenu && (
        <MenuOverlay
          onClose={() => setShowMenu(false)}
          onConcede={() => { setShowMenu(false); abandonRun(); }}
        />
      )}
    </div>
  );
};

// ---------------- Pile button + icons ----------------

const PileIcon: React.FC<{ variant: 'draw' | 'discard' | 'banish' }> = ({ variant }) => {
  if (variant === 'draw') {
    return (
      <span className="relative w-8 h-9 inline-block">
        <span className="absolute inset-0 rounded-sm border border-vow-gold/70 bg-ash-900 translate-x-[3px] translate-y-[3px]" />
        <span className="absolute inset-0 rounded-sm border border-vow-gold/80 bg-ash-800 translate-x-[1.5px] translate-y-[1.5px]" />
        <span className="absolute inset-0 rounded-sm border border-vow-gold bg-gradient-to-br from-ash-700 to-ash-900" />
      </span>
    );
  }
  if (variant === 'discard') {
    return (
      <span className="relative w-9 h-9 inline-block">
        <span className="absolute inset-0 rounded-sm border border-ash-300/80 bg-ash-800 -rotate-[10deg] translate-x-[-2px]" />
        <span className="absolute inset-0 rounded-sm border border-ash-200 bg-gradient-to-br from-ash-600 to-ash-800 rotate-[10deg] translate-x-[2px]" />
      </span>
    );
  }
  // banish
  return (
    <span className="relative w-8 h-9 inline-block">
      <span className="absolute inset-0 rounded-sm border border-vow-blood/70 bg-ash-900" />
      <span className="absolute inset-0 flex items-center justify-center text-vow-blood text-lg leading-none font-bold">✕</span>
    </span>
  );
};

const PileButton: React.FC<{
  label: string;
  desc: string;
  icon: React.ReactNode;
  count: number;
  onClick: () => void;
}> = ({ label, desc, icon, count, onClick }) => (
  <Tooltip placement="top" content={<TooltipBody title={`${label} · ${count}`} subtitle="TAS" desc={desc} />}>
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2.5 px-4 py-2.5 rounded-md border-2 border-vow-gold/60 bg-ash-900/85 hover:bg-ash-800 hover:border-vow-gold transition text-ash-100 cursor-pointer shadow-[0_4px_14px_rgba(0,0,0,0.65)]"
    >
      {icon}
      <span className="font-display text-2xl text-ember-400 font-bold leading-none">{count}</span>
      <span className="font-display text-[11px] uppercase tracking-widest text-ash-300">{label}</span>
    </button>
  </Tooltip>
);

// ---------------- Overlays ----------------

const DeckPeek: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const combat = useGame((s) => s.combat);
  if (!combat) return null;
  const pile = (label: string, arr: { defId: string; upgraded?: boolean }[]) => (
    <div className="mb-3">
      <div className="text-sm text-vow-gold font-display mb-1 uppercase tracking-widest">{label} — {arr.length}</div>
      <div className="flex gap-1 flex-wrap">
        {arr.map((c, i) => {
          const d = getCard(c.defId);
          return (
            <span key={i} className="px-2 py-1 text-xs rounded bg-ash-800 border border-ash-500 text-ash-100" title={d.text}>
              {d.name}{c.upgraded ? '+' : ''}
            </span>
          );
        })}
        {arr.length === 0 && <span className="text-ash-400 text-xs italic">vide</span>}
      </div>
    </div>
  );
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-30" onClick={onClose}>
      <div className="panel max-w-3xl w-full max-h-[80vh] overflow-auto scrollbar-ember p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center mb-3">
          <h3 className="font-display text-2xl text-vow-bone">Ton deck</h3>
          <button onClick={onClose} className="ml-auto btn-ghost">Fermer</button>
        </div>
        {pile('Main', combat.hand)}
        {pile('Pioche (ordre masqué)', [...combat.draw].sort(() => 0))}
        {pile('Défausse', combat.discard)}
        {pile('Bannissement', combat.banish)}
      </div>
    </div>
  );
};

const PileViewer: React.FC<{
  title: string;
  cards: { defId: string; upgraded?: boolean }[];
  shuffled?: boolean;
  onClose: () => void;
}> = ({ title, cards, shuffled, onClose }) => {
  // Draw is shown shuffled so we don't leak ordering; discard/banish keep order.
  const displayed = shuffled ? [...cards].sort((a, b) => (a.defId > b.defId ? 1 : -1)) : cards;
  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-30 p-4" onClick={onClose}>
      <div className="panel max-w-6xl w-full max-h-[85vh] overflow-auto scrollbar-ember p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center mb-4">
          <h3 className="font-display text-2xl text-vow-bone">
            {title} <span className="text-ember-400">· {cards.length}</span>
          </h3>
          {shuffled && (
            <span className="ml-3 text-[10px] text-ash-300 italic uppercase tracking-widest">Ordre masqué</span>
          )}
          <button onClick={onClose} className="ml-auto btn-ghost">Fermer</button>
        </div>
        {displayed.length === 0 ? (
          <div className="text-ash-400 italic text-center py-10">Cette pile est vide.</div>
        ) : (
          <div className="flex gap-4 flex-wrap justify-center pt-2">
            {displayed.map((c, i) => {
              const d = getCard(c.defId);
              return (
                <div key={i} className="pl-4">
                  <CardView def={d} upgraded={c.upgraded} size="sm" affordable />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const MenuOverlay: React.FC<{ onClose: () => void; onConcede: () => void }> = ({ onClose, onConcede }) => (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-30" onClick={onClose}>
    <div className="panel max-w-sm w-full p-5" onClick={(e) => e.stopPropagation()}>
      <h3 className="font-display text-xl text-vow-bone mb-3">Menu</h3>
      <div className="flex flex-col gap-2">
        <button onClick={onClose} className="btn">Reprendre</button>
        <button onClick={onConcede} className="btn border-vow-blood/60 text-vow-blood hover:bg-vow-blood/20">
          Abandonner
        </button>
      </div>
      <p className="text-xs text-ash-300 mt-3 italic">
        Abandonner met fin à cette tentative et renvoie au menu principal.
      </p>
    </div>
  </div>
);
