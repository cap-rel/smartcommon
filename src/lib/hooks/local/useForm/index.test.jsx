import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

vi.mock("lib/hooks", async (importOriginal) => {
    const actual = await importOriginal();
    return { ...actual, useLibConfig: () => ({ debug: false }) };
});

import { log } from "lib/utils";

import { useForm } from "./index";

describe("useForm debug", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("logs the form state changes when debug is on", () => {
        const stateLog = vi.spyOn(log, "state").mockImplementation(() => {});
        const { result } = renderHook(() => useForm({ debug: true }));

        act(() => result.current.setField({ name: "note", value: "x", errors: {} }));

        expect(stateLog).toHaveBeenCalledWith("SET values.note =>", "x");
    });

    it("stays silent when debug is off", () => {
        const stateLog = vi.spyOn(log, "state").mockImplementation(() => {});
        const { result } = renderHook(() => useForm());

        act(() => result.current.setField({ name: "note", value: "x", errors: {} }));

        expect(stateLog).not.toHaveBeenCalled();
    });
});
