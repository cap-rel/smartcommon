import { useState } from "react";
import { FaCheck, FaHourglassHalf } from "react-icons/fa6";

import { setDefaultStory } from "../../../../../storybook";

import { ChipBar } from "../";

// Sample source chips + two "status" sub-filters, exercising the pill vs
// squared-sub-filter shapes and the active/inactive palette.
const sourceChips = [
    { key: "all", label: "All", count: 12 },
    { key: "mine", label: "Mine", count: 4 },
    {
        key: "todo",
        label: "To do",
        count: 5,
        variant: "status",
        icon: FaHourglassHalf,
        activeClassName: "bg-amber-500 text-white border-amber-500",
        inactiveClassName: "bg-amber-50 text-amber-700 border-amber-200",
    },
    {
        key: "done",
        label: "Done",
        count: 7,
        variant: "status",
        icon: FaCheck,
        activeClassName: "bg-emerald-600 text-white border-emerald-600",
        inactiveClassName: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
];

// ChipBar is stateless: the parent owns which chip is active. This wrapper
// keeps that state so the story is interactive.
const ControlledChipBar = (args) => {
    const [active, setActive] = useState("all");
    const base = args.chips?.length ? args.chips : sourceChips;
    const chips = base.map((chip) => ({
        ...chip,
        active: chip.key === active,
        onClick: () => setActive(chip.key),
    }));
    return <ChipBar {...args} chips={chips} />;
};

export const Default = setDefaultStory({
    args: {},
    code: `
        import { ChipBar } from "@cap-rel/smartcommon";

        const [active, setActive] = useState("all");

        <ChipBar
            chips={[
                { key: "all", label: "All", count: 12,
                  active: active === "all", onClick: () => setActive("all") },
                { key: "mine", label: "Mine", count: 4,
                  active: active === "mine", onClick: () => setActive("mine") },
            ]}
        />
    `,
});

Default.render = (args) => <ControlledChipBar {...args} />;
