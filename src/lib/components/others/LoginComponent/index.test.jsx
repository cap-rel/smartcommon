import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";

import { extractPairingId } from "./props";

const { fakeApi, scannerProps } = vi.hoisted(() => ({
    fakeApi: {
        login: () => Promise.resolve({}),
        getEntities: () => Promise.resolve({ entities: [] }),
        claimQrPair: () => Promise.resolve({}),
        pollQrPair: () => Promise.resolve({}),
    },
    scannerProps: { current: null },
}));

vi.mock("lib/hooks/global/useApi", () => ({
    useApi: () => fakeApi,
    useApiContext: () => fakeApi,
}));

// Replace BarcodeScanner with a transparent stub: render a small div that
// exposes onScan/onClose callbacks via a shared ref so tests can drive them.
vi.mock("lib/components/others/BarcodeScanner", () => ({
    BarcodeScanner: (props) => {
        scannerProps.current = props;
        if (!props.open) return null;
        return (
            <div data-testid="scanner-stub">
                <span data-testid="scanner-title">{props.labels?.title}</span>
                <div data-testid="scanner-feedback">{props.feedbackContent}</div>
            </div>
        );
    },
}));

// Smartcommon form primitives have a barrel-cycle issue under Vitest that
// prevents <Input>/<Select>/<Boolean> from rendering their inner <input>.
// We don't need to test those here - LoginComponent's behaviour is what
// matters - so swap them with minimal HTML stubs.
vi.mock("lib/components", async () => {
    const real = await vi.importActual("lib/components");
    return {
        ...real,
        Input: ({ name, type = "text", value, onChange, placeholder, readOnly, label }) => (
            <label>
                <span>{label}</span>
                <input
                    name={name}
                    type={type}
                    value={value ?? ""}
                    onChange={(e) => onChange?.(e.target.value)}
                    placeholder={placeholder}
                    readOnly={readOnly}
                />
            </label>
        ),
        Select: ({ name, value, onChange, options = [], label, placeholder }) => (
            <label>
                <span>{label}</span>
                <select
                    name={name}
                    value={value ?? ""}
                    onChange={(e) => onChange?.(e.target.value)}
                >
                    <option value="">{placeholder}</option>
                    {options.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </select>
            </label>
        ),
        Boolean: ({ name, value, onChange, label }) => (
            <label>
                <input
                    name={name}
                    type="checkbox"
                    checked={!!value}
                    onChange={(e) => onChange?.(e.target.checked)}
                />
                <span>{label}</span>
            </label>
        ),
        Button: ({ label, type = "button", loading, disabled, onClick, children }) => (
            <button type={type} disabled={disabled || loading} onClick={onClick}>
                {label || children}
            </button>
        ),
    };
});

import { LoginComponent } from "./index";

describe("extractPairingId", () => {
    it("accepts a bare 32-hex string", () => {
        const id = "deadbeef".repeat(4);
        expect(extractPairingId(id)).toBe(id);
        expect(extractPairingId(id.toUpperCase())).toBe(id);
    });

    it("extracts pairing_id from a /qrpair/ URL", () => {
        const id = "abcdef01".repeat(4);
        expect(extractPairingId(`https://example.com/qrpair/${id}`)).toBe(id);
        expect(extractPairingId(`https://example.com/qr-pair/${id}`)).toBe(id);
    });

    it("extracts pairing_id from a JSON-like payload", () => {
        const id = "11223344".repeat(4);
        expect(extractPairingId(`{"pairing_id":"${id}"}`)).toBe(id);
    });

    it("returns null for invalid input", () => {
        expect(extractPairingId("")).toBeNull();
        expect(extractPairingId("not a code")).toBeNull();
        expect(extractPairingId("xx")).toBeNull();
        expect(extractPairingId("zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz")).toBeNull();
        expect(extractPairingId(null)).toBeNull();
        expect(extractPairingId(undefined)).toBeNull();
    });
});

describe("LoginComponent - password mode", () => {
    beforeEach(() => {
        fakeApi.login = vi.fn().mockResolvedValue({ id: 7, email: "u@x.com" });
        fakeApi.getEntities = vi.fn().mockResolvedValue({ entities: [] });
        fakeApi.claimQrPair = vi.fn();
        fakeApi.pollQrPair = vi.fn();
        scannerProps.current = null;
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    const emailInput = (container) => container.querySelector('input[name="email"]');
    const passwordInput = (container) => container.querySelector('input[name="password"]');

    it("renders email and password fields", () => {
        const { container } = render(<LoginComponent onSuccess={() => {}} />);
        expect(emailInput(container)).not.toBeNull();
        expect(passwordInput(container)).not.toBeNull();
        expect(screen.getByRole("button", { name: /Se connecter/i })).toBeDefined();
    });

    it("calls api.login with the form values on submit", async () => {
        const onSuccess = vi.fn();
        const { container } = render(
            <LoginComponent onSuccess={onSuccess} showEntities={false} />
        );

        fireEvent.change(emailInput(container), { target: { value: "u@x.com" } });
        fireEvent.change(passwordInput(container), { target: { value: "secret" } });
        fireEvent.click(screen.getByRole("button", { name: /Se connecter/i }));

        await waitFor(() => {
            expect(fakeApi.login).toHaveBeenCalledTimes(1);
        });
        const [body] = fakeApi.login.mock.calls[0];
        expect(body.email).toBe("u@x.com");
        expect(body.password).toBe("secret");
        expect(body.entity).toBeUndefined();

        await waitFor(() => {
            expect(onSuccess).toHaveBeenCalledWith({ id: 7, email: "u@x.com" });
        });
    });

    it("shows an error message when api.login fails", async () => {
        fakeApi.login = vi.fn().mockRejectedValue(new Error("nope"));
        const onError = vi.fn();
        const { container } = render(
            <LoginComponent
                onSuccess={() => {}}
                onError={onError}
                showEntities={false}
            />
        );

        fireEvent.change(emailInput(container), { target: { value: "u@x.com" } });
        fireEvent.change(passwordInput(container), { target: { value: "x" } });
        fireEvent.click(screen.getByRole("button", { name: /Se connecter/i }));

        await waitFor(() => {
            expect(screen.getByRole("alert")).toBeDefined();
        });
        expect(onError).toHaveBeenCalled();
    });

    it("does not submit when fields are empty", () => {
        render(<LoginComponent onSuccess={() => {}} showEntities={false} />);

        fireEvent.click(screen.getByRole("button", { name: /Se connecter/i }));

        expect(fakeApi.login).not.toHaveBeenCalled();
        expect(screen.getByRole("alert")).toBeDefined();
    });

    it("loads entities at mount and shows the Select when not empty", async () => {
        fakeApi.getEntities = vi.fn().mockResolvedValue({
            entities: [
                { id: 1, label: "Entity A" },
                { id: 2, label: "Entity B" },
            ],
        });
        const { container } = render(<LoginComponent onSuccess={() => {}} />);

        await waitFor(() => {
            expect(fakeApi.getEntities).toHaveBeenCalled();
        });
        await waitFor(() => {
            expect(container.querySelector('[name="entity"], select')).not.toBeNull();
        });
    });

    it("does not render Entity select when getEntities returns empty", async () => {
        fakeApi.getEntities = vi.fn().mockResolvedValue({ entities: [] });
        const { container } = render(<LoginComponent onSuccess={() => {}} />);

        await waitFor(() => {
            expect(fakeApi.getEntities).toHaveBeenCalled();
        });
        expect(container.querySelector('select[name="entity"]')).toBeNull();
    });

    it("does not call getEntities when showEntities is false", () => {
        render(<LoginComponent onSuccess={() => {}} showEntities={false} />);
        expect(fakeApi.getEntities).not.toHaveBeenCalled();
    });

    it("hides the Remember me checkbox by default", () => {
        render(<LoginComponent onSuccess={() => {}} showEntities={false} />);
        expect(screen.queryByText(/Se souvenir/i)).toBeNull();
    });

    it("shows the Remember me checkbox when showRememberMe is true", () => {
        render(
            <LoginComponent onSuccess={() => {}} showEntities={false} showRememberMe />
        );
        expect(screen.getByText(/Se souvenir/i)).toBeDefined();
    });
});

describe("LoginComponent - QR pair mode", () => {
    beforeEach(() => {
        fakeApi.login = vi.fn();
        fakeApi.getEntities = vi.fn().mockResolvedValue({ entities: [] });
        fakeApi.claimQrPair = vi.fn();
        fakeApi.pollQrPair = vi.fn();
        scannerProps.current = null;
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.clearAllMocks();
    });

    it("hides the QR scan button when enableQrPair is false", () => {
        render(<LoginComponent onSuccess={() => {}} showEntities={false} />);
        expect(screen.queryByText(/Scanner un QR code/i)).toBeNull();
    });

    it("opens the scanner when the QR button is clicked", () => {
        render(
            <LoginComponent onSuccess={() => {}} showEntities={false} enableQrPair />
        );
        expect(screen.queryByTestId("scanner-stub")).toBeNull();

        fireEvent.click(screen.getByText(/Scanner un QR code/i));

        expect(screen.getByTestId("scanner-stub")).toBeDefined();
    });

    it("rejects an invalid QR payload", async () => {
        render(
            <LoginComponent onSuccess={() => {}} showEntities={false} enableQrPair />
        );
        fireEvent.click(screen.getByText(/Scanner un QR code/i));

        await act(async () => {
            scannerProps.current.onScan("not-a-pairing-id");
        });

        expect(fakeApi.claimQrPair).not.toHaveBeenCalled();
        expect(screen.getByRole("alert").textContent).toMatch(/QR code/);
    });

    it("calls claimQrPair with the extracted pairing id and the device label", async () => {
        const id = "deadbeef".repeat(4);
        fakeApi.claimQrPair = vi.fn().mockResolvedValue({
            status: "claimed",
            claim_token: "tok-1",
        });
        fakeApi.pollQrPair = vi.fn().mockResolvedValue({ status: "pending" });

        render(
            <LoginComponent
                onSuccess={() => {}}
                showEntities={false}
                enableQrPair
                deviceLabel="iPhone Eric"
                deviceUuid="u-1"
            />
        );

        fireEvent.click(screen.getByText(/Scanner un QR code/i));

        await act(async () => {
            await scannerProps.current.onScan(id);
        });

        expect(fakeApi.claimQrPair).toHaveBeenCalledTimes(1);
        const [pairingArg, bodyArg] = fakeApi.claimQrPair.mock.calls[0];
        expect(pairingArg).toBe(id);
        expect(bodyArg).toEqual({ device_label: "iPhone Eric", device_uuid: "u-1" });
    });

    it("polls and calls onSuccess when pollQrPair returns status=consumed", async () => {
        const id = "deadbeef".repeat(4);
        fakeApi.claimQrPair = vi.fn().mockResolvedValue({
            status: "claimed",
            claim_token: "tok-1",
        });
        fakeApi.pollQrPair = vi
            .fn()
            .mockResolvedValueOnce({ status: "pending" })
            .mockResolvedValueOnce({
                status: "consumed",
                access_token: "AT",
                refresh_token: "RT",
            });

        const onSuccess = vi.fn();
        render(
            <LoginComponent
                onSuccess={onSuccess}
                showEntities={false}
                enableQrPair
                qrPollIntervalMs={1000}
            />
        );

        fireEvent.click(screen.getByText(/Scanner un QR code/i));

        await act(async () => {
            await scannerProps.current.onScan(id);
        });

        // First poll tick
        await act(async () => {
            vi.advanceTimersByTime(1000);
        });
        await act(async () => {
            await Promise.resolve();
        });

        // Second poll tick -> consumed
        await act(async () => {
            vi.advanceTimersByTime(1000);
        });
        await act(async () => {
            await Promise.resolve();
        });

        expect(fakeApi.pollQrPair).toHaveBeenCalledTimes(2);
        expect(onSuccess).toHaveBeenCalledWith({
            status: "consumed",
            access_token: "AT",
            refresh_token: "RT",
        });
    });

    it("stops polling and shows an error when status=expired", async () => {
        const id = "deadbeef".repeat(4);
        fakeApi.claimQrPair = vi.fn().mockResolvedValue({
            status: "claimed",
            claim_token: "tok-1",
        });
        fakeApi.pollQrPair = vi.fn().mockResolvedValue({ status: "expired" });

        render(
            <LoginComponent
                onSuccess={() => {}}
                showEntities={false}
                enableQrPair
                qrPollIntervalMs={500}
            />
        );

        fireEvent.click(screen.getByText(/Scanner un QR code/i));

        await act(async () => {
            await scannerProps.current.onScan(id);
        });

        await act(async () => {
            vi.advanceTimersByTime(500);
        });
        await act(async () => {
            await Promise.resolve();
        });

        expect(screen.getByRole("alert").textContent).toMatch(/expir/);
    });

    it("times out after qrTimeoutMs and shows the timeout error", async () => {
        const id = "deadbeef".repeat(4);
        fakeApi.claimQrPair = vi.fn().mockResolvedValue({
            status: "claimed",
            claim_token: "tok-1",
        });
        fakeApi.pollQrPair = vi.fn().mockResolvedValue({ status: "pending" });

        render(
            <LoginComponent
                onSuccess={() => {}}
                showEntities={false}
                enableQrPair
                qrPollIntervalMs={1000}
                qrTimeoutMs={2000}
            />
        );

        fireEvent.click(screen.getByText(/Scanner un QR code/i));

        await act(async () => {
            await scannerProps.current.onScan(id);
        });

        await act(async () => {
            vi.advanceTimersByTime(2000);
        });
        await act(async () => {
            await Promise.resolve();
        });

        expect(screen.getByRole("alert").textContent).toMatch(/dépass|temps|temps/i);
    });

    it("falls back to error mode when claimQrPair fails", async () => {
        const id = "deadbeef".repeat(4);
        fakeApi.claimQrPair = vi.fn().mockRejectedValue(new Error("net"));

        const onError = vi.fn();
        render(
            <LoginComponent
                onSuccess={() => {}}
                onError={onError}
                showEntities={false}
                enableQrPair
            />
        );

        fireEvent.click(screen.getByText(/Scanner un QR code/i));

        await act(async () => {
            await scannerProps.current.onScan(id);
        });

        expect(screen.getByRole("alert")).toBeDefined();
        expect(onError).toHaveBeenCalled();
    });
});
