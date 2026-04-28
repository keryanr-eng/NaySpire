import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const ARENA_URL = '/assets/arena.png';
export const SceneBackdrop = () => (_jsxs("div", { className: "absolute inset-0 pointer-events-none overflow-hidden", style: { zIndex: 0 }, "aria-hidden": true, children: [_jsx("div", { className: "absolute inset-0", style: {
                backgroundImage: `url('${ARENA_URL}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                filter: 'brightness(0.5) saturate(0.8) contrast(1.1)',
            } }), _jsx("div", { className: "absolute inset-0", style: { background: 'rgba(0,0,0,0.48)' } }), _jsx("div", { className: "absolute inset-0", style: {
                background: 'radial-gradient(ellipse at 50% 55%, transparent 28%, rgba(0,0,0,0.45) 65%, rgba(0,0,0,0.85) 95%)',
            } }), _jsx("div", { className: "absolute inset-0", style: {
                background: 'radial-gradient(ellipse 120% 110% at 50% 50%, transparent 50%, rgba(0,0,0,0.5) 100%)',
            } }), _jsx("svg", { viewBox: "0 0 1400 700", preserveAspectRatio: "xMidYMid slice", className: "absolute inset-0 w-full h-full opacity-75", children: _jsx("g", { children: Array.from({ length: 14 }).map((_, i) => {
                    const cx = (i * 97) % 1400;
                    const cy = 120 + ((i * 53) % 400);
                    const r = 1 + (i % 3) * 0.5;
                    return (_jsxs("circle", { cx: cx, cy: cy, r: r, fill: "#fb923c", children: [_jsx("animate", { attributeName: "opacity", values: "0;0.8;0", dur: `${3 + (i % 4)}s`, repeatCount: "indefinite", begin: `${i * 0.3}s` }), _jsx("animate", { attributeName: "cy", values: `${cy};${cy - 40};${cy - 80}`, dur: `${3 + (i % 4)}s`, repeatCount: "indefinite", begin: `${i * 0.3}s` })] }, i));
                }) }) })] }));
// -------------------------------------------------------------------------
// StageFloor — middle compositional layer: sits on top of the backdrop
// and behind the combatants. All the geometry is pinned to GROUND_LINE_PX
// so the shared ground plane is a single source of truth, and every
// grounding effect — the warm wash, the shadow pool, the implied line —
// sits at the same y as the combatants' feet.
// -------------------------------------------------------------------------
export const GROUND_LINE_PX = 96;
export const StageFloor = () => (_jsxs("div", { className: "absolute inset-0 pointer-events-none overflow-hidden", style: { zIndex: 1 }, "aria-hidden": true, children: [_jsx("div", { className: "absolute inset-0", style: {
                background: 'radial-gradient(ellipse 45% 38% at 50% 60%, rgba(249,115,22,0.12) 0%, rgba(249,115,22,0.05) 42%, transparent 70%)',
            } }), _jsx("div", { className: "absolute inset-x-0 top-0 h-2/5", style: {
                background: 'linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.15) 70%, rgba(0,0,0,0) 100%)',
            } }), _jsx("div", { className: "absolute inset-x-0", style: {
                bottom: 0,
                height: `${GROUND_LINE_PX * 2.4}px`,
                background: 'radial-gradient(ellipse 40% 55% at 50% 90%, rgba(249,115,22,0.22) 0%, rgba(249,115,22,0.07) 45%, transparent 80%)',
            } }), _jsx("div", { className: "absolute inset-x-0", style: {
                bottom: 0,
                height: `${GROUND_LINE_PX * 1.8}px`,
                background: 'radial-gradient(ellipse 50% 75% at 50% 100%, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 50%, transparent 85%)',
            } }), _jsx("div", { className: "absolute inset-x-[8%] h-[2px]", style: {
                bottom: `${GROUND_LINE_PX}px`,
                background: 'linear-gradient(90deg, transparent 0%, rgba(249,115,22,0.28) 35%, rgba(249,115,22,0.45) 50%, rgba(249,115,22,0.28) 65%, transparent 100%)',
                filter: 'blur(1.5px)',
            } })] }));
