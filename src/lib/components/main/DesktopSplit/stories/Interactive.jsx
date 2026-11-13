import { useState } from "react";

import { setDefaultStory } from "../../../../../storybook";

import { DesktopSplit } from "../";
import { Detail, MasterList, Placeholder } from "./demo";

const SelectableSplit = (args) => {
    const [selectedId, setSelectedId] = useState(null);
    return (
        <DesktopSplit
            { ...args }
            master={<MasterList selectedId={selectedId} onSelect={(item) => setSelectedId(item.id)} />}
            detail={<Detail id={selectedId} />}
            hasSelection={selectedId !== null}
            placeholder={<Placeholder />}
        />
    );
};

export const Interactive = setDefaultStory({
    args: {
        masterWidth: "w-[320px]",
        masterProps: { "aria-label": "Interventions" },
        detailProps: { "aria-label": "Intervention detail" },
    },
    code: `
        import { useState } from "react";
        import { DesktopSplit } from "@cap-rel/smartcommon";

        const [selected, setSelected] = useState(null);

        <DesktopSplit
          masterWidth="w-[320px]"
          master={<InterventionList selectedId={selected?.id} onSelect={setSelected} />}
          detail={<InterventionDetail intervention={selected} />}
          hasSelection={!!selected}
          placeholder={<p className="p-4 text-soft-text">Pick an intervention</p>}
          masterProps={{ "aria-label": "Interventions" }}
          detailProps={{ "aria-label": "Intervention detail" }}
        />
    `,
});

Interactive.parameters.docs.description = {
    story: "Selection held by the parent: a click in the master fills the detail. Fixed master width through `masterWidth`, named regions through `masterProps` / `detailProps`.",
};

Interactive.render = (args) => <SelectableSplit { ...args } />;
