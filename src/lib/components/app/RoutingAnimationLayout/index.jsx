import { AnimatePresence, motion } from "framer-motion";
import { Outlet, useLocation } from "react-router-dom";

import { twMerge } from "lib/utils";

import { defaultProps, propTypes } from "./props";

const DEFAULT_FADE = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
};

const resolveFromConfig = ({ pathname, prevPathname, animationsConfig, defaultAnimationKey }) => {
    const pages = animationsConfig?.pages ?? {};
    const page = pages[pathname];
    if (page !== undefined) {
        if (typeof page === "string") return page;
        return page[prevPathname] || page["*"] || defaultAnimationKey;
    }
    const fallback = pages["*"];
    if (typeof fallback === "string") return fallback;
    return fallback?.[prevPathname] || fallback?.["*"] || defaultAnimationKey;
};

export const RoutingAnimationLayout = (props) => {
    const {
        animationsConfig,
        mode,
        prevPathname,
        defaultAnimationKey,
        resolveAnimationKey,
        containerProps,
        children,
    } = props;

    const location = useLocation();
    const effectivePrevPathname = prevPathname ?? location.state?.prevPathname;
    const animations = animationsConfig?.animations ?? { [defaultAnimationKey]: DEFAULT_FADE };

    const animationKey = resolveAnimationKey
        ? resolveAnimationKey({
            pathname: location.pathname,
            prevPathname: effectivePrevPathname,
            location,
        })
        : resolveFromConfig({
            pathname: location.pathname,
            prevPathname: effectivePrevPathname,
            animationsConfig,
            defaultAnimationKey,
        });

    const animation = animations[animationKey] ?? animations[defaultAnimationKey] ?? DEFAULT_FADE;

    const { className: userClassName, ...restContainerProps } = containerProps ?? {};

    return (
        <AnimatePresence mode={mode}>
            <motion.div
                {...animation}
                {...restContainerProps}
                key={location.pathname}
                className={twMerge("fixed inset-0", userClassName)}
            >
                {children ?? <Outlet />}
            </motion.div>
        </AnimatePresence>
    );
};

RoutingAnimationLayout.propTypes = propTypes;
RoutingAnimationLayout.defaultProps = defaultProps;
