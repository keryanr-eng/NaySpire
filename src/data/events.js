// EMBERVOW — Événements aléatoires rencontrés sur les nœuds d'événement.
// Les événements sont des invites à embranchements. Chaque option peut modifier le RunState via un résolveur.
import { getCard } from './cards';
import { getPotion } from './potions';
// Mutations utilitaires
const addGold = (run, n) => { run.gold = Math.max(0, run.gold + n); };
const hurt = (run, n) => { run.hp = Math.max(1, run.hp - n); };
const heal = (run, n) => { run.hp = Math.min(run.maxHp, run.hp + n); };
const addCard = (run, defId, upgraded = false) => {
    run.deck.push({ uid: `ev_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, defId, upgraded });
};
const removeRandomCard = (run, rand) => {
    const removable = run.deck.filter((c) => getCard(c.defId).rarity !== 'starter');
    if (!removable.length)
        return false;
    const victim = removable[Math.floor(rand() * removable.length)];
    run.deck = run.deck.filter((c) => c.uid !== victim.uid);
    return true;
};
export const ALL_EVENTS = [
    {
        id: 'ev_the_weeping_idol',
        title: 'L\u2019Idole en Pleurs',
        body: 'Une idole d\u2019os trempe dans une flaque de ses propres larmes. Un murmure promet la force à qui prêtera un faux serment.',
        options: [
            {
                label: 'Prêter le faux serment (Perds 6 PV, gagne une carte rare)',
                resolve: (run) => {
                    hurt(run, 6);
                    const pool = ['vb_final_vow', 'vb_crown_of_ash', 'sb_executioner', 'sb_aegis', 'sb_bell_of_dusk'];
                    const pick = pool[Math.floor(Math.random() * pool.length)];
                    addCard(run, pick);
                    return `Tu jures. L\u2019idole pleure des éclats de verre. ${getCard(pick).name} ajoutée à ton deck.`;
                },
            },
            {
                label: 'La briser (Gagne 25 or)',
                resolve: (run) => { addGold(run, 25); return 'L\u2019idole se brise. Des pièces s\u2019échappent de son creux.'; },
            },
            { label: 'La laisser en paix', resolve: () => 'Tu passes ton chemin. Le murmure te suit un moment.' },
        ],
    },
    {
        id: 'ev_the_silent_merchant',
        title: 'Le Marchand Silencieux',
        body: 'Une silhouette encapuchonnée propose un échange. Elle ne parle pas ; elle désigne simplement ce qu\u2019elle veut.',
        options: [
            {
                label: 'Échanger 30 or contre une potion aléatoire',
                disabled: (run) => run.gold < 30,
                resolve: (run, rand) => {
                    addGold(run, -30);
                    const pool = ['pot_mend', 'pot_surge', 'pot_flame', 'pot_fury', 'pot_brittle', 'pot_seal', 'pot_insight'];
                    const id = pool[Math.floor(rand() * pool.length)];
                    const slot = run.potions.findIndex((p) => !p);
                    if (slot >= 0)
                        run.potions[slot] = id;
                    return `Il te tend ${getPotion(id).name}.`;
                },
            },
            {
                label: 'Échanger 5 PV contre 45 or',
                disabled: (run) => run.hp <= 5,
                resolve: (run) => { hurt(run, 5); addGold(run, 45); return 'Il boit le sang et compte les pièces.'; },
            },
            { label: 'Refuser', resolve: () => 'Il hoche la tête. Tu t\u2019en vas.' },
        ],
    },
    {
        id: 'ev_altar_of_ashes',
        title: 'Autel des Cendres',
        body: 'Un autel brûle d\u2019un feu froid. Tu pourrais sacrifier quelque chose qui t\u2019appartient pour réveiller les braises.',
        options: [
            {
                label: 'Brûler une carte (retire une carte non-initiale)',
                disabled: (run) => run.deck.every((c) => getCard(c.defId).rarity === 'starter'),
                resolve: (run, rand) => (removeRandomCard(run, rand) ? 'Une carte s\u2019effrite en cendres dans ta main.' : 'Rien d\u2019éligible à brûler.'),
            },
            {
                label: 'Brûler 20 PV (gagne une relique commune)',
                disabled: (run) => run.hp <= 20,
                resolve: (run) => {
                    hurt(run, 20);
                    // attribution de la relique gérée par la couche externe via un flag
                    run.flags.pending_common_relic = 1;
                    return 'Le sang bout. Une braise en forme d\u2019anneau refroidit dans ta paume.';
                },
            },
            { label: 'Te détourner', resolve: () => 'Tu t\u2019épargnes, pour l\u2019instant.' },
        ],
    },
    {
        id: 'ev_chained_saint',
        title: 'Le Saint Enchaîné',
        body: 'Une silhouette enchaînée marmonne des prières à l\u2019envers. Tu peux les libérer — à un prix.',
        options: [
            {
                label: 'Briser les chaînes (Perds 4 PV, soin complet plus tard)',
                disabled: (run) => run.hp <= 4,
                resolve: (run) => {
                    hurt(run, 4);
                    run.flags.full_heal_next_rest = 1;
                    return 'Le saint t\u2019étreint puis s\u2019évanouit. Ton prochain repos te soignera entièrement.';
                },
            },
            {
                label: 'Resserrer les chaînes (Gagne 2 PV max et 10 or)',
                resolve: (run) => {
                    run.maxHp += 2;
                    heal(run, 2);
                    addGold(run, 10);
                    return 'Le saint soupire. Tu te sens plus solide.';
                },
            },
            { label: 'Passer sans rien faire', resolve: () => 'Leur prière te suit dans le couloir.' },
        ],
    },
    {
        id: 'ev_mirror_choir',
        title: 'Le Chœur des Miroirs',
        body: 'Une douzaine de miroirs te renvoient ta propre voix, à l\u2019envers.',
        options: [
            {
                label: 'Briser un miroir (ajoute la copie d\u2019une carte aléatoire de ton deck)',
                resolve: (run, rand) => {
                    const eligible = run.deck.filter((c) => !getCard(c.defId).upgradeOf);
                    if (!eligible.length)
                        return 'Aucune copie n\u2019apparaît.';
                    const src = eligible[Math.floor(rand() * eligible.length)];
                    addCard(run, src.defId, src.upgraded);
                    return `Un jumeau de ${getCard(src.defId).name} sort du verre.`;
                },
            },
            {
                label: 'Écouter (gagne 1 PV max, perds 2 PV)',
                resolve: (run) => { run.maxHp += 1; hurt(run, 2); return 'Tu chantes avec eux. Quelque chose s\u2019allume en toi.'; },
            },
            { label: 'Fuir', resolve: () => 'Le chant s\u2019estompe tandis que tu cours.' },
        ],
    },
];
export const EVENT_MAP = Object.fromEntries(ALL_EVENTS.map((e) => [e.id, e]));
export function getEvent(id) {
    const e = EVENT_MAP[id];
    if (!e)
        throw new Error(`Unknown event id: ${id}`);
    return e;
}
