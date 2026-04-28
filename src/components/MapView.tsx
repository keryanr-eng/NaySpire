// EMBERVOW - Run map (node-graph visual).
//
// Floors are drawn bottom-up. Nodes are clickable only when they are valid
// next path choices, or when the run has not picked its first node yet.

import React from 'react';
import { useGame } from '../state/game';
import { nextChoices } from '../systems/map';
import type { MapNode, NodeKind } from '../types';
import { getPotion } from '../data/potions';
import { getRelic } from '../data/relics';
import { resolveSprite } from '../assets/sprites';
import { getPotionArt, getRelicArt } from '../assets/generatedAssets';
import { Sprite } from './Sprite';
import { Tooltip, TooltipBody } from './Tooltip';
import { publicAsset } from '../assets/paths';

const nodeSymbol: Record<NodeKind, string> = {
  combat: 'X',
  elite: '!',
  boss: '*',
  event: '?',
  rest: '~',
  merchant: '$',
  treasure: '◇',
};

const nodeColor: Record<NodeKind, string> = {
  combat: 'from-ash-700 to-ash-800 border-ash-400 text-ash-100',
  elite: 'from-vow-blood/40 to-ash-900 border-vow-blood text-vow-blood',
  boss: 'from-ember-700 to-ember-900 border-vow-gold text-ash-100',
  event: 'from-vow-seal/30 to-ash-900 border-vow-seal text-vow-seal',
  rest: 'from-emerald-900/50 to-ash-900 border-emerald-400 text-emerald-300',
  merchant: 'from-yellow-900/50 to-ash-900 border-vow-gold text-vow-gold',
  treasure: 'from-purple-900/40 to-ash-900 border-purple-400 text-purple-300',
};

const nodeIcon: Record<NodeKind, string> = {
  combat: publicAsset('assets/generated/map/node_combat.png'),
  elite: publicAsset('assets/generated/map/node_elite.png'),
  boss: publicAsset('assets/generated/map/node_boss.png'),
  event: publicAsset('assets/generated/map/node_event.png'),
  rest: publicAsset('assets/generated/map/node_rest.png'),
  merchant: publicAsset('assets/generated/map/node_merchant.png'),
  treasure: publicAsset('assets/generated/map/node_treasure.png'),
};

const nodeLabel: Record<NodeKind, string> = {
  combat: 'Combat',
  elite: 'Elite',
  boss: 'Boss',
  event: 'Evenement',
  rest: 'Repos',
  merchant: 'Marchand',
  treasure: 'Tresor',
};

const relicTierLabel: Record<string, string> = {
  starter: 'Depart',
  common: 'Commune',
  uncommon: 'Peu commune',
  rare: 'Rare',
  boss: 'Boss',
};

const rarityLabel: Record<string, string> = {
  common: 'Commune',
  uncommon: 'Peu commune',
  rare: 'Rare',
};

const CELL_W = 110;
const CELL_H = 78;
const COLS = 5;

const HeaderInventoryIcon: React.FC<{
  title: string;
  subtitle?: string;
  description?: string;
  spriteId?: string | null;
  imageUrl?: string;
  empty?: boolean;
  children?: React.ReactNode;
}> = ({ title, subtitle, description, spriteId, imageUrl, empty, children }) => {
  const fallbackTitle = [title, subtitle, description].filter(Boolean).join('\n');

  return (
    <Tooltip
      placement="bottom"
      maxWidth={300}
      content={<TooltipBody title={title} subtitle={subtitle} desc={description} />}
    >
      <span
        title={fallbackTitle}
        className={[
          'item-button w-9 h-9 rounded-full border flex items-center justify-center cursor-help overflow-hidden',
          'bg-ash-900/80 shadow-[0_2px_10px_rgba(0,0,0,0.55)]',
          empty
            ? 'border-ash-500 text-ash-500 opacity-70'
            : 'border-vow-gold/70 text-vow-bone hover:border-vow-gold hover:shadow-glow',
        ].join(' ')}
      >
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="asset-icon asset-icon-map" />
        ) : spriteId ? (
          <Sprite id={spriteId} w={26} h={26} title={title} />
        ) : children}
      </span>
    </Tooltip>
  );
};

export const MapView: React.FC = () => {
  const run = useGame((s) => s.run);
  const chooseNode = useGame((s) => s.chooseNode);
  const openDeck = () => useGame.setState({ modal: { kind: 'deck' } });

  if (!run) return null;

  const reachable = new Set(nextChoices(run.map, run.currentNodeId).map((n) => n.id));
  const floors: MapNode[][] = [];
  for (const id in run.map.nodes) {
    const node = run.map.nodes[id];
    floors[node.floor] = floors[node.floor] ?? [];
    floors[node.floor].push(node);
  }

  const totalFloors = floors.length;
  const svgW = COLS * CELL_W + 40;
  const svgH = totalFloors * CELL_H + 40;

  function pos(node: MapNode): { x: number; y: number } {
    const yFromTop = totalFloors - 1 - node.floor;
    return {
      x: 20 + node.col * CELL_W + CELL_W / 2,
      y: 20 + yFromTop * CELL_H + CELL_H / 2,
    };
  }

  const currentPos = run.currentNodeId ? pos(run.map.nodes[run.currentNodeId]) : null;

  return (
    <div className="min-h-screen flex flex-col">
      <div className="panel m-3 p-3 flex items-center gap-4">
        <div className="font-display text-2xl text-vow-gold">EMBERVOW</div>
        <div className="text-sm text-ash-200">
          Acte {run.act} - Etage {run.floor}/{run.map.floors - 1}
        </div>

        <div className="ml-auto flex items-center gap-3 text-sm">
          <span>Coeur <b>{run.hp}</b>/{run.maxHp}</span>
          <span className="text-vow-gold">Or {run.gold}</span>
          <span className="text-ember-400" title="Taille du deck">Deck {run.deck.length}</span>

          <div className="flex items-center gap-1.5 max-w-[34rem] flex-wrap justify-end">
            {run.relics.map((id) => {
              const relic = getRelic(id);
              return (
                <HeaderInventoryIcon
                  key={id}
                  title={relic.name}
                  subtitle={`Relique - ${relicTierLabel[relic.tier] ?? relic.tier}`}
                  description={relic.description}
                  imageUrl={getRelicArt(id)}
                  spriteId={resolveSprite(id)}
                />
              );
            })}

            {run.potions.map((id, index) => {
              if (!id) {
                return (
                  <HeaderInventoryIcon
                    key={`empty-potion-${index}`}
                    title="Emplacement vide"
                    subtitle="Potion"
                    description="Aucune potion dans cet emplacement."
                    empty
                  >
                    <span className="text-lg leading-none">.</span>
                  </HeaderInventoryIcon>
                );
              }

              const potion = getPotion(id);
              return (
                <HeaderInventoryIcon
                  key={`${id}-${index}`}
                  title={potion.name}
                  subtitle={`Potion - ${rarityLabel[potion.rarity] ?? potion.rarity}`}
                  description={potion.description}
                  imageUrl={getPotionArt(id)}
                  spriteId={resolveSprite(id)}
                />
              );
            })}
          </div>

          <button className="btn" onClick={openDeck}>Deck</button>
          <button className="btn-ghost" onClick={() => useGame.setState({ screen: 'menu' })}>Menu</button>
        </div>
      </div>

      <div className="flex-1 overflow-auto scrollbar-ember flex justify-center p-6">
        <div className="relative" style={{ width: svgW, height: svgH }}>
          <svg width={svgW} height={svgH} className="absolute inset-0 pointer-events-none">
            {floors.flat().map((node) => node.children.map((childId) => {
              const a = pos(node);
              const b = pos(run.map.nodes[childId]);
              const dim = !node.visited && !reachable.has(node.id);
              return (
                <line
                  key={`${node.id}-${childId}`}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={dim ? '#3a3228' : '#7a6a58'}
                  strokeWidth={2}
                  strokeDasharray={node.visited || reachable.has(node.id) ? '' : '3 4'}
                />
              );
            }))}
          </svg>

          {floors.flat().map((node) => {
            const p = pos(node);
            const clickable = reachable.has(node.id);
            const visited = !!node.visited;
            return (
              <button
                key={node.id}
                onClick={() => clickable && chooseNode(node.id)}
                disabled={!clickable}
                className={[
                  'absolute w-16 h-16 -ml-8 -mt-8 rounded-full',
                  'flex items-center justify-center transition-all',
                  clickable ? 'shadow-glow hover:scale-110' : '',
                  visited ? 'opacity-40 grayscale' : '',
                  !clickable && !visited ? 'opacity-65 grayscale-[0.25]' : '',
                ].join(' ')}
                style={{ left: p.x, top: p.y }}
                title={nodeLabel[node.kind]}
              >
                <img
                  src={nodeIcon[node.kind]}
                  alt={nodeLabel[node.kind]}
                  className="w-full h-full object-contain pointer-events-none drop-shadow-[0_0_12px_rgba(212,162,76,0.32)]"
                />
              </button>
            );
          })}

          {currentPos && (
            <div
              className="absolute w-16 h-16 -ml-8 -mt-8 rounded-full border-2 border-vow-gold animate-pulse pointer-events-none"
              style={{ left: currentPos.x, top: currentPos.y }}
            />
          )}
        </div>
      </div>

      <div className="panel m-3 mt-0 p-2 flex flex-wrap gap-3 text-xs justify-center text-ash-200">
        <span>X Combat</span>
        <span>! Elite</span>
        <span>? Evenement</span>
        <span>~ Repos</span>
        <span>$ Marchand</span>
        <span>◇ Tresor</span>
        <span className="text-vow-gold">* Boss</span>
      </div>
    </div>
  );
};
