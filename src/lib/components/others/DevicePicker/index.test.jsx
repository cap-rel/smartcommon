import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import {
    DEFAULT_LABELS,
    DEFAULT_DEVICE_ICON,
    DEVICE_LABEL_MAX_LENGTH,
    SUPPORTED_DEVICE_ICONS,
    formatSessionCount,
    normaliseDeviceIcon,
} from "./props";

// Same form-primitives stub strategy as LoginComponent: bypass the
// lib/components <-> lib/hooks barrel cycle under Vitest.
vi.mock("lib/components", async () => {
    const real = await vi.importActual("lib/components");
    return {
        ...real,
        Input: ({ name, type = "text", value, onChange, placeholder, readOnly, required, maxLength, label, help }) => (
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
                    maxLength={maxLength}
                />
            </label>
        ),
        Select: ({ name, value, onChange, options = [], label }) => (
            <label>
                <span>{label}</span>
                <select
                    name={name}
                    value={value ?? ""}
                    onChange={(e) => onChange?.(e.target.value)}
                >
                    {options.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </select>
            </label>
        ),
        Button: ({ label, type = "button", loading, disabled, onClick, children }) => (
            <button type={type} disabled={disabled || loading} onClick={onClick}>
                {label || children}
            </button>
        ),
    };
});

import { DevicePicker } from "./index";

describe("normaliseDeviceIcon", () => {
    it("returns the icon when it is in the whitelist", () => {
        SUPPORTED_DEVICE_ICONS.forEach((key) => {
            expect(normaliseDeviceIcon(key)).toBe(key);
        });
    });

    it("falls back to the default icon for unknown / malformed values", () => {
        expect(normaliseDeviceIcon("watch")).toBe(DEFAULT_DEVICE_ICON);
        expect(normaliseDeviceIcon(null)).toBe(DEFAULT_DEVICE_ICON);
        expect(normaliseDeviceIcon(undefined)).toBe(DEFAULT_DEVICE_ICON);
        expect(normaliseDeviceIcon(42)).toBe(DEFAULT_DEVICE_ICON);
    });
});

describe("formatSessionCount", () => {
    it("uses the singular label for 0 or 1 sessions", () => {
        expect(formatSessionCount(0, DEFAULT_LABELS)).toBe(DEFAULT_LABELS.sessionsSingular);
        expect(formatSessionCount(1, DEFAULT_LABELS)).toBe(DEFAULT_LABELS.sessionsSingular);
    });

    it("substitutes {count} in the plural template", () => {
        expect(formatSessionCount(5, DEFAULT_LABELS)).toBe(
            DEFAULT_LABELS.sessionsPlural.replace("{count}", "5")
        );
    });

    it("treats non-numeric input as zero", () => {
        expect(formatSessionCount(undefined, DEFAULT_LABELS)).toBe(DEFAULT_LABELS.sessionsSingular);
        expect(formatSessionCount(NaN, DEFAULT_LABELS)).toBe(DEFAULT_LABELS.sessionsSingular);
    });
});

describe("DevicePicker - empty existingDevices", () => {
    beforeEach(() => {
        // Nothing to reset between tests; each test renders its own.
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("renders the form directly when there is no existing device", () => {
        render(
            <DevicePicker
                existingDevices={[]}
                onPick={vi.fn()}
                onCreate={vi.fn()}
            />
        );
        expect(screen.getByText(DEFAULT_LABELS.title)).toBeDefined();
        expect(screen.getByText(DEFAULT_LABELS.newDeviceTitle)).toBeDefined();
        expect(screen.queryByText(DEFAULT_LABELS.newDeviceButton)).toBeNull();
    });

    it("calls onCreate with trimmed label and the chosen icon", async () => {
        const onCreate = vi.fn().mockResolvedValue({});
        const { container } = render(
            <DevicePicker
                existingDevices={[]}
                onPick={vi.fn()}
                onCreate={onCreate}
            />
        );

        const input = container.querySelector('input[name="label"]');
        fireEvent.change(input, { target: { value: "  mon iPhone  " } });

        const select = container.querySelector('select[name="icon"]');
        fireEvent.change(select, { target: { value: "tablet" } });

        fireEvent.click(screen.getByRole("button", { name: DEFAULT_LABELS.submitNew }));

        await waitFor(() => {
            expect(onCreate).toHaveBeenCalledTimes(1);
        });
        expect(onCreate).toHaveBeenCalledWith("mon iPhone", "tablet");
    });

    it("rejects an empty label with the validation message", () => {
        const onCreate = vi.fn();
        const { container } = render(
            <DevicePicker
                existingDevices={[]}
                onPick={vi.fn()}
                onCreate={onCreate}
            />
        );

        // Force-submit via the form (bypasses HTML5 required on stubs).
        const form = container.querySelector("form");
        fireEvent.submit(form);

        expect(onCreate).not.toHaveBeenCalled();
        expect(screen.getByRole("alert").textContent)
            .toBe(DEFAULT_LABELS.validationLabelRequired);
    });

    it("rejects a label longer than the max length with the validation message", () => {
        const onCreate = vi.fn();
        const { container } = render(
            <DevicePicker
                existingDevices={[]}
                onPick={vi.fn()}
                onCreate={onCreate}
            />
        );

        // Bypass the stub maxLength clamp by setting the field via React
        // state: in this stub the value is forwarded straight back, so a
        // long value DOES reach onChange. We assert the JS guard catches
        // it before calling onCreate.
        const long = "a".repeat(DEVICE_LABEL_MAX_LENGTH + 1);
        const input = container.querySelector('input[name="label"]');
        fireEvent.change(input, { target: { value: long } });

        const form = container.querySelector("form");
        fireEvent.submit(form);

        expect(onCreate).not.toHaveBeenCalled();
        expect(screen.getByRole("alert").textContent)
            .toBe(DEFAULT_LABELS.validationLabelTooLong);
    });

    it("falls back to the default icon when the icon prop is invalid", async () => {
        const onCreate = vi.fn().mockResolvedValue({});
        const { container } = render(
            <DevicePicker
                existingDevices={[]}
                onPick={vi.fn()}
                onCreate={onCreate}
            />
        );

        // Drive the icon state to an invalid value directly by mutating
        // the select. The stub forwards the raw value.
        const select = container.querySelector('select[name="icon"]');
        // The select only contains the four whitelist values, so changing
        // its value to e.g. "watch" via fireEvent.change is a no-op on the
        // DOM (it stays on the previous valid value). This verifies the
        // whitelist is respected at the rendering level.
        fireEvent.change(select, { target: { value: "watch" } });

        const input = container.querySelector('input[name="label"]');
        fireEvent.change(input, { target: { value: "Test" } });

        fireEvent.click(screen.getByRole("button", { name: DEFAULT_LABELS.submitNew }));

        await waitFor(() => {
            expect(onCreate).toHaveBeenCalledTimes(1);
        });
        // The icon stays at the default ("phone") because the select
        // refused the unknown value.
        expect(onCreate).toHaveBeenCalledWith("Test", DEFAULT_DEVICE_ICON);
    });
});

describe("DevicePicker - with existingDevices", () => {
    const sampleDevices = [
        {
            id: 12,
            label: "mon iPhone",
            icon: "phone",
            date_lastseen: "2026-05-11 14:23:00",
            session_count: 3,
        },
        {
            id: 15,
            label: "MacBook bureau",
            icon: "laptop",
            date_lastseen: "2026-05-10 09:00:00",
            session_count: 1,
        },
    ];

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("renders one card per existing device with label and session count", () => {
        render(
            <DevicePicker
                existingDevices={sampleDevices}
                onPick={vi.fn()}
                onCreate={vi.fn()}
            />
        );
        expect(screen.getByText("mon iPhone")).toBeDefined();
        expect(screen.getByText("MacBook bureau")).toBeDefined();
        expect(screen.getByText(/3 applications connectées/)).toBeDefined();
        expect(screen.getByText(/1 application connectée/)).toBeDefined();
    });

    it("calls onPick with the device id when a card is clicked", async () => {
        const onPick = vi.fn().mockResolvedValue({});
        render(
            <DevicePicker
                existingDevices={sampleDevices}
                onPick={onPick}
                onCreate={vi.fn()}
            />
        );

        fireEvent.click(screen.getByText("mon iPhone"));

        await waitFor(() => {
            expect(onPick).toHaveBeenCalledTimes(1);
        });
        expect(onPick).toHaveBeenCalledWith(12);
    });

    it("switches to the form when the '+ Nouvel appareil' button is clicked", () => {
        render(
            <DevicePicker
                existingDevices={sampleDevices}
                onPick={vi.fn()}
                onCreate={vi.fn()}
            />
        );

        // Form not visible initially.
        expect(screen.queryByText(DEFAULT_LABELS.newDeviceTitle)).toBeNull();

        fireEvent.click(screen.getByText(DEFAULT_LABELS.newDeviceButton));

        expect(screen.getByText(DEFAULT_LABELS.newDeviceTitle)).toBeDefined();
        // The cards are now hidden behind the form.
        expect(screen.queryByText("mon iPhone")).toBeNull();
    });

    it("returns to the list when the back link is clicked from the form", () => {
        render(
            <DevicePicker
                existingDevices={sampleDevices}
                onPick={vi.fn()}
                onCreate={vi.fn()}
            />
        );

        fireEvent.click(screen.getByText(DEFAULT_LABELS.newDeviceButton));
        expect(screen.getByText(DEFAULT_LABELS.newDeviceTitle)).toBeDefined();

        // Inside the form, the back link reuses the "Annuler" label.
        const backLink = screen.getByRole("button", { name: DEFAULT_LABELS.cancel });
        fireEvent.click(backLink);

        expect(screen.queryByText(DEFAULT_LABELS.newDeviceTitle)).toBeNull();
        expect(screen.getByText("mon iPhone")).toBeDefined();
    });

    it("disables every interactive control while loading", () => {
        const { container } = render(
            <DevicePicker
                existingDevices={sampleDevices}
                onPick={vi.fn()}
                onCreate={vi.fn()}
                loading
            />
        );

        const itemButtons = container.querySelectorAll('button[data-device-id]');
        expect(itemButtons.length).toBe(2);
        itemButtons.forEach((b) => expect(b.disabled).toBe(true));

        // The "+ Nouvel appareil" button is disabled too.
        const newDeviceButton = screen.getByText(DEFAULT_LABELS.newDeviceButton);
        expect(newDeviceButton.disabled).toBe(true);
    });

    it("shows the external error message above the list", () => {
        render(
            <DevicePicker
                existingDevices={sampleDevices}
                onPick={vi.fn()}
                onCreate={vi.fn()}
                error="Backend a refusé l'association"
            />
        );

        expect(screen.getByRole("alert").textContent)
            .toBe("Backend a refusé l'association");
    });

    it("does not lose the form pre-fill when the user toggles back from list -> form -> list -> form", () => {
        // Smoke test for state lifecycle: when the user switches from
        // the form back to the list and then opens the form again, the
        // previously typed label should still be there (we don't auto-
        // reset it).
        const { container } = render(
            <DevicePicker
                existingDevices={sampleDevices}
                onPick={vi.fn()}
                onCreate={vi.fn()}
            />
        );

        fireEvent.click(screen.getByText(DEFAULT_LABELS.newDeviceButton));
        const input = container.querySelector('input[name="label"]');
        fireEvent.change(input, { target: { value: "kept value" } });

        fireEvent.click(screen.getByRole("button", { name: DEFAULT_LABELS.cancel }));
        // Back on the list.
        expect(screen.queryByText(DEFAULT_LABELS.newDeviceTitle)).toBeNull();

        fireEvent.click(screen.getByText(DEFAULT_LABELS.newDeviceButton));
        const inputAgain = container.querySelector('input[name="label"]');
        expect(inputAgain.value).toBe("kept value");
    });

    it("renders a top-level Annuler button when onCancel is provided", () => {
        const onCancel = vi.fn();
        render(
            <DevicePicker
                existingDevices={sampleDevices}
                onPick={vi.fn()}
                onCreate={vi.fn()}
                onCancel={onCancel}
            />
        );

        // Two buttons named "Annuler" if we open the form, but on the
        // list view there is exactly one.
        const cancelButtons = screen.getAllByRole("button", { name: DEFAULT_LABELS.cancel });
        expect(cancelButtons.length).toBe(1);

        fireEvent.click(cancelButtons[0]);
        expect(onCancel).toHaveBeenCalledTimes(1);
    });
});
