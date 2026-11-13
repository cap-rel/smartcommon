import { fn } from "storybook/test";

import { setDefaultStory } from "../../../../../storybook";

export const TextTrigger = setDefaultStory({
    args: {
        align: "left",
        trigger: "Sort by",
        items: [
            { key: "date", label: "Date", onClick: fn() },
            { key: "customer", label: "Customer", onClick: fn() },
            { key: "amount", label: "Amount", onClick: fn() },
        ],
    },
    code: `
        import { Dropdown } from "@cap-rel/smartcommon";

        <Dropdown
          align="left"
          trigger="Sort by"
          items={[
            { key: "date", label: "Date", onClick: () => setSort("date") },
            { key: "customer", label: "Customer", onClick: () => setSort("customer") },
            { key: "amount", label: "Amount", onClick: () => setSort("amount") },
          ]}
        />
    `,
});

TextTrigger.parameters.docs.description = {
    story: "Plain content as `trigger`: the Dropdown wraps it in its own `<button>` carrying the ARIA attributes.",
};
