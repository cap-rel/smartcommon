import { setDefaultStory } from "../../../../../storybook";
import { RoutingDemo } from "./Demo";

export const Default = {
    ...setDefaultStory({
        code: `
            import { RoutingAnimationLayout } from "@cap-rel/smartcommon";

            const animationsConfig = {
              animations: {
                fade: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
                slide: { initial: { x: "100%" }, animate: { x: 0 }, exit: { x: "-100%" } },
              },
              pages: { "/detail": "slide", "*": "fade" },
            };

            <Route element={<RoutingAnimationLayout animationsConfig={animationsConfig} />}>
              <Route path="/" element={<ListPage />} />
              <Route path="/detail" element={<DetailPage />} />
            </Route>
        `,
    }),
    render: () => <RoutingDemo />,
};
