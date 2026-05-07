import { describe, it, expect } from "vitest";
import { render, renderHook, screen } from "@testing-library/react";

import { LibConfigProvider } from "./index";
import { useLibConfig } from "lib/hooks";

describe("LibConfigProvider", () => {
    it("renders its children", () => {
        render(
            <LibConfigProvider value={{}}>
                <p>child node</p>
            </LibConfigProvider>
        );

        expect(screen.getByText("child node")).toBeDefined();
    });

    it("exposes the value to consumers via useLibConfig", () => {
        const config = { components: { theme: "dark" }, custom: 42 };

        const wrapper = ({ children }) => (
            <LibConfigProvider value={config}>{children}</LibConfigProvider>
        );

        const { result } = renderHook(() => useLibConfig(), { wrapper });

        expect(result.current).toBe(config);
        expect(result.current.components.theme).toBe("dark");
        expect(result.current.custom).toBe(42);
    });

    it("returns an empty object from useLibConfig outside any provider", () => {
        const { result } = renderHook(() => useLibConfig());

        expect(result.current).toEqual({});
    });

    it("returns an empty object from useLibConfig when value is null", () => {
        const wrapper = ({ children }) => (
            <LibConfigProvider value={null}>{children}</LibConfigProvider>
        );

        const { result } = renderHook(() => useLibConfig(), { wrapper });

        expect(result.current).toEqual({});
    });

    it("propagates value updates to consumers on rerender", () => {
        const Probe = () => {
            const cfg = useLibConfig();
            return <span>mode: {cfg.mode}</span>;
        };

        const { rerender } = render(
            <LibConfigProvider value={{ mode: "a" }}>
                <Probe />
            </LibConfigProvider>
        );

        expect(screen.getByText("mode: a")).toBeDefined();

        rerender(
            <LibConfigProvider value={{ mode: "b" }}>
                <Probe />
            </LibConfigProvider>
        );

        expect(screen.getByText("mode: b")).toBeDefined();
    });
});
