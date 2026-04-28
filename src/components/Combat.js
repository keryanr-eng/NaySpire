import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// EMBERVOW — combat screen.
// Top HUD with class name + wide HP bar + ember + gold + potion slots.
// Arena: hero scene-left, enemies scene-right (each with HP pill + intent pill).
// Hand bottom. Footer: pile counts + End Turn.
import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../state/game';
import { getCard } from '../data/cards';
import { getPotion } from '../data/potions';
import { CardView } from './Card';
import { CharacterArt } from './CharacterArt';
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
const tierLabel = {
    starter: 'Départ',
    common: 'Commun',
    uncommon: 'Peu commun',
    rare: 'Rare',
    boss: 'Boss',
};
function hasSprite(id) {
    return !!SPRITES[id];
}
const intentColor = {
    attack: 'text-vow-blood',
    attack_multi: 'text-vow-blood',
    defend: 'text-vow-seal',
    buff: 'text-vow-gold',
    debuff: 'text-ember-500',
    summon: 'text-ash-200',
    special: 'text-ember-400',
    unknown: 'text-ash-300',
};
const intentGlyph = {
    attack: '⚔', attack_multi: '⚔⚔', defend: '🛡', buff: '✦', debuff: '☠', summon: '◈', special: '◉', unknown: '?',
};
const FLOAT_KEEP_MS = 1700;
const ENEMY_ATTACK_STAGGER_MS = 700;
const ENEMY_ATTACK_SEQUENCE_PAD_MS = 900;
const SUMMON_ATTACK_SEQUENCE_MS = 1250;
const SUMMON_SERVANT_ART = '/assets/generated/summons/bound_servant.png';
// ---------------- Status row ----------------
const STATUS_GLYPH = {
    fury: { glyph: '✦', tint: 'text-vow-blood', label: 'Furie' },
    poise: { glyph: '◈', tint: 'text-vow-seal', label: 'Aplomb' },
    sigil: { glyph: '☉', tint: 'text-vow-gold', label: 'Sigille' },
    brittle: { glyph: '✷', tint: 'text-ember-400', label: 'Fragile' },
    faded: { glyph: '◐', tint: 'text-ember-500', label: 'Flétri' },
    bleed: { glyph: '♥', tint: 'text-vow-blood', label: 'Saignement' },
    ignite: { glyph: '🜂', tint: 'text-ember-400', label: 'Embrasement' },
    fracture: { glyph: '⚡', tint: 'text-vow-blood', label: 'Fracture' },
    seal: { glyph: '◉', tint: 'text-vow-seal', label: 'Sceau' },
    chained: { glyph: '⛓', tint: 'text-ash-200', label: 'Entravé' },
    thorns: { glyph: '⚘', tint: 'text-emerald-400', label: 'Épines' },
    momentum: { glyph: '»', tint: 'text-vow-gold', label: 'Élan' },
    echo: { glyph: '◇', tint: 'text-purple-300', label: 'Echo' },
    summon: { glyph: '✦', tint: 'text-purple-300', label: 'Serviteur lie' },
};
const StatusRow = ({ status, align = 'center', size = 'sm' }) => {
    const entries = Object.entries(status).filter(([k, v]) => !k.startsWith('_') && (v ?? 0) > 0);
    if (!entries.length)
        return null;
    const large = size === 'lg';
    return (_jsx("div", { className: ['flex flex-wrap', large ? 'gap-2' : 'gap-1', align === 'center' ? 'justify-center' : align === 'right' ? 'justify-end' : 'justify-start'].join(' '), children: entries.map(([id, n]) => {
            const m = STATUS_GLYPH[id] ?? { glyph: '•', tint: 'text-ash-100', label: id };
            const spriteId = `status_${id}`;
            const useSprite = hasSprite(spriteId);
            const info = describeStatus(id, n);
            const kindTint = info.kind === 'buff' ? 'text-emerald-300' :
                info.kind === 'debuff' ? 'text-vow-blood' :
                    info.kind === 'class' ? 'text-vow-gold' : 'text-ash-200';
            const tooltipText = `${info.label} ${n}\n${info.kind.toUpperCase()}\n${info.desc}`;
            return (_jsxs("span", { title: tooltipText, tabIndex: 0, className: [
                    'relative group/status flex items-center rounded border border-vow-gold/50 bg-ash-900/90 cursor-help shadow-[0_3px_10px_rgba(0,0,0,0.65)] outline-none focus-visible:ring-2 focus-visible:ring-vow-gold',
                    large ? 'gap-2 px-2.5 py-1.5 text-sm' : 'gap-1 px-1.5 py-0.5 text-xs',
                    m.tint,
                ].join(' '), children: [useSprite
                        ? _jsx(Sprite, { id: spriteId, w: large ? 26 : 18, h: large ? 26 : 18 })
                        : _jsx("span", { className: large ? 'text-xl leading-none' : '', children: m.glyph }), _jsx("span", { className: ['font-display font-bold leading-none', large ? 'text-lg' : 'text-xs', kindTint].join(' '), children: n }), _jsx("span", { className: [
                            'invisible opacity-0 group-hover/status:visible group-hover/status:opacity-100 group-focus-visible/status:visible group-focus-visible/status:opacity-100',
                            'absolute left-1/2 bottom-full mb-2 -translate-x-1/2 z-[90] w-72 pointer-events-none transition-opacity duration-150',
                            'rounded-md border border-vow-gold/70 bg-ash-900/95 px-3 py-2 text-left text-ash-100 shadow-[0_8px_24px_rgba(0,0,0,0.85)]',
                        ].join(' '), children: _jsx(TooltipBody, { title: `${info.label} ${n}`, subtitle: info.kind.toUpperCase(), desc: info.desc }) })] }, id));
        }) }));
};
const SummonServants = ({ summons, activeAttack, hitSignals, floats, registerRef }) => {
    const living = summons.filter((s) => s.hp > 0).sort((a, b) => a.slot - b.slot);
    if (!living.length)
        return null;
    return (_jsx("div", { className: "relative flex-shrink-0 w-[22rem] h-[34vh] max-h-[22rem] flex items-end justify-center pointer-events-none", children: _jsx("div", { className: "flex items-end justify-center gap-3", children: living.map((s) => {
                const attacking = activeAttack?.slot === s.slot;
                const hitSignal = hitSignals[s.id] ?? 0;
                const hpPct = Math.max(0, Math.min(100, (s.hp / Math.max(1, s.maxHp)) * 100));
                return (_jsxs("div", { className: "relative flex flex-col items-center", children: [_jsxs("div", { ref: (el) => registerRef?.(s.slot, el), className: [
                                'summon-unit-shell',
                                attacking ? 'animate-hero-strike summon-unit-hero-strike' : hitSignal ? 'animate-summon-unit-hit' : 'animate-summon-unit-idle',
                                s.slot === 1 ? 'translate-y-[-0.75rem]' : '',
                            ].join(' '), children: [_jsx("img", { src: SUMMON_SERVANT_ART, alt: "", className: "summon-unit-img", draggable: false }), hitSignal > 0 && !attacking && _jsx("span", { className: "summon-hit-burst", "aria-hidden": "true" }), attacking && (_jsxs(_Fragment, { children: [_jsx("span", { className: "summon-attack-wake", "aria-hidden": "true" }), _jsx("span", { className: "summon-attack-impact", "aria-hidden": "true" })] })), _jsx("div", { className: "absolute inset-x-0 top-[22%] flex flex-col items-center pointer-events-none z-30", children: floats.filter((f) => f.targetId === s.id).map((f) => (_jsx("span", { className: [
                                            f.tone === 'dmg' ? 'animate-damage-number damage-number text-4xl' : 'animate-float text-2xl font-bold drop-shadow',
                                            f.tone === 'dmg' ? 'text-[#fff1cf]' : f.tone === 'heal' ? 'text-emerald-400' : f.tone === 'ward' ? 'text-vow-seal' : 'text-vow-gold',
                                        ].join(' '), children: f.text }, f.id))) })] }, `${s.id}-${attacking ? activeAttack?.nonce : hitSignal ? `hit-${hitSignal}` : 'idle'}`), _jsxs("div", { className: "relative -mt-4 h-6 w-24 overflow-hidden rounded-md border border-purple-300/70 bg-black/80 shadow-[0_3px_12px_rgba(0,0,0,0.85)]", children: [_jsx("div", { className: "absolute inset-y-0 left-0 bg-gradient-to-r from-purple-900 via-purple-600 to-purple-300", style: { width: `${hpPct}%` } }), _jsxs("div", { className: "relative flex h-full items-center justify-center text-[0.8rem] font-display font-bold text-ash-100 drop-shadow", children: [Math.max(0, s.hp), "/", s.maxHp] })] }), _jsxs("div", { className: "mt-1 rounded-md border border-purple-300/45 bg-black/75 px-2 py-0.5 font-display text-[0.82rem] font-bold text-purple-100 shadow-[0_0_12px_rgba(126,34,206,0.35)]", children: ["ATQ ", s.damage] })] }, s.id));
            }) }) }));
};
const BurstFx = ({ kind, signal, compact }) => {
    if (!kind)
        return null;
    const count = kind === 'death' ? 18 : kind === 'hit' ? 12 : 10;
    const className = kind === 'hit' ? 'combat-spark combat-spark-hit' :
        kind === 'death' ? 'combat-spark combat-spark-death' :
            kind === 'heal' ? 'combat-spark combat-spark-heal' :
                kind === 'ward' ? 'combat-spark combat-spark-ward' :
                    'combat-spark combat-spark-status';
    return (_jsx("div", { className: "absolute inset-0 pointer-events-none z-40 overflow-visible", children: Array.from({ length: count }).map((_, i) => {
            const angle = (i / count) * Math.PI * 2;
            const radius = compact ? 38 : 54;
            const dx = Math.cos(angle) * radius;
            const dy = Math.sin(angle) * radius * 0.72;
            const delay = (i % 5) * 22;
            return (_jsx("span", { className: className, style: {
                    left: `${46 + Math.cos(angle) * 8}%`,
                    top: `${48 + Math.sin(angle) * 6}%`,
                    ['--dx']: `${dx}px`,
                    ['--dy']: `${dy}px`,
                    animationDelay: `${delay}ms`,
                } }, i));
        }) }, `${kind}-${signal}`));
};
// ---------------- Scene enemy card ----------------
const SceneEnemy = ({ e, hitSignal, reaction, targeting, onClick, onHover, floats, compact, damagePreview, imminent, keyboardTarget, registerRef, attackSignal }) => {
    const [fx, setFx] = useState(null);
    useEffect(() => {
        if (!hitSignal)
            return;
        setFx(reaction);
        const t = setTimeout(() => setFx(null), 420);
        return () => clearTimeout(t);
    }, [hitSignal, reaction]);
    // Lunge animation — runs for ~520ms when attackSignal increments.
    // Kept separate from `fx` so the hit-flash the enemy receives from the
    // player's counter-attack doesn't cancel its own strike motion.
    const [lunging, setLunging] = useState(false);
    useEffect(() => {
        if (!attackSignal)
            return;
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
        if (!dead) {
            setHidden(false);
            return;
        }
        const t = setTimeout(() => setHidden(true), 500);
        return () => clearTimeout(t);
    }, [dead]);
    if (hidden)
        return null;
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
    const targetableGlow = targeting && !dead
        ? 'drop-shadow(0 0 10px rgba(249,115,22,0.55))'
        : '';
    const activeGlow = !dead && (keyboardTarget || targeting)
        ? keyboardTarget
            ? 'drop-shadow(0 0 18px rgba(212,162,76,0.9))'
            : ''
        : '';
    return (_jsxs("button", { type: "button", ref: (el) => registerRef?.(e.id, el), onClick: onClick, onMouseEnter: () => onHover?.(e.id), onMouseLeave: () => onHover?.(null), disabled: dead, className: [
            'group relative flex flex-col items-center gap-2 p-1 rounded-lg transition-all duration-300',
            dead ? 'opacity-0 scale-90 pointer-events-none' : '',
            targeting && !dead ? 'cursor-crosshair' : '',
        ].join(' '), children: [!dead && (_jsxs("div", { className: [
                    'flex items-center gap-2 rounded-lg bg-ash-900/95 border-2 px-3 py-1.5 shadow-xl max-w-[220px]',
                    imminent ? 'border-vow-blood/80 animate-intent-imminent' : 'border-vow-gold/50 animate-intent-breathe',
                    c,
                ].join(' '), style: { boxShadow: '0 4px 10px rgba(0,0,0,0.7)' }, title: e.nextIntent.description, children: [_jsx("span", { className: "text-lg leading-none", children: g }), _jsx("span", { className: "text-sm font-display font-semibold leading-tight", children: e.nextIntent.description ?? e.nextIntent.kind }), (e.nextIntent.kind === 'attack' || e.nextIntent.kind === 'attack_multi') && e.nextIntent.value != null && (_jsxs("span", { className: "ml-1 px-1.5 py-0.5 rounded bg-vow-blood/30 border border-vow-blood/70 text-ash-100 font-display font-bold text-sm leading-none", children: [e.nextIntent.value, e.nextIntent.hits && e.nextIntent.hits > 1 ? `×${e.nextIntent.hits}` : ''] }))] })), _jsxs("div", { className: ['relative', size].join(' '), style: {
                    filter: [activeGlow, targetableGlow].filter(Boolean).join(' ') || undefined,
                    transition: 'filter 200ms ease-out',
                }, children: [_jsx("div", { className: "absolute left-1/2 bottom-0 -translate-x-1/2 w-[78%] h-7 pointer-events-none", style: {
                            background: 'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 55%, transparent 100%)',
                            filter: 'blur(4px)',
                        } }), _jsx("div", { className: "absolute left-1/2 bottom-0 -translate-x-1/2 w-[100%] h-10 pointer-events-none", style: {
                            background: 'radial-gradient(ellipse 55% 45% at 50% 60%, rgba(0,0,0,0.35) 0%, transparent 70%)',
                            filter: 'blur(8px)',
                        } }), _jsx("div", { className: ['absolute inset-0', fxClass].join(' '), children: (() => {
                            const portrait = getEnemyPortrait(e.defId);
                            return (_jsx(PortraitImage, { portrait: portrait, mirror: portrait.mirrorInCombat, className: "w-full h-full drop-shadow-[0_22px_26px_rgba(0,0,0,0.9)]", style: { objectPosition: 'center calc(100% + 5vh)' }, title: e.name }));
                        })() }), fx === 'hit' && (_jsxs(_Fragment, { children: [_jsx("div", { className: "absolute inset-0 pointer-events-none z-20 animate-impact-flash", style: {
                                    background: 'radial-gradient(circle at 50% 58%, rgba(255,80,40,0.85) 0%, rgba(255,140,60,0.5) 22%, rgba(255,80,40,0) 60%)',
                                    mixBlendMode: 'screen',
                                } }, `flash-${hitSignal}`), _jsx("svg", { className: "absolute inset-0 pointer-events-none z-20", viewBox: "0 0 100 100", preserveAspectRatio: "none", children: _jsxs("g", { className: "animate-spark-burst", style: { transformOrigin: '50% 58%' }, children: [Array.from({ length: 8 }).map((_, i) => {
                                            const angle = (i * 45 - 90) * (Math.PI / 180);
                                            const r1 = 6, r2 = 22;
                                            const x1 = 50 + Math.cos(angle) * r1;
                                            const y1 = 58 + Math.sin(angle) * r1;
                                            const x2 = 50 + Math.cos(angle) * r2;
                                            const y2 = 58 + Math.sin(angle) * r2;
                                            return (_jsx("line", { x1: x1, y1: y1, x2: x2, y2: y2, stroke: "#ffd089", strokeWidth: 0.8, strokeLinecap: "round", opacity: 0.9 }, i));
                                        }), _jsx("circle", { cx: "50", cy: "58", r: "3", fill: "#fff1cf", opacity: "0.95" })] }) }, `sparks-${hitSignal}`)] })), _jsx(BurstFx, { kind: fx ?? (dead ? 'death' : null), signal: hitSignal, compact: compact }), damagePreview != null && damagePreview > 0 && (_jsx("div", { className: "absolute left-1/2 -translate-x-1/2 top-2 z-30 pointer-events-none animate-dmg-preview", children: _jsxs("div", { className: "flex items-center gap-1 px-3 py-1 rounded-md bg-vow-blood/90 border-2 border-vow-gold/60 shadow-[0_4px_16px_rgba(0,0,0,0.9)]", children: [_jsx("span", { className: "text-ash-100 text-base leading-none", children: "\u2694" }), _jsxs("span", { className: "font-display font-black text-2xl text-ash-100 leading-none tracking-tight drop-shadow-[0_2px_3px_rgba(0,0,0,0.9)]", children: ["\u2212", damagePreview] })] }) })), _jsx("div", { className: "absolute inset-x-0 top-[18%] flex flex-col items-center pointer-events-none z-30", children: floats.map((f) => (_jsx("span", { className: [
                                f.tone === 'dmg' ? 'animate-damage-number damage-number text-5xl' : f.tone === 'ward' ? 'animate-damage-number damage-number text-4xl' : 'animate-float text-3xl font-bold drop-shadow',
                                f.tone === 'dmg' ? 'text-[#fff1cf]' : f.tone === 'heal' ? 'text-emerald-400' : f.tone === 'ward' ? 'text-vow-seal' : 'text-vow-gold',
                            ].join(' '), children: f.text }, f.id))) })] }), _jsxs("div", { className: "flex items-stretch gap-2", children: [_jsxs("div", { className: "relative flex items-stretch h-9 rounded-lg overflow-hidden border-2 border-vow-gold/70 shadow-xl", style: { boxShadow: '0 4px 14px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(212,162,76,0.4)' }, children: [_jsx("div", { className: "flex items-center justify-center px-2.5 bg-gradient-to-b from-vow-blood to-[#4a0f18] text-ash-100 border-r border-vow-gold/60", children: _jsx("span", { className: "text-base leading-none", children: "\uD83D\uDEE1" }) }), _jsxs("div", { className: "relative w-36 bg-ash-900", children: [_jsx("div", { className: "absolute inset-y-0 left-0 transition-[width] duration-300", style: {
                                            width: `${hpPct}%`,
                                            background: 'linear-gradient(90deg, #8b1e2b 0%, #c2410c 60%, #fb923c 100%)',
                                            boxShadow: 'inset 0 -4px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
                                        } }), _jsxs("div", { className: "relative flex items-center justify-center h-full", children: [_jsx("span", { className: "text-vow-blood text-base leading-none mr-1", children: "\u2694" }), _jsxs("span", { className: "text-ash-100 font-display font-bold text-base leading-none tracking-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]", children: [Math.max(0, e.hp), "/", e.maxHp] })] })] })] }), e.ward > 0 && (_jsxs("div", { className: "relative flex items-stretch h-9 rounded-lg overflow-hidden border-2 border-vow-seal/80 shadow-xl animate-ward-appear", style: { boxShadow: '0 4px 14px rgba(0,0,0,0.8), 0 0 14px rgba(59,130,246,0.35), inset 0 0 0 1px rgba(147,197,253,0.35)' }, children: [_jsx("div", { className: "flex items-center justify-center px-2.5 bg-gradient-to-b from-[#1e3a8a] to-[#0f1e44] text-ash-100 border-r border-vow-seal/70", children: _jsx("span", { className: "text-base leading-none", children: "\u00F0\u0178\u203A\u00A1" }) }), _jsx("div", { className: "relative flex min-w-[3.25rem] items-center justify-center bg-ash-900 px-3", children: _jsx("span", { className: "font-display text-base font-bold leading-none text-vow-seal drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]", children: e.ward }) })] }))] }), _jsx("div", { className: "absolute left-1/2 bottom-[-2.45rem] -translate-x-1/2 min-w-[16rem] pointer-events-auto z-20", children: _jsx(StatusRow, { status: e.status, align: "center", size: "lg" }) })] }));
};
// ---------------- Main combat screen ----------------
export const CombatScreen = () => {
    const combat = useGame((s) => s.combat);
    const run = useGame((s) => s.run);
    const playCard = useGame((s) => s.combatPlayCard);
    const endTurn = useGame((s) => s.combatEndTurn);
    const usePotion = useGame((s) => s.combatUsePotion);
    const abandonRun = useGame((s) => s.abandonRun);
    const [targeting, setTargeting] = useState(null);
    const [xCost, setXCost] = useState(null);
    const [playingUid, setPlayingUid] = useState(null);
    const [shaking, setShaking] = useState(false);
    const [showDeck, setShowDeck] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [openPile, setOpenPile] = useState(null);
    const [hoveredCardUid, setHoveredCardUid] = useState(null);
    const heroRef = useRef(null);
    const [heroStriking, setHeroStriking] = useState(false);
    const [heroAttackOffset, setHeroAttackOffset] = useState({ dx: 170, dy: -16 });
    const [slashFx, setSlashFx] = useState(null);
    // Deltas → portrait reactions / sfx
    const prevPlayerHp = useRef(combat?.player.hp ?? 0);
    const prevPlayerWard = useRef(combat?.player.ward ?? 0);
    const [displayedPlayerVitals, setDisplayedPlayerVitals] = useState({
        hp: combat?.player.hp ?? 0,
        maxHp: combat?.player.maxHp ?? 1,
        ward: combat?.player.ward ?? 0,
    });
    const prevEnemyState = useRef({});
    const prevSummonState = useRef({});
    const [playerSignal, setPlayerSignal] = useState(0);
    const [playerReact, setPlayerReact] = useState(null);
    const [enemySignals, setEnemySignals] = useState({});
    const [summonHitSignals, setSummonHitSignals] = useState({});
    // Per-enemy "attack signal" — a monotonically increasing counter the
    // SceneEnemy watches to play its lunge animation. We fire these in a
    // staggered sequence when the player ends their turn, so each attacker
    // visibly winds up and strikes instead of the whole turn resolving in
    // one silent frame.
    const [attackSignals, setAttackSignals] = useState({});
    const triggerEnemyAttacks = (enemies, startDelay = 0) => {
        const attackers = enemies.filter((e) => e.hp > 0 &&
            (e.nextIntent.kind === 'attack' || e.nextIntent.kind === 'attack_multi'));
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
    const [floats, setFloats] = useState([]);
    const pendingEnemyDisplayOffset = useRef(0);
    useEffect(() => {
        if (!combat)
            return;
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
        if (!combat?.pendingFloat?.length)
            return;
        const now = Date.now();
        const added = combat.pendingFloat.map((f, i) => ({ id: now + i, ...f }));
        combat.pendingFloat.length = 0;
        const timers = [];
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
    const [activeSummonAttack, setActiveSummonAttack] = useState(null);
    useEffect(() => {
        if (!combat?.pendingSummonAttacks?.length)
            return;
        const attacks = [...combat.pendingSummonAttacks];
        combat.pendingSummonAttacks.length = 0;
        const timers = [];
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
        if (!combat)
            return;
        const next = { ...summonHitSignals };
        let dirty = false;
        for (const s of combat.summons ?? []) {
            const prev = prevSummonState.current[s.id];
            if (!prev) {
                prevSummonState.current[s.id] = { hp: s.hp, ward: s.ward };
                continue;
            }
            if (s.hp < prev.hp || s.ward < prev.ward) {
                next[s.id] = (next[s.id] ?? 0) + 1;
                dirty = true;
            }
            prevSummonState.current[s.id] = { hp: s.hp, ward: s.ward };
        }
        for (const id of Object.keys(prevSummonState.current)) {
            if (!(combat.summons ?? []).some((s) => s.id === id))
                delete prevSummonState.current[id];
        }
        if (dirty)
            setSummonHitSignals(next);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [combat?.summons.map((s) => `${s.id}:${s.hp}:${s.ward}`).join('|')]);
    useEffect(() => {
        if (!combat)
            return;
        const hp = combat.player.hp, ward = combat.player.ward;
        const ph = prevPlayerHp.current, pw = prevPlayerWard.current;
        if (hp < ph) {
            const delay = pendingEnemyDisplayOffset.current;
            window.setTimeout(() => {
                setPlayerReact('hit');
                setPlayerSignal((n) => n + 1);
                setShaking(true);
                sfx.damage();
                setTimeout(() => setShaking(false), 360);
            }, delay);
        }
        else if (ward < pw) {
            const delay = pendingEnemyDisplayOffset.current;
            window.setTimeout(() => {
                setPlayerReact('hit');
                setPlayerSignal((n) => n + 1);
                setShaking(true);
                sfx.damage();
                setTimeout(() => setShaking(false), 300);
            }, delay);
        }
        else if (hp > ph) {
            setPlayerReact('heal');
            setPlayerSignal((n) => n + 1);
            sfx.heal();
        }
        else if (ward > pw) {
            setPlayerReact('ward');
            setPlayerSignal((n) => n + 1);
            sfx.wardGain();
        }
        prevPlayerHp.current = hp;
        prevPlayerWard.current = ward;
    }, [combat?.player.hp, combat?.player.ward]);
    useEffect(() => {
        if (!combat)
            return;
        const next = { ...enemySignals };
        let dirty = false;
        for (const e of combat.enemies) {
            const prev = prevEnemyState.current[e.id];
            if (!prev) {
                prevEnemyState.current[e.id] = { hp: e.hp, ward: e.ward };
                continue;
            }
            if (e.hp < prev.hp) {
                next[e.id] = { n: (next[e.id]?.n ?? 0) + 1, kind: e.hp <= 0 ? 'death' : 'hit' };
                sfx.attackHit();
                dirty = true;
            }
            else if (e.ward > prev.ward) {
                next[e.id] = { n: (next[e.id]?.n ?? 0) + 1, kind: 'ward' };
                dirty = true;
            }
            prevEnemyState.current[e.id] = { hp: e.hp, ward: e.ward };
        }
        if (dirty)
            setEnemySignals(next);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [combat?.enemies.map((e) => `${e.id}:${e.hp}:${e.ward}`).join('|')]);
    // -------- Targeting arrow (pointer + keyboard cycling) --------
    const [mouse, setMouse] = useState(null);
    const [hoveredEnemy, setHoveredEnemy] = useState(null);
    const [keyboardTargetIdx, setKeyboardTargetIdx] = useState(null);
    const enemyRefs = useRef({});
    const registerEnemyRef = (id, el) => {
        enemyRefs.current[id] = el;
    };
    const summonRefs = useRef({});
    const registerSummonRef = (slot, el) => {
        summonRefs.current[slot] = el;
    };
    const triggerSlash = (from, to, tone) => {
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
    const triggerHeroSlash = (enemyId) => {
        if (!enemyId)
            return;
        const hero = heroRef.current;
        const enemy = enemyRefs.current[enemyId];
        if (!hero || !enemy)
            return;
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
    const triggerEnemySlash = (enemyId) => {
        const enemy = enemyRefs.current[enemyId];
        const hero = heroRef.current;
        if (!enemy || !hero)
            return;
        window.setTimeout(() => {
            triggerSlash(enemy.getBoundingClientRect(), hero.getBoundingClientRect(), 'enemy');
        }, 160);
    };
    const triggerSummonSlash = (slot, enemyId) => {
        const summon = summonRefs.current[slot];
        const enemy = enemyRefs.current[enemyId];
        if (!summon || !enemy)
            return;
        summon.animate([
            { transform: 'translate(0, 0) rotate(0deg) scale(1)', filter: 'brightness(1)' },
            { transform: 'translate(-34px, 8px) rotate(-4deg) scale(0.94)', filter: 'brightness(1.25)' },
            { transform: 'translate(95px, -7px) rotate(2deg) scale(1.06)', filter: 'brightness(1.55)' },
            { transform: 'translate(250px, -16px) rotate(5deg) scale(1.14)', filter: 'brightness(2.05)' },
            { transform: 'translate(215px, -10px) rotate(3deg) scale(1.08)', filter: 'brightness(1.65)' },
            { transform: 'translate(0, 0) rotate(0deg) scale(1)', filter: 'brightness(1)' },
        ], {
            duration: 760,
            easing: 'cubic-bezier(0.13, 0.87, 0.22, 1)',
        });
        window.setTimeout(() => {
            triggerSlash(summon.getBoundingClientRect(), enemy.getBoundingClientRect(), 'hero');
        }, 170);
    };
    // Track mouse globally while targeting. Cheap — only attaches when needed.
    useEffect(() => {
        if (!targeting) {
            setMouse(null);
            return;
        }
        const h = (ev) => setMouse({ x: ev.clientX, y: ev.clientY });
        window.addEventListener('mousemove', h);
        return () => window.removeEventListener('mousemove', h);
    }, [targeting]);
    // -------- Low-HP heartbeat: pulse a thud every 1.5s when HP < 30% --------
    useEffect(() => {
        if (!combat)
            return;
        const pct = displayedPlayerVitals.hp / Math.max(1, displayedPlayerVitals.maxHp);
        if (pct >= 0.3 || displayedPlayerVitals.hp <= 0)
            return;
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
        const onKey = (ev) => {
            const s = useGame.getState();
            const c = s.combat;
            if (!c || c.phase !== 'player')
                return;
            const tgt = ev.target;
            if (tgt && (tgt.tagName === 'INPUT' || tgt.tagName === 'TEXTAREA' || tgt.isContentEditable))
                return;
            if (ev.key === 'Escape') {
                if (targeting) {
                    setTargeting(null);
                    setXCost(null);
                    sfx.cardSelect();
                    ev.preventDefault();
                    return;
                }
                if (showMenu) {
                    setShowMenu(false);
                    ev.preventDefault();
                    return;
                }
            }
            if (ev.key === 'e' || ev.key === 'E' || ev.key === ' ') {
                if (targeting)
                    return;
                ev.preventDefault();
                setXCost(null);
                sfx.endTurn();
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
                if (!alive.length)
                    return;
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
                if (!ci)
                    return;
                const def = getCard(ci.defId);
                if (def.cost > c.ember && def.cost >= 0)
                    return;
                if (def.type === 'curse' || def.id === 'status_dross')
                    return;
                ev.preventDefault();
                const runPlay = (enemyId) => {
                    if (def.type === 'attack')
                        triggerHeroSlash(enemyId);
                    setPlayingUid(ci.uid);
                    sfx.cardPlay(def.type);
                    setTimeout(() => {
                        s.combatPlayCard(ci.uid, enemyId, def.cost < 0 ? c.ember : undefined);
                        setPlayingUid(null);
                    }, 180);
                };
                if (def.target === 'enemy') {
                    const alive = c.enemies.filter((e) => e.hp > 0);
                    if (!alive.length)
                        return;
                    const chosen = keyboardTargetIdx != null && alive[keyboardTargetIdx] ? alive[keyboardTargetIdx] : alive[0];
                    runPlay(chosen.id);
                }
                else {
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
        if (!combat)
            return;
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
    const [playerFx, setPlayerFx] = useState(null);
    useEffect(() => {
        if (!playerSignal)
            return;
        setPlayerFx(playerReact);
        const t = setTimeout(() => setPlayerFx(null), 420);
        return () => clearTimeout(t);
    }, [playerSignal, playerReact]);
    if (!combat || !run)
        return null;
    const hand = combat.hand;
    const crowdedHand = hand.length > 5;
    const summons = combat.summons ?? [];
    const className = run.classId === 'vowbreaker' ? 'Vowbreaker' :
        run.classId === 'sealbinder' ? 'Sealbinder' :
            run.classId === 'whisperer' ? 'Whisperer' :
                run.classId === 'summoner' ? 'Summoner' : 'Auger';
    const playerArt = `player_${run.classId}`;
    const playerFxClass = heroStriking ? 'animate-hero-strike' :
        playerFx === 'hit' ? 'animate-hit-flash animate-player-damage-recoil' :
            playerFx === 'heal' ? 'animate-heal-flash' :
                playerFx === 'ward' ? 'animate-ward-flash' :
                    'animate-idle-float';
    const handleCardClick = (uid) => {
        const ci = combat.hand.find((c) => c.uid === uid);
        const def = getCard(ci.defId);
        if (def.cost > combat.ember && def.cost >= 0)
            return;
        if (def.cost < 0)
            setXCost(combat.ember);
        if (def.target === 'enemy') {
            setTargeting({ uid });
            sfx.cardSelect();
            return;
        }
        playTheCard(uid, undefined, def);
    };
    const playTheCard = (uid, enemyId, def) => {
        if (def.type === 'attack')
            triggerHeroSlash(enemyId);
        setPlayingUid(uid);
        sfx.cardPlay(def.type);
        setTimeout(() => {
            playCard(uid, enemyId, def.cost < 0 ? (xCost ?? combat.ember) : undefined);
            setPlayingUid(null);
        }, 180);
    };
    const handleEnemyClick = (enemyId) => {
        if (!targeting)
            return;
        if (typeof targeting.forPotionSlot === 'number') {
            usePotion(targeting.forPotionSlot, enemyId);
            sfx.potionUse();
            setTargeting(null);
            return;
        }
        const ci = combat.hand.find((c) => c.uid === targeting.uid);
        if (!ci) {
            setTargeting(null);
            return;
        }
        const def = getCard(ci.defId);
        playTheCard(targeting.uid, enemyId, def);
        setTargeting(null);
        setXCost(null);
    };
    const handlePotion = (slot) => {
        const pid = run.potions[slot];
        if (!pid)
            return;
        const p = getPotion(pid);
        if (p.needsTarget)
            setTargeting({ uid: '', forPotionSlot: slot });
        else {
            usePotion(slot);
            sfx.potionUse();
        }
    };
    const handleEndTurn = () => {
        setTargeting(null);
        setXCost(null);
        sfx.endTurn();
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
    const handleRootClick = (ev) => {
        if (!targeting)
            return;
        const t = ev.target;
        // Any click inside a button / card / enemy in this screen has already
        // been handled by a more specific handler. This root-level handler is
        // just a safety net for clicks on the scene backdrop, empty arena
        // space, the status bar, etc.
        if (t.closest('button') || t.closest('[data-card-root]'))
            return;
        setTargeting(null);
        setXCost(null);
        sfx.cardSelect();
    };
    return (_jsxs("div", { className: ['h-screen overflow-hidden flex flex-col', shaking ? 'animate-screen-shake' : ''].join(' '), onClick: handleRootClick, children: [_jsxs("div", { className: "relative shrink-0 flex items-center gap-7 px-7 py-4 border-b-2 border-vow-gold/40 min-h-[5.25rem]", style: {
                    background: 'linear-gradient(180deg, rgba(16,10,7,0.98) 0%, rgba(16,10,7,0.95) 70%, rgba(14,9,6,0.85) 100%)',
                    boxShadow: '0 8px 22px -10px rgba(0,0,0,0.9)',
                }, children: [_jsxs("div", { className: "flex flex-col items-start", children: [_jsx("div", { className: "font-display text-vow-gold text-4xl tracking-widest leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]", children: className.toUpperCase() }), _jsxs("div", { className: "text-[11px] uppercase tracking-[0.3em] text-ash-300 mt-1.5", children: ["Vowbearer \u00B7 Turn ", combat.turn] })] }), _jsxs("div", { className: "ml-auto flex items-center gap-3", children: [_jsx(GoldPlaque, { gold: run.gold }), run.relics.length > 0 && (_jsxs(_Fragment, { children: [_jsx("div", { className: "h-11 w-px bg-ash-500/60" }), _jsx("div", { className: "flex gap-2 flex-wrap max-w-[30rem]", children: run.relics.map((rid) => {
                                            const spriteId = resolveSprite(rid);
                                            const artUrl = getRelicArt(rid);
                                            let relicDef = null;
                                            try {
                                                relicDef = getRelic(rid);
                                            }
                                            catch {
                                                relicDef = null;
                                            }
                                            const btn = (_jsx("div", { className: "item-button w-12 h-12 rounded-md border-2 border-vow-gold/80 bg-ash-900/70 flex items-center justify-center overflow-hidden hover:scale-110 transition cursor-help shadow-[0_0_10px_rgba(212,162,76,0.35)]", title: relicDef?.name, children: artUrl ? _jsx("img", { src: artUrl, alt: relicDef?.name ?? rid, className: "asset-icon asset-icon-relic" }) : spriteId
                                                    ? _jsx(Sprite, { id: spriteId, fill: true, title: relicDef?.name ?? rid })
                                                    : _jsx("span", { className: "text-vow-gold text-lg", children: "\u2726" }) }, rid));
                                            if (!relicDef)
                                                return _jsx(React.Fragment, { children: btn }, rid);
                                            return (_jsx(Tooltip, { placement: "bottom", content: _jsx(TooltipBody, { title: relicDef.name, subtitle: tierLabel[relicDef.tier] ?? relicDef.tier, desc: relicDef.description }), children: btn }, rid));
                                        }) }), _jsx("div", { className: "h-11 w-px bg-ash-500/60" })] })), _jsx("div", { className: "flex gap-2", children: run.potions.map((pid, i) => {
                                    const spriteId = pid ? resolveSprite(pid) : null;
                                    const artUrl = getPotionArt(pid);
                                    const hasSpr = !!spriteId || !!artUrl;
                                    const potionDef = pid ? getPotion(pid) : null;
                                    const button = (_jsx("button", { onClick: () => handlePotion(i), disabled: !pid, className: [
                                            'item-button w-12 h-12 rounded-full border-2 flex items-center justify-center transition text-xl overflow-hidden',
                                            pid
                                                ? 'border-vow-gold hover:scale-110 text-vow-bone shadow-[0_0_14px_rgba(249,115,22,0.5)] cursor-help'
                                                : 'border-ash-500 bg-ash-900/70 text-ash-400',
                                            pid && !hasSpr ? 'bg-gradient-to-br from-ember-500 via-ember-700 to-ember-900' : '',
                                            pid && hasSpr ? 'bg-ash-900/60' : '',
                                        ].join(' '), children: pid && artUrl ? (_jsx("img", { src: artUrl, alt: potionDef.name, className: "asset-icon asset-icon-potion" })) : pid && hasSpr && spriteId ? (_jsx(Sprite, { id: spriteId, fill: true, title: potionDef.name })) : pid ? '⚗' : '·' }, i));
                                    if (!potionDef)
                                        return _jsx(React.Fragment, { children: button }, i);
                                    return (_jsx(Tooltip, { placement: "bottom", content: _jsx(TooltipBody, { title: potionDef.name, subtitle: tierLabel[potionDef.rarity] ?? potionDef.rarity, desc: potionDef.description }), children: button }, i));
                                }) }), _jsx("button", { onClick: () => setShowDeck(true), className: "px-5 py-3 rounded-md border-2 border-vow-gold/70 bg-gradient-to-b from-ash-800 to-ash-900 hover:from-ash-700 hover:to-ash-800 text-vow-bone font-display text-lg tracking-wide shadow-lg", children: "Deck" }), _jsx("button", { onClick: () => setShowMenu(true), className: "px-5 py-3 rounded-md border-2 border-ash-400 bg-gradient-to-b from-ash-800 to-ash-900 hover:from-ash-700 hover:to-ash-800 text-ash-100 font-display text-lg tracking-wide shadow-lg", children: "Menu" })] })] }), _jsxs("div", { className: "arena relative flex-1 min-h-0 overflow-hidden isolate", children: [_jsx(SceneBackdrop, {}), _jsx(StageFloor, {}), slashFx && (() => {
                        const angle = slashFx.tone === 'hero' ? -22 : 158;
                        return (_jsx("svg", { className: "fixed inset-0 z-40 pointer-events-none overflow-visible", children: _jsxs("g", { className: "weapon-slash-impact", transform: `translate(${slashFx.toX} ${slashFx.toY})`, children: [_jsxs("g", { transform: `rotate(${angle})`, children: [_jsx("path", { d: "M -34 -8 Q 0 -30 34 -8", className: slashFx.tone === 'hero' ? 'weapon-contact-arc-hero' : 'weapon-contact-arc-enemy' }), _jsx("line", { x1: "-20", y1: "5", x2: "22", y2: "-16", className: slashFx.tone === 'hero' ? 'weapon-contact-cut-hero' : 'weapon-contact-cut-enemy' })] }), _jsx("circle", { r: "5", className: slashFx.tone === 'hero' ? 'weapon-impact-core-hero' : 'weapon-impact-core-enemy' }), Array.from({ length: 6 }).map((_, i) => {
                                        const angle = (i / 8) * Math.PI * 2;
                                        const x = Math.cos(angle) * 22;
                                        const y = Math.sin(angle) * 17;
                                        return (_jsx("line", { x1: Math.cos(angle) * 7, y1: Math.sin(angle) * 5, x2: x, y2: y, className: slashFx.tone === 'hero' ? 'weapon-impact-spark-hero' : 'weapon-impact-spark-enemy' }, i));
                                    })] }) }, slashFx.id));
                    })(), _jsxs("div", { className: "absolute inset-0 z-10 flex items-end justify-center gap-[4rem] pointer-events-none pb-14", children: [_jsxs("div", { className: "relative flex-shrink-0 flex flex-col items-center gap-3 pointer-events-auto", children: [_jsxs("div", { ref: heroRef, className: ['relative w-[18rem] h-[40vh] max-h-[26rem]', playerFxClass].join(' '), style: {
                                            ['--attack-dx']: `${heroAttackOffset.dx}px`,
                                            ['--attack-dy']: `${heroAttackOffset.dy}px`,
                                        }, children: [_jsx("div", { className: "absolute left-1/2 bottom-0 -translate-x-1/2 w-[72%] h-10 pointer-events-none", style: {
                                                    background: 'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.35) 55%, transparent 100%)',
                                                    filter: 'blur(5px)',
                                                } }), _jsx("div", { className: "absolute left-1/2 bottom-0 -translate-x-1/2 w-[100%] h-14 pointer-events-none", style: {
                                                    background: 'radial-gradient(ellipse 55% 45% at 50% 60%, rgba(0,0,0,0.4) 0%, transparent 70%)',
                                                    filter: 'blur(10px)',
                                                } }), (() => {
                                                const portrait = getPlayerPortrait(playerArt);
                                                if (portrait) {
                                                    // The Vowbreaker PNG has a thick band of transparent
                                                    // pixels below the character's feet. `object-position`
                                                    // pushes the image further down inside its box, so the
                                                    // transparent band is clipped off the bottom and the
                                                    // painted feet land on the container's bottom edge —
                                                    // the same spot where the rats' feet sit. vh scales so
                                                    // the offset stays right across window sizes.
                                                    return (_jsx(PortraitImage, { portrait: portrait, className: "w-full h-full drop-shadow-[0_26px_32px_rgba(0,0,0,0.92)]", style: { objectPosition: 'center calc(100% + 5vh)' }, title: className }));
                                                }
                                                return _jsx(CharacterArt, { artId: playerArt, className: "w-full h-full drop-shadow-[0_26px_32px_rgba(0,0,0,0.92)]" });
                                            })(), playerFx === 'hit' && (_jsxs(_Fragment, { children: [_jsx("div", { className: "absolute inset-0 pointer-events-none z-20 animate-impact-flash", style: {
                                                            background: 'radial-gradient(circle at 50% 55%, rgba(255,80,40,0.85) 0%, rgba(255,140,60,0.5) 22%, rgba(255,80,40,0) 60%)',
                                                            mixBlendMode: 'screen',
                                                        } }, `player-flash-${playerSignal}`), _jsx("svg", { className: "absolute inset-0 pointer-events-none z-20", viewBox: "0 0 100 100", preserveAspectRatio: "none", children: _jsxs("g", { className: "animate-spark-burst", style: { transformOrigin: '50% 55%' }, children: [Array.from({ length: 8 }).map((_, i) => {
                                                                    const angle = (i * 45 - 90) * (Math.PI / 180);
                                                                    const r1 = 6, r2 = 22;
                                                                    const x1 = 50 + Math.cos(angle) * r1;
                                                                    const y1 = 55 + Math.sin(angle) * r1;
                                                                    const x2 = 50 + Math.cos(angle) * r2;
                                                                    const y2 = 55 + Math.sin(angle) * r2;
                                                                    return (_jsx("line", { x1: x1, y1: y1, x2: x2, y2: y2, stroke: "#ffd089", strokeWidth: 0.8, strokeLinecap: "round", opacity: 0.9 }, i));
                                                                }), _jsx("circle", { cx: "50", cy: "55", r: "3", fill: "#fff1cf", opacity: "0.95" })] }) }, `player-sparks-${playerSignal}`)] })), _jsx(BurstFx, { kind: playerFx, signal: playerSignal }), _jsx("div", { className: "absolute left-1/2 bottom-0 -translate-x-1/2 w-48 h-3 rounded-full bg-ember-500/25 blur-lg pointer-events-none" }), _jsx("div", { className: "absolute inset-x-0 top-[18%] flex flex-col items-center pointer-events-none z-30", children: floats.filter((f) => f.targetId === 'player').map((f) => (_jsx("span", { className: [
                                                        f.tone === 'dmg' ? 'animate-damage-number damage-number text-6xl' : f.tone === 'ward' ? 'animate-damage-number damage-number text-5xl' : 'animate-float text-4xl font-bold drop-shadow',
                                                        f.tone === 'dmg' ? 'text-[#fff1cf]' : f.tone === 'heal' ? 'text-emerald-400' : f.tone === 'ward' ? 'text-vow-seal' : 'text-vow-gold',
                                                    ].join(' '), children: f.text }, f.id))) })] }), (() => {
                                        const hp = displayedPlayerVitals.hp;
                                        const maxHp = displayedPlayerVitals.maxHp;
                                        const ward = displayedPlayerVitals.ward;
                                        const hpPct = Math.max(0, Math.min(100, (hp / Math.max(1, maxHp)) * 100));
                                        return (_jsxs("div", { className: "relative flex flex-col items-center", children: [_jsxs("div", { className: "flex items-stretch gap-2", children: [_jsx(Tooltip, { placement: "top", content: _jsx(TooltipBody, { title: `PV ${hp}/${maxHp}`, subtitle: "VIE", desc: "Tes points de vie. \u00C0 0, la tentative est perdue." }), children: _jsxs("div", { className: "relative flex items-stretch h-10 rounded-lg overflow-hidden border-2 border-vow-gold/70 shadow-xl cursor-help", style: { boxShadow: '0 4px 14px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(212,162,76,0.4)' }, children: [_jsx("div", { className: "flex items-center justify-center px-3 bg-gradient-to-b from-vow-blood to-[#4a0f18] text-ash-100 border-r border-vow-gold/60", children: _jsx("span", { className: "text-lg leading-none", children: "\u2665" }) }), _jsxs("div", { className: "relative w-48 bg-ash-900", children: [_jsx("div", { className: "absolute inset-y-0 left-0 transition-[width] duration-300", style: {
                                                                                    width: `${hpPct}%`,
                                                                                    background: 'linear-gradient(90deg, #8b1e2b 0%, #c2410c 60%, #fb923c 100%)',
                                                                                    boxShadow: 'inset 0 -4px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
                                                                                } }), _jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: _jsxs("span", { className: "text-ash-100 font-display font-bold text-lg leading-none tracking-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]", children: [Math.max(0, hp), "/", maxHp] }) })] })] }) }), ward > 0 && (_jsx(Tooltip, { placement: "top", content: _jsx(TooltipBody, { title: `Garde ${ward}`, subtitle: "BONUS", desc: "Absorbe les d\u00E9g\u00E2ts avant les PV. Dispara\u00EEt au d\u00E9but de ton tour." }), children: _jsxs("div", { className: "relative flex items-stretch h-10 rounded-lg overflow-hidden border-2 border-vow-seal/80 shadow-xl cursor-help animate-ward-appear", style: { boxShadow: '0 4px 14px rgba(0,0,0,0.8), 0 0 14px rgba(59,130,246,0.35), inset 0 0 0 1px rgba(147,197,253,0.35)' }, children: [_jsx("div", { className: "flex items-center justify-center px-3 bg-gradient-to-b from-[#1e3a8a] to-[#0f1e44] text-ash-100 border-r border-vow-seal/70", children: _jsx("span", { className: "text-lg leading-none", children: "\uD83D\uDEE1" }) }), _jsxs("div", { className: "relative min-w-[3rem] px-3 bg-ash-900", children: [_jsx("div", { className: "absolute inset-0", style: {
                                                                                    background: 'linear-gradient(90deg, #1e3a8a 0%, #2563eb 60%, #60a5fa 100%)',
                                                                                    boxShadow: 'inset 0 -4px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
                                                                                } }), _jsx("div", { className: "relative flex items-center justify-center h-full", children: _jsx("span", { className: "text-ash-100 font-display font-bold text-lg leading-none tracking-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]", children: ward }) })] })] }) }))] }), _jsx("div", { className: "absolute top-full mt-2 left-1/2 -translate-x-1/2 min-w-[18rem] pointer-events-auto z-20", children: _jsx(StatusRow, { status: combat.player.status, align: "center", size: "lg" }) })] }));
                                    })()] }), _jsx(SummonServants, { summons: summons, activeAttack: activeSummonAttack, hitSignals: summonHitSignals, floats: floats, registerRef: registerSummonRef }), _jsx("div", { className: "relative flex items-end justify-start gap-6 flex-wrap pointer-events-auto", children: (() => {
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
                                        const showPreview = !!targetingDef && e.hp > 0 &&
                                            (hoveredEnemy === e.id || (hoveredEnemy == null && kbEnemy?.id === e.id));
                                        const previewTotal = showPreview && targetingDef
                                            ? (previewCardDamage(targetingDef, combat.player, e)?.total ?? null)
                                            : null;
                                        return (_jsx(SceneEnemy, { e: e, hitSignal: sig?.n ?? 0, reaction: sig?.kind ?? null, targeting: !!targeting, onClick: () => handleEnemyClick(e.id), onHover: setHoveredEnemy, floats: myFloats, compact: combat.enemies.length > 2, damagePreview: previewTotal, imminent: combat.phase === 'enemy', keyboardTarget: kbEnemy?.id === e.id, registerRef: registerEnemyRef, attackSignal: attackSignals[e.id] ?? 0 }, e.id));
                                    });
                                })() })] })] }), _jsxs("div", { className: "relative shrink-0 min-h-[344px] border-t border-vow-gold/25", style: {
                    background: 'linear-gradient(180deg, rgba(10,8,7,0.0) 0%, rgba(12,9,7,0.55) 25%, rgba(14,10,8,0.85) 60%, rgba(14,10,8,0.95) 100%)',
                    boxShadow: 'inset 0 18px 30px -18px rgba(0,0,0,0.8)',
                }, children: [_jsxs("div", { className: "absolute left-6 top-1/2 -translate-y-1/2 z-10 flex flex-col items-start gap-3", children: [_jsx(EmberPlaque, { ember: combat.ember, max: combat.emberMax }), _jsx(PileButton, { label: "Pioche", desc: "Les cartes que tu vas piocher, dans un ordre m\u00E9lang\u00E9.", icon: _jsx(PileIcon, { variant: "draw" }), count: combat.draw.length, onClick: () => setOpenPile('draw') })] }), _jsx("div", { className: [
                            'relative z-0 flex items-end w-full pt-5 pb-6 min-h-[344px] overflow-y-visible',
                            crowdedHand
                                ? 'justify-start gap-0 flex-nowrap overflow-x-auto scrollbar-ember px-[13rem]'
                                : 'justify-center gap-5 flex-wrap px-[10rem]',
                        ].join(' '), children: hand.map((ci, index) => {
                            const def = getCard(ci.defId);
                            const affordable = def.cost <= combat.ember || def.cost < 0;
                            const unplayable = def.type === 'curse' || def.id === 'status_dross';
                            return (_jsx("div", { className: "animate-rise shrink-0 transition-transform duration-150 hover:-translate-y-4", "data-card-uid": ci.uid, onMouseEnter: () => setHoveredCardUid(ci.uid), onMouseLeave: () => setHoveredCardUid((current) => current === ci.uid ? null : current), style: {
                                    marginLeft: crowdedHand && index > 0 ? -28 : undefined,
                                    zIndex: hoveredCardUid === ci.uid || targeting?.uid === ci.uid ? 100 : index,
                                }, children: _jsx(CardView, { def: def, upgraded: ci.upgraded, size: "lg", affordable: affordable && !unplayable, disabled: !affordable || unplayable, onClick: () => handleCardClick(ci.uid), selected: targeting?.uid === ci.uid, playing: playingUid === ci.uid }) }, ci.uid));
                        }) }), _jsxs("div", { className: "absolute right-6 top-1/2 -translate-y-1/2 z-10 flex flex-col items-end gap-3", children: [_jsx("button", { onClick: handleEndTurn, className: "px-8 py-4 rounded-md font-display text-2xl text-ash-100 font-bold tracking-wide transition-all hover:scale-105", style: {
                                    background: 'linear-gradient(180deg, #c2410c 0%, #7c2d12 100%)',
                                    border: '2px solid rgba(212,162,76,0.8)',
                                    boxShadow: '0 4px 18px rgba(0,0,0,0.75), 0 0 24px rgba(249,115,22,0.55)',
                                }, children: "Fin du tour" }), _jsxs("div", { className: "flex flex-col gap-2", children: [_jsx(PileButton, { label: "D\u00E9fausse", desc: "Les cartes jou\u00E9es ou d\u00E9pens\u00E9es. Elles sont rem\u00E9lang\u00E9es dans la pioche quand elle est vide.", icon: _jsx(PileIcon, { variant: "discard" }), count: combat.discard.length, onClick: () => setOpenPile('discard') }), _jsx(PileButton, { label: "Bannissement", desc: "Les cartes retir\u00E9es de ce combat. Elles ne sont pas rem\u00E9lang\u00E9es.", icon: _jsx(PileIcon, { variant: "banish" }), count: combat.banish.length, onClick: () => setOpenPile('banish') })] })] })] }), _jsxs("div", { className: "hidden", children: [_jsxs("div", { className: "flex gap-2", children: [_jsx(PileButton, { label: "Pioche", desc: "Les cartes que tu vas piocher, dans un ordre m\u00E9lang\u00E9.", icon: _jsx(PileIcon, { variant: "draw" }), count: combat.draw.length, onClick: () => setOpenPile('draw') }), _jsx(PileButton, { label: "D\u00E9fausse", desc: "Les cartes jou\u00E9es ou d\u00E9pens\u00E9es. Elles sont rem\u00E9lang\u00E9es dans la pioche quand elle est vide.", icon: _jsx(PileIcon, { variant: "discard" }), count: combat.discard.length, onClick: () => setOpenPile('discard') }), _jsx(PileButton, { label: "Bannissement", desc: "Les cartes retir\u00E9es de ce combat. Elles ne sont pas rem\u00E9lang\u00E9es.", icon: _jsx(PileIcon, { variant: "banish" }), count: combat.banish.length, onClick: () => setOpenPile('banish') })] }), _jsx("button", { onClick: handleEndTurn, className: "ml-auto px-8 py-2.5 rounded-md font-display text-lg text-ash-100 font-bold tracking-wide transition-all hover:scale-105", style: {
                            background: 'linear-gradient(180deg, #c2410c 0%, #7c2d12 100%)',
                            border: '2px solid rgba(212,162,76,0.7)',
                            boxShadow: '0 4px 14px rgba(0,0,0,0.6), 0 0 20px rgba(249,115,22,0.45)',
                        }, children: "Fin du tour" })] }), targeting && (() => {
                const vw = window.innerWidth;
                const vh = window.innerHeight;
                // Start from the actual selected card so the arrow visibly grows
                // out of the chosen card instead of some generic screen point.
                let startX = vw / 2;
                let startY = vh - 110;
                const cardEl = document.querySelector(`[data-card-uid="${targeting.uid}"]`);
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
                return (_jsxs("svg", { className: "fixed inset-0 z-30 pointer-events-none", width: vw, height: vh, viewBox: `0 0 ${vw} ${vh}`, children: [_jsx("defs", { children: _jsx("marker", { id: "target-arrow-head", viewBox: "0 0 10 10", refX: "7", refY: "5", markerWidth: "5.5", markerHeight: "5.5", orient: "auto-start-reverse", children: _jsx("path", { d: "M 0 0 L 10 5 L 0 10 Z", fill: "#fb923c" }) }) }), _jsx("path", { d: path, stroke: "rgba(249,115,22,0.22)", strokeWidth: 8, fill: "none", strokeLinecap: "round" }), _jsx("path", { d: path, stroke: "#fb923c", strokeWidth: 1.75, fill: "none", strokeLinecap: "round", markerEnd: "url(#target-arrow-head)", opacity: 0.95 }), _jsx("circle", { cx: startX, cy: startY, r: 4, fill: "#fed7aa", opacity: 0.9, children: _jsx("animate", { attributeName: "r", values: "3;5;3", dur: "1.4s", repeatCount: "indefinite" }) }), dots.map((d, i) => (_jsx("circle", { className: "target-arrow-dot", cx: d.x, cy: d.y, r: 1.5, fill: "#ffd089", opacity: 0.55 + d.t * 0.3, style: { animationDelay: `${i * 90}ms` } }, i)))] }));
            })(), (() => {
                const pct = displayedPlayerVitals.hp / Math.max(1, displayedPlayerVitals.maxHp);
                if (pct >= 0.3 || displayedPlayerVitals.hp <= 0)
                    return null;
                return (_jsx("div", { className: "fixed inset-0 z-20 pointer-events-none animate-low-hp-vignette", "aria-hidden": "true" }));
            })(), showVictory && (_jsxs("div", { className: "fixed inset-0 z-40 flex items-center justify-center pointer-events-none", children: [_jsx("div", { className: "absolute inset-0 animate-victory-glow", style: {
                            background: 'radial-gradient(ellipse at 50% 45%, rgba(212,162,76,0.35) 0%, rgba(212,162,76,0.12) 30%, rgba(0,0,0,0) 65%)',
                        } }), _jsx("div", { className: "absolute inset-0 overflow-hidden", children: Array.from({ length: 34 }).map((_, i) => (_jsx("span", { className: "victory-ember", style: {
                                left: `${8 + ((i * 23) % 86)}%`,
                                bottom: `${-8 - (i % 5) * 4}%`,
                                animationDelay: `${(i % 11) * 85}ms`,
                                animationDuration: `${1100 + (i % 7) * 120}ms`,
                                ['--drift']: `${((i % 9) - 4) * 14}px`,
                            } }, i))) }), _jsxs("div", { className: "relative flex flex-col items-center gap-2 animate-victory-banner", children: [_jsx("span", { className: "font-display uppercase text-vow-gold text-7xl font-bold tracking-[0.3em] drop-shadow-[0_4px_14px_rgba(0,0,0,0.95)]", children: "Victoire" }), _jsx("span", { className: "font-display uppercase text-ash-200 text-sm tracking-[0.5em]", children: "Le serment tient bon" })] })] })), _jsx("div", { className: "fixed bottom-20 right-3 max-w-xs max-h-40 overflow-y-auto scrollbar-ember panel p-2 text-xs text-ash-200 opacity-60 hover:opacity-100 transition", children: combat.log.slice(-6).map((l, i) => _jsx("div", { children: l }, i)) }), targeting && (_jsxs("div", { className: "fixed top-20 left-1/2 -translate-x-1/2 panel px-4 py-1 text-sm text-vow-gold animate-pulse z-20", children: ["Choisis une cible", _jsx("button", { className: "ml-3 btn-ghost text-xs", onClick: () => setTargeting(null), children: "Annuler" })] })), showDeck && (_jsx(DeckPeek, { onClose: () => setShowDeck(false) })), openPile && (_jsx(PileViewer, { title: openPile === 'draw' ? 'Pioche' : openPile === 'discard' ? 'Défausse' : 'Bannissement', cards: openPile === 'draw' ? combat.draw : openPile === 'discard' ? combat.discard : combat.banish, shuffled: openPile === 'draw', onClose: () => setOpenPile(null) })), showMenu && (_jsx(MenuOverlay, { onClose: () => setShowMenu(false), onConcede: () => { setShowMenu(false); abandonRun(); } }))] }));
};
// ---------------- Pile button + icons ----------------
const PileIcon = ({ variant }) => {
    if (variant === 'draw') {
        return (_jsxs("span", { className: "relative w-8 h-9 inline-block", children: [_jsx("span", { className: "absolute inset-0 rounded-sm border border-vow-gold/70 bg-ash-900 translate-x-[3px] translate-y-[3px]" }), _jsx("span", { className: "absolute inset-0 rounded-sm border border-vow-gold/80 bg-ash-800 translate-x-[1.5px] translate-y-[1.5px]" }), _jsx("span", { className: "absolute inset-0 rounded-sm border border-vow-gold bg-gradient-to-br from-ash-700 to-ash-900" })] }));
    }
    if (variant === 'discard') {
        return (_jsxs("span", { className: "relative w-9 h-9 inline-block", children: [_jsx("span", { className: "absolute inset-0 rounded-sm border border-ash-300/80 bg-ash-800 -rotate-[10deg] translate-x-[-2px]" }), _jsx("span", { className: "absolute inset-0 rounded-sm border border-ash-200 bg-gradient-to-br from-ash-600 to-ash-800 rotate-[10deg] translate-x-[2px]" })] }));
    }
    // banish
    return (_jsxs("span", { className: "relative w-8 h-9 inline-block", children: [_jsx("span", { className: "absolute inset-0 rounded-sm border border-vow-blood/70 bg-ash-900" }), _jsx("span", { className: "absolute inset-0 flex items-center justify-center text-vow-blood text-lg leading-none font-bold", children: "\u2715" })] }));
};
const PileButton = ({ label, desc, icon, count, onClick }) => (_jsx(Tooltip, { placement: "top", content: _jsx(TooltipBody, { title: `${label} · ${count}`, subtitle: "TAS", desc: desc }), children: _jsxs("button", { type: "button", onClick: onClick, className: "flex items-center gap-2.5 px-4 py-2.5 rounded-md border-2 border-vow-gold/60 bg-ash-900/85 hover:bg-ash-800 hover:border-vow-gold transition text-ash-100 cursor-pointer shadow-[0_4px_14px_rgba(0,0,0,0.65)]", children: [icon, _jsx("span", { className: "font-display text-2xl text-ember-400 font-bold leading-none", children: count }), _jsx("span", { className: "font-display text-[11px] uppercase tracking-widest text-ash-300", children: label })] }) }));
// ---------------- Overlays ----------------
const DeckPeek = ({ onClose }) => {
    const combat = useGame((s) => s.combat);
    if (!combat)
        return null;
    const pile = (label, arr) => (_jsxs("div", { className: "mb-3", children: [_jsxs("div", { className: "text-sm text-vow-gold font-display mb-1 uppercase tracking-widest", children: [label, " \u2014 ", arr.length] }), _jsxs("div", { className: "flex gap-1 flex-wrap", children: [arr.map((c, i) => {
                        const d = getCard(c.defId);
                        return (_jsxs("span", { className: "px-2 py-1 text-xs rounded bg-ash-800 border border-ash-500 text-ash-100", title: d.text, children: [d.name, c.upgraded ? '+' : ''] }, i));
                    }), arr.length === 0 && _jsx("span", { className: "text-ash-400 text-xs italic", children: "vide" })] })] }));
    return (_jsx("div", { className: "fixed inset-0 bg-black/70 flex items-center justify-center z-30", onClick: onClose, children: _jsxs("div", { className: "panel max-w-3xl w-full max-h-[80vh] overflow-auto scrollbar-ember p-5", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "flex items-center mb-3", children: [_jsx("h3", { className: "font-display text-2xl text-vow-bone", children: "Ton deck" }), _jsx("button", { onClick: onClose, className: "ml-auto btn-ghost", children: "Fermer" })] }), pile('Main', combat.hand), pile('Pioche (ordre masqué)', [...combat.draw].sort(() => 0)), pile('Défausse', combat.discard), pile('Bannissement', combat.banish)] }) }));
};
const PileViewer = ({ title, cards, shuffled, onClose }) => {
    // Draw is shown shuffled so we don't leak ordering; discard/banish keep order.
    const displayed = shuffled ? [...cards].sort((a, b) => (a.defId > b.defId ? 1 : -1)) : cards;
    return (_jsx("div", { className: "fixed inset-0 bg-black/75 flex items-center justify-center z-30 p-4", onClick: onClose, children: _jsxs("div", { className: "panel max-w-6xl w-full max-h-[85vh] overflow-auto scrollbar-ember p-5", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "flex items-center mb-4", children: [_jsxs("h3", { className: "font-display text-2xl text-vow-bone", children: [title, " ", _jsxs("span", { className: "text-ember-400", children: ["\u00B7 ", cards.length] })] }), shuffled && (_jsx("span", { className: "ml-3 text-[10px] text-ash-300 italic uppercase tracking-widest", children: "Ordre masqu\u00E9" })), _jsx("button", { onClick: onClose, className: "ml-auto btn-ghost", children: "Fermer" })] }), displayed.length === 0 ? (_jsx("div", { className: "text-ash-400 italic text-center py-10", children: "Cette pile est vide." })) : (_jsx("div", { className: "flex gap-4 flex-wrap justify-center pt-2", children: displayed.map((c, i) => {
                        const d = getCard(c.defId);
                        return (_jsx("div", { className: "pl-4", children: _jsx(CardView, { def: d, upgraded: c.upgraded, size: "sm", affordable: true }) }, i));
                    }) }))] }) }));
};
const MenuOverlay = ({ onClose, onConcede }) => (_jsx("div", { className: "fixed inset-0 bg-black/70 flex items-center justify-center z-30", onClick: onClose, children: _jsxs("div", { className: "panel max-w-sm w-full p-5", onClick: (e) => e.stopPropagation(), children: [_jsx("h3", { className: "font-display text-xl text-vow-bone mb-3", children: "Menu" }), _jsxs("div", { className: "flex flex-col gap-2", children: [_jsx("button", { onClick: onClose, className: "btn", children: "Reprendre" }), _jsx("button", { onClick: onConcede, className: "btn border-vow-blood/60 text-vow-blood hover:bg-vow-blood/20", children: "Abandonner" })] }), _jsx("p", { className: "text-xs text-ash-300 mt-3 italic", children: "Abandonner met fin \u00E0 cette tentative et renvoie au menu principal." })] }) }));
