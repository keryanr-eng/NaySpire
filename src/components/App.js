import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// EMBERVOW — top-level screen router + modal overlay.
import { useState, useEffect, useRef } from 'react';
import { useGame } from '../state/game';
import { MainMenu, ClassSelect, RewardScreen, ShopScreen, RestScreen, EventScreen, TreasureScreen, DeckViewer, DeckPicker, GameOverScreen, VictoryScreen, HelpScreen } from './Screens';
import { MapView } from './MapView';
import { CombatScreen } from './Combat';
import { SpriteCalibrator } from './SpriteCalibrator';
import { getCard } from '../data/cards';
import { setAmbienceMode, startAmbience, stopAmbience } from '../systems/sound';
function musicMoodForScreen(screen) {
    if (screen === 'combat')
        return 'combat';
    if (screen === 'map' || screen === 'class_select')
        return 'map';
    if (screen === 'shop' || screen === 'rest' || screen === 'treasure')
        return 'sanctuary';
    if (screen === 'event' || screen === 'help' || screen === 'settings')
        return 'event';
    if (screen === 'reward')
        return 'reward';
    if (screen === 'victory')
        return 'victory';
    if (screen === 'game_over')
        return 'defeat';
    return 'menu';
}
const App = () => {
    const screen = useGame((s) => s.screen);
    const modal = useGame((s) => s.modal);
    const run = useGame((s) => s.run);
    const latestMusicMood = useRef(musicMoodForScreen(screen));
    latestMusicMood.current = musicMoodForScreen(screen);
    // URL-gated sprite calibration overlay. Open by appending ?sprites=1,
    // or press Shift+S anywhere.
    const [showSprites, setShowSprites] = useState(() => typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('sprites'));
    useEffect(() => {
        const onKey = (e) => {
            if (e.shiftKey && (e.key === 'S' || e.key === 's'))
                setShowSprites((v) => !v);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);
    useEffect(() => {
        let started = false;
        const bootAmbience = () => {
            if (started)
                return;
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
    let view = null;
    switch (screen) {
        case 'menu':
            view = _jsx(MainMenu, {});
            break;
        case 'help':
            view = _jsx(HelpScreen, {});
            break;
        case 'class_select':
            view = _jsx(ClassSelect, {});
            break;
        case 'map':
            view = _jsx(MapView, {});
            break;
        case 'combat':
            view = _jsx(CombatScreen, {});
            break;
        case 'reward':
            view = _jsx(RewardScreen, {});
            break;
        case 'shop':
            view = _jsx(ShopScreen, {});
            break;
        case 'rest':
            view = _jsx(RestScreen, {});
            break;
        case 'event':
            view = _jsx(EventScreen, {});
            break;
        case 'treasure':
            view = _jsx(TreasureScreen, {});
            break;
        case 'game_over':
            view = _jsx(GameOverScreen, {});
            break;
        case 'victory':
            view = _jsx(VictoryScreen, {});
            break;
        default: view = _jsx(MainMenu, {});
    }
    return (_jsxs("div", { className: "min-h-screen", children: [view, modal?.kind === 'deck' && _jsx(DeckViewer, {}), modal?.kind === 'pick_card_to_upgrade' && run && (_jsx(DeckPicker, { title: "Choisis une carte \u00E0 am\u00E9liorer", cards: run.deck, filter: (c) => {
                    const d = getCard(c.defId);
                    return !!d.upgradeTo && !c.upgraded;
                }, onPick: modal.onPick, onCancel: () => useGame.setState({ modal: null }), showUpgradePreview: true })), modal?.kind === 'pick_card_to_remove' && run && (_jsx(DeckPicker, { title: "Choisis une carte \u00E0 retirer", cards: run.deck, filter: (c) => {
                    const d = getCard(c.defId);
                    return d.rarity !== 'starter';
                }, onPick: modal.onPick, onCancel: () => useGame.setState({ modal: null }) })), showSprites && _jsx(SpriteCalibrator, { onClose: () => setShowSprites(false) })] }));
};
export default App;
