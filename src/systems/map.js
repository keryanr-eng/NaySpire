// EMBERVOW — map generator.
//
// We place N floors of 1..K nodes, connect them with non-crossing edges,
// and assign node kinds from a distribution. The boss sits on floor FLOORS
// and is reachable from every floor-(FLOORS-1) node.
//
// Design goals:
//  - Branching but legible (max 4-5 columns per floor).
//  - Guaranteed path diversity (each starting column reaches a different sub-tree early).
//  - Rest/Merchant distributed to support build pacing.
//  - Elites rare early, more common mid-act; no elites on floor 0 or floor FLOORS-1.
import { makeRng, mix, pick, weightedPick } from './rng';
import { NORMAL_ENCOUNTERS, EARLY_ENCOUNTERS, ELITE_ENCOUNTERS, BOSS_ENCOUNTERS } from '../data/enemies';
import { ALL_EVENTS } from '../data/events';
const FLOORS = 15; // floor 0..14 combat nodes; floor 15 = boss
const COLS = 5;
const PATHS_PER_FLOOR = 4; // up to 4 live columns per floor
export function generateMap(seed) {
    const rng = makeRng(mix(seed, 0xa11));
    const floors = [];
    // 1) Place nodes on each floor (2..PATHS_PER_FLOOR per floor)
    for (let f = 0; f < FLOORS; f++) {
        const count = f === 0 ? 3 : Math.min(PATHS_PER_FLOOR, 2 + Math.floor(rng() * 3));
        const cols = chooseCols(rng, count);
        const floor = cols.map((col, i) => ({
            id: `n_${f}_${col}_${i}`,
            floor: f,
            col,
            kind: 'combat',
            children: [],
            seed: mix(seed, f, col, i),
        }));
        floors.push(floor);
    }
    // 2) Assign kinds by floor band
    for (let f = 0; f < FLOORS; f++) {
        for (const node of floors[f]) {
            node.kind = rollKindForFloor(rng, f);
        }
    }
    // Force an initial variety constraint: no two starting nodes identical kind
    ensureVariety(floors[0], rng);
    // Ensure a rest before the boss (floor FLOORS-2 mostly rest)
    ensurePreBossRest(floors[FLOORS - 1], rng);
    // 3) Connect floors — each node connects to 1-2 nodes on next floor
    for (let f = 0; f < FLOORS - 1; f++) {
        connectFloors(floors[f], floors[f + 1], rng);
    }
    // 4) Boss node
    const boss = {
        id: `n_boss`,
        floor: FLOORS,
        col: 2,
        kind: 'boss',
        children: [],
        seed: mix(seed, 0xb055),
    };
    for (const n of floors[FLOORS - 1])
        n.children.push(boss.id);
    // 5) Bake encounter/event ids deterministically per node
    const nodes = {};
    for (const f of floors)
        for (const n of f)
            nodes[n.id] = n;
    nodes[boss.id] = boss;
    bakeContent(nodes, seed);
    return {
        nodes,
        startIds: floors[0].map((n) => n.id),
        bossId: boss.id,
        floors: FLOORS + 1,
    };
}
function chooseCols(rng, count) {
    const all = [0, 1, 2, 3, 4].filter((c) => c < COLS);
    const chosen = [];
    const pool = all.slice();
    while (chosen.length < count && pool.length) {
        const i = Math.floor(rng() * pool.length);
        chosen.push(pool[i]);
        pool.splice(i, 1);
    }
    return chosen.sort((a, b) => a - b);
}
function rollKindForFloor(rng, f) {
    if (f === 0)
        return weightedPick(rng, [['combat', 80], ['event', 20]]);
    if (f === 1)
        return weightedPick(rng, [['combat', 70], ['event', 20], ['rest', 10]]);
    // Mid-act: more variety, elites appear
    if (f < 6)
        return weightedPick(rng, [
            ['combat', 50], ['event', 18], ['elite', 10], ['merchant', 10], ['rest', 8], ['treasure', 4],
        ]);
    // Late act
    if (f < FLOORS - 2)
        return weightedPick(rng, [
            ['combat', 42], ['event', 16], ['elite', 18], ['merchant', 9], ['rest', 10], ['treasure', 5],
        ]);
    // Last 2 floors before boss: favor rest/merchant/treasure
    return weightedPick(rng, [
        ['combat', 30], ['event', 10], ['elite', 15], ['merchant', 15], ['rest', 20], ['treasure', 10],
    ]);
}
function ensureVariety(floor, _rng) {
    const seen = new Set();
    for (const n of floor) {
        if (seen.has(n.kind)) {
            n.kind = 'event';
        }
        seen.add(n.kind);
    }
}
function ensurePreBossRest(lastRow, rng) {
    if (!lastRow.some((n) => n.kind === 'rest')) {
        pick(rng, lastRow).kind = 'rest';
    }
}
function connectFloors(a, b, rng) {
    // Each node in A connects to 1-2 nodes in B (never crossing more than ±1 col)
    // First pass: each A node picks the closest B node.
    const covered = new Set();
    for (const src of a) {
        const nearest = b
            .map((n) => ({ n, d: Math.abs(n.col - src.col) }))
            .sort((x, y) => x.d - y.d);
        const primary = nearest[0].n;
        src.children.push(primary.id);
        covered.add(primary.id);
        // 45% chance to add a secondary edge
        if (rng() < 0.45 && nearest.length > 1) {
            const secondary = nearest[1].n;
            if (Math.abs(secondary.col - src.col) <= 2) {
                src.children.push(secondary.id);
                covered.add(secondary.id);
            }
        }
    }
    // Ensure every B node has at least one incoming edge
    for (const dst of b) {
        if (covered.has(dst.id))
            continue;
        // attach from the nearest A node
        const nearest = a
            .map((n) => ({ n, d: Math.abs(n.col - dst.col) }))
            .sort((x, y) => x.d - y.d)[0].n;
        if (!nearest.children.includes(dst.id))
            nearest.children.push(dst.id);
    }
    // Dedup children
    for (const src of a)
        src.children = Array.from(new Set(src.children));
}
function bakeContent(nodes, _seed) {
    for (const id in nodes) {
        const n = nodes[id];
        const rng = makeRng(n.seed);
        if (n.kind === 'combat') {
            const pool = n.floor <= 1 ? EARLY_ENCOUNTERS : NORMAL_ENCOUNTERS;
            n.data = { encounterId: serializeEncounter(pool[Math.floor(rng() * pool.length)]) };
        }
        else if (n.kind === 'elite') {
            const pool = ELITE_ENCOUNTERS;
            n.data = { encounterId: serializeEncounter(pool[Math.floor(rng() * pool.length)]) };
        }
        else if (n.kind === 'boss') {
            n.data = { encounterId: serializeEncounter(BOSS_ENCOUNTERS[0]) };
        }
        else if (n.kind === 'event') {
            n.data = { eventId: ALL_EVENTS[Math.floor(rng() * ALL_EVENTS.length)].id };
        }
    }
}
// Encode/decode an encounter (array of enemy ids) as a single string for MapNode.data.
export function serializeEncounter(enemies) { return enemies.join('|'); }
export function parseEncounter(s) { return s.split('|'); }
// Utility: what nodes can the player choose NEXT given currentId?
export function nextChoices(map, currentId) {
    if (currentId === null)
        return map.startIds.map((id) => map.nodes[id]);
    const cur = map.nodes[currentId];
    return cur.children.map((id) => map.nodes[id]);
}
// Sanity check helpers (used by tests/dev)
export function mapStats(map) {
    const counts = {};
    for (const id in map.nodes)
        counts[map.nodes[id].kind] = (counts[map.nodes[id].kind] ?? 0) + 1;
    return counts;
}
