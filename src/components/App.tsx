// EMBERVOW — top-level screen router + modal overlay.

import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../state/game';
import { MainMenu, ClassSelect, RewardScreen, ShopScreen, RestScreen, EventScreen, TreasureScreen, DeckViewer, DeckPicker, GameOverScreen, VictoryScreen, HelpScreen } from './Screens';
import { MapView } from './MapView';
import { CombatScreen } from './Combat';
import { SpriteCalibrator } from './SpriteCalibrator';
import { getCard } from '../data/cards';
import { setAmbienceMode, startAmbience, stopAmbience, type MusicMood } from '../systems/sound';

function musicMoodForScreen(screen: string): MusicMood {
  if (screen === 'combat') return 'combat';
  if (screen === 'map' || screen === 'class_select') return 'map';
  if (screen === 'shop' || screen === 'rest' || screen === 'treasure') return 'sanctuary';
  if (screen === 'event' || screen === 'help' || screen === 'settings') return 'event';
  if (screen === 'reward') return 'reward';
  if (screen === 'victory') return 'victory';
  if (screen === 'game_over') return 'defeat';
  return 'menu';
}

const App: React.FC = () => {
  const screen = useGame((s) => s.screen);
  const modal = useGame((s) => s.modal);
  const run = useGame((s) => s.run);
  const latestMusicMood = useRef<MusicMood>(musicMoodForScreen(screen));
  latestMusicMood.current = musicMoodForScreen(screen);

  // URL-gated sprite calibration overlay. Open by appending ?sprites=1,
  // or press Shift+S anywhere.
  const [showSprites, setShowSprites] = useState(
    () => typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('sprites'),
  );
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.shiftKey && (e.key === 'S' || e.key === 's')) setShowSprites((v) => !v);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    let started = false;
    const bootAmbience = () => {
      if (started) return;
      started = true;
      startAmbience(latestMusicMood.current);
    };

    window.addEventListener('pointerdown', bootAmbience, { once: true });
    window.addEventListener('keydown', bootAmbience, { once: true });
    return () => {
      window.removeEventListener('pointerdown', bootAmbience);
      window.removeEventListener('keydown', bootAmbience);
      stopAmbience();
    };
  }, []);

  useEffect(() => {
    setAmbienceMode(musicMoodForScreen(screen));
  }, [screen]);

  let view: React.ReactNode = null;
  switch (screen) {
    case 'menu': view = <MainMenu />; break;
    case 'help': view = <HelpScreen />; break;
    case 'class_select': view = <ClassSelect />; break;
    case 'map': view = <MapView />; break;
    case 'combat': view = <CombatScreen />; break;
    case 'reward': view = <RewardScreen />; break;
    case 'shop': view = <ShopScreen />; break;
    case 'rest': view = <RestScreen />; break;
    case 'event': view = <EventScreen />; break;
    case 'treasure': view = <TreasureScreen />; break;
    case 'game_over': view = <GameOverScreen />; break;
    case 'victory': view = <VictoryScreen />; break;
    default: view = <MainMenu />;
  }

  return (
    <div className="min-h-screen">
      {view}
      {modal?.kind === 'deck' && <DeckViewer />}
      {modal?.kind === 'pick_card_to_upgrade' && run && (
        <DeckPicker
          title="Choisis une carte à améliorer"
          cards={run.deck}
          filter={(c) => {
            const d = getCard(c.defId);
            return !!d.upgradeTo && !c.upgraded;
          }}
          onPick={modal.onPick}
          onCancel={() => useGame.setState({ modal: null })}
          showUpgradePreview
        />
      )}
      {modal?.kind === 'pick_card_to_remove' && run && (
        <DeckPicker
          title="Choisis une carte à retirer"
          cards={run.deck}
          filter={(c) => {
            const d = getCard(c.defId);
            return d.rarity !== 'starter';
          }}
          onPick={modal.onPick}
          onCancel={() => useGame.setState({ modal: null })}
        />
      )}
      {showSprites && <SpriteCalibrator onClose={() => setShowSprites(false)} />}
    </div>
  );
};

export default App;
