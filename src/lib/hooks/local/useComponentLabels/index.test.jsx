import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";

import { LibConfigProvider } from "lib/components/app/LibConfigProvider";

import { useComponentLabels } from "./index";

const withComponents = (components) => {
    const Wrapper = ({ children }) => <LibConfigProvider value={{ components }}>{children}</LibConfigProvider>;
    return Wrapper;
};

describe("useComponentLabels", () => {
    it("returns the prop labels without any Provider", () => {
        const { result } = renderHook(() => useComponentLabels("ConfirmProvider", { cancel: "Annuler" }));
        expect(result.current).toEqual({ cancel: "Annuler" });
    });

    it("returns an empty object without labels nor theme", () => {
        const { result } = renderHook(() => useComponentLabels("ConfirmProvider"));
        expect(result.current).toEqual({});
    });

    it("reads the labels of the current theme", () => {
        const wrapper = withComponents({ theme: "app", themes: { app: { ConfirmProvider: { labels: { cancel: "Annuler", confirm: "OK" } } } } });
        const { result } = renderHook(() => useComponentLabels("ConfirmProvider"), { wrapper });
        expect(result.current).toEqual({ cancel: "Annuler", confirm: "OK" });
    });

    it("lays the prop labels over the theme ones key by key", () => {
        const wrapper = withComponents({ theme: "app", themes: { app: { ConfirmProvider: { labels: { cancel: "Annuler", confirm: "OK" } } } } });
        const { result } = renderHook(() => useComponentLabels("ConfirmProvider", { confirm: "Valider" }), { wrapper });
        expect(result.current).toEqual({ cancel: "Annuler", confirm: "Valider" });
    });

    it("resolves a theme entry naming declared variants", () => {
        const wrapper = withComponents({
            theme: "app",
            themes: { app: { AboutModal: ["fr", "short"] } },
            variants: { AboutModal: { fr: { labels: { title: "À propos", close: "Fermer" } }, short: { labels: { close: "OK" } } } },
        });
        const { result } = renderHook(() => useComponentLabels("AboutModal"), { wrapper });
        expect(result.current).toEqual({ title: "À propos", close: "OK" });
    });

    it("ignores the labels of another theme or component", () => {
        const wrapper = withComponents({ theme: "other", themes: { app: { ConfirmProvider: { labels: { cancel: "Annuler" } } } } });
        const { result } = renderHook(() => useComponentLabels("ConfirmProvider"), { wrapper });
        expect(result.current).toEqual({});
    });
});
