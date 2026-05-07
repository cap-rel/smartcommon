import { Modal } from "./";

export default {
    title: "Components/Others/Modal",
    component: Modal,
    parameters: {
        docs: { codePanel: true },
        layout: "fullscreen",
    },
    tags: ["Others"],
    argTypes: {
        isOpen: { control: "boolean", table: { category: "Main" } },
        onClose: { action: "closed", table: { category: "Events" } },
        title: { table: { category: "Main" } },
        size: {
            control: { type: "select" },
            options: ["sm", "md", "lg", "xl", "full"],
            table: { category: "Main" },
        },
        position: {
            control: { type: "radio" },
            options: ["center", "bottom"],
            table: { category: "Main" },
        },
        showCloseButton: { control: "boolean", table: { category: "Main" } },
        closeOnOverlayClick: { control: "boolean", table: { category: "Main" } },
        zIndex: { control: "number", table: { category: "Main" } },
    },
    args: {},
};

import { Default as Def } from "./stories";

export const Default = { tags: ["!dev"], ...Def };

export { Modal } from "./stories";
