import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const { toastCalls, mockHookState } = vi.hoisted(() => ({
    toastCalls: { count: 0 },
    mockHookState: {
        updateAvailable: false,
        isApplying: false,
        applyUpdate: () => {},
    },
}));

vi.mock("framer-motion", () => ({
    AnimatePresence: ({ children }) => children,
    motion: new Proxy(
        {},
        {
            get: () => ({ children, ...rest }) => {
                const tag = "div";
                const Tag = tag;
                // Strip framer-motion-only props before forwarding
                const { initial, animate, exit, transition, variants, ...domProps } = rest;
                void initial; void animate; void exit; void transition; void variants;
                return <Tag {...domProps}>{children}</Tag>;
            },
        }
    ),
}));

vi.mock("react-hot-toast", () => {
    const toast = (...args) => {
        toastCalls.count += 1;
        toastCalls.lastArgs = args;
    };
    toast.dismiss = () => {};
    return { default: toast };
});

vi.mock("lib/hooks", () => ({
    usePWAUpdate: () => mockHookState,
}));

import { UpdatePrompt } from "./index";

describe("UpdatePrompt", () => {
    beforeEach(() => {
        mockHookState.updateAvailable = false;
        mockHookState.isApplying = false;
        mockHookState.applyUpdate = vi.fn();
        toastCalls.count = 0;
        toastCalls.lastArgs = undefined;
    });

    describe("default (toast) variant", () => {
        it("renders nothing in DOM (toast handled by react-hot-toast)", () => {
            mockHookState.updateAvailable = true;
            const { container } = render(<UpdatePrompt />);
            expect(container.firstChild).toBeNull();
        });

        it("calls toast() exactly once when updateAvailable becomes true", () => {
            mockHookState.updateAvailable = true;
            render(<UpdatePrompt />);
            expect(toastCalls.count).toBe(1);
        });

        it("does not call toast() when updateAvailable is false", () => {
            mockHookState.updateAvailable = false;
            render(<UpdatePrompt />);
            expect(toastCalls.count).toBe(0);
        });
    });

    describe("banner variant", () => {
        it("does not render when no update is available", () => {
            mockHookState.updateAvailable = false;
            const { container } = render(<UpdatePrompt variant="banner" />);
            expect(container.firstChild).toBeNull();
        });

        it("renders default labels when update is available", () => {
            mockHookState.updateAvailable = true;
            render(<UpdatePrompt variant="banner" />);

            expect(screen.getByText("Mise à jour disponible")).toBeDefined();
            expect(screen.getByText("Une nouvelle version est disponible.")).toBeDefined();
            expect(screen.getByRole("button", { name: /Rafraîchir/ })).toBeDefined();
        });

        it("merges custom labels over defaults", () => {
            mockHookState.updateAvailable = true;
            render(
                <UpdatePrompt
                    variant="banner"
                    labels={{ title: "Update !", reloadButton: "Now" }}
                />
            );

            expect(screen.getByText("Update !")).toBeDefined();
            expect(screen.getByText("Une nouvelle version est disponible.")).toBeDefined();
            expect(screen.getByRole("button", { name: /Now/ })).toBeDefined();
        });

        it("positions banner at top when position=top", () => {
            mockHookState.updateAvailable = true;
            const { container } = render(<UpdatePrompt variant="banner" position="top" />);
            const banner = container.querySelector(".fixed");
            expect(banner.className).toContain("top-0");
            expect(banner.className).not.toContain("bottom-0");
        });

        it("positions banner at bottom by default", () => {
            mockHookState.updateAvailable = true;
            const { container } = render(<UpdatePrompt variant="banner" />);
            const banner = container.querySelector(".fixed");
            expect(banner.className).toContain("bottom-0");
        });

        it("calls applyUpdate when reload button is clicked", () => {
            mockHookState.updateAvailable = true;
            render(<UpdatePrompt variant="banner" />);

            fireEvent.click(screen.getByRole("button", { name: /Rafraîchir/ }));

            expect(mockHookState.applyUpdate).toHaveBeenCalledTimes(1);
        });

        it("disables the reload button when isApplying is true", () => {
            mockHookState.updateAvailable = true;
            mockHookState.isApplying = true;
            render(<UpdatePrompt variant="banner" />);

            const button = screen.getByRole("button", { name: /Rafraîchir/ });
            expect(button.disabled).toBe(true);
        });
    });

    describe("modal variant", () => {
        it("does not render when no update is available", () => {
            mockHookState.updateAvailable = false;
            const { container } = render(<UpdatePrompt variant="modal" />);
            expect(container.firstChild).toBeNull();
        });

        it("renders modal with title and message when update is available", () => {
            mockHookState.updateAvailable = true;
            render(<UpdatePrompt variant="modal" />);

            expect(screen.getByText("Mise à jour disponible")).toBeDefined();
            expect(screen.getByText("Une nouvelle version est disponible.")).toBeDefined();
        });

        it("calls applyUpdate when reload button is clicked", () => {
            mockHookState.updateAvailable = true;
            render(<UpdatePrompt variant="modal" />);

            fireEvent.click(screen.getByRole("button", { name: /Rafraîchir/ }));

            expect(mockHookState.applyUpdate).toHaveBeenCalledTimes(1);
        });

        it("disables the reload button when isApplying is true", () => {
            mockHookState.updateAvailable = true;
            mockHookState.isApplying = true;
            render(<UpdatePrompt variant="modal" />);

            const button = screen.getByRole("button", { name: /Rafraîchir/ });
            expect(button.disabled).toBe(true);
        });
    });
});
