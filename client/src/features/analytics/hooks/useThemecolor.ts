import { useEffect, useState } from "react";

const cache: Record<string, string> = {};

// Recharts (and most SVG/canvas libs) need a real color string — they can't
// consume a Tailwind class like "text-primary". Rather than guess at your
// CSS variable's format (HSL triplet? hex? oklch?), this renders an
// invisible element with the given class and reads its *computed* color,
// so it works no matter how the variable is defined.
export const useThemeColor = (className: string, fallback: string): string => {
    const [color, setColor] = useState(cache[className] || fallback);

    useEffect(() => {
        if (cache[className]) {
            setColor(cache[className]);
            return;
        }

        const el = document.createElement("span");
        el.className = className;
        el.style.position = "absolute";
        el.style.opacity = "0";
        el.style.pointerEvents = "none";
        document.body.appendChild(el);

        const resolved = getComputedStyle(el).color;
        document.body.removeChild(el);

        if (resolved) {
            cache[className] = resolved;
            setColor(resolved);
        }
    }, [className]);

    return color;
};