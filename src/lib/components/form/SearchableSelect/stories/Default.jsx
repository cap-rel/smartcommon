import { setDefaultStory } from "../../../../../storybook";

const COUNTRIES = [
    { label: "France", value: "fr" },
    { label: "Germany", value: "de" },
    { label: "Italy", value: "it" },
    { label: "Spain", value: "es" },
    { label: "Portugal", value: "pt" },
    { label: "Belgium", value: "be" },
    { label: "Netherlands", value: "nl" },
    { label: "Switzerland", value: "ch" },
    { label: "Austria", value: "at" },
    { label: "Poland", value: "pl" },
];

export const Default = setDefaultStory({
    args: {
        label: "Country",
        placeholder: "Search a country...",
        options: COUNTRIES,
    },
    code: `
        import { SearchableSelect } from "@cap-rel/smartcommon";

        const options = [
          { label: "France", value: "fr" },
          { label: "Germany", value: "de" },
          // ...
        ];

        <SearchableSelect
          label="Country"
          placeholder="Search a country..."
          options={options}
          onChange={(v) => console.log(v)}
        />
    `,
});
