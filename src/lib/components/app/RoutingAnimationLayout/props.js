import PropTypes from "prop-types";

export const propTypes = {
    // Animation registry + per-route mapping. Shape:
    //   {
    //     animations: { fade: { initial, animate, exit, transition }, ... },
    //     pages: {
    //       "/login": "fade",
    //       "/dashboard": { "/login": "slide-left", "*": "fade" },
    //       "*": "fade",
    //     },
    //   }
    // If omitted, falls back to a single fade animation.
    animationsConfig: PropTypes.shape({
        animations: PropTypes.object,
        pages: PropTypes.object,
    }),
    // AnimatePresence mode. "wait" blocks new entry until previous exits;
    // "sync" lets them overlap; "popLayout" reorders without re-mounting.
    mode: PropTypes.oneOf(["wait", "sync", "popLayout"]),
    // Override the previous pathname used for direction-aware animations.
    // When omitted, falls back to location.state?.prevPathname.
    prevPathname: PropTypes.string,
    // Animation key used when no entry matches in animationsConfig.pages.
    defaultAnimationKey: PropTypes.string,
    // Custom resolver: ({ pathname, prevPathname, location }) => animationKey
    // Bypasses the built-in pages lookup entirely.
    resolveAnimationKey: PropTypes.func,
    // Slot for the wrapping motion.div (className, style, data-attrs, ...).
    // Class names are merged via twMerge so consumer wins on conflicts.
    containerProps: PropTypes.object,
    // Optional children. When omitted, renders <Outlet /> (route element pattern).
    children: PropTypes.node,
};

export const defaultProps = {
    mode: "wait",
    defaultAnimationKey: "fade",
};
