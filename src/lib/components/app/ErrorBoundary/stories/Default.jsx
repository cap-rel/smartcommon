import { setDefaultStory } from "../../../../../storybook";
import { ErrorBoundaryDemo } from "./Demo";

export const Default = {
    ...setDefaultStory({
        code: `
            import { ErrorBoundary } from "@cap-rel/smartcommon";

            <ErrorBoundary onError={(error) => report(error)}>
              <HeavyEditor />
            </ErrorBoundary>
        `,
    }),
    render: () => <ErrorBoundaryDemo />,
};
