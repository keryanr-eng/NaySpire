// EMBERVOW — a collection of simpler UI screens.
// Kept in one file to avoid dozens of 20-line components.

import React, { useEffect, useMemo, useState } from 'react';
import { useGame, ShopState } from '../state/game';
import { getCard, ALL_CARDS } from '../data/cards';
import { getRelic, ALL_RELICS } from '../data/relics';
import { getPotion, ALL_POTIONS } from '../data/potions';
import { getEvent } from '../data/events';
import { CardView } from './Card';
import { Sprite } from './Sprite';
import { resolveSprite } from '../assets/sprites';
import { getPotionArt, getRelicArt } from '../assets/generatedAssets';
import { sfx } from '../systems/sound';
import { CharacterArt } from './CharacterArt';
import { PortraitImage } from './PortraitImage';
import { getPlayerPortrait } from '../assets/portraits';
import type { ClassId } from '../types';

const rarityLabel: Record<string, string> = {
  starter: 'Départ',
  common: 'Communes',
  uncommon: 'Peu communes',
  rare: 'Rares',
  curse: 'Malédictions',
  status: 'Statuts',
  boss: 'Boss',
};

const itemTierLabel: Record<string, string> = {
  starter: 'Départ',
  common: 'Commun',
  uncommon: 'Peu commun',
  rare: 'Rare',
  boss: 'Boss',
};

// =====================================================
// MAIN MENU
// =====================================================

export const MainMenu: React.FC = () => {
  const newRun = useGame((s) => s.newRun);
  const resume = useGame((s) => s.resumeIfExists);
  const meta = useGame((s) => s.meta);
  const [seedInput, setSeedInput] = useState('');
  const hasSave = !!localStorage.getItem('embervow.run.v1');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="text-center max-w-2xl">
        <div className="font-display text-6xl md:text-7xl text-vow-gold drop-shadow-[0_0_20px_rgba(249,115,22,0.35)]">EMBERVOW</div>
        <div className="text-ash-200 mt-2 italic">Reprends le Serment Brisé. Traverse le Berceau du Chœur par le feu.</div>
        <div className="mt-8 flex flex-col gap-3 items-center">
          <button className="btn-primary text-lg px-8 py-3 w-64" onClick={() => useGame.setState({ screen: 'class_select' })}>Nouvelle tentative</button>
          {hasSave && (
            <button className="btn w-64" onClick={() => resume()}>Continuer</button>
          )}
          <div className="flex gap-2 items-center mt-4">
            <input
              value={seedInput}
              onChange={(e) => setSeedInput(e.target.value)}
              placeholder="Seed personnalisée (optionnel)"
              className="bg-ash-800 border border-ash-500 rounded px-3 py-1 text-sm text-ash-100 w-52"
            />
            <button
              className="btn text-xs"
              onClick={() => {
                const s = parseInt(seedInput, 10);
                if (!isNaN(s)) useGame.setState({ _tickle: s });
                useGame.setState({ screen: 'class_select' });
              }}
            >Utiliser</button>
          </div>
          <button className="btn-ghost mt-4" onClick={() => useGame.setState({ screen: 'help' })}>Règles</button>
        </div>
        <div className="mt-12 text-ash-300 text-xs">
          Victoires — Vowbreaker : {meta.wins.vowbreaker ?? 0} · Sealbinder : {meta.wins.sealbinder ?? 0} · Whisperer : {meta.wins.whisperer ?? 0} · Auger : {meta.wins.auger ?? 0} · Summoner : {meta.wins.summoner ?? 0} · Défaites : {meta.losses}
        </div>
      </div>
    </div>
  );
};

// =====================================================
// HELP
// =====================================================

export const HelpScreen: React.FC = () => (
  <div className="min-h-screen flex justify-center p-6">
    <div className="panel p-6 max-w-2xl">
      <h1 className="font-display text-3xl text-vow-gold mb-3">Le Premier Serment</h1>
      <p className="text-ash-100 mb-3">
        À chaque tour, tu dépenses de la <b className="text-ember-400">Braise</b> (3/tour) pour jouer tes cartes.
        La <b className="text-vow-seal">Garde</b> absorbe les dégâts, puis disparaît au début de ton prochain tour.
        Quand tous les ennemis tombent, tu remportes le combat et choisis tes récompenses.
      </p>
      <ul className="text-ash-200 text-sm space-y-1 list-disc pl-5">
        <li><b>Fragile</b> — la cible subit +50 % de dégâts d’attaque.</li>
        <li><b>Flétri</b> — la cible inflige -25 % de dégâts.</li>
        <li><b>Saignement</b> — la cible subit X dégâts au début de son tour.</li>
        <li><b>Embrasement</b> — la cible subit X dégâts en fin de tour, puis l’effet est divisé par deux.</li>
        <li><b>Furie</b> — +X dégâts à chacune de tes frappes.</li>
        <li><b>Sigille</b> — annule les X prochaines applications de malus.</li>
        <li><b>Fracture</b> (Vowbreaker) — une réserve que certaines cartes libèrent brutalement.</li>
        <li><b>Sceau</b> (Sealbinder) — des marques consommées ou exploitées par d’autres cartes.</li>
        <li><b>Écho</b> (Whisperer) — une réserve qui amplifie certaines rafales.</li>
        <li><b>Fragile</b> (Auger) — prépare les ennemis pour déclencher pioche et dégâts amplifiés.</li>
        <li><b>Invocation</b> (Summoner) — appelle un Serviteur lié persistant, puis le renforce pour qu’il frappe plus fort au début de tes tours.</li>
      </ul>
      <p className="text-ash-300 text-sm mt-4">
        Choisis ton chemin avec soin. Les haltes soignent ou améliorent une carte. Les marchands vendent cartes, reliques et potions.
        Les événements peuvent récompenser ou blesser. Le boss de chaque acte met ton deck à l’épreuve.
      </p>
      <button className="btn-primary mt-5" onClick={() => useGame.setState({ screen: 'menu' })}>Retour</button>
    </div>
  </div>
);

// =====================================================
// CLASS SELECT
// =====================================================

const CLASS_DATA: Record<ClassId, {
  title: string;
  artId: string;
  tag: string;
  hp: number;
  mech: string;
  colors: string;
  starter: string;
}> = {
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

const ClassCard: React.FC<{ id: ClassId; onPick: () => void }> = ({ id, onPick }) => {
  const data = CLASS_DATA[id];
  const portrait = getPlayerPortrait(data.artId);
  const isPainted = !!portrait;
  const generatedPortrait = !!portrait?.url.includes('/assets/generated/');
  return (
    <div className={`panel overflow-hidden w-full max-w-[43rem] min-h-[23rem] bg-gradient-to-br ${data.colors} transition-transform hover:-translate-y-1`}>
      <div className="grid grid-cols-[47%_53%] h-full min-h-[23rem]">
      <div className="relative overflow-hidden border-r border-vow-gold/20 bg-black/25">
        <div
          className="absolute inset-0"
          style={{
            background:
              id === 'vowbreaker'
                ? 'radial-gradient(ellipse at 50% 64%, rgba(249,115,22,0.28) 0%, rgba(139,30,43,0.16) 38%, transparent 72%)'
                : id === 'sealbinder'
                  ? 'radial-gradient(ellipse at 50% 64%, rgba(96,165,250,0.24) 0%, rgba(37,99,235,0.14) 38%, transparent 72%)'
                  : id === 'whisperer'
                    ? 'radial-gradient(ellipse at 50% 64%, rgba(52,211,153,0.22) 0%, rgba(20,83,45,0.16) 40%, transparent 74%)'
                    : id === 'summoner'
                      ? 'radial-gradient(ellipse at 50% 64%, rgba(168,85,247,0.23) 0%, rgba(88,28,135,0.16) 40%, transparent 74%)'
                      : 'radial-gradient(ellipse at 50% 64%, rgba(212,162,76,0.24) 0%, rgba(120,53,15,0.14) 40%, transparent 74%)',
          }}
        />
        <div
          className={[
            'absolute left-1/2 -translate-x-1/2 z-10',
            id === 'vowbreaker' && !generatedPortrait
              ? 'bottom-[-4.75rem] w-[25rem] h-[30rem]'
              : generatedPortrait
                ? 'bottom-[-0.75rem] w-[20rem] h-[24rem]'
                : isPainted
                ? 'bottom-[-1rem] w-[21rem] h-[23rem]'
                : 'bottom-[-1.4rem] w-[18rem] h-[22rem]',
          ].join(' ')}
          style={{
            transform: id === 'vowbreaker' && !generatedPortrait
              ? 'translateX(-50%) scale(1.06)'
              : generatedPortrait ? 'translateX(-50%) scale(0.98)' : isPainted ? 'translateX(-50%) scale(1.04)' : 'translateX(-50%) scale(1.22)',
            transformOrigin: '50% 100%',
          }}
        >
          {portrait ? (
            <PortraitImage
              portrait={portrait}
              className="w-full h-full drop-shadow-[0_18px_24px_rgba(0,0,0,0.9)]"
              style={{ objectPosition: generatedPortrait ? 'center bottom' : 'center calc(100% + 5.5rem)' }}
              title={data.title}
            />
          ) : (
            <CharacterArt artId={data.artId} className="w-full h-full drop-shadow-[0_18px_24px_rgba(0,0,0,0.9)]" />
          )}
        </div>
        <div className="absolute inset-x-8 bottom-7 h-8 rounded-full bg-black/45 blur-md" />
      </div>
      <div className="p-6 flex flex-col">
        <div className="font-display text-4xl text-vow-bone leading-none">{data.title}</div>
        <div className="text-ash-200 uppercase tracking-widest text-xs mt-2">{data.tag}</div>
        <div className="mt-5 flex items-center gap-3 text-sm">
          <span className="rounded border border-vow-gold/40 bg-black/25 px-3 py-1 text-ash-100">
            PV <span className="text-vow-blood font-bold">{data.hp}</span>
          </span>
          <span className="rounded border border-ash-400/40 bg-black/20 px-3 py-1 text-ash-300">
            Départ
          </span>
        </div>
        <p className="mt-5 text-ash-100 text-sm leading-relaxed">{data.mech}</p>
        <p className="mt-3 text-ash-300 text-xs italic leading-relaxed">{data.starter}</p>
        <button className="btn-primary mt-auto w-full text-base py-3" onClick={onPick}>Partir</button>
      </div>
      </div>
    </div>
  );
};

export const ClassSelect: React.FC = () => {
  const newRun = useGame((s) => s.newRun);
  const seedOverride = useGame((s) => s._tickle);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="font-display text-4xl text-vow-gold mb-6">Choisis ton Serment Brisé</div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full max-w-[90rem] justify-items-center">
        <ClassCard id="vowbreaker" onPick={() => newRun('vowbreaker', seedOverride || undefined)} />
        <ClassCard id="sealbinder" onPick={() => newRun('sealbinder', seedOverride || undefined)} />
        <ClassCard id="whisperer" onPick={() => newRun('whisperer', seedOverride || undefined)} />
        <ClassCard id="auger" onPick={() => newRun('auger', seedOverride || undefined)} />
        <ClassCard id="summoner" onPick={() => newRun('summoner', seedOverride || undefined)} />
      </div>
      <button className="btn-ghost mt-8" onClick={() => useGame.setState({ screen: 'menu' })}>Retour</button>
    </div>
  );
};

// =====================================================
// REWARD SCREEN
// =====================================================

export const RewardScreen: React.FC = () => {
  const rewards = useGame((s) => s.rewards);
  const take = useGame((s) => s.takeReward);
  const skip = useGame((s) => s.skipCardReward);

  // Play a quiet coin + node-enter chime once when the screen mounts. The
  // ambient combat bed has already been stopped by the time we land here.
  useEffect(() => {
    sfx.nodeEnter();
  }, []);

  if (!rewards) return null;

  return (
    <div className="min-h-screen flex flex-col items-center p-8 gap-8 relative">
      {/* Soft gold glow backdrop — sells "treasure room" without changing layout */}
      <div className="absolute inset-0 pointer-events-none"
           style={{
             background:
               'radial-gradient(ellipse 60% 50% at 50% 35%, rgba(212,162,76,0.14) 0%, rgba(212,162,76,0.05) 35%, transparent 70%)',
           }} />

      <div className="relative flex flex-col items-center">
        <div className="font-display uppercase text-5xl text-vow-gold tracking-[0.25em] animate-reward-title">
          Butin
        </div>
        <div className="text-ash-300 text-sm mt-2 tracking-widest uppercase animate-reward-rise" style={{ animationDelay: '250ms' }}>
          La braise réclame son dû
        </div>
      </div>

      {/* Gold plaque — rises into place, flashes gold as it lands. */}
      <div className="relative flex items-center gap-3 animate-reward-rise" style={{ animationDelay: '400ms' }}>
        <span className="text-3xl leading-none">◉</span>
        <span>
          <span className="font-display text-3xl font-bold animate-gold-flash" style={{ animationDelay: '700ms' }}>
            +{rewards.gold}
          </span>
          <span className="ml-2 uppercase text-ash-300 tracking-widest text-xs">or</span>
        </span>
      </div>

      {/* SEQUENTIAL REWARD STEPS
          We show ONE reward at a time, in the visual order Potion → Relic
          → Cards. Forcing the player to click through each step means
          nothing gets missed and each reward gets the stage it deserves.
          Precedence: take / skip the top-most step to reveal the next. */}
      {(() => {
        // Priority: potion first (biggest visual with sprite), then relic,
        // then the card pick (which is the "main" choice, so it lands last).
        if (rewards.pending.includes('potion') && rewards.potion) {
          const potDef = getPotion(rewards.potion);
          const spriteId = resolveSprite(rewards.potion);
          const artUrl = getPotionArt(rewards.potion);
          return (
            <div
              key="potion-step"
              className="relative flex flex-col items-center gap-3 panel p-6 max-w-md animate-reward-rise border-ember-500/60"
              style={{
                animationDelay: '500ms',
                background: 'linear-gradient(180deg, rgba(42,36,28,0.97) 0%, rgba(21,19,15,0.97) 100%)',
                boxShadow: '0 0 28px rgba(249,115,22,0.35), inset 0 0 0 1px rgba(249,115,22,0.35)',
              }}
            >
              <div className="uppercase text-ember-400 text-xs tracking-[0.35em]">⚗ Potion</div>
              {/* Large painted flask artwork — pulled from the same sprite
                  sheet the HUD uses for potion slots. Falls back to a glyph
                  if the sprite can't be resolved for this potion id. */}
              <div
                className="item-button flex items-center justify-center w-40 h-40 rounded-full relative animate-reward-rise"
                style={{
                  animationDelay: '700ms',
                  background:
                    'radial-gradient(circle at 50% 40%, rgba(249,115,22,0.35) 0%, rgba(124,45,18,0.25) 45%, rgba(10,9,8,0.7) 80%)',
                  boxShadow: 'inset 0 0 26px rgba(0,0,0,0.7), 0 0 32px rgba(249,115,22,0.35)',
                }}
              >
                {artUrl ? (
                  <img src={artUrl} alt={potDef.name} className="asset-icon asset-icon-reward animate-item-acquire" />
                ) : spriteId ? (
                  <Sprite id={spriteId} w={120} h={138} title={potDef.name} />
                ) : (
                  <span className="text-7xl text-ember-400">⚗</span>
                )}
              </div>
              <div className="font-display text-3xl text-ember-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] mt-1">
                {potDef.name}
              </div>
              <div className="uppercase text-ash-300 text-[10px] tracking-[0.3em]">{itemTierLabel[potDef.rarity] ?? potDef.rarity}</div>
              <div className="text-ash-100 italic text-sm text-center leading-relaxed max-w-xs">
                {potDef.description}
              </div>
              <div className="flex gap-3 mt-3">
                <button
                  className="btn-primary px-6"
                  onClick={() => { sfx.potionUse(); take('potion'); }}
                >
                  Prendre la fiole
                </button>
                <button
                  className="px-4 py-2 rounded-md border border-ash-400 bg-ash-800/60 hover:bg-ash-700 text-ash-200 hover:text-vow-bone text-sm tracking-wider uppercase transition"
                  onClick={() => take('potion')}
                >
                  La laisser
                </button>
              </div>
            </div>
          );
        }

        if (rewards.pending.includes('relic') && rewards.relic) {
          const relDef = getRelic(rewards.relic);
          const spriteId = resolveSprite(rewards.relic);
          const artUrl = getRelicArt(rewards.relic);
          return (
            <div
              key="relic-step"
              className="relative flex flex-col items-center gap-3 panel p-6 max-w-md animate-reward-rise border-vow-gold/60"
              style={{
                animationDelay: '500ms',
                background: 'linear-gradient(180deg, rgba(42,36,28,0.97) 0%, rgba(21,19,15,0.97) 100%)',
                boxShadow: '0 0 30px rgba(212,162,76,0.35), inset 0 0 0 1px rgba(212,162,76,0.35)',
              }}
            >
              <div className="uppercase text-vow-gold text-xs tracking-[0.35em]">◈ Relique</div>
              <div
                className="item-button flex items-center justify-center w-40 h-40 rounded-full relative animate-reward-rise"
                style={{
                  animationDelay: '700ms',
                  background:
                    'radial-gradient(circle at 50% 40%, rgba(212,162,76,0.4) 0%, rgba(124,95,40,0.25) 45%, rgba(10,9,8,0.7) 80%)',
                  boxShadow: 'inset 0 0 26px rgba(0,0,0,0.7), 0 0 32px rgba(212,162,76,0.4)',
                }}
              >
                {artUrl ? (
                  <img src={artUrl} alt={relDef.name} className="asset-icon asset-icon-reward animate-item-acquire" />
                ) : spriteId ? (
                  <Sprite id={spriteId} w={120} h={120} title={relDef.name} />
                ) : (
                  <span className="text-7xl text-vow-gold">✦</span>
                )}
              </div>
              <div className="font-display text-3xl text-vow-gold drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] mt-1">
                {relDef.name}
              </div>
              <div className="uppercase text-ash-300 text-[10px] tracking-[0.3em]">{itemTierLabel[relDef.tier] ?? relDef.tier}</div>
              <div className="text-ash-100 italic text-sm text-center leading-relaxed max-w-xs">
                {relDef.description}
              </div>
              <button
                className="btn-primary mt-3 px-6"
                onClick={() => { sfx.wardGain(); take('relic'); }}
              >
                La lier à ton serment
              </button>
            </div>
          );
        }

        if (rewards.pending.includes('cards')) {
          return (
            <div key="cards-step" className="relative flex flex-col items-center gap-4 animate-reward-rise" style={{ animationDelay: '500ms' }}>
              <div className="font-display uppercase text-vow-gold tracking-[0.3em] text-sm">
                ⸻ Choisis une carte ⸻
              </div>
              <div className="flex gap-5 flex-wrap justify-center pt-2">
                {rewards.cards.map((id, i) => (
                  <div
                    key={i}
                    className="animate-reward-rise"
                    style={{ animationDelay: `${650 + i * 140}ms` }}
                  >
                    <CardView def={getCard(id)} onClick={() => { sfx.cardSelect(); take('cards', { defId: id }); }} />
                  </div>
                ))}
              </div>
              <button
                className="mt-1 px-5 py-1.5 rounded-md border border-ash-400 bg-ash-800/60 hover:bg-ash-700 hover:border-vow-gold/60 text-ash-200 hover:text-vow-bone text-sm tracking-wider uppercase transition"
                onClick={skip}
              >
                Passer — tout brûler
              </button>
            </div>
          );
        }

        // All steps resolved — the store should have already flipped the
        // screen away, but show a graceful empty beat just in case.
        return (
          <div className="relative text-ash-300 italic mt-6 animate-reward-rise">
            Le chemin s’ouvre devant toi…
          </div>
        );
      })()}
    </div>
  );
};

// =====================================================
// SHOP SCREEN
// =====================================================

type ShopItemPanelProps = {
  tone: 'relic' | 'potion';
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  disabled: boolean;
  sold?: boolean;
  onBuy?: () => void;
};

const ShopItemPanel: React.FC<ShopItemPanelProps> = ({ tone, name, description, price, imageUrl, disabled, sold, onBuy }) => {
  if (sold) {
    return (
      <div className="h-[9.25rem] rounded-md border border-ash-500/45 bg-black/20 opacity-45 italic text-center flex items-center justify-center text-ash-300">
        vendu
      </div>
    );
  }
  const isPotion = tone === 'potion';
  return (
    <div className="panel p-3 h-[9.25rem] grid grid-cols-[5rem_1fr] gap-3 items-center overflow-hidden">
      <div
        className={[
          'item-button w-20 h-20 rounded-md border flex items-center justify-center bg-ash-900/65 overflow-hidden',
          isPotion ? 'border-ember-500/70' : 'border-vow-gold/70',
        ].join(' ')}
      >
        {imageUrl ? (
          <img src={imageUrl} alt={name} className={['asset-icon', isPotion ? 'asset-icon-potion' : 'asset-icon-relic'].join(' ')} />
        ) : (
          <span className={isPotion ? 'text-4xl text-ember-400' : 'text-4xl text-vow-gold'}>{isPotion ? '⚗' : '*'}</span>
        )}
      </div>
      <div className="min-w-0 flex flex-col h-full">
        <div className={['font-display text-lg leading-tight truncate', isPotion ? 'text-ember-400' : 'text-vow-gold'].join(' ')}>
          {name}
        </div>
        <div className="text-xs text-ash-200 leading-snug mt-1 line-clamp-2">{description}</div>
        <button className="btn-primary mt-auto py-2 disabled:opacity-40" disabled={disabled} onClick={onBuy}>
          Acheter ⚜ {price}
        </button>
      </div>
    </div>
  );
};

export const ShopScreenLegacy: React.FC = () => {
  const run = useGame((s) => s.run)!;
  const leaveShop = useGame((s) => s.leaveShop);
  const [shop, setShop] = useState<ShopState>(() => useGame.getState().rollShop());
  const [removeOpen, setRemoveOpen] = useState(false);

  const buyCard = (i: number) => {
    const it = shop.cards[i];
    if (!it || run.gold < it.price) return;
    run.gold -= it.price;
    run.deck.push({ uid: `sh_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 6)}`, defId: it.defId, upgraded: false });
    shop.cards[i] = null as any;
    useGame.setState({ run: { ...run } });
    useGame.getState().persist();
    setShop({ ...shop });
  };
  const buyRelic = (i: number) => {
    const it = shop.relics[i];
    if (!it || run.gold < it.price) return;
    run.gold -= it.price;
    run.relics.push(it.relicId);
    const rd = getRelic(it.relicId);
    if (rd.hook === 'max_hp_plus_7') { run.maxHp += 7; run.hp += 7; }
    shop.relics[i] = null as any;
    useGame.setState({ run: { ...run } });
    useGame.getState().persist();
    setShop({ ...shop });
  };
  const buyPotion = (i: number) => {
    const it = shop.potions[i];
    if (!it || run.gold < it.price) return;
    const slot = run.potions.findIndex((p) => !p);
    if (slot < 0) return;
    run.gold -= it.price;
    run.potions[slot] = it.potionId;
    shop.potions[i] = null as any;
    useGame.setState({ run: { ...run } });
    useGame.getState().persist();
    setShop({ ...shop });
  };
  const openRemove = () => {
    if (shop.removeService.used || run.gold < shop.removeService.price) return;
    setRemoveOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col p-6 gap-4">
      <div className="flex items-center gap-4">
        <div className="font-display text-4xl text-vow-gold">Le Marchand Silencieux</div>
        <div className="ml-auto text-vow-gold text-lg">⚜ {run.gold}</div>
      </div>
      <p className="italic text-ash-300">Il ne dit rien, mais il se souvient de chaque pièce.</p>

      <div className="mt-2">
        <div className="font-display text-xl text-ash-100 mb-2">Cartes</div>
        <div className="flex gap-3 flex-wrap">
          {shop.cards.map((c, i) => c ? (
            <div key={i} className="flex flex-col items-center gap-1">
              <CardView def={getCard(c.defId)} disabled={run.gold < c.price} onClick={() => buyCard(i)} />
              <span className={['text-sm', run.gold >= c.price ? 'text-vow-gold' : 'text-ash-500'].join(' ')}>⚜ {c.price}</span>
            </div>
          ) : <div key={i} className="w-44 h-60 opacity-40 italic text-center flex items-center justify-center border border-ash-500 rounded text-ash-400">vendu</div>)}
        </div>
      </div>

      <div className="mt-2">
        <div className="font-display text-xl text-ash-100 mb-2">Reliques</div>
        <div className="flex gap-3 flex-wrap">
          {shop.relics.map((r, i) => r ? (
            <div key={i} className="panel p-3 w-60 flex flex-col gap-1">
              <div className="font-display text-lg text-vow-gold">{getRelic(r.relicId).name}</div>
              <div className="text-xs text-ash-200">{getRelic(r.relicId).description}</div>
              <button className="btn-primary mt-2 disabled:opacity-40" disabled={run.gold < r.price} onClick={() => buyRelic(i)}>Acheter ⚜ {r.price}</button>
            </div>
          ) : <div key={i} className="w-60 h-28 opacity-40 italic text-center flex items-center justify-center border border-ash-500 rounded">vendu</div>)}
        </div>
      </div>

      <div className="mt-2">
        <div className="font-display text-xl text-ash-100 mb-2">Potions</div>
        <div className="flex gap-3 flex-wrap">
          {shop.potions.map((p, i) => p ? (
            <div key={i} className="panel p-3 w-60 flex flex-col gap-1">
              <div className="font-display text-lg text-ember-400">{getPotion(p.potionId).name}</div>
              <div className="text-xs text-ash-200">{getPotion(p.potionId).description}</div>
              <button className="btn-primary mt-2 disabled:opacity-40" disabled={run.gold < p.price || run.potions.every((x) => x)} onClick={() => buyPotion(i)}>Acheter ⚜ {p.price}</button>
            </div>
          ) : <div key={i} className="w-60 h-28 opacity-40 italic text-center flex items-center justify-center border border-ash-500 rounded">vendu</div>)}
        </div>
      </div>

      <div className="panel p-3 mt-3">
        <div className="font-display text-xl text-ash-100 mb-1">Services</div>
        <button
          disabled={shop.removeService.used || run.gold < shop.removeService.price}
          className="btn disabled:opacity-40"
          onClick={openRemove}
        >Retirer une carte du deck — ⚜ {shop.removeService.price}</button>
      </div>

      <button className="btn-primary mt-4 w-fit" onClick={leaveShop}>Partir</button>

      {removeOpen && (
        <DeckPicker
          title="Choisis une carte à retirer"
          cards={run.deck}
          filter={(c) => getCard(c.defId).rarity !== 'starter'}
          onPick={(uid) => {
            run.gold -= shop.removeService.price;
            useGame.getState().removeCardFromDeck(uid);
            shop.removeService.used = true;
            useGame.setState({ run: { ...useGame.getState().run! } });
            setShop({ ...shop });
            setRemoveOpen(false);
          }}
          onCancel={() => setRemoveOpen(false)}
        />
      )}
    </div>
  );
};

export const ShopScreen: React.FC = () => {
  const run = useGame((s) => s.run)!;
  const leaveShop = useGame((s) => s.leaveShop);
  const [shop, setShop] = useState<ShopState>(() => useGame.getState().rollShop());
  const [removeOpen, setRemoveOpen] = useState(false);

  const buyCard = (i: number) => {
    const it = shop.cards[i];
    if (!it || run.gold < it.price) return;
    run.gold -= it.price;
    run.deck.push({ uid: `sh_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 6)}`, defId: it.defId, upgraded: false });
    shop.cards[i] = null as any;
    useGame.setState({ run: { ...run } });
    useGame.getState().persist();
    setShop({ ...shop });
  };
  const buyRelic = (i: number) => {
    const it = shop.relics[i];
    if (!it || run.gold < it.price) return;
    run.gold -= it.price;
    run.relics.push(it.relicId);
    const rd = getRelic(it.relicId);
    if (rd.hook === 'max_hp_plus_7') { run.maxHp += 7; run.hp += 7; }
    shop.relics[i] = null as any;
    useGame.setState({ run: { ...run } });
    useGame.getState().persist();
    setShop({ ...shop });
  };
  const buyPotion = (i: number) => {
    const it = shop.potions[i];
    if (!it || run.gold < it.price) return;
    const slot = run.potions.findIndex((p) => !p);
    if (slot < 0) return;
    run.gold -= it.price;
    run.potions[slot] = it.potionId;
    shop.potions[i] = null as any;
    useGame.setState({ run: { ...run } });
    useGame.getState().persist();
    setShop({ ...shop });
  };
  const openRemove = () => {
    if (shop.removeService.used || run.gold < shop.removeService.price) return;
    setRemoveOpen(true);
  };

  return (
    <div className="min-h-screen max-h-screen overflow-hidden flex flex-col p-5 gap-3">
      <div className="flex items-start gap-4">
        <div>
          <div className="font-display text-4xl text-vow-gold leading-none">Le Marchand Silencieux</div>
          <p className="italic text-ash-300 mt-3">Il ne dit rien, mais il se souvient de chaque piece.</p>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <div className="text-vow-gold text-xl">⚜ {run.gold}</div>
          <button className="btn-primary px-6" onClick={leaveShop}>Partir</button>
        </div>
      </div>

      <div className="flex-1 min-h-0 grid grid-rows-[auto_1fr] gap-3">
        <section>
          <div className="font-display text-xl text-ash-100 mb-2">Cartes</div>
          <div className="flex gap-3 flex-nowrap overflow-visible">
            {shop.cards.map((c, i) => c ? (
              <div key={i} className="flex flex-col items-center gap-1 shrink-0">
                <CardView def={getCard(c.defId)} size="sm" disabled={run.gold < c.price} onClick={() => buyCard(i)} />
                <span className={['text-base font-bold', run.gold >= c.price ? 'text-vow-gold' : 'text-ash-500'].join(' ')}>⚜ {c.price}</span>
              </div>
            ) : (
              <div key={i} className="w-32 h-44 opacity-40 italic text-center flex items-center justify-center border border-ash-500 rounded text-ash-400 shrink-0">vendu</div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-[1fr_1fr_18rem] gap-4 min-h-0">
          <section>
            <div className="font-display text-xl text-ash-100 mb-2">Reliques</div>
            <div className="grid grid-rows-2 gap-3">
              {shop.relics.map((r, i) => {
                if (!r) return <ShopItemPanel key={i} tone="relic" name="Vendu" description="" price={0} disabled sold />;
                const relic = getRelic(r.relicId);
                return (
                  <ShopItemPanel
                    key={i}
                    tone="relic"
                    name={relic.name}
                    description={relic.description}
                    price={r.price}
                    imageUrl={getRelicArt(r.relicId)}
                    disabled={run.gold < r.price}
                    onBuy={() => buyRelic(i)}
                  />
                );
              })}
            </div>
          </section>

          <section>
            <div className="font-display text-xl text-ash-100 mb-2">Potions</div>
            <div className="grid grid-rows-2 gap-3">
              {shop.potions.map((p, i) => {
                if (!p) return <ShopItemPanel key={i} tone="potion" name="Vendu" description="" price={0} disabled sold />;
                const potion = getPotion(p.potionId);
                return (
                  <ShopItemPanel
                    key={i}
                    tone="potion"
                    name={potion.name}
                    description={potion.description}
                    price={p.price}
                    imageUrl={getPotionArt(p.potionId)}
                    disabled={run.gold < p.price || run.potions.every((x) => x)}
                    onBuy={() => buyPotion(i)}
                  />
                );
              })}
            </div>
          </section>

          <section className="panel p-4 h-fit self-start">
            <div className="font-display text-xl text-ash-100 mb-2">Services</div>
            <button
              disabled={shop.removeService.used || run.gold < shop.removeService.price}
              className="btn disabled:opacity-40 w-full text-left"
              onClick={openRemove}
            >
              Retirer une carte du deck<br />
              <span className="text-vow-gold">⚜ {shop.removeService.price}</span>
            </button>
          </section>
        </div>
      </div>

      {removeOpen && (
        <DeckPicker
          title="Choisis une carte a retirer"
          cards={run.deck}
          filter={(c) => getCard(c.defId).rarity !== 'starter'}
          onPick={(uid) => {
            run.gold -= shop.removeService.price;
            useGame.getState().removeCardFromDeck(uid);
            shop.removeService.used = true;
            useGame.setState({ run: { ...useGame.getState().run! } });
            setShop({ ...shop });
            setRemoveOpen(false);
          }}
          onCancel={() => setRemoveOpen(false)}
        />
      )}
    </div>
  );
};

// =====================================================
// REST SCREEN
// =====================================================

export const RestScreen: React.FC = () => {
  const rest = useGame((s) => s.rest);
  const run = useGame((s) => s.run)!;
  const healAmt = Math.floor(run.maxHp * 0.3) + (run.relics.includes('rel_hearth_of_sanctum') ? 10 : 0);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="font-display text-5xl text-ember-400 mb-2">Le Foyer</div>
      <div className="text-ash-300 italic mb-8">Un petit feu garde un petit espoir.</div>
      <div className="flex gap-6">
        <button className="panel p-6 w-56 text-center hover:border-emerald-400 transition-colors" onClick={() => rest('heal')}>
          <div className="text-4xl">❤</div>
          <div className="font-display text-xl mt-2">Soigner</div>
          <div className="text-ash-200 text-sm mt-1">Récupère {healAmt} PV.</div>
        </button>
        <button className="panel p-6 w-56 text-center hover:border-vow-gold transition-colors" onClick={() => rest('upgrade')}>
          <div className="text-4xl">⚒</div>
          <div className="font-display text-xl mt-2">Forger</div>
          <div className="text-ash-200 text-sm mt-1">Améliore définitivement une carte.</div>
        </button>
      </div>
    </div>
  );
};

// =====================================================
// EVENT SCREEN
// =====================================================

export const EventScreen: React.FC = () => {
  const run = useGame((s) => s.run)!;
  const resolve = useGame((s) => s.resolveEventOption);
  const node = run.map.nodes[run.currentNodeId!];
  const ev = getEvent(node.data?.eventId ?? '');
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="panel p-6 max-w-2xl">
        <div className="font-display text-3xl text-vow-gold mb-2">{ev.title}</div>
        <p className="text-ash-100 italic mb-5">{ev.body}</p>
        <div className="flex flex-col gap-2">
          {ev.options.map((o, i) => (
            <button key={i} disabled={!!o.disabled?.(run)} onClick={() => resolve(i)} className="btn text-left disabled:opacity-40 disabled:cursor-not-allowed">
              {o.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// =====================================================
// TREASURE SCREEN
// =====================================================

export const TreasureScreen: React.FC = () => {
  const take = useGame((s) => s.takeTreasure);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="font-display text-5xl text-vow-gold mb-4">Un Reliquaire</div>
      <div className="text-ash-200 italic mb-6">Une boîte de fer, encore chaude.</div>
      <button className="btn-primary text-xl px-8 py-3" onClick={take}>Ouvrir</button>
    </div>
  );
};

// =====================================================
// DECK VIEWER (modal)
// =====================================================

export const DeckViewer: React.FC = () => {
  const run = useGame((s) => s.run)!;
  const close = useGame((s) => s.closeModal);
  const byRarity = (r: string) => run.deck.filter((c) => getCard(c.defId).rarity === r);

  return (
    <div className="fixed inset-0 bg-black/80 z-40 flex flex-col items-center p-4 overflow-auto scrollbar-ember">
      <div className="panel p-4 w-full max-w-6xl">
        <div className="flex items-center">
          <div className="font-display text-2xl text-vow-gold">Ton deck ({run.deck.length})</div>
          <button className="btn-ghost ml-auto" onClick={close}>Fermer</button>
        </div>
        {['starter','common','uncommon','rare','curse','status'].map((r) => {
          const group = byRarity(r);
          if (!group.length) return null;
          return (
            <div key={r} className="mt-3">
              <div className="text-ash-300 uppercase tracking-widest text-xs mb-1">{rarityLabel[r] ?? r}</div>
              <div className="flex flex-wrap gap-2">
                {group.map((c) => (
                  <CardView key={c.uid} def={getCard(c.defId)} upgraded={c.upgraded} size="sm" />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// =====================================================
// DECK PICKER (for remove/upgrade)
// =====================================================

interface DeckPickerProps {
  title: string;
  cards: { uid: string; defId: string; upgraded: boolean }[];
  filter?: (c: { uid: string; defId: string; upgraded: boolean }) => boolean;
  onPick: (uid: string) => void;
  onCancel?: () => void;
  showUpgradePreview?: boolean;
}

export const DeckPicker: React.FC<DeckPickerProps> = ({ title, cards, filter, onPick, onCancel, showUpgradePreview }) => {
  const [showForgedDetails, setShowForgedDetails] = useState(false);
  const list = filter ? cards.filter(filter) : cards;
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center p-4 overflow-auto scrollbar-ember">
      <div className="panel p-4 w-full max-w-6xl">
        <div className="flex items-center gap-4">
          <div className="font-display text-2xl text-vow-gold">{title}</div>
          {showUpgradePreview && (
            <label className="flex items-center gap-2 rounded border border-vow-gold/40 bg-black/25 px-3 py-2 text-sm text-ash-100 cursor-pointer select-none">
              <input
                type="checkbox"
                className="accent-ember-600"
                checked={showForgedDetails}
                onChange={(e) => setShowForgedDetails(e.currentTarget.checked)}
              />
              Voir les détails forgés
            </label>
          )}
          {onCancel && <button className="btn-ghost ml-auto" onClick={onCancel}>Annuler</button>}
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {list.map((c) => {
            const def = getCard(c.defId);
            const previewDef = showUpgradePreview && showForgedDetails && def.upgradeTo ? getCard(def.upgradeTo) : def;
            return (
              <CardView key={c.uid} def={previewDef} upgraded={c.upgraded} size="sm" onClick={() => onPick(c.uid)} />
            );
          })}
          {!list.length && <div className="text-ash-300 italic">Aucune carte éligible.</div>}
        </div>
      </div>
    </div>
  );
};

// =====================================================
// GAME OVER / VICTORY
// =====================================================

export const GameOverScreen: React.FC = () => (
  <div className="min-h-screen flex flex-col items-center justify-center p-6">
    <div className="font-display text-6xl text-vow-blood drop-shadow-[0_0_14px_rgba(139,30,43,0.5)] mb-2">Le Serment se brise.</div>
    <div className="text-ash-300 italic mb-8">Tes braises s’éteignent dans l’obscurité.</div>
    <div className="flex gap-3">
      <button className="btn-primary" onClick={() => useGame.setState({ screen: 'class_select' })}>Réessayer</button>
      <button className="btn" onClick={() => useGame.setState({ screen: 'menu' })}>Menu principal</button>
    </div>
  </div>
);

export const VictoryScreen: React.FC = () => {
  const meta = useGame((s) => s.meta);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="font-display text-6xl text-vow-gold drop-shadow-[0_0_16px_rgba(212,162,76,0.5)] mb-2">Serment Repris.</div>
      <div className="text-ash-100 italic mb-8">Le Maître de Chœur se tait. Quelque part, une porte se souvient de toi.</div>
      <div className="text-ash-200 text-sm mb-6">Victoires — Vowbreaker : {meta.wins.vowbreaker ?? 0} · Sealbinder : {meta.wins.sealbinder ?? 0} · Whisperer : {meta.wins.whisperer ?? 0} · Auger : {meta.wins.auger ?? 0} · Summoner : {meta.wins.summoner ?? 0}</div>
      <div className="flex gap-3">
        <button className="btn-primary" onClick={() => useGame.setState({ screen: 'class_select' })}>Nouvelle tentative</button>
        <button className="btn" onClick={() => useGame.setState({ screen: 'menu' })}>Menu principal</button>
      </div>
    </div>
  );
};





