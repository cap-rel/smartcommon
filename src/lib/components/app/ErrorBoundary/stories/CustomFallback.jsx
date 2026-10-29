import { setDefaultStory } from "../../../../../storybook";
import { CustomFallback as Fallback, ErrorBoundaryDemo } from "./Demo";

export const CustomFallback = {
    ...setDefaultStory({
        code: `
            const Fallback = ({ error, resetError }) => (
              <div>
                <strong>This section could not be displayed.</strong>
                <span>{error.message}</span>
                <Button label="Reload the section" onClick={resetError} />
              </div>
            );

            <ErrorBoundary FallbackComponent={Fallback}>
              <HeavyEditor />
            </ErrorBoundary>
        `,
    }),
    render: () => <ErrorBoundaryDemo FallbackComponent={Fallback} />,
};
