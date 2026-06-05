import { useVariantMerger } from "lib/hooks";

// Floating Action Button: a fixed, circular, icon-only action trigger
// (the "+" add button at the bottom of a list, etc.).
//
// Why a dedicated component and not <Button>: <Button> is a labeled button
// sized by the theme font-size, and an icon-only child rendered at 1em then
// inherits that font-size. Going through className/twMerge to resize it is
// non-deterministic (the theme's custom text-app-* sizes and the standard
// text-* scale share the same font-size group). A FAB instead sizes its glyph
// in EXPLICIT PIXELS, bypassing the font-size cascade entirely, so the icon is
// always visible regardless of the surrounding theme.
//
// Props:
//   - icon      : a react-icons component (passed as the component itself,
//                 e.g. icon={FaPlus}). Rendered at `iconSize` px.
//   - onClick   : click handler.
//   - color     : "primary" | "secondary" (themed background). Default secondary.
//   - size      : circle diameter in px. Default 64.
//   - iconSize  : glyph size in px. Default 32.
//   - position  : "bottom-right" | "bottom-left". Default bottom-right.
//   - children  : optional, rendered instead of `icon` when no icon is given.
//   - buttonProps: passthrough to the native <button> (data-testid, aria-label,
//                 className override merged via twMerge, etc.).
export const FAB = (props) => {
    const { variantProps, mergeProps } = useVariantMerger("FAB", props);

    const {
        icon: Icon,
        onClick = () => {},
        color = "secondary",
        size = 64,
        iconSize = 32,
        position = "bottom-right",
        children,
    } = variantProps;

    // Literal class strings (no `bg-${color}` interpolation): Tailwind only
    // generates classes it can see as complete tokens at build time.
    const bgClass = color === "primary" ? "bg-primary" : "bg-secondary";
    const positionClass = position === "bottom-left" ? "bottom-20 left-4" : "bottom-20 right-4";

    return (
        <button {...mergeProps("button", (p) => ({
            ...p,
            type: "button",
            onClick,
            // Diameter in inline style so it never depends on which w-/h-
            // utilities the consumer's Tailwind build happens to generate.
            style: { width: `${size}px`, height: `${size}px`, ...(p.style || {}) },
            className: `fixed ${positionClass} z-30 rounded-full ${bgClass} text-white shadow-lg
                flex items-center justify-center active:brightness-90`,
        }))}>
            {Icon ? <Icon size={iconSize} color="#ffffff" aria-hidden="true" /> : children}
        </button>
    );
};
