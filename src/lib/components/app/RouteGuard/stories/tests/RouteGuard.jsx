import { setTestStory } from "../../../../../../storybook";
import { propTypes } from "../../props";

export const RouteGuard = setTestStory({
    args: {
        requireAuth: true,
        children: (
            <div className="p-4 rounded-app-md bg-soft-bg border border-border text-app-base">
                Test content
            </div>
        ),
    },
    props: propTypes,
    hidden: ["children"],
});
