
{/* <Button { ...mergeProps("RightButton", props => ({
                                ...props,
                                icon: rightButtons.icon,
                                buttonProps: {
                                    ...props.buttonProps,
                                    className: "px-app-xs py-app-xs text-app-lg"
                                }
                            }))} /> */}

{/* <Button key={`link${LI}`} { ...mergeProps("BottomButton", props => ({
    ...props,
    ...link,
    buttonProps: {
        ...props.buttonProps,
        onClick: () => set("linkActive", LI),
        style: { transition: `filter var(--really-quick), color var(--medium), border-color var(--medium)` },
        className: `snap-center border-b-4 px-app-base py-app-xs rounded-note rounded-b-app-base font-app-base gap-app-sm ${linkActive == LI ? "text-white border-white" : "text-white/50 border-primary"}`
    }
}))} /> */}


// Link Rounded Variant ?

{/* <div className={`bg-soft relative text-base`}>
                    <div className={`bg-primary absolute left-0 right-0 top-0 bottom-1/2 z-10`}/>
                    <div className={`overflow-x-auto row-v-center relative z-20 scroll-hidden`}>
                        {links.map((link, LI) => {
                            return (
                                <Link
                                    key={`link${LI}`}
                                    { ...link}
                                    onClick={() => set("linkActive", LI)}
                                    className={twMerge(`duration-100 active:brightness-soft row-v-center gap-2 ${linkActive == LI ? "bg-soft text-primary rounded-t-xl first:rounded-tl-none last:rounded-tr-none" : "text-white bg-primary"} px-4 py-2 ${LI == linkActive - 1 && "rounded-br-xl"} ${LI == linkActive + 1 && "rounded-bl-xl"}`)}
                                >
                                    <div
                                        className={twMerge(`text-lg`)}
                                    >
                                        {link.icon}
                                    </div>
                                    <div
                                        className={twMerge(`whitespace-nowrap`)}
                                    >
                                        {link.label}
                                    </div>
                                </Link>
                            );
                        }
                        )}
                    </div>
                </div> */}