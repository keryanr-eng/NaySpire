import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useGame } from '../state/game';
import { nextChoices } from '../systems/map';
import { getPotion } from '../data/potions';
import { getRelic } from '../data/relics';
import { resolveSprite } from '../assets/sprites';
import { getPotionArt, getRelicArt } from '../assets/generatedAssets';
import { Sprite } from './Sprite';
import { Tooltip, TooltipBody } from './Tooltip';
const nodeSymbol = {
    combat: 'X',
    elite: '!',
    boss: '*',
    event: '?',
    rest: '~',
    merchant: '$',
    treasure: '◇',
};
const nodeColor = {
    combat: 'from-ash-700 to-ash-800 border-ash-400 text-ash-100',
    elite: 'from-vow-blood/40 to-ash-900 border-vow-blood text-vow-blood',
    boss: 'from-ember-700 to-ember-900 border-vow-gold text-ash-100',
    event: 'from-vow-seal/30 to-ash-900 border-vow-seal text-vow-seal',
    rest: 'from-emerald-900/50 to-ash-900 border-emerald-400 text-emerald-300',
    merchant: 'from-yellow-900/50 to-ash-900 border-vow-gold text-vow-gold',
    treasure: 'from-purple-900/40 to-ash-900 border-purple-400 text-purple-300',
};
const nodeIcon = {
    combat: '/assets/generated/map/node_combat.png',
    elite: '/assets/generated/map/node_elite.png',
    boss: '/assets/generated/map/node_boss.png',
    event: '/assets/generated/map/node_event.png',
    rest: '/assets/generated/map/node_rest.png',
    merchant: '/assets/generated/map/node_merchant.png',
    treasure: '/assets/generated/map/node_treasure.png',
};
const nodeLabel = {
    combat: 'Combat',
    elite: 'Elite',
    boss: 'Boss',
    event: 'Evenement',
    rest: 'Repos',
    merchant: 'Marchand',
    treasure: 'Tresor',
};
const relicTierLabel = {
    starter: 'Depart',
    common: 'Commune',
    uncommon: 'Peu commune',
    rare: 'Rare',
    boss: 'Boss',
};
const rarityLabel = {
    common: 'Commune',
    uncommon: 'Peu commune',
    rare: 'Rare',
};
const CELL_W = 110;
const CELL_H = 78;
const COLS = 5;
const HeaderInventoryIcon = ({ title, subtitle, description, spriteId, imageUrl, empty, children }) => {
    const fallbackTitle = [title, subtitle, description].filter(Boolean).join('\n');
    return (_jsx(Tooltip, { placement: "bottom", maxWidth: 300, content: _jsx(TooltipBody, { title: title, subtitle: subtitle, desc: description }), children: _jsx("span", { title: fallbackTitle, className: [
                'item-button w-9 h-9 rounded-full border flex items-center justify-center cursor-help overflow-hidden',
                'bg-ash-900/80 shadow-[0_2px_10px_rgba(0,0,0,0.55)]',
                empty
                    ? 'border-ash-500 text-ash-500 opacity-70'
                    : 'border-vow-gold/70 text-vow-bone hover:border-vow-gold hover:shadow-glow',
            ].join(' '), children: imageUrl ? (_jsx("img", { src: imageUrl, alt: title, className: "asset-icon asset-icon-map" })) : spriteId ? (_jsx(Sprite, { id: spriteId, w: 26, h: 26, title: title })) : children }) }));
};
export const MapView = () => {
    const run = useGame((s) => s.run);
    const chooseNode = useGame((s) => s.chooseNode);
    const openDeck = () => useGame.setState({ modal: { kind: 'deck' } });
    if (!run)
        return null;
    const reachable = new Set(nextChoices(run.map, run.currentNodeId).map((n) => n.id));
    const floors = [];
    for (const id in run.map.nodes) {
        const node = run.map.nodes[id];
        floors[node.floor] = floors[node.floor] ?? [];
        floors[node.floor].push(node);
    }
    const totalFloors = floors.length;
    const svgW = COLS * CELL_W + 40;
    const svgH = totalFloors * CELL_H + 40;
    function pos(node) {
        const yFromTop = totalFloors - 1 - node.floor;
        return {
            x: 20 + node.col * CELL_W + CELL_W / 2,
            y: 20 + yFromTop * CELL_H + CELL_H / 2,
        };
    }
    const currentPos = run.currentNodeId ? pos(run.map.nodes[run.currentNodeId]) : null;
    return (_jsxs("div", { className: "min-h-screen flex flex-col", children: [_jsxs("div", { className: "panel m-3 p-3 flex items-center gap-4", children: [_jsx("div", { className: "font-display text-2xl text-vow-gold", children: "EMBERVOW" }), _jsxs("div", { className: "text-sm text-ash-200", children: ["Acte ", run.act, " - Etage ", run.floor, "/", run.map.floors - 1] }), _jsxs("div", { className: "ml-auto flex items-center gap-3 text-sm", children: [_jsxs("span", { children: ["Coeur ", _jsx("b", { children: run.hp }), "/", run.maxHp] }), _jsxs("span", { className: "text-vow-gold", children: ["Or ", run.gold] }), _jsxs("span", { className: "text-ember-400", title: "Taille du deck", children: ["Deck ", run.deck.length] }), _jsxs("div", { className: "flex items-center gap-1.5 max-w-[34rem] flex-wrap justify-end", children: [run.relics.map((id) => {
                                        const relic = getRelic(id);
                                        return (_jsx(HeaderInventoryIcon, { title: relic.name, subtitle: `Relique - ${relicTierLabel[relic.tier] ?? relic.tier}`, description: relic.description, imageUrl: getRelicArt(id), spriteId: resolveSprite(id) }, id));
                                    }), run.potions.map((id, index) => {
                                        if (!id) {
                                            return (_jsx(HeaderInventoryIcon, { title: "Emplacement vide", subtitle: "Potion", description: "Aucune potion dans cet emplacement.", empty: true, children: _jsx("span", { className: "text-lg leading-none", children: "." }) }, `empty-potion-${index}`));
                                        }
                                        const potion = getPotion(id);
                                        return (_jsx(HeaderInventoryIcon, { title: potion.name, subtitle: `Potion - ${rarityLabel[potion.rarity] ?? potion.rarity}`, description: potion.description, imageUrl: getPotionArt(id), spriteId: resolveSprite(id) }, `${id}-${index}`));
                                    })] }), _jsx("button", { className: "btn", onClick: openDeck, children: "Deck" }), _jsx("button", { className: "btn-ghost", onClick: () => useGame.setState({ screen: 'menu' }), children: "Menu" })] })] }), _jsx("div", { className: "flex-1 overflow-auto scrollbar-ember flex justify-center p-6", children: _jsxs("div", { className: "relative", style: { width: svgW, height: svgH }, children: [_jsx("svg", { width: svgW, height: svgH, className: "absolute inset-0 pointer-events-none", children: floors.flat().map((node) => node.children.map((childId) => {
                                const a = pos(node);
                                const b = pos(run.map.nodes[childId]);
                                const dim = !node.visited && !reachable.has(node.id);
                                return (_jsx("line", { x1: a.x, y1: a.y, x2: b.x, y2: b.y, stroke: dim ? '#3a3228' : '#7a6a58', strokeWidth: 2, strokeDasharray: node.visited || reachable.has(node.id) ? '' : '3 4' }, `${node.id}-${childId}`));
                            })) }), floors.flat().map((node) => {
                            const p = pos(node);
                            const clickable = reachable.has(node.id);
                            const visited = !!node.visited;
                            return (_jsx("button", { onClick: () => clickable && chooseNode(node.id), disabled: !clickable, className: [
                                    'absolute w-16 h-16 -ml-8 -mt-8 rounded-full',
                                    'flex items-center justify-center transition-all',
                                    clickable ? 'shadow-glow hover:scale-110' : '',
                                    visited ? 'opacity-40 grayscale' : '',
                                    !clickable && !visited ? 'opacity-65 grayscale-[0.25]' : '',
                                ].join(' '), style: { left: p.x, top: p.y }, title: nodeLabel[node.kind], children: _jsx("img", { src: nodeIcon[node.kind], alt: nodeLabel[node.kind], className: "w-full h-full object-contain pointer-events-none drop-shadow-[0_0_12px_rgba(212,162,76,0.32)]" }) }, node.id));
                        }), currentPos && (_jsx("div", { className: "absolute w-16 h-16 -ml-8 -mt-8 rounded-full border-2 border-vow-gold animate-pulse pointer-events-none", style: { left: currentPos.x, top: currentPos.y } }))] }) }), _jsxs("div", { className: "panel m-3 mt-0 p-2 flex flex-wrap gap-3 text-xs justify-center text-ash-200", children: [_jsx("span", { children: "X Combat" }), _jsx("span", { children: "! Elite" }), _jsx("span", { children: "? Evenement" }), _jsx("span", { children: "~ Repos" }), _jsx("span", { children: "$ Marchand" }), _jsx("span", { children: "\u25C7 Tresor" }), _jsx("span", { className: "text-vow-gold", children: "* Boss" })] })] }));
};
