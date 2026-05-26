import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const { fakeApi } = vi.hoisted(() => ({
    fakeApi: {
        user: { id: 1, deviceOptions: undefined },
        identifyDevice: () => Promise.resolve({}),
    },
}));

vi.mock("lib/hooks/global/useApi", () => ({
    useApi: () => fakeApi,
    useApiContext: () => fakeApi,
}));

// Same form-primitives stub strategy as LoginComponent: avoid the
// barrel-cycle that prevents <Input>/<Checker>/<Button> from rendering
// their inner DOM under Vitest.
vi.mock("lib/components", async () => {
    const real = await vi.importActual("lib/components");
    return {
        ...real,
        Input: ({ name, type = "text", value, onChange, placeholder, readOnly, required, label, help }) => (
            <label>
                <span>{label}</span>
                {help && <small>{help}</small>}
                <input
                    name={name}
                    type={type}
                    value={value ?? ""}
                    onChange={(e) => onChange?.(e.target.value)}
                    placeholder={placeholder}
                    readOnly={readOnly}
                    required={required}
                />
            </label>
        ),
        Checker: ({ name, value, onChange, options = [], label, type = "radio", required }) => (
            <fieldset>
                <legend>{label}</legend>
                {options.map((opt) => (
                    <label key={opt.value}>
                        <input
                            type={type}
                            name={name}
                            value={opt.value}
                            checked={value === opt.value}
                            onChange={() => onChange?.(opt.value)}
                            required={required}
                        />
                        {opt.label}
                    </label>
                ))}
            </fieldset>
        ),
        Button: ({ label, type = "button", loading, disabled, onClick, children }) => (
            <button type={type} disabled={disabled || loading} onClick={onClick}>
                {label || children}
            </button>
        ),
    };
});

import { DeviceIdentificationComponent } from "./index";

describe("DeviceIdentificationComponent", () => {
    beforeEach(() => {
        fakeApi.user = { id: 1, deviceOptions: undefined };
        fakeApi.identifyDevice = vi.fn().mockResolvedValue({ id: 42 });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe("rendering - no device options", () => {
        it("shows the no-devices description and a label input only", () => {
            fakeApi.user = { id: 1 }; // no deviceOptions
            render(<DeviceIdentificationComponent onSuccess={() => {}} />);

            expect(screen.getByText(/No device is registered/)).toBeDefined();
            expect(screen.getByLabelText(/Device name/i)).toBeDefined();
            // No device picker visible
            expect(screen.queryByLabelText(/Choose a device/i)).toBeNull();
        });

        it("submits with empty uuid and the label entered by the user", async () => {
            fakeApi.user = { id: 1 };
            const onSuccess = vi.fn();
            const { container } = render(
                <DeviceIdentificationComponent onSuccess={onSuccess} />
            );

            const input = container.querySelector('input[name="label"]');
            fireEvent.change(input, { target: { value: "iPhone Eric" } });

            fireEvent.click(screen.getByRole("button", { name: /Validate/i }));

            await waitFor(() => {
                expect(fakeApi.identifyDevice).toHaveBeenCalledTimes(1);
            });
            const [body] = fakeApi.identifyDevice.mock.calls[0];
            expect(body.label).toBe("iPhone Eric");
            expect(body.uuid).toBe("");
            await waitFor(() => {
                expect(onSuccess).toHaveBeenCalledWith({ id: 42 });
            });
        });
    });

    describe("rendering - with device options", () => {
        it("shows the device picker and the description for existing devices", () => {
            fakeApi.user = {
                id: 1,
                deviceOptions: [
                    { uuid: "u-1", label: "Tablet 1" },
                    { uuid: "u-2", label: "Tablet 2" },
                ],
            };
            render(<DeviceIdentificationComponent onSuccess={() => {}} />);

            expect(screen.getByText(/Select one of the devices/)).toBeDefined();
            expect(screen.getByText("Tablet 1")).toBeDefined();
            expect(screen.getByText("Tablet 2")).toBeDefined();
            expect(screen.getByText("New device")).toBeDefined();
        });

        it("hides the label input until the user picks 'new device'", () => {
            fakeApi.user = {
                id: 1,
                deviceOptions: [{ uuid: "u-1", label: "Tablet 1" }],
            };
            const { container } = render(
                <DeviceIdentificationComponent onSuccess={() => {}} />
            );

            // Initially no label input (no selection yet)
            expect(container.querySelector('input[name="label"]')).toBeNull();

            // Pick "New device"
            const newDeviceRadio = screen.getByLabelText("New device");
            fireEvent.click(newDeviceRadio);

            expect(container.querySelector('input[name="label"]')).not.toBeNull();
        });

        it("submits with the picked uuid and empty label when an existing device is chosen", async () => {
            fakeApi.user = {
                id: 1,
                deviceOptions: [{ uuid: "u-1", label: "Tablet 1" }],
            };
            const onSuccess = vi.fn();
            render(<DeviceIdentificationComponent onSuccess={onSuccess} />);

            fireEvent.click(screen.getByLabelText("Tablet 1"));
            fireEvent.click(screen.getByRole("button", { name: /Validate/i }));

            await waitFor(() => {
                expect(fakeApi.identifyDevice).toHaveBeenCalledTimes(1);
            });
            const [body] = fakeApi.identifyDevice.mock.calls[0];
            expect(body.uuid).toBe("u-1");
            expect(body.label).toBe("");
        });

        it("clears the label when switching back from 'New device' to an existing one", () => {
            fakeApi.user = {
                id: 1,
                deviceOptions: [{ uuid: "u-1", label: "Tablet 1" }],
            };
            const { container } = render(
                <DeviceIdentificationComponent onSuccess={() => {}} />
            );

            // Pick "New device", then type
            fireEvent.click(screen.getByLabelText("New device"));
            const input = container.querySelector('input[name="label"]');
            fireEvent.change(input, { target: { value: "typed before swap" } });

            // Pick an existing device -> label input disappears, value is reset
            fireEvent.click(screen.getByLabelText("Tablet 1"));
            expect(container.querySelector('input[name="label"]')).toBeNull();

            // Switch back to "New device" -> input re-appears, empty
            fireEvent.click(screen.getByLabelText("New device"));
            const reappeared = container.querySelector('input[name="label"]');
            expect(reappeared.value).toBe("");
        });
    });

    describe("error handling", () => {
        it("shows the default error message when identifyDevice fails", async () => {
            fakeApi.user = { id: 1 };
            fakeApi.identifyDevice = vi.fn().mockRejectedValue(new Error("net"));

            const onError = vi.fn();
            const { container } = render(
                <DeviceIdentificationComponent onSuccess={() => {}} onError={onError} />
            );

            fireEvent.change(container.querySelector('input[name="label"]'), {
                target: { value: "x" },
            });
            fireEvent.click(screen.getByRole("button", { name: /Validate/i }));

            await waitFor(() => {
                expect(screen.getByRole("alert").textContent).toMatch(/Failed to register the device/);
            });
            expect(onError).toHaveBeenCalled();
        });

        it("uses getErrorLabel when provided", async () => {
            fakeApi.user = { id: 1 };
            fakeApi.identifyDevice = vi.fn().mockRejectedValue({ statusCode: 409 });

            const getErrorLabel = vi.fn(() => "Already taken");

            const { container } = render(
                <DeviceIdentificationComponent
                    onSuccess={() => {}}
                    getErrorLabel={getErrorLabel}
                />
            );

            fireEvent.change(container.querySelector('input[name="label"]'), {
                target: { value: "x" },
            });
            fireEvent.click(screen.getByRole("button", { name: /Validate/i }));

            await waitFor(() => {
                expect(getErrorLabel).toHaveBeenCalled();
            });
            expect(screen.getByRole("alert").textContent).toBe("Already taken");
        });
    });

    describe("labels override", () => {
        it("merges custom labels over defaults", () => {
            fakeApi.user = { id: 1 };
            render(
                <DeviceIdentificationComponent
                    onSuccess={() => {}}
                    labels={{
                        title: "Pick a device",
                        submitLabel: "OK",
                    }}
                />
            );
            expect(screen.getByText("Pick a device")).toBeDefined();
            expect(screen.getByRole("button", { name: "OK" })).toBeDefined();
            // Unchanged labels still come from defaults
            expect(screen.getByText(/Device name/i)).toBeDefined();
        });
    });

    describe("icon", () => {
        it("renders a default icon by default", () => {
            fakeApi.user = { id: 1 };
            const { container } = render(
                <DeviceIdentificationComponent onSuccess={() => {}} />
            );
            expect(container.querySelector("svg")).not.toBeNull();
        });

        it("hides the icon (and title block) when icon=null", () => {
            fakeApi.user = { id: 1 };
            const { container } = render(
                <DeviceIdentificationComponent onSuccess={() => {}} icon={null} />
            );
            // No svg = no icon = no title block
            expect(container.querySelector("svg")).toBeNull();
            expect(screen.queryByRole("heading")).toBeNull();
        });
    });

    describe("identifyTimeoutMs", () => {
        it("uses identifyTimeoutMs over abortTimeoutMs when provided", async () => {
            fakeApi.user = { id: 1 };
            let capturedSignal = null;
            fakeApi.identifyDevice = vi.fn((body, opts) => {
                capturedSignal = opts?.signal;
                return Promise.resolve({});
            });

            const { container } = render(
                <DeviceIdentificationComponent
                    onSuccess={() => {}}
                    identifyTimeoutMs={3000}
                    abortTimeoutMs={9999}
                />
            );

            fireEvent.change(container.querySelector('input[name="label"]'), {
                target: { value: "x" },
            });
            fireEvent.click(screen.getByRole("button", { name: /Validate/i }));

            await waitFor(() => {
                expect(fakeApi.identifyDevice).toHaveBeenCalled();
            });
            expect(capturedSignal).toBeInstanceOf(AbortSignal);
        });
    });

    // -------------------------------------------------------------
    // viewport_mode integration (smartcommon 1.0.335)
    // -------------------------------------------------------------

    describe("viewport_mode", () => {
        it("renders the viewport-mode radio with the auto-detected option pre-selected", () => {
            fakeApi.user = { id: 1 };
            render(
                <DeviceIdentificationComponent
                    onSuccess={() => {}}
                    defaultViewportMode="tablet"
                />
            );
            expect(screen.getByText("Device type")).toBeDefined();
            expect(screen.getByText("Tablet")).toBeDefined();
            expect(screen.getByText("Smartphone")).toBeDefined();
            // The "Tablet" option is pre-checked.
            const tabletRadio = screen.getByLabelText("Tablet");
            expect(tabletRadio.checked).toBe(true);
        });

        it("submits with viewport_mode in the body on the new device path", async () => {
            fakeApi.user = { id: 1 };
            const { container } = render(
                <DeviceIdentificationComponent
                    onSuccess={() => {}}
                    defaultViewportMode="auto"
                />
            );

            fireEvent.change(container.querySelector('input[name="label"]'), {
                target: { value: "iPad" },
            });
            // Switch to "Desktop"
            fireEvent.click(screen.getByLabelText("Desktop"));
            fireEvent.click(screen.getByRole("button", { name: /Validate/i }));

            await waitFor(() => {
                expect(fakeApi.identifyDevice).toHaveBeenCalledTimes(1);
            });
            const [body] = fakeApi.identifyDevice.mock.calls[0];
            expect(body.label).toBe("iPad");
            expect(body.viewport_mode).toBe("desktop");
        });

        it("omits viewport_mode from the body when enableViewportMode={false}", async () => {
            fakeApi.user = { id: 1 };
            const { container } = render(
                <DeviceIdentificationComponent
                    onSuccess={() => {}}
                    enableViewportMode={false}
                />
            );

            // Radio should not be rendered.
            expect(screen.queryByText("Device type")).toBeNull();

            fireEvent.change(container.querySelector('input[name="label"]'), {
                target: { value: "x" },
            });
            fireEvent.click(screen.getByRole("button", { name: /Validate/i }));

            await waitFor(() => {
                expect(fakeApi.identifyDevice).toHaveBeenCalledTimes(1);
            });
            const [body] = fakeApi.identifyDevice.mock.calls[0];
            expect(body.viewport_mode).toBeUndefined();
        });

        it("hides the viewport-mode radio on the existing-device path", () => {
            fakeApi.user = {
                id: 1,
                deviceOptions: [{ uuid: "u-1", label: "Tablet 1" }],
            };
            render(<DeviceIdentificationComponent onSuccess={() => {}} />);

            // No device picked yet -> no label input and no viewport radio
            expect(screen.queryByText("Device type")).toBeNull();

            // Pick the existing device -> still no viewport radio
            fireEvent.click(screen.getByLabelText("Tablet 1"));
            expect(screen.queryByText("Device type")).toBeNull();
        });

        it("shows the viewport-mode radio again when the user picks 'New device' in the picker", () => {
            fakeApi.user = {
                id: 1,
                deviceOptions: [{ uuid: "u-1", label: "Tablet 1" }],
            };
            render(<DeviceIdentificationComponent onSuccess={() => {}} />);

            // Initially neither picker option selected -> no viewport radio
            expect(screen.queryByText("Device type")).toBeNull();
            // Pick "New device" -> viewport radio appears
            fireEvent.click(screen.getByLabelText("New device"));
            expect(screen.getByText("Device type")).toBeDefined();
        });

        it("does not crash when no ViewportProvider is mounted (legacy hosts)", async () => {
            // The component must keep working when wrapped by a host
            // that has not yet mounted ViewportProvider. With no
            // context, the post-submit viewport sync is a no-op and
            // onSuccess fires as usual.
            fakeApi.user = { id: 1 };
            const onSuccess = vi.fn();
            const { container } = render(
                <DeviceIdentificationComponent
                    onSuccess={onSuccess}
                    defaultViewportMode="tablet"
                />
            );

            fireEvent.change(container.querySelector('input[name="label"]'), {
                target: { value: "x" },
            });
            fireEvent.click(screen.getByRole("button", { name: /Validate/i }));

            await waitFor(() => {
                expect(onSuccess).toHaveBeenCalledWith({ id: 42 });
            });
        });
    });
});

// -------------------------------------------------------------
// Viewport sync after submit -- needs a ViewportContext.Provider
// -------------------------------------------------------------

describe("DeviceIdentificationComponent viewport sync", () => {
    beforeEach(() => {
        fakeApi.user = { id: 1, deviceOptions: undefined };
        fakeApi.identifyDevice = vi.fn().mockResolvedValue({ id: 42 });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("calls setPreference(applied, { silent: true }) when the chosen mode differs from current preference", async () => {
        const { ViewportContext } = await import("lib/components/app/ViewportProvider/context");
        const setPreference = vi.fn().mockResolvedValue();
        const onSuccess = vi.fn();
        fakeApi.user = { id: 1 };

        const { container } = render(
            <ViewportContext.Provider
                value={{ viewport: "mobile", preference: "auto", setPreference, isMobile: true, isTablet: false, isDesktop: false }}
            >
                <DeviceIdentificationComponent
                    onSuccess={onSuccess}
                    defaultViewportMode="tablet"
                />
            </ViewportContext.Provider>
        );

        fireEvent.change(container.querySelector('input[name="label"]'), {
            target: { value: "iPad" },
        });
        fireEvent.click(screen.getByRole("button", { name: /Validate/i }));

        await waitFor(() => {
            expect(fakeApi.identifyDevice).toHaveBeenCalledTimes(1);
        });
        await waitFor(() => {
            expect(setPreference).toHaveBeenCalledWith("tablet", { silent: true });
        });
        // setPreference reloads, so onSuccess must NOT have fired.
        expect(onSuccess).not.toHaveBeenCalled();
    });

    it("does not call setPreference when the chosen mode matches the current preference", async () => {
        const { ViewportContext } = await import("lib/components/app/ViewportProvider/context");
        const setPreference = vi.fn().mockResolvedValue();
        const onSuccess = vi.fn();
        fakeApi.user = { id: 1 };

        const { container } = render(
            <ViewportContext.Provider
                value={{ viewport: "tablet", preference: "tablet", setPreference, isMobile: false, isTablet: true, isDesktop: false }}
            >
                <DeviceIdentificationComponent
                    onSuccess={onSuccess}
                    defaultViewportMode="tablet"
                />
            </ViewportContext.Provider>
        );

        fireEvent.change(container.querySelector('input[name="label"]'), {
            target: { value: "iPad" },
        });
        fireEvent.click(screen.getByRole("button", { name: /Validate/i }));

        await waitFor(() => {
            expect(onSuccess).toHaveBeenCalledWith({ id: 42 });
        });
        expect(setPreference).not.toHaveBeenCalled();
    });

    it("applies the stored viewport_mode after picking a known existing device", async () => {
        const { ViewportContext } = await import("lib/components/app/ViewportProvider/context");
        const setPreference = vi.fn().mockResolvedValue();
        const onSuccess = vi.fn();
        fakeApi.user = {
            id: 1,
            deviceOptions: [{ uuid: "u-1", label: "mon iPad" }],
            existingUserDevices: [
                { id: 7, label: "mon iPad", icon: "tablet", viewport_mode: "desktop" },
            ],
        };

        render(
            <ViewportContext.Provider
                value={{ viewport: "tablet", preference: "auto", setPreference, isMobile: false, isTablet: true, isDesktop: false }}
            >
                <DeviceIdentificationComponent onSuccess={onSuccess} />
            </ViewportContext.Provider>
        );

        fireEvent.click(screen.getByLabelText("mon iPad"));
        fireEvent.click(screen.getByRole("button", { name: /Validate/i }));

        await waitFor(() => {
            expect(fakeApi.identifyDevice).toHaveBeenCalledTimes(1);
        });
        // The picker submission must NOT include viewport_mode in the
        // body (the backend already knows the stored choice; sending
        // it would clobber an explicit user override later).
        const [body] = fakeApi.identifyDevice.mock.calls[0];
        expect(body.viewport_mode).toBeUndefined();
        await waitFor(() => {
            expect(setPreference).toHaveBeenCalledWith("desktop", { silent: true });
        });
    });
});
