// Storybook decorator: the menu is position: fixed under its trigger. Leave
// room below the trigger so the opened menu does not cover the next block of
// the documentation page.
export const menuAreaDecorator = (Story) => (
    <div className="min-h-[260px] p-app-base flex justify-center items-start">
        <Story />
    </div>
);
