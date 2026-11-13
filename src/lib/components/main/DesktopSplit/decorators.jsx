// Storybook decorator: DesktopSplit is h-full, it needs a bounded height
// (a flex-1 min-h-0 container under a DesktopHeader in a real page).
export const boundedHeightDecorator = (Story) => (
    <div className="h-[360px] border border-border">
        <Story />
    </div>
);
