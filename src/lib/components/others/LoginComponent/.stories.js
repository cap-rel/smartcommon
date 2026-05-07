import { LoginComponent } from "./";
import { fakeApiDecorator } from "./decorators";

export default {
    title: "Components/Others/LoginComponent",
    component: LoginComponent,
    parameters: {
        docs: {
            codePanel: true,
            description: {
                component:
                    "Generic Dolibarr login form. Renders email + password " +
                    "(+ optional entity Select and remember-me checkbox) " +
                    "and calls api.login() on submit. When `enableQrPair` " +
                    "is true, also offers a 'Scan QR' button that opens " +
                    "BarcodeScanner, calls api.claimQrPair, then polls " +
                    "api.pollQrPair until the PC user confirms (smartAuth " +
                    "QR pairing flow).",
            },
        },
        layout: "centered",
    },
    tags: ["Others"],
    decorators: [fakeApiDecorator],
    argTypes: {
        showEntities: { control: "boolean", table: { category: "Main" } },
        showRememberMe: { control: "boolean", table: { category: "Main" } },
        enableQrPair: { control: "boolean", table: { category: "Main" } },
        qrPollIntervalMs: { control: "number", table: { category: "Main" } },
        qrTimeoutMs: { control: "number", table: { category: "Main" } },
        deviceLabel: { control: "text", table: { category: "Main" } },
        deviceUuid: { control: "text", table: { category: "Main" } },
        labels: { control: "object", table: { category: "Main" } },
        onSuccess: { action: "success", table: { category: "Events" } },
        onError: { action: "error", table: { category: "Events" } },
    },
    args: {},
};

import {
    Default as Def,
    WithRememberMe as Wrm,
    WithQrPair as Wqr,
} from "./stories";

export const Default = { tags: ["!dev"], ...Def };
export const WithRememberMe = { tags: ["!dev"], ...Wrm };
export const WithQrPair = { tags: ["!dev"], ...Wqr };

export { LoginComponent } from "./stories";
