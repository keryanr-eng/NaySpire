import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// EMBERVOW — animated character portrait wrapper.
// Composes a CharacterArt with HP bar, Ward pill, status badges, and
// reactions to hits/heals via hitSignal (a monotonically increasing number).
import { useEffect, useState } from 'react';
import { CharacterArt } from './CharacterArt';
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
};
const StatusRow = ({ status, compact }) => {
    const entries = Object.entries(status).filter(([k, v]) => !k.startsWith('_') && (v ?? 0) > 0);
    if (!entries.length)
        return null;
    return (_jsx("div", { className: "flex flex-wrap gap-1 justify-center", children: entries.map(([id, n]) => {
            const meta = STATUS_GLYPH[id] ?? { glyph: '•', tint: 'text-ash-100', label: id };
            return (_jsxs("span", { title: `${meta.label} ${n}`, className: [
                    'flex items-center gap-0.5 rounded border border-ash-400 bg-ash-700/90',
                    compact ? 'text-[10px] px-1 py-[1px]' : 'text-xs px-1.5 py-0.5',
                    meta.tint,
                ].join(' '), children: [_jsx("span", { children: meta.glyph }), _jsx("span", { className: "text-vow-gold font-semibold", children: n })] }, id));
        }) }));
};
const HPBar = ({ hp, max, ward }) => {
    const pct = Math.max(0, Math.min(100, (hp / Math.max(1, max)) * 100));
    return (_jsxs("div", { className: "w-full flex flex-col items-center gap-1", children: [_jsxs("div", { className: "relative h-3 w-full rounded bg-ash-900 overflow-hidden border border-ash-500 shadow-inner", children: [_jsx("div", { className: "absolute inset-y-0 left-0 bg-gradient-to-r from-vow-blood via-ember-600 to-ember-400 transition-[width] duration-300", style: { width: `${pct}%` } }), _jsxs("div", { className: "absolute inset-0 flex items-center justify-center text-[10px] font-bold text-ash-100 tracking-wide drop-shadow", children: [hp, " / ", max] })] }), ward > 0 && (_jsxs("div", { className: "flex items-center gap-1 text-vow-seal text-xs font-semibold", children: [_jsx("span", { "aria-hidden": true, children: "\uD83D\uDEE1" }), _jsxs("span", { children: [ward, " Garde"] })] }))] }));
};
export const CharacterView = ({ artId, name, hp, maxHp, ward, status, hitSignal = 0, reactionKind, facing = 'left', selected, highlighted, compact, onClick, intent, subtitle, disabled, }) => {
    const [fx, setFx] = useState(null);
    useEffect(() => {
        if (!hitSignal)
            return;
        setFx(reactionKind ?? 'hit');
        const t = setTimeout(() => setFx(null), 420);
        return () => clearTimeout(t);
    }, [hitSignal, reactionKind]);
    const dead = hp <= 0;
    const portraitSize = compact ? 'w-24 h-32' : 'w-32 h-44';
    const fxClass = fx === 'hit' ? 'animate-hit-flash' :
        fx === 'heal' ? 'animate-heal-flash' :
            fx === 'ward' ? 'animate-ward-flash' :
                fx === 'buff' ? 'animate-buff-pulse' :
                    fx === 'debuff' ? 'animate-debuff-pulse' :
                        fx === 'death' ? 'animate-death-fade' : '';
    const shakeClass = fx === 'hit' ? 'animate-portrait-hit' : 'animate-idle-float';
    const Wrapper = onClick ? 'button' : 'div';
    return (_jsxs(Wrapper, { type: onClick ? 'button' : undefined, onClick: onClick, disabled: onClick ? disabled : undefined, className: [
            'group relative flex flex-col items-center gap-2 p-2 rounded-lg transition-all',
            onClick && !disabled ? 'cursor-pointer' : '',
            highlighted ? 'ring-2 ring-ember-500 shadow-glow' : 'ring-1 ring-ash-500/30',
            selected ? 'ring-2 ring-vow-gold' : '',
            dead ? 'opacity-35 grayscale pointer-events-none' : '',
        ].join(' '), style: { background: 'radial-gradient(ellipse at center bottom, rgba(249,115,22,0.08), transparent 65%)' }, children: [_jsxs("div", { className: "text-center leading-tight", children: [_jsx("div", { className: "font-display text-vow-bone text-base truncate max-w-[180px]", children: name }), subtitle && _jsx("div", { className: "text-[10px] uppercase tracking-widest text-ash-300", children: subtitle })] }), intent && (_jsx("div", { className: "text-xs flex items-center gap-1 px-2 py-1 rounded bg-ash-900/80 border border-ash-500 max-w-[180px]", children: intent })), _jsxs("div", { className: ['relative', portraitSize, shakeClass].join(' '), style: { transform: facing === 'right' ? 'scaleX(-1)' : undefined }, children: [_jsx(CharacterArt, { artId: artId, className: ['w-full h-full', fxClass].join(' ') }), highlighted && (_jsx("div", { className: "absolute inset-x-0 bottom-0 h-2 pointer-events-none", children: _jsx("div", { className: "mx-auto w-24 h-2 rounded-full bg-ember-500/40 blur-sm animate-pulse" }) }))] }), _jsx("div", { className: "w-full max-w-[180px]", children: _jsx(HPBar, { hp: Math.max(0, hp), max: maxHp, ward: ward }) }), _jsx(StatusRow, { status: status, compact: compact })] }));
};
