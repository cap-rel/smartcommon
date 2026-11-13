// Storybook decorator: a page body under the header, as recommended
// (header shrink-0 above a flex-1 min-h-0 body). It also leaves room for the
// UserMenu once opened.
export const pageDecorator = (Story) => (
    <div className="flex flex-col h-[260px] bg-medium-bg">
        <Story />
        <div className="flex-1 min-h-0 p-app-base text-app-sm text-soft-text">
            Page content
        </div>
    </div>
);
