import { setDefaultStory } from "../../../../../storybook";

import { Detail, MasterList, Placeholder } from "./demo";

export const Default = setDefaultStory({
    args: {
        master: <MasterList selectedId={42} />,
        detail: <Detail id={42} />,
        hasSelection: true,
        placeholder: <Placeholder />,
        masterProps: { "aria-label": "Interventions" },
    },
    code: `
        import { DesktopSplit } from "@cap-rel/smartcommon";

        <div className="flex flex-col h-full">
          <DesktopHeader title="Interventions" />
          <div className="flex-1 min-h-0">
            <DesktopSplit
              master={<DataTable ... onRowClick={(row) => setSelected(row)} />}
              detail={<InterventionDetail intervention={selected} />}
              hasSelection={!!selected}
              placeholder={<p className="p-4 text-soft-text">Pick an intervention</p>}
              masterProps={{ "aria-label": "Interventions" }}
            />
          </div>
        </div>
    `,
});
