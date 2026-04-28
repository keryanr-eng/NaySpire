import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { sfx } from '../systems/sound';
const sizeMap = {
    sm: 'w-32 h-44 text-xs',
    md: 'w-44 h-60 text-sm',
    lg: 'w-56 h-72 text-base',
};
const rarityClass = {
    starter: 'card-rarity-common',
    common: 'card-rarity-common',
    uncommon: 'card-rarity-uncommon',
    rare: 'card-rarity-rare',
    curse: 'card-rarity-curse',
    status: 'card-rarity-curse',
    special: 'card-rarity-uncommon',
};
const typeBadgeClass = {
    attack: 'bg-vow-blood/70 text-ash-100',
    skill: 'bg-vow-seal/60 text-ash-100',
    power: 'bg-vow-gold/80 text-ash-900',
    curse: 'bg-vow-blood/90 text-ash-100',
    status: 'bg-ash-500/80 text-ash-100',
};
const typeGlyph = {
    attack: '⚔',
    skill: '◈',
    power: '✦',
    curse: '☠',
    status: '•',
};
const typeLabel = {
    attack: 'Attaque',
    skill: 'Compétence',
    power: 'Pouvoir',
    curse: 'Malédiction',
    status: 'Statut',
};
export const CardView = ({ def, upgraded, disabled, affordable = true, onClick, size = 'md', selected, footer, dim, playing, }) => {
    const rarityCss = rarityClass[def.rarity] ?? 'card-rarity-common';
    const isPlayable = affordable && !disabled;
    const isLarge = size === 'lg';
    return (_jsxs("button", { type: "button", onMouseEnter: () => isPlayable && sfx.cardHover(), onClick: onClick, disabled: disabled, "data-card-root": true, className: [
            'card-face', rarityCss, sizeMap[size],
            'relative rounded-lg flex flex-col text-left transition-all duration-150',
            isLarge ? 'px-4 py-4' : 'px-2 py-2',
            isPlayable ? 'card-playable hover:-translate-y-2' : 'card-unplayable cursor-not-allowed',
            selected ? 'ring-2 ring-vow-gold -translate-y-3 shadow-glow' : '',
            dim ? 'opacity-50' : '',
            playing ? 'animate-card-play' : '',
        ].join(' '), children: [_jsx("div", { className: isLarge ? 'absolute -left-3 -top-3 z-10' : 'absolute -left-2 -top-2 z-10', children: _jsx("div", { className: [
                        'rounded-full flex items-center justify-center font-display font-bold border-2',
                        isLarge ? 'w-10 h-10 text-lg' : 'w-8 h-8 text-base',
                        def.cost < 0
                            ? 'bg-gradient-to-br from-vow-gold via-ember-500 to-ember-700 text-ash-900 border-vow-gold'
                            : affordable
                                ? 'bg-gradient-to-br from-ember-400 via-ember-600 to-ember-900 text-ash-100 border-vow-gold'
                                : 'bg-ash-700 text-ash-300 border-ash-400',
                    ].join(' '), style: { boxShadow: affordable ? '0 2px 6px rgba(0,0,0,0.8), 0 0 10px rgba(249,115,22,0.55)' : '0 2px 6px rgba(0,0,0,0.8)' }, children: def.cost < 0 ? 'X' : def.cost }) }), _jsx("div", { className: isLarge ? 'flex justify-end mb-3' : 'flex justify-end mb-1', children: _jsxs("span", { className: [
                        'uppercase tracking-wider rounded flex items-center gap-1',
                        isLarge ? 'text-[12px] px-2 py-1' : 'text-[10px] px-1.5 py-0.5',
                        typeBadgeClass[def.type],
                    ].join(' '), children: [_jsx("span", { "aria-hidden": true, children: typeGlyph[def.type] ?? '•' }), _jsx("span", { children: typeLabel[def.type] ?? def.type })] }) }), _jsxs("div", { className: [
                    'font-display text-vow-bone leading-tight',
                    isLarge ? 'text-[22px]' : 'text-[13px] md:text-[15px]',
                ].join(' '), children: [def.name, upgraded && !def.upgradeOf ? '+' : ''] }), _jsx("div", { className: isLarge ? 'h-px bg-ash-500 my-2 opacity-70' : 'h-px bg-ash-500 my-1 opacity-70' }), _jsx("div", { className: [
                    'text-ash-200 whitespace-pre-wrap',
                    isLarge ? 'text-[16px] leading-relaxed' : 'text-[11px] md:text-[12px] leading-snug flex-1',
                ].join(' '), children: def.text }), footer] }));
};
