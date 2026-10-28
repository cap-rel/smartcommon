import { describe, it, expect, afterEach } from "vitest";
import { render, renderHook, screen, waitFor } from "@testing-library/react";

import { LibConfigProvider } from "./index";
import { useLibConfig } from "lib/hooks";
import { createLogger, getRecentLogs, setLogBufferEnabled } from "lib/utils/functions/consoleLogs";

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

describe("LibConfigProvider - feedback log buffer", () => {
    afterEach(() => {
        // Leave the buffer enabled and empty for the other test files.
        setLogBufferEnabled(false);
        setLogBufferEnabled(true);
    });

    it("keeps the log buffer enabled by default", async () => {
        setLogBufferEnabled(false);
        setLogBufferEnabled(true);

        render(
            <LibConfigProvider value={{}}>
                <p>child</p>
            </LibConfigProvider>
        );

        const log = createLogger("cfg-default");
        log.error("buffered by default");
        await waitFor(() => expect(getRecentLogs().some((l) => l.includes("buffered by default"))).toBe(true));
    });

    it("disables and drains the log buffer when feedback.logBuffer is false", async () => {
        const log = createLogger("cfg-off");
        log.error("before disabling");
        expect(getRecentLogs().some((l) => l.includes("before disabling"))).toBe(true);

        render(
            <LibConfigProvider value={{ feedback: { logBuffer: false } }}>
                <p>child</p>
            </LibConfigProvider>
        );

        await waitFor(() => expect(getRecentLogs().length).toBe(0));

        log.error("not buffered while disabled");
        expect(getRecentLogs().some((l) => l.includes("not buffered while disabled"))).toBe(false);
    });

    it("re-enables the log buffer when the config flips back", async () => {
        const { rerender } = render(
            <LibConfigProvider value={{ feedback: { logBuffer: false } }}>
                <p>child</p>
            </LibConfigProvider>
        );
        await waitFor(() => {
            const log = createLogger("cfg-flip");
            log.error("while off");
            expect(getRecentLogs().some((l) => l.includes("while off"))).toBe(false);
        });

        rerender(
            <LibConfigProvider value={{ feedback: { logBuffer: true } }}>
                <p>child</p>
            </LibConfigProvider>
        );

        const log = createLogger("cfg-flip");
        log.error("after flip");
        await waitFor(() => expect(getRecentLogs().some((l) => l.includes("after flip"))).toBe(true));
    });
});
