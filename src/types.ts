// EMBERVOW — core types
// Combat is turn-based. The player plays cards from hand by spending Ember.
// All content is data-driven. Card effects are a declarative list of "Ops".

export type ClassId = 'vowbreaker' | 'sealbinder' | 'whisperer' | 'auger' | 'summoner';

export type Rarity = 'starter' | 'common' | 'uncommon' | 'rare' | 'curse' | 'status' | 'special';
export type CardType = 'attack' | 'skill' | 'power' | 'curse' | 'status';
export type TargetMode = 'enemy' | 'all_enemies' | 'self' | 'random_enemy' | 'none';

// Statuses applied to combatants. Positive, neutral, and negative kept in a unified bag.
export type StatusId =
  // buffs
  | 'fury'        // +X to every attack this combat
  | 'poise'       // +X ward from skills that grant ward
  | 'sigil'       // negates next X debuff applications
  | 'regen'       // heal X at end of turn, decays by 1
  | 'momentum'    // +X energy next turn only
  | 'thorns'      // reflect X damage when attacked
  // debuffs
  | 'brittle'     // takes +50% attack damage; decays by 1 per turn
  | 'faded'       // deals -25% damage; decays by 1 per turn
  | 'bleed'       // at start of owner's turn, take X damage (does not decay)
  | 'ignite'      // at end of turn, take X damage; halves (round down)
  // class-specific
  | 'fracture'    // Vowbreaker counter; spendable
  | 'seal'        // Sealbinder mark on enemies; some cards consume/interact
  | 'echo'        // scaling reserve
  | 'summon'      // Summoner: bound servants currently active
  // meta
  | 'chained'     // cannot gain Ward this turn
  | 'marked'      // draw 1 extra when you attack this enemy
  ;

export interface StatusBag {
  // stack counts keyed by status id
  [key: string]: number | undefined;
}

// ---------- card effects ----------

export type Op =
  | { kind: 'damage'; amount: number; target?: TargetMode; hits?: number }
  | { kind: 'ward'; amount: number; target?: 'self' }
  | { kind: 'status'; id: StatusId; amount: number; target: TargetMode }
  | { kind: 'draw'; amount: number }
  | { kind: 'gain_ember'; amount: number }
  | { kind: 'lose_hp'; amount: number }
  | { kind: 'heal'; amount: number }
  | { kind: 'discard_random'; amount: number }
  | { kind: 'banish_self' }                            // send this card to banish after play
  | { kind: 'return_self_hand' }                       // returns to hand instead of discard
  | { kind: 'add_card_to_hand'; cardId: string; amount?: number }
  | { kind: 'add_card_to_discard'; cardId: string; amount?: number }
  | { kind: 'summon'; amount: number }
  | { kind: 'command_summons'; damage: number; consume?: number; target?: TargetMode }
  | { kind: 'double_status'; id: StatusId; target: TargetMode }
  | { kind: 'spend_fracture'; per: number; then: Op }  // spends X fracture, runs inner effect scaled
  | { kind: 'if_has_status'; id: StatusId; target: TargetMode; then: Op[]; else?: Op[] }
  | { kind: 'if_hp_below'; pct: number; then: Op[]; else?: Op[] }
  | { kind: 'repeat'; times: number; ops: Op[] }
  | { kind: 'per_target_status'; id: StatusId; target: TargetMode; then: Op } // scales by stacks
  ;

export interface CardDef {
  id: string;
  name: string;
  cost: number;             // -1 = X cost
  type: CardType;
  rarity: Rarity;
  classId: ClassId | 'neutral' | 'status';
  target: TargetMode;
  text: string;             // description shown to player (generated or authored)
  ops: Op[];                // ops executed when the card is played
  upgradeOf?: string;       // if this is an upgraded version, points back to base
  upgradeTo?: string;       // id of upgraded version
  exhaust?: boolean;        // banish on play
  ethereal?: boolean;       // if in hand at end of turn, banish instead of discard
  retain?: boolean;         // not discarded at end of turn
  innate?: boolean;         // starts every combat in opening hand
  tags?: string[];
}

export interface CardInstance {
  uid: string;              // unique per draft within a run
  defId: string;
  upgraded: boolean;
}

// ---------- combatants ----------

export interface Combatant {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  ward: number;
  status: StatusBag;
  isPlayer: boolean;
}

export type IntentKind = 'attack' | 'attack_multi' | 'defend' | 'debuff' | 'buff' | 'summon' | 'special' | 'unknown';

export interface Intent {
  kind: IntentKind;
  label?: string;
  value?: number;       // attack damage or numeric effect
  hits?: number;        // # of strikes
  description?: string; // human-readable
}

// AI "move" - mirrors a card for the enemy.
export interface EnemyMove {
  id: string;
  intent: Intent;
  ops: Op[];
}

export interface EnemyDef {
  id: string;
  name: string;
  tier: 'normal' | 'elite' | 'boss';
  hpRange: [number, number];
  description?: string;
  // Given context, choose the next move's id. Return id of a move in 'moves'.
  moves: Record<string, EnemyMove>;
  pickMove: (ctx: EnemyAICtx) => string;
}

export interface EnemyAICtx {
  turn: number;           // 1-based
  hpPct: number;          // 0..1
  lastMove?: string;
  history: string[];
  rng: () => number;
}

export interface EnemyInstance extends Combatant {
  defId: string;
  tier: 'normal' | 'elite' | 'boss';
  moveHistory: string[];
  nextMove: string;
  nextIntent: Intent;
}

export interface SummonInstance extends Combatant {
  slot: number;
  damage: number;
}

// ---------- combat state ----------

export interface CombatState {
  turn: number;               // player-turn number (1-based)
  phase: 'player' | 'enemy' | 'ended';
  player: Combatant;
  summons: SummonInstance[];
  enemies: EnemyInstance[];
  draw: CardInstance[];
  hand: CardInstance[];
  discard: CardInstance[];
  banish: CardInstance[];
  ember: number;
  emberMax: number;
  drawPerTurn: number;
  // ephemeral: event log entries this combat
  log: string[];
  // for effects that reference last-played data
  lastCardPlayedType?: CardType;
  // float texts on enemies/player for UI
  pendingFloat: Array<{ targetId: string; text: string; tone: 'dmg' | 'heal' | 'ward' | 'status'; delayMs?: number; source?: 'summon' | 'enemy' }>;
  pendingSummonAttacks: Array<{ servantIndex: number; targetId: string; delayMs: number }>;
  // flags for animations
  shaking: Record<string, number>;
  // end-of-combat flag
  victory?: boolean;
}

// ---------- map ----------

export type NodeKind = 'combat' | 'elite' | 'event' | 'rest' | 'merchant' | 'treasure' | 'boss';

export interface MapNode {
  id: string;
  floor: number;            // 0..N
  col: number;              // column on that floor
  kind: NodeKind;
  children: string[];       // ids of reachable nodes on next floor
  data?: { encounterId?: string; eventId?: string }; // baked at gen time
  visited?: boolean;
  seed: number;             // deterministic content seed
}

export interface RunMap {
  nodes: Record<string, MapNode>;
  startIds: string[];        // floor 0 nodes the player may choose
  bossId: string;
  floors: number;
}

// ---------- relics, potions, rewards ----------

export type RelicTier = 'common' | 'uncommon' | 'rare' | 'boss' | 'starter';

export interface RelicDef {
  id: string;
  name: string;
  tier: RelicTier;
  classId?: ClassId;           // if class-locked
  description: string;
  // hooks are handled declaratively by id in systems/combat.ts
  hook: RelicHook;
}

export type RelicHook =
  | 'first_attack_plus_2'           // +2 dmg on first attack each turn
  | 'first_skill_plus_2_ward'       // +2 ward on first skill each turn
  | 'start_combat_draw_1'
  | 'start_combat_add_spark'
  | 'start_combat_summon_1'
  | 'start_combat_2_ward'
  | 'gain_1_ember_on_enemy_death'
  | 'heal_2_after_combat'
  | 'double_first_bleed_per_combat'
  | 'upgraded_cards_cost_neg_1_once_per_combat'
  | 'first_seal_per_turn_2_ward'    // Sealbinder starter
  | 'first_attack_per_turn_applies_1_brittle'
  | 'whenever_banish_gain_1_fracture'
  | 'at_combat_end_if_no_damage_taken_gain_2_gold'
  | 'shop_prices_minus_15pct'
  | 'start_of_turn_gain_1_ember_if_0_cards_in_hand'
  | 'start_combat_3_ward'
  | 'max_hp_plus_7'
  | 'first_potion_each_combat_refills'
  | 'on_rest_heal_plus_10'
  | 'bleed_tick_plus_1'
  | 'whenever_status_applied_gain_1_ward'
  | 'at_turn_start_if_hand_5_plus_gain_1_momentum'
  | 'gold_gain_plus_25pct'
  | 'on_boss_complete_heal_full'
  ;

export interface Potion {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'uncommon' | 'rare';
  // type is used by the UI to decide whether the potion needs a target
  needsTarget: boolean;
  apply: PotionEffect;
}

export type PotionEffect =
  | { kind: 'heal'; amount: number }
  | { kind: 'ember'; amount: number }
  | { kind: 'draw'; amount: number }
  | { kind: 'damage'; amount: number }
  | { kind: 'ward'; amount: number }
  | { kind: 'status_self'; id: StatusId; amount: number }
  | { kind: 'status_enemy'; id: StatusId; amount: number }
  | { kind: 'cleanse' }
  | { kind: 'remove_card_temp'; count: number };

// ---------- run state / save ----------

export interface RunState {
  seed: number;
  classId: ClassId;
  hp: number;
  maxHp: number;
  gold: number;
  deck: CardInstance[];
  relics: string[];                   // relic def ids
  potions: Array<string | null>;      // fixed-size slot array
  potionSlots: number;
  map: RunMap;
  currentNodeId: string | null;       // null before floor 0 choice
  floor: number;
  act: number;                        // 1-based
  seen: { enemies: string[]; events: string[] };
  // per-run flags used by various systems
  flags: Record<string, number>;
  // log of events for run summary
  history: string[];
}

export interface MetaState {
  // light meta: high scores, classes unlocked list, options
  wins: Record<ClassId, number>;
  losses: number;
  seenCards: string[];
  seenRelics: string[];
  achievements: string[];
}

export type Screen =
  | 'menu'
  | 'class_select'
  | 'map'
  | 'combat'
  | 'reward'
  | 'shop'
  | 'rest'
  | 'event'
  | 'treasure'
  | 'deck_viewer'
  | 'game_over'
  | 'victory'
  | 'help'
  | 'settings';

export interface RewardState {
  gold: number;
  cards: string[];    // 3 card def ids to pick from (or 0)
  relic?: string;
  potion?: string;
  // remaining choices the player still needs to resolve
  pending: Array<'cards' | 'relic' | 'potion'>;
}
