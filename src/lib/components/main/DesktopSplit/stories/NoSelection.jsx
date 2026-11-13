import { setDefaultStory } from "../../../../../storybook";

import { Detail, MasterList, Placeholder } from "./demo";

export const NoSelection = setDefaultStory({
    args: {
        master: <MasterList />,
        detail: <Detail id={42} />,
        hasSelection: false,
        placeholder: <Placeholder />,
    },
    code: `
        import { DesktopSplit } from "@cap-rel/smartcommon";

        <DesktopSplit
          master={<InterventionList />}
          detail={<InterventionDetail intervention={selected} />}
          hasSelection={false}
          placeholder={<p className="p-4 text-soft-text">Pick an intervention</p>}
        />
    `,
});

NoSelection.parameters.docs.description = {
    story: "Nothing selected yet: the right pane shows `placeholder` instead of `detail`.",
};
