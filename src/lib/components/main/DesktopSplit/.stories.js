import { DesktopSplit } from "./";
import { boundedHeightDecorator } from "./decorators";

export default {
    title: "Components/Main/DesktopSplit",
    component: DesktopSplit,
    parameters: {
        docs: {
            codePanel: true,
            description: {
                component:
                    "Desktop master-detail, always side by side: the master " +
                    "(a DataTable, usually) keeps its width, the detail " +
                    "takes the rest and shows the placeholder until " +
                    "something is selected. Each pane scrolls on its own; " +
                    "the component is h-full, give it a bounded height.",
            },
        },
        layout: "fullscreen",
    },
    tags: ["Main"],
    decorators: [boundedHeightDecorator],
    argTypes: {
        master: { control: false, table: { category: "Main" } },
        detail: { control: false, table: { category: "Main" } },
        hasSelection: { control: "boolean", table: { category: "Main" } },
        placeholder: { control: false, table: { category: "Main" } },
        masterWidth: { control: "text", table: { category: "Appearance" } },
        masterClassName: { control: "text", table: { category: "Appearance" } },
        detailClassName: { control: "text", table: { category: "Appearance" } },
        testId: { control: "text", table: { category: "Main" } },
        containerProps: { control: false, table: { category: "Elements" } },
        masterProps: { control: false, table: { category: "Elements" } },
        detailProps: { control: false, table: { category: "Elements" } },
    },
    args: {},
};

import { Default as Def, NoSelection as Ns, Interactive as Int } from "./stories";

export const Default = { tags: ["!dev"], ...Def };
export const NoSelection = { tags: ["!dev"], ...Ns };
export const Interactive = { tags: ["!dev"], ...Int };
