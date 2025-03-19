const classic = {
    linkProps: {
        className: ({ isActive }) => `group`
    },
    iconAndLabelContainerProps: {
        className: ({ isActive }) => ``
    },
    iconContainerProps: {
        className: ({ isActive }) => `py-2 px-6 rounded-full duration-200 ${isActive ? "text-primary bg-primary/20" : "text-stronger bg-softest group-active:brightness-soft"}`
    },
    labelProps: {
        className: ({ isActive }) => `font-semibold duration-200 ${isActive ? "text-primary brightness-soft" : "text-stronger"}`
    }
};

const test = {
    linkProps: {
        className: ({ isActive }) => `group border-t-4 duration-200 ${isActive ? "border-primary": "border-softest"}`
    },
    iconAndLabelContainerProps: {
        className: ({ isActive }) => ``
    },
    iconContainerProps: {
        className: ({ isActive }) => `duration-200 rounded-full bg-softest group-active:brightness-soft ${isActive ? "text-primary" : "text-strong"}`
    },
    labelProps: {
        className: ({ isActive }) => `font-semibold duration-200 ${isActive ? "text-primary" : "text-stronger"}`
    }
};

export const tabbarLinkVariants = { classic, test };