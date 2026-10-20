import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";

const { toastCalls, mockHookState } = vi.hoisted(() => ({
    toastCalls: { count: 0, dismissed: [] },
    mockHookState: {
        updateAvailable: false,
        isApplying: false,
        newVersion: null,
        releaseNotes: null,
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
        return `toast-${toastCalls.count}`;
    };
    toast.dismiss = (id) => {
        toastCalls.dismissed.push(id);
    };
    return { default: toast };
});

vi.mock("lib/hooks", () => ({
    usePWAUpdate: (options) => {
        mockHookState.options = options;
        return mockHookState;
    },
}));

import { UpdatePrompt } from "./index";

describe("UpdatePrompt", () => {
    beforeEach(() => {
        mockHookState.updateAvailable = false;
        mockHookState.isApplying = false;
        mockHookState.newVersion = null;
        mockHookState.releaseNotes = null;
        mockHookState.applyUpdate = vi.fn();
        toastCalls.count = 0;
        toastCalls.lastArgs = undefined;
        toastCalls.dismissed = [];
        mockHookState.options = undefined;
    });

    // Simulates usePWAUpdate reporting a newly installed Service Worker.
    const detectUpdate = () => {
        act(() => {
            mockHookState.options.onUpdateAvailable();
        });
    };

    // Renders the toast body react-hot-toast would have received.
    const renderToastBody = () => {
        const [renderFn] = toastCalls.lastArgs;
        return render(renderFn({ id: `toast-${toastCalls.count}` }));
    };

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

        it("does not stack a new toast on re-render", () => {
            mockHookState.updateAvailable = true;
            const { rerender } = render(<UpdatePrompt />);
            rerender(<UpdatePrompt labels={{ title: "Other" }} />);
            rerender(<UpdatePrompt />);
            expect(toastCalls.count).toBe(1);
        });

        it("keeps the toast closed after Later until the next detection", () => {
            mockHookState.updateAvailable = true;
            const { rerender } = render(<UpdatePrompt />);
            detectUpdate();
            const body = renderToastBody();

            act(() => {
                fireEvent.click(body.getByRole("button", { name: "Later" }));
            });
            rerender(<UpdatePrompt />);

            expect(toastCalls.dismissed).toContain("toast-1");
            expect(toastCalls.count).toBe(1);

            detectUpdate();
            expect(toastCalls.count).toBe(2);
        });

        it("forwards onUpdateAvailable to the consumer", () => {
            const onUpdateAvailable = vi.fn();
            render(<UpdatePrompt onUpdateAvailable={onUpdateAvailable} />);
            detectUpdate();
            expect(onUpdateAvailable).toHaveBeenCalledTimes(1);
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

            expect(screen.getByText("Update available")).toBeDefined();
            expect(screen.getByText("A new version is available.")).toBeDefined();
            expect(screen.getByRole("button", { name: /Refresh/ })).toBeDefined();
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
            expect(screen.getByText("A new version is available.")).toBeDefined();
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

            fireEvent.click(screen.getByRole("button", { name: /Refresh/ }));

            expect(mockHookState.applyUpdate).toHaveBeenCalledTimes(1);
        });

        it("disables the reload button when isApplying is true", () => {
            mockHookState.updateAvailable = true;
            mockHookState.isApplying = true;
            render(<UpdatePrompt variant="banner" />);

            const button = screen.getByRole("button", { name: /Refresh/ });
            expect(button.disabled).toBe(true);
        });

        it("shows a Later button that hides the prompt until the next detection", () => {
            mockHookState.updateAvailable = true;
            const { container } = render(<UpdatePrompt variant="banner" />);
            detectUpdate();

            fireEvent.click(screen.getByRole("button", { name: "Later" }));
            expect(container.firstChild).toBeNull();
            expect(mockHookState.applyUpdate).not.toHaveBeenCalled();

            detectUpdate();
            expect(screen.getByText("Update available")).toBeDefined();
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

            expect(screen.getByText("Update available")).toBeDefined();
            expect(screen.getByText("A new version is available.")).toBeDefined();
        });

        it("calls applyUpdate when reload button is clicked", () => {
            mockHookState.updateAvailable = true;
            render(<UpdatePrompt variant="modal" />);

            fireEvent.click(screen.getByRole("button", { name: /Refresh/ }));

            expect(mockHookState.applyUpdate).toHaveBeenCalledTimes(1);
        });

        it("disables the reload button when isApplying is true", () => {
            mockHookState.updateAvailable = true;
            mockHookState.isApplying = true;
            render(<UpdatePrompt variant="modal" />);

            const button = screen.getByRole("button", { name: /Refresh/ });
            expect(button.disabled).toBe(true);
        });

        it("shows a Later button that hides the prompt until the next detection", () => {
            mockHookState.updateAvailable = true;
            const { container } = render(<UpdatePrompt variant="modal" />);
            detectUpdate();

            fireEvent.click(screen.getByRole("button", { name: "Later" }));
            expect(container.firstChild).toBeNull();
            expect(mockHookState.applyUpdate).not.toHaveBeenCalled();

            detectUpdate();
            expect(screen.getByText("Update available")).toBeDefined();
        });
    });

    describe("new version number", () => {
        it.each(["banner", "modal"])("shows the version and notes in %s mode", (variant) => {
            mockHookState.updateAvailable = true;
            mockHookState.newVersion = "1.4.0";
            mockHookState.releaseNotes = "Faster sync";
            render(<UpdatePrompt variant={variant} />);

            expect(screen.getByText("Version 1.4.0 is available.")).toBeDefined();
            expect(screen.getByText("Faster sync")).toBeDefined();
            expect(screen.queryByText("A new version is available.")).toBeNull();
        });

        it("accepts a localized messageWithVersion", () => {
            mockHookState.updateAvailable = true;
            mockHookState.newVersion = "2.0";
            render(
                <UpdatePrompt
                    variant="banner"
                    labels={{ messageWithVersion: (v) => `La version ${v} est disponible.` }}
                />
            );

            expect(screen.getByText("La version 2.0 est disponible.")).toBeDefined();
        });

        it("updates the existing toast in place when the version arrives", () => {
            mockHookState.updateAvailable = true;
            const { rerender } = render(<UpdatePrompt />);
            expect(toastCalls.count).toBe(1);

            mockHookState.newVersion = "1.4.0";
            rerender(<UpdatePrompt />);

            expect(toastCalls.count).toBe(2);
            expect(toastCalls.lastArgs[1].id).toBe("toast-1");
            const body = renderToastBody();
            expect(body.getByText("Version 1.4.0 is available.")).toBeDefined();
        });

        it("forwards versionUrl to usePWAUpdate", () => {
            render(<UpdatePrompt versionUrl="/build.json" />);
            expect(mockHookState.options.versionUrl).toBe("/build.json");
        });
    });
});
