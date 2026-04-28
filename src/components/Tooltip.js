import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// EMBERVOW — styled hover tooltip.
// Uses position:fixed + viewport-aware placement so the tooltip can never
// clip off the edge of the screen, even when the trigger is in a corner.
import { useLayoutEffect, useRef, useState } from 'react';
const MARGIN = 8;
export const Tooltip = ({ content, children, placement = 'top', className = '', maxWidth = 280, openDelay = 80, }) => {
    const [open, setOpen] = useState(false);
    const [coords, setCoords] = useState({ left: -9999, top: -9999 });
    const anchorRef = useRef(null);
    const tipRef = useRef(null);
    const timerRef = useRef(null);
    const show = () => {
        if (timerRef.current)
            clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setOpen(true), openDelay);
    };
    const hide = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        setOpen(false);
    };
    // Measure the tooltip and anchor after mount; clamp to viewport.
    useLayoutEffect(() => {
        if (!open || !anchorRef.current || !tipRef.current)
            return;
        const a = anchorRef.current.getBoundingClientRect();
        const t = tipRef.current.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        let left = 0;
        let top = 0;
        if (placement === 'top' || placement === 'bottom') {
            left = a.left + a.width / 2 - t.width / 2;
            left = Math.max(MARGIN, Math.min(vw - t.width - MARGIN, left));
            if (placement === 'top') {
                top = a.top - t.height - MARGIN;
                if (top < MARGIN)
                    top = a.bottom + MARGIN; // flip if no room above
            }
            else {
                top = a.bottom + MARGIN;
                if (top + t.height > vh - MARGIN)
                    top = a.top - t.height - MARGIN;
            }
        }
        else {
            top = a.top + a.height / 2 - t.height / 2;
            top = Math.max(MARGIN, Math.min(vh - t.height - MARGIN, top));
            if (placement === 'left') {
                left = a.left - t.width - MARGIN;
                if (left < MARGIN)
                    left = a.right + MARGIN;
            }
            else {
                left = a.right + MARGIN;
                if (left + t.width > vw - MARGIN)
                    left = a.left - t.width - MARGIN;
            }
        }
        setCoords({ left, top });
    }, [open, placement, content, maxWidth]);
    return (_jsxs("span", { ref: anchorRef, className: ['relative inline-flex', className].join(' '), onMouseEnter: show, onMouseLeave: hide, onFocus: show, onBlur: hide, children: [children, open && (_jsx("span", { ref: tipRef, role: "tooltip", className: "fixed z-50 pointer-events-none rounded-md border border-vow-gold/70 bg-ash-900/95 shadow-[0_6px_20px_rgba(0,0,0,0.8)] backdrop-blur-sm px-3 py-2 text-[13px] leading-snug text-ash-100", style: { width: maxWidth, left: coords.left, top: coords.top }, children: content }))] }));
};
// Helper to render a title + description body in a standard style.
export const TooltipBody = ({ title, subtitle, desc, flavor }) => (_jsxs("span", { className: "flex flex-col gap-1", children: [_jsx("span", { className: "font-display text-vow-gold text-base leading-tight", children: title }), subtitle && _jsx("span", { className: "text-[11px] uppercase tracking-widest text-ash-300", children: subtitle }), desc && _jsx("span", { className: "text-ash-100", children: desc }), flavor && _jsx("span", { className: "text-ash-400 italic text-[11px]", children: flavor })] }));
