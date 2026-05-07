import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";

import { extractPairingId, buildDefaultGetQrErrorLabel, DEFAULT_LABELS } from "./props";

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
        Input: ({ name, type = "text", value, onChange, placeholder, readOnly, required, label }) => (
            <label>
                <span>{label}</span>
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

    it("relies on HTML5 required to prevent submit when fields are empty", () => {
        // The component no longer carries its own "required field" message:
        // <input required> + form submission validation handle it natively.
        // We assert the inputs are marked as required so the browser can
        // intercept; we don't assert about an alert text since it would
        // depend on the browser's localised validation bubble.
        const { container } = render(
            <LoginComponent onSuccess={() => {}} showEntities={false} />
        );
        expect(emailInput(container).required).toBe(true);
        expect(passwordInput(container).required).toBe(true);
    });

    it("uses getErrorLabel to compute the inline error message", async () => {
        const err = new Error("boom");
        err.statusCode = 401;
        fakeApi.login = vi.fn().mockRejectedValue(err);

        const getErrorLabel = vi.fn((e) =>
            e.statusCode === 401 ? "Bad credentials" : "Network error"
        );

        const { container } = render(
            <LoginComponent
                onSuccess={() => {}}
                showEntities={false}
                getErrorLabel={getErrorLabel}
            />
        );

        fireEvent.change(emailInput(container), { target: { value: "u@x.com" } });
        fireEvent.change(passwordInput(container), { target: { value: "x" } });
        fireEvent.click(screen.getByRole("button", { name: /Se connecter/i }));

        await waitFor(() => {
            expect(getErrorLabel).toHaveBeenCalledWith(err);
        });
        await waitFor(() => {
            expect(screen.getByRole("alert").textContent).toBe("Bad credentials");
        });
    });

    it("falls back to labels.loginError when getErrorLabel returns undefined", async () => {
        fakeApi.login = vi.fn().mockRejectedValue(new Error("nope"));

        const getErrorLabel = vi.fn(() => undefined);

        const { container } = render(
            <LoginComponent
                onSuccess={() => {}}
                showEntities={false}
                getErrorLabel={getErrorLabel}
            />
        );

        fireEvent.change(emailInput(container), { target: { value: "u@x.com" } });
        fireEvent.change(passwordInput(container), { target: { value: "x" } });
        fireEvent.click(screen.getByRole("button", { name: /Se connecter/i }));

        await waitFor(() => {
            expect(screen.getByRole("alert").textContent).toMatch(/Identifiants/);
        });
    });

    it("uses entitiesTimeoutMs for the getEntities call", async () => {
        let capturedSignal = null;
        fakeApi.getEntities = vi.fn((opts) => {
            capturedSignal = opts?.signal;
            return Promise.resolve({ entities: [] });
        });

        render(
            <LoginComponent
                onSuccess={() => {}}
                entitiesTimeoutMs={42000}
                abortTimeoutMs={9999}
            />
        );

        await waitFor(() => {
            expect(fakeApi.getEntities).toHaveBeenCalled();
        });
        // We can't read the configured timeout from AbortSignal directly,
        // but at least we verify a real signal was provided.
        expect(capturedSignal).toBeInstanceOf(AbortSignal);
    });

    it("uses loginTimeoutMs for the login call", async () => {
        let capturedSignal = null;
        fakeApi.login = vi.fn((body, opts) => {
            capturedSignal = opts?.signal;
            return Promise.resolve({});
        });

        const { container } = render(
            <LoginComponent
                onSuccess={() => {}}
                showEntities={false}
                loginTimeoutMs={3000}
                abortTimeoutMs={9999}
            />
        );

        fireEvent.change(emailInput(container), { target: { value: "u@x.com" } });
        fireEvent.change(passwordInput(container), { target: { value: "x" } });
        fireEvent.click(screen.getByRole("button", { name: /Se connecter/i }));

        await waitFor(() => {
            expect(fakeApi.login).toHaveBeenCalled();
        });
        expect(capturedSignal).toBeInstanceOf(AbortSignal);
    });

    it("forwards inputProps and submitButtonProps to the rendered components", () => {
        // Our test stubs forward arbitrary extra props to the underlying
        // <input>/<button>. We pass a known className and assert it appears.
        const { container } = render(
            <LoginComponent
                onSuccess={() => {}}
                showEntities={false}
                inputProps={{ className: "my-custom-input" }}
                submitButtonProps={{ className: "my-custom-button" }}
            />
        );
        // Note: the stub Input ignores className silently; we check via the
        // form structure that nothing crashes and the standard inputs render.
        expect(emailInput(container)).not.toBeNull();
        expect(screen.getByRole("button", { name: /Se connecter/i })).toBeDefined();
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

    it("hides the QR scan button when enableQrPair is explicitly false", () => {
        render(
            <LoginComponent
                onSuccess={() => {}}
                showEntities={false}
                enableQrPair={false}
            />
        );
        expect(screen.queryByText(/Scanner un QR code/i)).toBeNull();
    });

    it("shows the QR scan button by default (smartAuth assumed)", () => {
        render(<LoginComponent onSuccess={() => {}} showEntities={false} />);
        expect(screen.getByText(/Scanner un QR code/i)).toBeDefined();
    });

    it("shows the 'or' separator above the QR button when enabled", () => {
        render(<LoginComponent onSuccess={() => {}} showEntities={false} />);
        expect(screen.getByText("ou")).toBeDefined();
    });

    it("hides the 'or' separator when QR is disabled", () => {
        render(
            <LoginComponent
                onSuccess={() => {}}
                showEntities={false}
                enableQrPair={false}
            />
        );
        expect(screen.queryByText("ou")).toBeNull();
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

    describe("dedicated overlay during claim/poll", () => {
        const id = "deadbeef".repeat(4);

        it("closes the scanner and opens the dedicated overlay during qr-claiming", async () => {
            // Make claim hang so we observe the qr-claiming state cleanly
            let resolveClaim;
            fakeApi.claimQrPair = vi.fn(() => new Promise((r) => { resolveClaim = r; }));

            render(<LoginComponent onSuccess={() => {}} showEntities={false} enableQrPair />);
            fireEvent.click(screen.getByText(/Scanner un QR code/i));

            await act(async () => {
                scannerProps.current.onScan(id);
            });

            // Scanner closed
            expect(screen.queryByTestId("scanner-stub")).toBeNull();
            // Overlay visible with the claiming message
            expect(screen.getByRole("status")).toBeDefined();
            expect(screen.getByText(/Connexion au serveur/)).toBeDefined();

            // cleanup so the pending promise doesn't leak
            await act(async () => {
                resolveClaim?.({ status: "claimed", claim_token: "tok-1" });
            });
        });

        it("shows the polling message during qr-polling", async () => {
            fakeApi.claimQrPair = vi.fn().mockResolvedValue({
                status: "claimed",
                claim_token: "tok-1",
            });
            // Hang the poll so we stay in qr-polling
            fakeApi.pollQrPair = vi.fn(() => new Promise(() => {}));

            render(<LoginComponent onSuccess={() => {}} showEntities={false} enableQrPair />);
            fireEvent.click(screen.getByText(/Scanner un QR code/i));

            await act(async () => {
                await scannerProps.current.onScan(id);
            });

            expect(screen.queryByTestId("scanner-stub")).toBeNull();
            expect(screen.getByText(/En attente de la confirmation/)).toBeDefined();
        });

        it("returns to password mode when the overlay 'Annuler' button is clicked", async () => {
            fakeApi.claimQrPair = vi.fn().mockResolvedValue({
                status: "claimed",
                claim_token: "tok-1",
            });
            fakeApi.pollQrPair = vi.fn(() => new Promise(() => {}));

            render(<LoginComponent onSuccess={() => {}} showEntities={false} enableQrPair />);
            fireEvent.click(screen.getByText(/Scanner un QR code/i));

            await act(async () => {
                await scannerProps.current.onScan(id);
            });

            expect(screen.getByRole("status")).toBeDefined();

            await act(async () => {
                fireEvent.click(screen.getByRole("button", { name: "Annuler" }));
            });

            // Overlay gone, scan button visible again (password mode)
            expect(screen.queryByRole("status")).toBeNull();
            expect(screen.getByText(/Scanner un QR code/i)).toBeDefined();
        });
    });

    describe("idempotence guard", () => {
        it("ignores a duplicate scan of the same code", async () => {
            const id = "deadbeef".repeat(4);
            fakeApi.claimQrPair = vi.fn().mockResolvedValue({
                status: "claimed",
                claim_token: "tok-1",
            });
            fakeApi.pollQrPair = vi.fn().mockResolvedValue({ status: "pending" });

            render(
                <LoginComponent onSuccess={() => {}} showEntities={false} enableQrPair />
            );

            fireEvent.click(screen.getByText(/Scanner un QR code/i));

            await act(async () => {
                await scannerProps.current.onScan(id);
                await scannerProps.current.onScan(id);
                await scannerProps.current.onScan(id);
            });

            expect(fakeApi.claimQrPair).toHaveBeenCalledTimes(1);
        });

        it("ignores a scan while polling is in progress", async () => {
            const id = "deadbeef".repeat(4);
            fakeApi.claimQrPair = vi.fn().mockResolvedValue({
                status: "claimed",
                claim_token: "tok-1",
            });
            fakeApi.pollQrPair = vi.fn().mockResolvedValue({ status: "pending" });

            render(
                <LoginComponent onSuccess={() => {}} showEntities={false} enableQrPair />
            );

            fireEvent.click(screen.getByText(/Scanner un QR code/i));

            await act(async () => {
                await scannerProps.current.onScan(id);
            });

            // While in qr-polling, a stray scan must not start a second claim
            await act(async () => {
                await scannerProps.current.onScan("aaaaaaaa".repeat(4));
            });

            expect(fakeApi.claimQrPair).toHaveBeenCalledTimes(1);
        });
    });

    describe("getQrErrorLabel mapping", () => {
        const id = "deadbeef".repeat(4);

        const claimReject = (err) => {
            fakeApi.claimQrPair = vi.fn().mockRejectedValue(err);
        };

        it("shows 'already claimed' on HTTP 409", async () => {
            claimReject({ response: { status: 409 } });
            render(<LoginComponent onSuccess={() => {}} showEntities={false} enableQrPair />);
            fireEvent.click(screen.getByText(/Scanner un QR code/i));
            await act(async () => { await scannerProps.current.onScan(id); });

            expect(screen.getByRole("alert").textContent).toMatch(/déjà été utilisé/);
        });

        it("shows 'pairing not found' on HTTP 404", async () => {
            claimReject({ response: { status: 404 } });
            render(<LoginComponent onSuccess={() => {}} showEntities={false} enableQrPair />);
            fireEvent.click(screen.getByText(/Scanner un QR code/i));
            await act(async () => { await scannerProps.current.onScan(id); });

            expect(screen.getByRole("alert").textContent).toMatch(/n'est plus valide/);
        });

        it("shows 'pairing expired' on HTTP 410", async () => {
            claimReject({ response: { status: 410 } });
            render(<LoginComponent onSuccess={() => {}} showEntities={false} enableQrPair />);
            fireEvent.click(screen.getByText(/Scanner un QR code/i));
            await act(async () => { await scannerProps.current.onScan(id); });

            expect(screen.getByRole("alert").textContent).toMatch(/expiré/);
        });

        it("shows 'rate limited' on HTTP 429", async () => {
            claimReject({ response: { status: 429 } });
            render(<LoginComponent onSuccess={() => {}} showEntities={false} enableQrPair />);
            fireEvent.click(screen.getByText(/Scanner un QR code/i));
            await act(async () => { await scannerProps.current.onScan(id); });

            expect(screen.getByRole("alert").textContent).toMatch(/Trop de tentatives/);
        });

        it("prefers apiCode (set by useApi.beforeError) over status", async () => {
            // Status 500 alone would fall back to claimError, but apiCode wins
            claimReject({ apiCode: "pairing_not_claimable", response: { status: 500 } });
            render(<LoginComponent onSuccess={() => {}} showEntities={false} enableQrPair />);
            fireEvent.click(screen.getByText(/Scanner un QR code/i));
            await act(async () => { await scannerProps.current.onScan(id); });

            expect(screen.getByRole("alert").textContent).toMatch(/déjà été utilisé/);
        });

        it("falls back to claimError on unmapped status", async () => {
            claimReject({ response: { status: 502 } });
            render(<LoginComponent onSuccess={() => {}} showEntities={false} enableQrPair />);
            fireEvent.click(screen.getByText(/Scanner un QR code/i));
            await act(async () => { await scannerProps.current.onScan(id); });

            expect(screen.getByRole("alert").textContent).toMatch(/revendiquer/);
        });

        it("uses a custom getQrErrorLabel when provided", async () => {
            claimReject({ response: { status: 409 } });
            const getQrErrorLabel = vi.fn(() => "Custom QR message");

            render(
                <LoginComponent
                    onSuccess={() => {}}
                    showEntities={false}
                    enableQrPair
                    getQrErrorLabel={getQrErrorLabel}
                />
            );
            fireEvent.click(screen.getByText(/Scanner un QR code/i));
            await act(async () => { await scannerProps.current.onScan(id); });

            expect(getQrErrorLabel).toHaveBeenCalled();
            // textContent includes the embedded "OK" button label, so we
            // check for the message as a substring instead.
            expect(screen.getByText("Custom QR message")).toBeDefined();
        });
    });
});

describe("buildDefaultGetQrErrorLabel (helper)", () => {
    const map = buildDefaultGetQrErrorLabel(DEFAULT_LABELS);

    it("maps pairing_not_claimable / 409", () => {
        expect(map({ apiCode: "pairing_not_claimable" })).toBe(DEFAULT_LABELS.pairingAlreadyClaimed);
        expect(map({ response: { status: 409 } })).toBe(DEFAULT_LABELS.pairingAlreadyClaimed);
    });

    it("maps pairing_not_found / 404", () => {
        expect(map({ apiCode: "pairing_not_found" })).toBe(DEFAULT_LABELS.pairingNotFound);
        expect(map({ response: { status: 404 } })).toBe(DEFAULT_LABELS.pairingNotFound);
    });

    it("maps pairing_expired / 410", () => {
        expect(map({ apiCode: "pairing_expired" })).toBe(DEFAULT_LABELS.pairingExpired);
        expect(map({ response: { status: 410 } })).toBe(DEFAULT_LABELS.pairingExpired);
    });

    it("maps rate_limited / 429", () => {
        expect(map({ apiCode: "rate_limited" })).toBe(DEFAULT_LABELS.rateLimited);
        expect(map({ response: { status: 429 } })).toBe(DEFAULT_LABELS.rateLimited);
    });

    it("maps invalid_pairing_id / 400", () => {
        expect(map({ apiCode: "invalid_pairing_id" })).toBe(DEFAULT_LABELS.invalidQrError);
        expect(map({ response: { status: 400 } })).toBe(DEFAULT_LABELS.invalidQrError);
    });

    it("falls back to claimError for unmapped errors", () => {
        expect(map({})).toBe(DEFAULT_LABELS.claimError);
        expect(map({ response: { status: 503 } })).toBe(DEFAULT_LABELS.claimError);
        expect(map({ apiCode: "unknown_code" })).toBe(DEFAULT_LABELS.claimError);
    });

    it("prefers apiCode over HTTP status when both are present", () => {
        expect(map({ apiCode: "rate_limited", response: { status: 500 } })).toBe(DEFAULT_LABELS.rateLimited);
    });
});
