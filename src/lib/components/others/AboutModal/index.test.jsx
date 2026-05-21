import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const { toastCalls } = vi.hoisted(() => ({
    toastCalls: { info: [], error: [] },
}));

vi.mock("react-hot-toast", () => {
    const toast = (...args) => {
        toastCalls.info.push(args);
    };
    toast.error = (...args) => {
        toastCalls.error.push(args);
    };
    toast.dismiss = () => {};
    return { default: toast };
});

import { AboutModal } from "./index";

const fakeReg = (overrides = {}) => ({
    update: vi.fn().mockResolvedValue(undefined),
    waiting: null,
    installing: null,
    ...overrides,
});

describe("AboutModal", () => {
    let originalServiceWorker;
    let originalLocation;
    let consoleErrorSpy;

    beforeEach(() => {
        toastCalls.info = [];
        toastCalls.error = [];
        originalServiceWorker = navigator.serviceWorker;
        originalLocation = window.location;
        consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        if (originalServiceWorker === undefined) {
            delete navigator.serviceWorker;
        } else {
            Object.defineProperty(navigator, "serviceWorker", {
                value: originalServiceWorker,
                configurable: true,
            });
        }
        Object.defineProperty(window, "location", {
            value: originalLocation,
            configurable: true,
        });
        consoleErrorSpy.mockRestore();
    });

    const setServiceWorker = (sw) => {
        if (sw === undefined) {
            delete navigator.serviceWorker;
            return;
        }
        Object.defineProperty(navigator, "serviceWorker", {
            value: sw,
            configurable: true,
        });
    };

    describe("rendering", () => {
        it("renders nothing when open is false", () => {
            const { container } = render(
                <AboutModal open={false} onClose={() => {}} appName="MyApp" />
            );
            expect(container.firstChild).toBeNull();
        });

        it("renders title, appName and version when open", () => {
            render(
                <AboutModal
                    open
                    onClose={() => {}}
                    appName="MyApp"
                    version="1.2.3"
                />
            );
            expect(screen.getByText("About")).toBeDefined();
            expect(screen.getByText("MyApp")).toBeDefined();
            expect(screen.getByText("1.2.3")).toBeDefined();
        });

        it("displays a dash when version is missing", () => {
            render(<AboutModal open onClose={() => {}} appName="MyApp" />);
            expect(screen.getByText("-")).toBeDefined();
        });

        it("renders the additional fields prop", () => {
            render(
                <AboutModal
                    open
                    onClose={() => {}}
                    appName="MyApp"
                    version="1.0.0"
                    fields={[
                        { label: "Backend", value: "https://api.example.com" },
                        { label: "User", value: "alice@example.com" },
                    ]}
                />
            );
            expect(screen.getByText("Backend")).toBeDefined();
            expect(screen.getByText("https://api.example.com")).toBeDefined();
            expect(screen.getByText("User")).toBeDefined();
            expect(screen.getByText("alice@example.com")).toBeDefined();
        });

        it("merges custom labels over defaults", () => {
            render(
                <AboutModal
                    open
                    onClose={() => {}}
                    appName="MyApp"
                    labels={{ title: "Custom title", close: "OK" }}
                />
            );
            expect(screen.getByText("Custom title")).toBeDefined();
            expect(screen.getByRole("button", { name: "OK" })).toBeDefined();
            // unchanged labels still come from defaults
            expect(screen.getByText("Application")).toBeDefined();
            expect(screen.getByText("Version")).toBeDefined();
        });
    });

    describe("close behaviour", () => {
        it("calls onClose when the bottom close button is clicked", () => {
            const onClose = vi.fn();
            render(<AboutModal open onClose={onClose} appName="MyApp" />);

            fireEvent.click(screen.getByRole("button", { name: "Close" }));

            expect(onClose).toHaveBeenCalledTimes(1);
        });
    });

    describe("checkForUpdates", () => {
        it("shows error toast when serviceWorker is not supported", async () => {
            setServiceWorker(undefined);
            render(<AboutModal open onClose={() => {}} appName="MyApp" />);

            fireEvent.click(
                screen.getByRole("button", { name: /Check for updates/ })
            );

            await waitFor(() => {
                expect(toastCalls.error.length).toBe(1);
            });
            expect(toastCalls.error[0][0]).toMatch(/Updates not supported/);
        });

        it("shows up-to-date when no registration is found", async () => {
            setServiceWorker({ getRegistration: vi.fn().mockResolvedValue(null) });
            render(<AboutModal open onClose={() => {}} appName="MyApp" />);

            fireEvent.click(
                screen.getByRole("button", { name: /Check for updates/ })
            );

            await waitFor(() => {
                expect(toastCalls.info.length).toBe(1);
            });
            expect(toastCalls.info[0][0]).toBe("Application up to date");
        });

        it("shows install button when a waiting worker exists", async () => {
            const reg = fakeReg({ waiting: { state: "installed" } });
            setServiceWorker({ getRegistration: vi.fn().mockResolvedValue(reg) });

            render(<AboutModal open onClose={() => {}} appName="MyApp" />);

            fireEvent.click(
                screen.getByRole("button", { name: /Check for updates/ })
            );

            await waitFor(() => {
                expect(reg.update).toHaveBeenCalled();
            });
            await waitFor(() => {
                expect(
                    screen.getByRole("button", { name: /Install update/ })
                ).toBeDefined();
            });
        });

        it("shows up-to-date when no waiting/installing worker exists", async () => {
            const reg = fakeReg();
            setServiceWorker({ getRegistration: vi.fn().mockResolvedValue(reg) });

            render(<AboutModal open onClose={() => {}} appName="MyApp" />);

            fireEvent.click(
                screen.getByRole("button", { name: /Check for updates/ })
            );

            await waitFor(() => {
                expect(reg.update).toHaveBeenCalled();
            });
            await waitFor(() => {
                expect(toastCalls.info.length).toBe(1);
            });
            expect(toastCalls.info[0][0]).toBe("Application up to date");
        });

        it("logs and toasts an error when getRegistration throws", async () => {
            setServiceWorker({
                getRegistration: vi.fn().mockRejectedValue(new Error("boom")),
            });

            render(<AboutModal open onClose={() => {}} appName="MyApp" />);

            fireEvent.click(
                screen.getByRole("button", { name: /Check for updates/ })
            );

            await waitFor(() => {
                expect(toastCalls.error.length).toBe(1);
            });
            expect(toastCalls.error[0][0]).toMatch(/Error during check/);
            expect(consoleErrorSpy).toHaveBeenCalled();
        });
    });

    describe("applyUpdate", () => {
        it("reloads the page when install button is clicked", async () => {
            const reg = fakeReg({ waiting: { state: "installed" } });
            setServiceWorker({ getRegistration: vi.fn().mockResolvedValue(reg) });

            const reloadSpy = vi.fn();
            Object.defineProperty(window, "location", {
                value: { ...window.location, reload: reloadSpy },
                configurable: true,
            });

            render(<AboutModal open onClose={() => {}} appName="MyApp" />);

            fireEvent.click(
                screen.getByRole("button", { name: /Check for updates/ })
            );

            const installBtn = await screen.findByRole("button", {
                name: /Install update/,
            });
            fireEvent.click(installBtn);

            expect(reloadSpy).toHaveBeenCalledTimes(1);
        });
    });
});
