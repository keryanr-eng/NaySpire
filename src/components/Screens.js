import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// EMBERVOW — a collection of simpler UI screens.
// Kept in one file to avoid dozens of 20-line components.
import { useEffect, useState } from 'react';
import { useGame } from '../state/game';
import { getCard } from '../data/cards';
import { getRelic } from '../data/relics';
import { getPotion } from '../data/potions';
import { getEvent } from '../data/events';
import { CardView } from './Card';
import { Sprite } from './Sprite';
import { resolveSprite } from '../assets/sprites';
import { getPotionArt, getRelicArt } from '../assets/generatedAssets';
import { sfx } from '../systems/sound';
import { CharacterArt } from './CharacterArt';
import { PortraitImage } from './PortraitImage';
import { getPlayerPortrait } from '../assets/portraits';
const rarityLabel = {
    starter: 'Départ',
    common: 'Communes',
    uncommon: 'Peu communes',
    rare: 'Rares',
    curse: 'Malédictions',
    status: 'Statuts',
    boss: 'Boss',
};
const itemTierLabel = {
    starter: 'Départ',
    common: 'Commun',
    uncommon: 'Peu commun',
    rare: 'Rare',
    boss: 'Boss',
};
// =====================================================
// MAIN MENU
// =====================================================
export const MainMenu = () => {
    const newRun = useGame((s) => s.newRun);
    const resume = useGame((s) => s.resumeIfExists);
    const meta = useGame((s) => s.meta);
    const [seedInput, setSeedInput] = useState('');
    const hasSave = !!localStorage.getItem('embervow.run.v1');
    return (_jsx("div", { className: "min-h-screen flex flex-col items-center justify-center p-6", children: _jsxs("div", { className: "text-center max-w-2xl", children: [_jsx("div", { className: "font-display text-6xl md:text-7xl text-vow-gold drop-shadow-[0_0_20px_rgba(249,115,22,0.35)]", children: "EMBERVOW" }), _jsx("div", { className: "text-ash-200 mt-2 italic", children: "Reprends le Serment Bris\u00E9. Traverse le Berceau du Ch\u0153ur par le feu." }), _jsxs("div", { className: "mt-8 flex flex-col gap-3 items-center", children: [_jsx("button", { className: "btn-primary text-lg px-8 py-3 w-64", onClick: () => useGame.setState({ screen: 'class_select' }), children: "Nouvelle tentative" }), hasSave && (_jsx("button", { className: "btn w-64", onClick: () => resume(), children: "Continuer" })), _jsxs("div", { className: "flex gap-2 items-center mt-4", children: [_jsx("input", { value: seedInput, onChange: (e) => setSeedInput(e.target.value), placeholder: "Seed personnalis\u00E9e (optionnel)", className: "bg-ash-800 border border-ash-500 rounded px-3 py-1 text-sm text-ash-100 w-52" }), _jsx("button", { className: "btn text-xs", onClick: () => {
                                        const s = parseInt(seedInput, 10);
                                        if (!isNaN(s))
                                            useGame.setState({ _tickle: s });
                                        useGame.setState({ screen: 'class_select' });
                                    }, children: "Utiliser" })] }), _jsx("button", { className: "btn-ghost mt-4", onClick: () => useGame.setState({ screen: 'help' }), children: "R\u00E8gles" })] }), _jsxs("div", { className: "mt-12 text-ash-300 text-xs", children: ["Victoires \u2014 Vowbreaker : ", meta.wins.vowbreaker ?? 0, " \u00B7 Sealbinder : ", meta.wins.sealbinder ?? 0, " \u00B7 Whisperer : ", meta.wins.whisperer ?? 0, " \u00B7 Auger : ", meta.wins.auger ?? 0, " \u00B7 Summoner : ", meta.wins.summoner ?? 0, " \u00B7 D\u00E9faites : ", meta.losses] })] }) }));
};
// =====================================================
// HELP
// =====================================================
export const HelpScreen = () => (_jsx("div", { className: "min-h-screen flex justify-center p-6", children: _jsxs("div", { className: "panel p-6 max-w-2xl", children: [_jsx("h1", { className: "font-display text-3xl text-vow-gold mb-3", children: "Le Premier Serment" }), _jsxs("p", { className: "text-ash-100 mb-3", children: ["\u00C0 chaque tour, tu d\u00E9penses de la ", _jsx("b", { className: "text-ember-400", children: "Braise" }), " (3/tour) pour jouer tes cartes. La ", _jsx("b", { className: "text-vow-seal", children: "Garde" }), " absorbe les d\u00E9g\u00E2ts, puis dispara\u00EEt au d\u00E9but de ton prochain tour. Quand tous les ennemis tombent, tu remportes le combat et choisis tes r\u00E9compenses."] }), _jsxs("ul", { className: "text-ash-200 text-sm space-y-1 list-disc pl-5", children: [_jsxs("li", { children: [_jsx("b", { children: "Fragile" }), " \u2014 la cible subit +50 % de d\u00E9g\u00E2ts d\u2019attaque."] }), _jsxs("li", { children: [_jsx("b", { children: "Fl\u00E9tri" }), " \u2014 la cible inflige -25 % de d\u00E9g\u00E2ts."] }), _jsxs("li", { children: [_jsx("b", { children: "Saignement" }), " \u2014 la cible subit X d\u00E9g\u00E2ts au d\u00E9but de son tour."] }), _jsxs("li", { children: [_jsx("b", { children: "Embrasement" }), " \u2014 la cible subit X d\u00E9g\u00E2ts en fin de tour, puis l\u2019effet est divis\u00E9 par deux."] }), _jsxs("li", { children: [_jsx("b", { children: "Furie" }), " \u2014 +X d\u00E9g\u00E2ts \u00E0 chacune de tes frappes."] }), _jsxs("li", { children: [_jsx("b", { children: "Sigille" }), " \u2014 annule les X prochaines applications de malus."] }), _jsxs("li", { children: [_jsx("b", { children: "Fracture" }), " (Vowbreaker) \u2014 une r\u00E9serve que certaines cartes lib\u00E8rent brutalement."] }), _jsxs("li", { children: [_jsx("b", { children: "Sceau" }), " (Sealbinder) \u2014 des marques consomm\u00E9es ou exploit\u00E9es par d\u2019autres cartes."] }), _jsxs("li", { children: [_jsx("b", { children: "\u00C9cho" }), " (Whisperer) \u2014 une r\u00E9serve qui amplifie certaines rafales."] }), _jsxs("li", { children: [_jsx("b", { children: "Fragile" }), " (Auger) \u2014 pr\u00E9pare les ennemis pour d\u00E9clencher pioche et d\u00E9g\u00E2ts amplifi\u00E9s."] }), _jsxs("li", { children: [_jsx("b", { children: "Invocation" }), " (Summoner) \u2014 appelle un Serviteur li\u00E9 persistant, puis le renforce pour qu\u2019il frappe plus fort au d\u00E9but de tes tours."] })] }), _jsx("p", { className: "text-ash-300 text-sm mt-4", children: "Choisis ton chemin avec soin. Les haltes soignent ou am\u00E9liorent une carte. Les marchands vendent cartes, reliques et potions. Les \u00E9v\u00E9nements peuvent r\u00E9compenser ou blesser. Le boss de chaque acte met ton deck \u00E0 l\u2019\u00E9preuve." }), _jsx("button", { className: "btn-primary mt-5", onClick: () => useGame.setState({ screen: 'menu' }), children: "Retour" })] }) }));
// =====================================================
// CLASS SELECT
// =====================================================
const CLASS_DATA = {
    vowbreaker: {
        title: 'Vowbreaker',
        artId: 'player_vowbreaker',
        tag: 'Zélote · Agressif · Montée en puissance',
        hp: 75,
        mech: 'Signature : Fracture. Subir des dégâts et jouer certaines cartes génère des charges de Fracture ; dépense-les pour déclencher des coups dévastateurs.',
        colors: 'from-vow-blood/50 to-ember-900/30 border-vow-blood',
        starter: 'Relique : Éclat du Premier Serment — la première attaque de chaque tour inflige +2 dégâts.',
    },
    sealbinder: {
        title: 'Sealbinder',
        artId: 'player_sealbinder',
        tag: 'Inquisiteur · Contrôle · Combo',
        hp: 65,
        mech: 'Signature : Sceau. Marque les ennemis ; d’autres cartes consomment les Sceaux ou gagnent en puissance grâce à eux.',
        colors: 'from-vow-seal/40 to-vow-seal/10 border-vow-seal',
        starter: 'Relique : Marteau du Jugement — le premier Sceau de chaque tour te donne 2 Garde.',
    },
    whisperer: {
        title: 'Whisperer',
        artId: 'player_whisperer',
        tag: 'Médium · Échos · Saignement',
        hp: 62,
        mech: 'Signature : Écho. Les attaques et murmures accumulent des Échos ; certaines cartes les transforment en rafales de dégâts.',
        colors: 'from-emerald-900/45 to-ash-900/40 border-emerald-500/70',
        starter: 'Relique : Encensoir des Échos — au début du combat, pioche 1 carte de plus.',
    },
    auger: {
        title: 'Auger',
        artId: 'player_auger',
        tag: 'Oracle · Prédiction · Tempo',
        hp: 60,
        mech: 'Signature : Présage. Fêle le destin avec Fragile, pioche au bon moment et transforme les tours préparés en attaques propres.',
        colors: 'from-vow-gold/25 to-ash-900/40 border-vow-gold/70',
        starter: 'Relique : Lentille de l’Augure — au début du combat, gagne 3 Garde.',
    },
    summoner: {
        title: 'Summoner',
        artId: 'player_summoner',
        tag: 'Invocateur · Serviteur · Renforcement',
        hp: 58,
        mech: 'Signature : Invocation. Appelle un Serviteur lié persistant ; chaque nouvelle invocation le soigne, augmente ses PV max et renforce ses attaques.',
        colors: 'from-purple-900/35 to-ash-900/40 border-purple-400/70',
        starter: 'Relique : Cloche des Liés — au début du combat, invoque 1 Serviteur lié.',
    },
};
const ClassCard = ({ id, onPick }) => {
    const data = CLASS_DATA[id];
    const portrait = getPlayerPortrait(data.artId);
    const isPainted = !!portrait;
    const generatedPortrait = !!portrait?.url.includes('/assets/generated/');
    return (_jsx("div", { className: `panel overflow-hidden w-full max-w-[43rem] min-h-[23rem] bg-gradient-to-br ${data.colors} transition-transform hover:-translate-y-1`, children: _jsxs("div", { className: "grid grid-cols-[47%_53%] h-full min-h-[23rem]", children: [_jsxs("div", { className: "relative overflow-hidden border-r border-vow-gold/20 bg-black/25", children: [_jsx("div", { className: "absolute inset-0", style: {
                                background: id === 'vowbreaker'
                                    ? 'radial-gradient(ellipse at 50% 64%, rgba(249,115,22,0.28) 0%, rgba(139,30,43,0.16) 38%, transparent 72%)'
                                    : id === 'sealbinder'
                                        ? 'radial-gradient(ellipse at 50% 64%, rgba(96,165,250,0.24) 0%, rgba(37,99,235,0.14) 38%, transparent 72%)'
                                        : id === 'whisperer'
                                            ? 'radial-gradient(ellipse at 50% 64%, rgba(52,211,153,0.22) 0%, rgba(20,83,45,0.16) 40%, transparent 74%)'
                                            : id === 'summoner'
                                                ? 'radial-gradient(ellipse at 50% 64%, rgba(168,85,247,0.23) 0%, rgba(88,28,135,0.16) 40%, transparent 74%)'
                                                : 'radial-gradient(ellipse at 50% 64%, rgba(212,162,76,0.24) 0%, rgba(120,53,15,0.14) 40%, transparent 74%)',
                            } }), _jsx("div", { className: [
                                'absolute left-1/2 -translate-x-1/2 z-10',
                                id === 'vowbreaker' && !generatedPortrait
                                    ? 'bottom-[-4.75rem] w-[25rem] h-[30rem]'
                                    : generatedPortrait
                                        ? 'bottom-[-0.75rem] w-[20rem] h-[24rem]'
                                        : isPainted
                                            ? 'bottom-[-1rem] w-[21rem] h-[23rem]'
                                            : 'bottom-[-1.4rem] w-[18rem] h-[22rem]',
                            ].join(' '), style: {
                                transform: id === 'vowbreaker' && !generatedPortrait
                                    ? 'translateX(-50%) scale(1.06)'
                                    : generatedPortrait ? 'translateX(-50%) scale(0.98)' : isPainted ? 'translateX(-50%) scale(1.04)' : 'translateX(-50%) scale(1.22)',
                                transformOrigin: '50% 100%',
                            }, children: portrait ? (_jsx(PortraitImage, { portrait: portrait, className: "w-full h-full drop-shadow-[0_18px_24px_rgba(0,0,0,0.9)]", style: { objectPosition: generatedPortrait ? 'center bottom' : 'center calc(100% + 5.5rem)' }, title: data.title })) : (_jsx(CharacterArt, { artId: data.artId, className: "w-full h-full drop-shadow-[0_18px_24px_rgba(0,0,0,0.9)]" })) }), _jsx("div", { className: "absolute inset-x-8 bottom-7 h-8 rounded-full bg-black/45 blur-md" })] }), _jsxs("div", { className: "p-6 flex flex-col", children: [_jsx("div", { className: "font-display text-4xl text-vow-bone leading-none", children: data.title }), _jsx("div", { className: "text-ash-200 uppercase tracking-widest text-xs mt-2", children: data.tag }), _jsxs("div", { className: "mt-5 flex items-center gap-3 text-sm", children: [_jsxs("span", { className: "rounded border border-vow-gold/40 bg-black/25 px-3 py-1 text-ash-100", children: ["PV ", _jsx("span", { className: "text-vow-blood font-bold", children: data.hp })] }), _jsx("span", { className: "rounded border border-ash-400/40 bg-black/20 px-3 py-1 text-ash-300", children: "D\u00E9part" })] }), _jsx("p", { className: "mt-5 text-ash-100 text-sm leading-relaxed", children: data.mech }), _jsx("p", { className: "mt-3 text-ash-300 text-xs italic leading-relaxed", children: data.starter }), _jsx("button", { className: "btn-primary mt-auto w-full text-base py-3", onClick: onPick, children: "Partir" })] })] }) }));
};
export const ClassSelect = () => {
    const newRun = useGame((s) => s.newRun);
    const seedOverride = useGame((s) => s._tickle);
    return (_jsxs("div", { className: "min-h-screen flex flex-col items-center justify-center p-6", children: [_jsx("div", { className: "font-display text-4xl text-vow-gold mb-6", children: "Choisis ton Serment Bris\u00E9" }), _jsxs("div", { className: "grid grid-cols-1 xl:grid-cols-2 gap-6 w-full max-w-[90rem] justify-items-center", children: [_jsx(ClassCard, { id: "vowbreaker", onPick: () => newRun('vowbreaker', seedOverride || undefined) }), _jsx(ClassCard, { id: "sealbinder", onPick: () => newRun('sealbinder', seedOverride || undefined) }), _jsx(ClassCard, { id: "whisperer", onPick: () => newRun('whisperer', seedOverride || undefined) }), _jsx(ClassCard, { id: "auger", onPick: () => newRun('auger', seedOverride || undefined) }), _jsx(ClassCard, { id: "summoner", onPick: () => newRun('summoner', seedOverride || undefined) })] }), _jsx("button", { className: "btn-ghost mt-8", onClick: () => useGame.setState({ screen: 'menu' }), children: "Retour" })] }));
};
// =====================================================
// REWARD SCREEN
// =====================================================
export const RewardScreen = () => {
    const rewards = useGame((s) => s.rewards);
    const take = useGame((s) => s.takeReward);
    const skip = useGame((s) => s.skipCardReward);
    // Play a quiet coin + node-enter chime once when the screen mounts. The
    // ambient combat bed has already been stopped by the time we land here.
    useEffect(() => {
        sfx.nodeEnter();
    }, []);
    if (!rewards)
        return null;
    return (_jsxs("div", { className: "min-h-screen flex flex-col items-center p-8 gap-8 relative", children: [_jsx("div", { className: "absolute inset-0 pointer-events-none", style: {
                    background: 'radial-gradient(ellipse 60% 50% at 50% 35%, rgba(212,162,76,0.14) 0%, rgba(212,162,76,0.05) 35%, transparent 70%)',
                } }), _jsxs("div", { className: "relative flex flex-col items-center", children: [_jsx("div", { className: "font-display uppercase text-5xl text-vow-gold tracking-[0.25em] animate-reward-title", children: "Butin" }), _jsx("div", { className: "text-ash-300 text-sm mt-2 tracking-widest uppercase animate-reward-rise", style: { animationDelay: '250ms' }, children: "La braise r\u00E9clame son d\u00FB" })] }), _jsxs("div", { className: "relative flex items-center gap-3 animate-reward-rise", style: { animationDelay: '400ms' }, children: [_jsx("span", { className: "text-3xl leading-none", children: "\u25C9" }), _jsxs("span", { children: [_jsxs("span", { className: "font-display text-3xl font-bold animate-gold-flash", style: { animationDelay: '700ms' }, children: ["+", rewards.gold] }), _jsx("span", { className: "ml-2 uppercase text-ash-300 tracking-widest text-xs", children: "or" })] })] }), (() => {
                // Priority: potion first (biggest visual with sprite), then relic,
                // then the card pick (which is the "main" choice, so it lands last).
                if (rewards.pending.includes('potion') && rewards.potion) {
                    const potDef = getPotion(rewards.potion);
                    const spriteId = resolveSprite(rewards.potion);
                    const artUrl = getPotionArt(rewards.potion);
                    return (_jsxs("div", { className: "relative flex flex-col items-center gap-3 panel p-6 max-w-md animate-reward-rise border-ember-500/60", style: {
                            animationDelay: '500ms',
                            background: 'linear-gradient(180deg, rgba(42,36,28,0.97) 0%, rgba(21,19,15,0.97) 100%)',
                            boxShadow: '0 0 28px rgba(249,115,22,0.35), inset 0 0 0 1px rgba(249,115,22,0.35)',
                        }, children: [_jsx("div", { className: "uppercase text-ember-400 text-xs tracking-[0.35em]", children: "\u2697 Potion" }), _jsx("div", { className: "item-button flex items-center justify-center w-40 h-40 rounded-full relative animate-reward-rise", style: {
                                    animationDelay: '700ms',
                                    background: 'radial-gradient(circle at 50% 40%, rgba(249,115,22,0.35) 0%, rgba(124,45,18,0.25) 45%, rgba(10,9,8,0.7) 80%)',
                                    boxShadow: 'inset 0 0 26px rgba(0,0,0,0.7), 0 0 32px rgba(249,115,22,0.35)',
                                }, children: artUrl ? (_jsx("img", { src: artUrl, alt: potDef.name, className: "asset-icon asset-icon-reward animate-item-acquire" })) : spriteId ? (_jsx(Sprite, { id: spriteId, w: 120, h: 138, title: potDef.name })) : (_jsx("span", { className: "text-7xl text-ember-400", children: "\u2697" })) }), _jsx("div", { className: "font-display text-3xl text-ember-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] mt-1", children: potDef.name }), _jsx("div", { className: "uppercase text-ash-300 text-[10px] tracking-[0.3em]", children: itemTierLabel[potDef.rarity] ?? potDef.rarity }), _jsx("div", { className: "text-ash-100 italic text-sm text-center leading-relaxed max-w-xs", children: potDef.description }), _jsxs("div", { className: "flex gap-3 mt-3", children: [_jsx("button", { className: "btn-primary px-6", onClick: () => { sfx.potionUse(); take('potion'); }, children: "Prendre la fiole" }), _jsx("button", { className: "px-4 py-2 rounded-md border border-ash-400 bg-ash-800/60 hover:bg-ash-700 text-ash-200 hover:text-vow-bone text-sm tracking-wider uppercase transition", onClick: () => take('potion'), children: "La laisser" })] })] }, "potion-step"));
                }
                if (rewards.pending.includes('relic') && rewards.relic) {
                    const relDef = getRelic(rewards.relic);
                    const spriteId = resolveSprite(rewards.relic);
                    const artUrl = getRelicArt(rewards.relic);
                    return (_jsxs("div", { className: "relative flex flex-col items-center gap-3 panel p-6 max-w-md animate-reward-rise border-vow-gold/60", style: {
                            animationDelay: '500ms',
                            background: 'linear-gradient(180deg, rgba(42,36,28,0.97) 0%, rgba(21,19,15,0.97) 100%)',
                            boxShadow: '0 0 30px rgba(212,162,76,0.35), inset 0 0 0 1px rgba(212,162,76,0.35)',
                        }, children: [_jsx("div", { className: "uppercase text-vow-gold text-xs tracking-[0.35em]", children: "\u25C8 Relique" }), _jsx("div", { className: "item-button flex items-center justify-center w-40 h-40 rounded-full relative animate-reward-rise", style: {
                                    animationDelay: '700ms',
                                    background: 'radial-gradient(circle at 50% 40%, rgba(212,162,76,0.4) 0%, rgba(124,95,40,0.25) 45%, rgba(10,9,8,0.7) 80%)',
                                    boxShadow: 'inset 0 0 26px rgba(0,0,0,0.7), 0 0 32px rgba(212,162,76,0.4)',
                                }, children: artUrl ? (_jsx("img", { src: artUrl, alt: relDef.name, className: "asset-icon asset-icon-reward animate-item-acquire" })) : spriteId ? (_jsx(Sprite, { id: spriteId, w: 120, h: 120, title: relDef.name })) : (_jsx("span", { className: "text-7xl text-vow-gold", children: "\u2726" })) }), _jsx("div", { className: "font-display text-3xl text-vow-gold drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] mt-1", children: relDef.name }), _jsx("div", { className: "uppercase text-ash-300 text-[10px] tracking-[0.3em]", children: itemTierLabel[relDef.tier] ?? relDef.tier }), _jsx("div", { className: "text-ash-100 italic text-sm text-center leading-relaxed max-w-xs", children: relDef.description }), _jsx("button", { className: "btn-primary mt-3 px-6", onClick: () => { sfx.wardGain(); take('relic'); }, children: "La lier \u00E0 ton serment" })] }, "relic-step"));
                }
                if (rewards.pending.includes('cards')) {
                    return (_jsxs("div", { className: "relative flex flex-col items-center gap-4 animate-reward-rise", style: { animationDelay: '500ms' }, children: [_jsx("div", { className: "font-display uppercase text-vow-gold tracking-[0.3em] text-sm", children: "\u2E3B Choisis une carte \u2E3B" }), _jsx("div", { className: "flex gap-5 flex-wrap justify-center pt-2", children: rewards.cards.map((id, i) => (_jsx("div", { className: "animate-reward-rise", style: { animationDelay: `${650 + i * 140}ms` }, children: _jsx(CardView, { def: getCard(id), onClick: () => { sfx.cardSelect(); take('cards', { defId: id }); } }) }, i))) }), _jsx("button", { className: "mt-1 px-5 py-1.5 rounded-md border border-ash-400 bg-ash-800/60 hover:bg-ash-700 hover:border-vow-gold/60 text-ash-200 hover:text-vow-bone text-sm tracking-wider uppercase transition", onClick: skip, children: "Passer \u2014 tout br\u00FBler" })] }, "cards-step"));
                }
                // All steps resolved — the store should have already flipped the
                // screen away, but show a graceful empty beat just in case.
                return (_jsx("div", { className: "relative text-ash-300 italic mt-6 animate-reward-rise", children: "Le chemin s\u2019ouvre devant toi\u2026" }));
            })()] }));
};
const ShopItemPanel = ({ tone, name, description, price, imageUrl, disabled, sold, onBuy }) => {
    if (sold) {
        return (_jsx("div", { className: "h-[9.25rem] rounded-md border border-ash-500/45 bg-black/20 opacity-45 italic text-center flex items-center justify-center text-ash-300", children: "vendu" }));
    }
    const isPotion = tone === 'potion';
    return (_jsxs("div", { className: "panel p-3 h-[9.25rem] grid grid-cols-[5rem_1fr] gap-3 items-center overflow-hidden", children: [_jsx("div", { className: [
                    'item-button w-20 h-20 rounded-md border flex items-center justify-center bg-ash-900/65 overflow-hidden',
                    isPotion ? 'border-ember-500/70' : 'border-vow-gold/70',
                ].join(' '), children: imageUrl ? (_jsx("img", { src: imageUrl, alt: name, className: ['asset-icon', isPotion ? 'asset-icon-potion' : 'asset-icon-relic'].join(' ') })) : (_jsx("span", { className: isPotion ? 'text-4xl text-ember-400' : 'text-4xl text-vow-gold', children: isPotion ? '⚗' : '*' })) }), _jsxs("div", { className: "min-w-0 flex flex-col h-full", children: [_jsx("div", { className: ['font-display text-lg leading-tight truncate', isPotion ? 'text-ember-400' : 'text-vow-gold'].join(' '), children: name }), _jsx("div", { className: "text-xs text-ash-200 leading-snug mt-1 line-clamp-2", children: description }), _jsxs("button", { className: "btn-primary mt-auto py-2 disabled:opacity-40", disabled: disabled, onClick: onBuy, children: ["Acheter \u269C ", price] })] })] }));
};
export const ShopScreenLegacy = () => {
    const run = useGame((s) => s.run);
    const leaveShop = useGame((s) => s.leaveShop);
    const [shop, setShop] = useState(() => useGame.getState().rollShop());
    const [removeOpen, setRemoveOpen] = useState(false);
    const buyCard = (i) => {
        const it = shop.cards[i];
        if (!it || run.gold < it.price)
            return;
        run.gold -= it.price;
        run.deck.push({ uid: `sh_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 6)}`, defId: it.defId, upgraded: false });
        shop.cards[i] = null;
        useGame.setState({ run: { ...run } });
        useGame.getState().persist();
        setShop({ ...shop });
    };
    const buyRelic = (i) => {
        const it = shop.relics[i];
        if (!it || run.gold < it.price)
            return;
        run.gold -= it.price;
        run.relics.push(it.relicId);
        const rd = getRelic(it.relicId);
        if (rd.hook === 'max_hp_plus_7') {
            run.maxHp += 7;
            run.hp += 7;
        }
        shop.relics[i] = null;
        useGame.setState({ run: { ...run } });
        useGame.getState().persist();
        setShop({ ...shop });
    };
    const buyPotion = (i) => {
        const it = shop.potions[i];
        if (!it || run.gold < it.price)
            return;
        const slot = run.potions.findIndex((p) => !p);
        if (slot < 0)
            return;
        run.gold -= it.price;
        run.potions[slot] = it.potionId;
        shop.potions[i] = null;
        useGame.setState({ run: { ...run } });
        useGame.getState().persist();
        setShop({ ...shop });
    };
    const openRemove = () => {
        if (shop.removeService.used || run.gold < shop.removeService.price)
            return;
        setRemoveOpen(true);
    };
    return (_jsxs("div", { className: "min-h-screen flex flex-col p-6 gap-4", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "font-display text-4xl text-vow-gold", children: "Le Marchand Silencieux" }), _jsxs("div", { className: "ml-auto text-vow-gold text-lg", children: ["\u269C ", run.gold] })] }), _jsx("p", { className: "italic text-ash-300", children: "Il ne dit rien, mais il se souvient de chaque pi\u00E8ce." }), _jsxs("div", { className: "mt-2", children: [_jsx("div", { className: "font-display text-xl text-ash-100 mb-2", children: "Cartes" }), _jsx("div", { className: "flex gap-3 flex-wrap", children: shop.cards.map((c, i) => c ? (_jsxs("div", { className: "flex flex-col items-center gap-1", children: [_jsx(CardView, { def: getCard(c.defId), disabled: run.gold < c.price, onClick: () => buyCard(i) }), _jsxs("span", { className: ['text-sm', run.gold >= c.price ? 'text-vow-gold' : 'text-ash-500'].join(' '), children: ["\u269C ", c.price] })] }, i)) : _jsx("div", { className: "w-44 h-60 opacity-40 italic text-center flex items-center justify-center border border-ash-500 rounded text-ash-400", children: "vendu" }, i)) })] }), _jsxs("div", { className: "mt-2", children: [_jsx("div", { className: "font-display text-xl text-ash-100 mb-2", children: "Reliques" }), _jsx("div", { className: "flex gap-3 flex-wrap", children: shop.relics.map((r, i) => r ? (_jsxs("div", { className: "panel p-3 w-60 flex flex-col gap-1", children: [_jsx("div", { className: "font-display text-lg text-vow-gold", children: getRelic(r.relicId).name }), _jsx("div", { className: "text-xs text-ash-200", children: getRelic(r.relicId).description }), _jsxs("button", { className: "btn-primary mt-2 disabled:opacity-40", disabled: run.gold < r.price, onClick: () => buyRelic(i), children: ["Acheter \u269C ", r.price] })] }, i)) : _jsx("div", { className: "w-60 h-28 opacity-40 italic text-center flex items-center justify-center border border-ash-500 rounded", children: "vendu" }, i)) })] }), _jsxs("div", { className: "mt-2", children: [_jsx("div", { className: "font-display text-xl text-ash-100 mb-2", children: "Potions" }), _jsx("div", { className: "flex gap-3 flex-wrap", children: shop.potions.map((p, i) => p ? (_jsxs("div", { className: "panel p-3 w-60 flex flex-col gap-1", children: [_jsx("div", { className: "font-display text-lg text-ember-400", children: getPotion(p.potionId).name }), _jsx("div", { className: "text-xs text-ash-200", children: getPotion(p.potionId).description }), _jsxs("button", { className: "btn-primary mt-2 disabled:opacity-40", disabled: run.gold < p.price || run.potions.every((x) => x), onClick: () => buyPotion(i), children: ["Acheter \u269C ", p.price] })] }, i)) : _jsx("div", { className: "w-60 h-28 opacity-40 italic text-center flex items-center justify-center border border-ash-500 rounded", children: "vendu" }, i)) })] }), _jsxs("div", { className: "panel p-3 mt-3", children: [_jsx("div", { className: "font-display text-xl text-ash-100 mb-1", children: "Services" }), _jsxs("button", { disabled: shop.removeService.used || run.gold < shop.removeService.price, className: "btn disabled:opacity-40", onClick: openRemove, children: ["Retirer une carte du deck \u2014 \u269C ", shop.removeService.price] })] }), _jsx("button", { className: "btn-primary mt-4 w-fit", onClick: leaveShop, children: "Partir" }), removeOpen && (_jsx(DeckPicker, { title: "Choisis une carte \u00E0 retirer", cards: run.deck, filter: (c) => getCard(c.defId).rarity !== 'starter', onPick: (uid) => {
                    run.gold -= shop.removeService.price;
                    useGame.getState().removeCardFromDeck(uid);
                    shop.removeService.used = true;
                    useGame.setState({ run: { ...useGame.getState().run } });
                    setShop({ ...shop });
                    setRemoveOpen(false);
                }, onCancel: () => setRemoveOpen(false) }))] }));
};
export const ShopScreen = () => {
    const run = useGame((s) => s.run);
    const leaveShop = useGame((s) => s.leaveShop);
    const [shop, setShop] = useState(() => useGame.getState().rollShop());
    const [removeOpen, setRemoveOpen] = useState(false);
    const buyCard = (i) => {
        const it = shop.cards[i];
        if (!it || run.gold < it.price)
            return;
        run.gold -= it.price;
        run.deck.push({ uid: `sh_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 6)}`, defId: it.defId, upgraded: false });
        shop.cards[i] = null;
        useGame.setState({ run: { ...run } });
        useGame.getState().persist();
        setShop({ ...shop });
    };
    const buyRelic = (i) => {
        const it = shop.relics[i];
        if (!it || run.gold < it.price)
            return;
        run.gold -= it.price;
        run.relics.push(it.relicId);
        const rd = getRelic(it.relicId);
        if (rd.hook === 'max_hp_plus_7') {
            run.maxHp += 7;
            run.hp += 7;
        }
        shop.relics[i] = null;
        useGame.setState({ run: { ...run } });
        useGame.getState().persist();
        setShop({ ...shop });
    };
    const buyPotion = (i) => {
        const it = shop.potions[i];
        if (!it || run.gold < it.price)
            return;
        const slot = run.potions.findIndex((p) => !p);
        if (slot < 0)
            return;
        run.gold -= it.price;
        run.potions[slot] = it.potionId;
        shop.potions[i] = null;
        useGame.setState({ run: { ...run } });
        useGame.getState().persist();
        setShop({ ...shop });
    };
    const openRemove = () => {
        if (shop.removeService.used || run.gold < shop.removeService.price)
            return;
        setRemoveOpen(true);
    };
    return (_jsxs("div", { className: "min-h-screen max-h-screen overflow-hidden flex flex-col p-5 gap-3", children: [_jsxs("div", { className: "flex items-start gap-4", children: [_jsxs("div", { children: [_jsx("div", { className: "font-display text-4xl text-vow-gold leading-none", children: "Le Marchand Silencieux" }), _jsx("p", { className: "italic text-ash-300 mt-3", children: "Il ne dit rien, mais il se souvient de chaque piece." })] }), _jsxs("div", { className: "ml-auto flex items-center gap-4", children: [_jsxs("div", { className: "text-vow-gold text-xl", children: ["\u269C ", run.gold] }), _jsx("button", { className: "btn-primary px-6", onClick: leaveShop, children: "Partir" })] })] }), _jsxs("div", { className: "flex-1 min-h-0 grid grid-rows-[auto_1fr] gap-3", children: [_jsxs("section", { children: [_jsx("div", { className: "font-display text-xl text-ash-100 mb-2", children: "Cartes" }), _jsx("div", { className: "flex gap-3 flex-nowrap overflow-visible", children: shop.cards.map((c, i) => c ? (_jsxs("div", { className: "flex flex-col items-center gap-1 shrink-0", children: [_jsx(CardView, { def: getCard(c.defId), size: "sm", disabled: run.gold < c.price, onClick: () => buyCard(i) }), _jsxs("span", { className: ['text-base font-bold', run.gold >= c.price ? 'text-vow-gold' : 'text-ash-500'].join(' '), children: ["\u269C ", c.price] })] }, i)) : (_jsx("div", { className: "w-32 h-44 opacity-40 italic text-center flex items-center justify-center border border-ash-500 rounded text-ash-400 shrink-0", children: "vendu" }, i))) })] }), _jsxs("div", { className: "grid grid-cols-[1fr_1fr_18rem] gap-4 min-h-0", children: [_jsxs("section", { children: [_jsx("div", { className: "font-display text-xl text-ash-100 mb-2", children: "Reliques" }), _jsx("div", { className: "grid grid-rows-2 gap-3", children: shop.relics.map((r, i) => {
                                            if (!r)
                                                return _jsx(ShopItemPanel, { tone: "relic", name: "Vendu", description: "", price: 0, disabled: true, sold: true }, i);
                                            const relic = getRelic(r.relicId);
                                            return (_jsx(ShopItemPanel, { tone: "relic", name: relic.name, description: relic.description, price: r.price, imageUrl: getRelicArt(r.relicId), disabled: run.gold < r.price, onBuy: () => buyRelic(i) }, i));
                                        }) })] }), _jsxs("section", { children: [_jsx("div", { className: "font-display text-xl text-ash-100 mb-2", children: "Potions" }), _jsx("div", { className: "grid grid-rows-2 gap-3", children: shop.potions.map((p, i) => {
                                            if (!p)
                                                return _jsx(ShopItemPanel, { tone: "potion", name: "Vendu", description: "", price: 0, disabled: true, sold: true }, i);
                                            const potion = getPotion(p.potionId);
                                            return (_jsx(ShopItemPanel, { tone: "potion", name: potion.name, description: potion.description, price: p.price, imageUrl: getPotionArt(p.potionId), disabled: run.gold < p.price || run.potions.every((x) => x), onBuy: () => buyPotion(i) }, i));
                                        }) })] }), _jsxs("section", { className: "panel p-4 h-fit self-start", children: [_jsx("div", { className: "font-display text-xl text-ash-100 mb-2", children: "Services" }), _jsxs("button", { disabled: shop.removeService.used || run.gold < shop.removeService.price, className: "btn disabled:opacity-40 w-full text-left", onClick: openRemove, children: ["Retirer une carte du deck", _jsx("br", {}), _jsxs("span", { className: "text-vow-gold", children: ["\u269C ", shop.removeService.price] })] })] })] })] }), removeOpen && (_jsx(DeckPicker, { title: "Choisis une carte a retirer", cards: run.deck, filter: (c) => getCard(c.defId).rarity !== 'starter', onPick: (uid) => {
                    run.gold -= shop.removeService.price;
                    useGame.getState().removeCardFromDeck(uid);
                    shop.removeService.used = true;
                    useGame.setState({ run: { ...useGame.getState().run } });
                    setShop({ ...shop });
                    setRemoveOpen(false);
                }, onCancel: () => setRemoveOpen(false) }))] }));
};
// =====================================================
// REST SCREEN
// =====================================================
export const RestScreen = () => {
    const rest = useGame((s) => s.rest);
    const run = useGame((s) => s.run);
    const healAmt = Math.floor(run.maxHp * 0.3) + (run.relics.includes('rel_hearth_of_sanctum') ? 10 : 0);
    return (_jsxs("div", { className: "min-h-screen flex flex-col items-center justify-center p-6", children: [_jsx("div", { className: "font-display text-5xl text-ember-400 mb-2", children: "Le Foyer" }), _jsx("div", { className: "text-ash-300 italic mb-8", children: "Un petit feu garde un petit espoir." }), _jsxs("div", { className: "flex gap-6", children: [_jsxs("button", { className: "panel p-6 w-56 text-center hover:border-emerald-400 transition-colors", onClick: () => rest('heal'), children: [_jsx("div", { className: "text-4xl", children: "\u2764" }), _jsx("div", { className: "font-display text-xl mt-2", children: "Soigner" }), _jsxs("div", { className: "text-ash-200 text-sm mt-1", children: ["R\u00E9cup\u00E8re ", healAmt, " PV."] })] }), _jsxs("button", { className: "panel p-6 w-56 text-center hover:border-vow-gold transition-colors", onClick: () => rest('upgrade'), children: [_jsx("div", { className: "text-4xl", children: "\u2692" }), _jsx("div", { className: "font-display text-xl mt-2", children: "Forger" }), _jsx("div", { className: "text-ash-200 text-sm mt-1", children: "Am\u00E9liore d\u00E9finitivement une carte." })] })] })] }));
};
// =====================================================
// EVENT SCREEN
// =====================================================
export const EventScreen = () => {
    const run = useGame((s) => s.run);
    const resolve = useGame((s) => s.resolveEventOption);
    const node = run.map.nodes[run.currentNodeId];
    const ev = getEvent(node.data?.eventId ?? '');
    return (_jsx("div", { className: "min-h-screen flex flex-col items-center justify-center p-6", children: _jsxs("div", { className: "panel p-6 max-w-2xl", children: [_jsx("div", { className: "font-display text-3xl text-vow-gold mb-2", children: ev.title }), _jsx("p", { className: "text-ash-100 italic mb-5", children: ev.body }), _jsx("div", { className: "flex flex-col gap-2", children: ev.options.map((o, i) => (_jsx("button", { disabled: !!o.disabled?.(run), onClick: () => resolve(i), className: "btn text-left disabled:opacity-40 disabled:cursor-not-allowed", children: o.label }, i))) })] }) }));
};
// =====================================================
// TREASURE SCREEN
// =====================================================
export const TreasureScreen = () => {
    const take = useGame((s) => s.takeTreasure);
    return (_jsxs("div", { className: "min-h-screen flex flex-col items-center justify-center p-6", children: [_jsx("div", { className: "font-display text-5xl text-vow-gold mb-4", children: "Un Reliquaire" }), _jsx("div", { className: "text-ash-200 italic mb-6", children: "Une bo\u00EEte de fer, encore chaude." }), _jsx("button", { className: "btn-primary text-xl px-8 py-3", onClick: take, children: "Ouvrir" })] }));
};
// =====================================================
// DECK VIEWER (modal)
// =====================================================
export const DeckViewer = () => {
    const run = useGame((s) => s.run);
    const close = useGame((s) => s.closeModal);
    const byRarity = (r) => run.deck.filter((c) => getCard(c.defId).rarity === r);
    return (_jsx("div", { className: "fixed inset-0 bg-black/80 z-40 flex flex-col items-center p-4 overflow-auto scrollbar-ember", children: _jsxs("div", { className: "panel p-4 w-full max-w-6xl", children: [_jsxs("div", { className: "flex items-center", children: [_jsxs("div", { className: "font-display text-2xl text-vow-gold", children: ["Ton deck (", run.deck.length, ")"] }), _jsx("button", { className: "btn-ghost ml-auto", onClick: close, children: "Fermer" })] }), ['starter', 'common', 'uncommon', 'rare', 'curse', 'status'].map((r) => {
                    const group = byRarity(r);
                    if (!group.length)
                        return null;
                    return (_jsxs("div", { className: "mt-3", children: [_jsx("div", { className: "text-ash-300 uppercase tracking-widest text-xs mb-1", children: rarityLabel[r] ?? r }), _jsx("div", { className: "flex flex-wrap gap-2", children: group.map((c) => (_jsx(CardView, { def: getCard(c.defId), upgraded: c.upgraded, size: "sm" }, c.uid))) })] }, r));
                })] }) }));
};
export const DeckPicker = ({ title, cards, filter, onPick, onCancel, showUpgradePreview }) => {
    const [showForgedDetails, setShowForgedDetails] = useState(false);
    const list = filter ? cards.filter(filter) : cards;
    return (_jsx("div", { className: "fixed inset-0 bg-black/80 z-50 flex flex-col items-center p-4 overflow-auto scrollbar-ember", children: _jsxs("div", { className: "panel p-4 w-full max-w-6xl", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "font-display text-2xl text-vow-gold", children: title }), showUpgradePreview && (_jsxs("label", { className: "flex items-center gap-2 rounded border border-vow-gold/40 bg-black/25 px-3 py-2 text-sm text-ash-100 cursor-pointer select-none", children: [_jsx("input", { type: "checkbox", className: "accent-ember-600", checked: showForgedDetails, onChange: (e) => setShowForgedDetails(e.currentTarget.checked) }), "Voir les d\u00E9tails forg\u00E9s"] })), onCancel && _jsx("button", { className: "btn-ghost ml-auto", onClick: onCancel, children: "Annuler" })] }), _jsxs("div", { className: "flex flex-wrap gap-2 mt-3", children: [list.map((c) => {
                            const def = getCard(c.defId);
                            const previewDef = showUpgradePreview && showForgedDetails && def.upgradeTo ? getCard(def.upgradeTo) : def;
                            return (_jsx(CardView, { def: previewDef, upgraded: c.upgraded, size: "sm", onClick: () => onPick(c.uid) }, c.uid));
                        }), !list.length && _jsx("div", { className: "text-ash-300 italic", children: "Aucune carte \u00E9ligible." })] })] }) }));
};
// =====================================================
// GAME OVER / VICTORY
// =====================================================
export const GameOverScreen = () => (_jsxs("div", { className: "min-h-screen flex flex-col items-center justify-center p-6", children: [_jsx("div", { className: "font-display text-6xl text-vow-blood drop-shadow-[0_0_14px_rgba(139,30,43,0.5)] mb-2", children: "Le Serment se brise." }), _jsx("div", { className: "text-ash-300 italic mb-8", children: "Tes braises s\u2019\u00E9teignent dans l\u2019obscurit\u00E9." }), _jsxs("div", { className: "flex gap-3", children: [_jsx("button", { className: "btn-primary", onClick: () => useGame.setState({ screen: 'class_select' }), children: "R\u00E9essayer" }), _jsx("button", { className: "btn", onClick: () => useGame.setState({ screen: 'menu' }), children: "Menu principal" })] })] }));
export const VictoryScreen = () => {
    const meta = useGame((s) => s.meta);
    return (_jsxs("div", { className: "min-h-screen flex flex-col items-center justify-center p-6", children: [_jsx("div", { className: "font-display text-6xl text-vow-gold drop-shadow-[0_0_16px_rgba(212,162,76,0.5)] mb-2", children: "Serment Repris." }), _jsx("div", { className: "text-ash-100 italic mb-8", children: "Le Ma\u00EEtre de Ch\u0153ur se tait. Quelque part, une porte se souvient de toi." }), _jsxs("div", { className: "text-ash-200 text-sm mb-6", children: ["Victoires \u2014 Vowbreaker : ", meta.wins.vowbreaker ?? 0, " \u00B7 Sealbinder : ", meta.wins.sealbinder ?? 0, " \u00B7 Whisperer : ", meta.wins.whisperer ?? 0, " \u00B7 Auger : ", meta.wins.auger ?? 0, " \u00B7 Summoner : ", meta.wins.summoner ?? 0] }), _jsxs("div", { className: "flex gap-3", children: [_jsx("button", { className: "btn-primary", onClick: () => useGame.setState({ screen: 'class_select' }), children: "Nouvelle tentative" }), _jsx("button", { className: "btn", onClick: () => useGame.setState({ screen: 'menu' }), children: "Menu principal" })] })] }));
};
