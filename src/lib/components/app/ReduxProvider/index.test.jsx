import { describe, it, expect, vi } from "vitest";
import { render, renderHook, screen } from "@testing-library/react";
import { useSelector } from "react-redux";

vi.mock("lib/hooks", () => ({
    useLibConfig: () => ({}),
}));

import { ReduxProvider } from "./index";

describe("ReduxProvider", () => {
    it("renders its children", () => {
        render(
            <ReduxProvider>
                <p>redux child</p>
            </ReduxProvider>
        );

        expect(screen.getByText("redux child")).toBeDefined();
    });

    it("makes a redux store available to consumers (useSelector works)", () => {
        const wrapper = ({ children }) => <ReduxProvider>{children}</ReduxProvider>;

        const { result } = renderHook(
            () => useSelector((state) => state.global),
            { wrapper }
        );

        expect(result.current).toBeDefined();
    });
});
