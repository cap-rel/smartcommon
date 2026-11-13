import { describe, it, expect } from "vitest";
import { useContext } from "react";
import { render, renderHook, screen, fireEvent, act } from "@testing-library/react";

import { ConfirmProvider } from "./index";
import { ConfirmContext } from "./context";
import { fr } from "lib/locales/fr";
import { LibConfigProvider } from "lib/components/app/LibConfigProvider";

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

describe("ConfirmProvider - dialog semantics, keyboard and theme", () => {
    // Opens a confirm() or alert() from a real trigger button, which keeps
    // the focus before the dialog opens.
    const setup = (method, options, providerProps = {}) => {
        const result = { value: undefined };
        const Probe = () => {
            const ctx = useContext(ConfirmContext);
            return (
                <button onClick={() => ctx[method](options).then((v) => { result.value = v; })}>
                    open
                </button>
            );
        };
        render(
            <ConfirmProvider {...providerProps}>
                <Probe />
            </ConfirmProvider>
        );
        const trigger = screen.getByRole("button", { name: "open" });
        return { result, trigger };
    };

    const open = async (trigger) => {
        trigger.focus();
        await act(async () => {
            fireEvent.click(trigger);
        });
    };

    it("is an alertdialog named by its title and described by its message", async () => {
        const { trigger } = setup("confirm", { title: "Delete the file", message: "It cannot be undone", detail: "photo.jpg" });
        await open(trigger);

        const dialog = screen.getByRole("alertdialog", { name: "Delete the file" });
        expect(dialog.getAttribute("aria-modal")).toBe("true");
        const describedBy = dialog.getAttribute("aria-describedby").split(" ");
        expect(describedBy.map((id) => document.getElementById(id).textContent)).toEqual(["It cannot be undone", "photo.jpg"]);
    });

    it("is named by its message when there is no title", async () => {
        const { trigger } = setup("confirm", { message: "Leave the page?" });
        await open(trigger);
        expect(screen.getByRole("alertdialog", { name: "Leave the page?" })).toBeDefined();
    });

    it("uses role dialog for alert()", async () => {
        const { trigger } = setup("alert", { title: "Saved", message: "All good" });
        await open(trigger);
        expect(screen.getByRole("dialog", { name: "Saved" })).toBeDefined();
        expect(screen.queryByRole("alertdialog")).toBeNull();
    });

    it("focuses the confirm button on open", async () => {
        const { trigger } = setup("confirm", { message: "Sure?" });
        await open(trigger);
        expect(document.activeElement).toBe(screen.getByRole("button", { name: "OK" }));
    });

    it("cancels a confirm on Escape and gives the focus back to the trigger", async () => {
        const { result, trigger } = setup("confirm", { message: "Sure?" });
        await open(trigger);

        await act(async () => {
            fireEvent.keyDown(document.activeElement, { key: "Escape" });
        });

        expect(result.value).toBe(false);
        expect(screen.queryByRole("alertdialog")).toBeNull();
        expect(document.activeElement).toBe(trigger);
    });

    it("gives the focus back after a confirm click", async () => {
        const { result, trigger } = setup("confirm", { message: "Sure?" });
        await open(trigger);
        const ok = screen.getByRole("button", { name: "OK" });
        ok.focus();
        await act(async () => {
            fireEvent.click(ok);
        });
        expect(result.value).toBe(true);
        expect(document.activeElement).toBe(trigger);
    });

    it("marks the Escape as handled so a dialog underneath stays open", async () => {
        const { trigger } = setup("confirm", { message: "Sure?" });
        await open(trigger);
        const event = new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true });
        await act(async () => {
            document.activeElement.dispatchEvent(event);
        });
        expect(event.defaultPrevented).toBe(true);
    });

    it("keeps Tab inside the dialog", async () => {
        const { trigger } = setup("confirm", { message: "Sure?" });
        await open(trigger);
        const cancel = screen.getByRole("button", { name: "Cancel" });
        const ok = screen.getByRole("button", { name: "OK" });

        fireEvent.keyDown(ok, { key: "Tab" });
        expect(document.activeElement).toBe(cancel);
        fireEvent.keyDown(cancel, { key: "Tab", shiftKey: true });
        expect(document.activeElement).toBe(ok);
    });

    it("uses theme tokens instead of fixed light colours", async () => {
        const { trigger } = setup("confirm", { title: "Delete", message: "Sure?", detail: "x" });
        await open(trigger);
        const dialog = screen.getByRole("alertdialog");
        expect(dialog.className).toContain("bg-soft-bg");
        expect(dialog.className).toContain("text-strong-text");
        expect(dialog.outerHTML).not.toMatch(/\b(bg-white|text-gray-[0-9]+|bg-gray-[0-9]+|border-gray-[0-9]+)\b/);
    });

    it("takes its button texts from a locale bundle", async () => {
        const { trigger } = setup("confirm", { message: "Sure?" }, { labels: fr.ConfirmProvider });
        await open(trigger);
        expect(screen.getByRole("button", { name: fr.ConfirmProvider.cancel })).toBeDefined();
        expect(screen.getByRole("button", { name: fr.ConfirmProvider.confirm })).toBeDefined();
    });
});

describe("ConfirmProvider - labels from the Provider theme", () => {
    const themed = (ui, labels) => (
        <LibConfigProvider value={{ components: { theme: "app", themes: { app: { ConfirmProvider: { labels } } } } }}>
            {ui}
        </LibConfigProvider>
    );

    const Probe = () => {
        const ctx = useContext(ConfirmContext);
        return <button onClick={() => ctx.confirm({ message: "Sure?" })}>open</button>;
    };

    it("takes its texts from the theme when no labels prop is given", async () => {
        render(themed(<ConfirmProvider><Probe /></ConfirmProvider>, fr.ConfirmProvider));
        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: "open" }));
        });
        expect(screen.getByRole("button", { name: fr.ConfirmProvider.cancel })).toBeDefined();
    });

    it("lets a labels prop override one text and keeps the theme for the other", async () => {
        render(themed(<ConfirmProvider labels={{ confirm: "Supprimer" }}><Probe /></ConfirmProvider>, fr.ConfirmProvider));
        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: "open" }));
        });
        expect(screen.getByRole("button", { name: "Supprimer" })).toBeDefined();
        expect(screen.getByRole("button", { name: fr.ConfirmProvider.cancel })).toBeDefined();
    });
});
