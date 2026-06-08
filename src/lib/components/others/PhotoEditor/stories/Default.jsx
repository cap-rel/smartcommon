import { setDefaultStory } from "../../../../../storybook";

export const Default = setDefaultStory({
    args: {
        open: true,
        src: "https://picsum.photos/seed/smartcommon/1200/900",
    },
    code: `
        import { PhotoEditor } from "@cap-rel/smartcommon";

        <PhotoEditor
          open={isOpen}
          src={photoBlob}
          onSave={(blob, { operations }) => {
              persist(blob);          // baked image
              storeRecipe(operations); // re-applicable, non-destructive
          }}
          onCancel={() => setIsOpen(false)}
        />
    `,
});
