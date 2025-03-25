const smart = {
    tabbarProps: {
        className: () => "shadow-strongest shadow-xl"
    }
}

const floating = {
    tabbarProps: {
        className: () => "bottom-4 left-4 right-4 shadow-md rounded-full shadow-black/10"
    }
}

export const tabbarVariants = { smart, floating };