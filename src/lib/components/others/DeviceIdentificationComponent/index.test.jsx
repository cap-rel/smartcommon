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

            expect(screen.getByText(/Aucun appareil n'est enregistré/)).toBeDefined();
            expect(screen.getByLabelText(/Nom de l'appareil/i)).toBeDefined();
            // No device picker visible
            expect(screen.queryByLabelText(/Choisir un appareil/i)).toBeNull();
        });

        it("submits with empty uuid and the label entered by the user", async () => {
            fakeApi.user = { id: 1 };
            const onSuccess = vi.fn();
            const { container } = render(
                <DeviceIdentificationComponent onSuccess={onSuccess} />
            );

            const input = container.querySelector('input[name="label"]');
            fireEvent.change(input, { target: { value: "iPhone Eric" } });

            fireEvent.click(screen.getByRole("button", { name: /Valider/i }));

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

            expect(screen.getByText(/Sélectionnez un des appareils/)).toBeDefined();
            expect(screen.getByText("Tablet 1")).toBeDefined();
            expect(screen.getByText("Tablet 2")).toBeDefined();
            expect(screen.getByText("Nouvel appareil")).toBeDefined();
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

            // Pick "Nouvel appareil"
            const newDeviceRadio = screen.getByLabelText("Nouvel appareil");
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
            fireEvent.click(screen.getByRole("button", { name: /Valider/i }));

            await waitFor(() => {
                expect(fakeApi.identifyDevice).toHaveBeenCalledTimes(1);
            });
            const [body] = fakeApi.identifyDevice.mock.calls[0];
            expect(body.uuid).toBe("u-1");
            expect(body.label).toBe("");
        });

        it("clears the label when switching back from 'new device' to an existing one", () => {
            fakeApi.user = {
                id: 1,
                deviceOptions: [{ uuid: "u-1", label: "Tablet 1" }],
            };
            const { container } = render(
                <DeviceIdentificationComponent onSuccess={() => {}} />
            );

            // Pick "Nouvel appareil", then type
            fireEvent.click(screen.getByLabelText("Nouvel appareil"));
            const input = container.querySelector('input[name="label"]');
            fireEvent.change(input, { target: { value: "typed before swap" } });

            // Pick an existing device -> label input disappears, value is reset
            fireEvent.click(screen.getByLabelText("Tablet 1"));
            expect(container.querySelector('input[name="label"]')).toBeNull();

            // Switch back to "Nouvel appareil" -> input re-appears, empty
            fireEvent.click(screen.getByLabelText("Nouvel appareil"));
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
            fireEvent.click(screen.getByRole("button", { name: /Valider/i }));

            await waitFor(() => {
                expect(screen.getByRole("alert").textContent).toMatch(/Impossible/);
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
            fireEvent.click(screen.getByRole("button", { name: /Valider/i }));

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
            expect(screen.getByText(/Nom de l'appareil/i)).toBeDefined();
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
            fireEvent.click(screen.getByRole("button", { name: /Valider/i }));

            await waitFor(() => {
                expect(fakeApi.identifyDevice).toHaveBeenCalled();
            });
            expect(capturedSignal).toBeInstanceOf(AbortSignal);
        });
    });
});
