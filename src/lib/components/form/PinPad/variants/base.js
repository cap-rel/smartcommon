export const base = () => ({
    // Give the pad a real, centered width. Without it the flex parent of a
    // full-screen lock overlay (items-center) shrinks the pad to its content and
    // the keys collapse into narrow pills. The keys are aspect-square, so this
    // width alone drives their size.
    container: {
        className: "w-full max-w-[15rem] mx-auto",
    },
});
