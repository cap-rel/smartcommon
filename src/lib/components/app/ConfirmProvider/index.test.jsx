import { describe, it, expect } from "vitest";
import { useContext } from "react";
import { render, renderHook, screen, fireEvent, act } from "@testing-library/react";

import { ConfirmProvider } from "./index";
import { ConfirmContext } from "./context";

describe("ConfirmProvider", () => {
    it("renders its children", () => {
        render(
            <ConfirmProvider>
                <p>confirm child</p>
            </ConfirmProvider>
        );

        expect(screen.getByText("confirm child")).toBeDefined();
    });

    it("does not render any dialog initially", () => {
        render(
            <ConfirmProvider>
                <p>idle</p>
            </ConfirmProvider>
        );

        expect(screen.queryByRole("button")).toBeNull();
    });

    it("opens a confirm dialog and resolves true on confirm click", async () => {
        const Probe = ({ trigger }) => {
            const ctx = useContext(ConfirmContext);
            return <button onClick={() => trigger(ctx.confirm)}>open</button>;
        };

        let resolved;
        const trigger = (confirm) => {
            confirm({ title: "Delete ?", message: "Sure ?" }).then((v) => {
                resolved = v;
            });
        };

        render(
            <ConfirmProvider>
                <Probe trigger={trigger} />
            </ConfirmProvider>
        );

        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: "open" }));
        });

        expect(screen.getByText("Delete ?")).toBeDefined();
        expect(screen.getByText("Sure ?")).toBeDefined();

        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: "OK" }));
        });

        expect(resolved).toBe(true);
        expect(screen.queryByText("Delete ?")).toBeNull();
    });

    it("resolves false when cancel is clicked", async () => {
        const Probe = ({ trigger }) => {
            const ctx = useContext(ConfirmContext);
            return <button onClick={() => trigger(ctx.confirm)}>open</button>;
        };

        let resolved;
        const trigger = (confirm) => {
            confirm({ message: "go ?" }).then((v) => {
                resolved = v;
            });
        };

        render(
            <ConfirmProvider>
                <Probe trigger={trigger} />
            </ConfirmProvider>
        );

        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: "open" }));
        });

        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
        });

        expect(resolved).toBe(false);
    });

    it("uses custom labels prop for default cancel/confirm text", async () => {
        const Probe = ({ trigger }) => {
            const ctx = useContext(ConfirmContext);
            return <button onClick={() => trigger(ctx.confirm)}>open</button>;
        };

        const trigger = (confirm) => confirm({ message: "x" });

        render(
            <ConfirmProvider labels={{ cancel: "Annuler", confirm: "Valider" }}>
                <Probe trigger={trigger} />
            </ConfirmProvider>
        );

        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: "open" }));
        });

        expect(screen.getByRole("button", { name: "Annuler" })).toBeDefined();
        expect(screen.getByRole("button", { name: "Valider" })).toBeDefined();
    });

    it("alert() shows only one button (no cancel)", async () => {
        const Probe = ({ trigger }) => {
            const ctx = useContext(ConfirmContext);
            return <button onClick={() => trigger(ctx.alert)}>open</button>;
        };

        let resolved;
        const trigger = (alert) => {
            alert({ message: "info" }).then((v) => {
                resolved = v;
            });
        };

        render(
            <ConfirmProvider>
                <Probe trigger={trigger} />
            </ConfirmProvider>
        );

        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: "open" }));
        });

        expect(screen.queryByRole("button", { name: "Cancel" })).toBeNull();

        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: "OK" }));
        });

        expect(resolved).toBe(true);
    });

    it("uses per-call confirmText/cancelText overrides over labels", async () => {
        const Probe = ({ trigger }) => {
            const ctx = useContext(ConfirmContext);
            return <button onClick={() => trigger(ctx.confirm)}>open</button>;
        };

        const trigger = (confirm) =>
            confirm({ message: "x", confirmText: "Yes!", cancelText: "Nope" });

        render(
            <ConfirmProvider>
                <Probe trigger={trigger} />
            </ConfirmProvider>
        );

        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: "open" }));
        });

        expect(screen.getByRole("button", { name: "Yes!" })).toBeDefined();
        expect(screen.getByRole("button", { name: "Nope" })).toBeDefined();
    });

    it("exposes both confirm and alert functions on the context", () => {
        const wrapper = ({ children }) => <ConfirmProvider>{children}</ConfirmProvider>;
        const { result } = renderHook(() => useContext(ConfirmContext), { wrapper });

        expect(typeof result.current.confirm).toBe("function");
        expect(typeof result.current.alert).toBe("function");
    });
});
