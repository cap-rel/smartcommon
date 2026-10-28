import { setDefaultStory } from "../../../../../storybook";

export const Redact = setDefaultStory({
    args: {
        open: true,
        src: "https://picsum.photos/seed/smartcommon/1200/900",
        tools: ["redact", "rotate", "flip"],
    },
    code: `
        import { PhotoEditor } from "@cap-rel/smartcommon";

        <PhotoEditor
          open={isOpen}
          src={photoBlob}
          tools={["redact", "rotate", "flip"]}
          onSave={(blob, { operations }) => {
              persist(blob);          // baked image, rects painted opaque
              storeRecipe(operations); // re-applicable, non-destructive
          }}
          onCancel={() => setIsOpen(false)}
        />
    `,
});
