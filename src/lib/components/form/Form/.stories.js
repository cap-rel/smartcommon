import { Form } from "./";

export default {
    title: "Components/Form/Form",
    component: Form,
    parameters: {
        docs: {
            codePanel: true,
            description: {
                component:
                    "Groups the fields of a form around the state returned by " +
                    "`useForm()`. Fields with a `name` read and write their " +
                    "value in it; a Button with `type=\"submit\"` submits. On " +
                    "submit, `onPreSubmit` runs, every field shows its errors, " +
                    "and `onSubmit` is called only when all the rules pass " +
                    "(required, min / max, pattern...).",
            },
        },
        layout: "centered",
    },
    tags: ["Form"],
    argTypes: {
        form: { control: false, table: { category: "Main" } },
        onPreSubmit: { control: false, table: { category: "Events" } },
        onSubmit: { control: false, table: { category: "Events" } },
        children: { control: false, table: { category: "Main" } },
    },
    args: {},
};

import { Default as Def } from "./stories";

export const Default = { tags: ["!dev"], ...Def };
