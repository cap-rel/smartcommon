import { SearchableSelect } from "./";

export default {
    title: "Components/Form/SearchableSelect",
    component: SearchableSelect,
    parameters: {
        docs: { codePanel: true },
        layout: "centered",
    },
    tags: ["Form"],
    argTypes: {
        label: { table: { category: "Main" } },
        placeholder: { table: { category: "Main" } },
        options: { control: "object", table: { category: "Main" } },
        value: { table: { category: "Main" } },
        defaultValue: { table: { category: "Main" } },
        disabled: { control: "boolean", table: { category: "Main" } },
        required: { control: "boolean", table: { category: "Main" } },
        onChange: { action: "changed", table: { category: "Events" } },
    },
    args: {},
};

import { Default as Def } from "./stories";

export const Default = { tags: ["!dev"], ...Def };

export { SearchableSelect } from "./stories";
