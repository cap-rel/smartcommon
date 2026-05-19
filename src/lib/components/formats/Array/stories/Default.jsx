import { setDefaultStory } from "../../../../../storybook";

export const Default = setDefaultStory({
  args: {
    value: [
      { fullname: "Jean Dupont" },
      { firstname: "Alice", lastname: "Martin" },
      { code: "C001" },
      { email: "carol@example.com" },
    ],
  },
  code: `
    import { ArrayFormat } from "@cap-rel/smartcommon";

    <ArrayFormat
        value={[
            { fullname: "Jean Dupont" },
            { firstname: "Alice", lastname: "Martin" },
            { code: "C001" },
            { email: "carol@example.com" },
        ]}
    />
    // -> "Jean Dupont, Alice Martin, C001, carol@example.com"
  `
});
