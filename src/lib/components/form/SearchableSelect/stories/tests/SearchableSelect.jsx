import { setTestStory } from "../../../../../../storybook";
import { propTypes } from "../../props";

export const SearchableSelect = setTestStory({
    args: {
        label: "Country",
        placeholder: "Search a country...",
        options: [
            { label: "France", value: "fr" },
            { label: "Germany", value: "de" },
            { label: "Italy", value: "it" },
        ],
    },
    props: propTypes,
    hidden: [],
});
