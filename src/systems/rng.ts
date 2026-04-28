// Deterministic, seedable RNG (mulberry32) + helpers.
// Using a PRNG so runs can be replayed/debugged and content generation is reproducible per seed.

export type Rng = () => number;

export function makeRng(seed: number): Rng {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randInt(rng: Rng, min: number, maxInclusive: number): number {
  return Math.floor(rng() * (maxInclusive - min + 1)) + min;
}

export function pick<T>(rng: Rng, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

export function pickN<T>(rng: Rng, arr: readonly T[], n: number): T[] {
  const pool = arr.slice();
  const out: T[] = [];
  while (out.length < n && pool.length) {
    const i = Math.floor(rng() * pool.length);
    out.push(pool[i]);
    pool.splice(i, 1);
  }
  return out;
}

export function shuffle<T>(rng: Rng, arr: readonly T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function weightedPick<T>(rng: Rng, entries: Array<[T, number]>): T {
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let r = rng() * total;
  for (const [v, w] of entries) {
    r -= w;
    if (r <= 0) return v;
  }
  return entries[entries.length - 1][0];
}

// 32-bit hash combining a seed with salts, so child seeds are deterministic and independent.
export function mix(seed: number, ...salts: number[]): number {
  let h = seed >>> 0;
  for (const s of salts) {
    h = Math.imul(h ^ (s >>> 0), 2654435761) >>> 0;
  }
  return h >>> 0;
}

let uidCounter = 1;
export function makeUid(prefix = 'u'): string {
  uidCounter += 1;
  return `${prefix}_${uidCounter.toString(36)}_${Math.floor(Math.random() * 1e6).toString(36)}`;
}
