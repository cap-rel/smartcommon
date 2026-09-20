import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const { mockHookState } = vi.hoisted(() => ({
    mockHookState: {
        shouldOffer: false,
        canPrompt: false,
        needsManualInstructions: false,
        promptInstall: () => {},
        dismiss: () => {},
    },
}));

vi.mock("framer-motion", () => ({
    AnimatePresence: ({ children }) => children,
    motion: new Proxy(
        {},
        {
            get: () => ({ children, ...rest }) => {
                const { initial, animate, exit, transition, variants, ...domProps } = rest;
                void initial; void animate; void exit; void transition; void variants;
                return <div {...domProps}>{children}</div>;
            },
        }
    ),
}));

vi.mock("lib/hooks", () => ({
    useInstallPrompt: () => mockHookState,
}));

import { InstallPrompt } from "./index";

describe("InstallPrompt", () => {
    beforeEach(() => {
        mockHookState.shouldOffer = false;
        mockHookState.canPrompt = false;
        mockHookState.needsManualInstructions = false;
        mockHookState.promptInstall = vi.fn().mockResolvedValue("accepted");
        mockHookState.dismiss = vi.fn();
    });

    it("renders nothing when there is nothing to offer", () => {
        const { container } = render(<InstallPrompt />);
        expect(container.firstChild).toBeNull();
    });

    it("shows the banner and triggers the native prompt", async () => {
        mockHookState.shouldOffer = true;
        mockHookState.canPrompt = true;

        render(<InstallPrompt labels={{ title: "Installer l'appli", installButton: "Installer" }} />);

        expect(screen.getByText("Installer l'appli")).toBeTruthy();
        fireEvent.click(screen.getByText("Installer"));

        await waitFor(() => {
            expect(mockHookState.promptInstall).toHaveBeenCalled();
        });
        // The native dialog IS the next step, no manual steps here.
        expect(screen.queryByTestId("install-prompt-ios-steps")).toBeNull();
    });

    it("shows the manual steps on iOS instead of calling a prompt that does not exist", async () => {
        mockHookState.shouldOffer = true;
        mockHookState.canPrompt = false;
        mockHookState.needsManualInstructions = true;

        render(<InstallPrompt labels={{ installButton: "Installer", iosTitle: "Ajouter a l'ecran d'accueil" }} />);
        fireEvent.click(screen.getByText("Installer"));

        await waitFor(() => {
            expect(screen.getByTestId("install-prompt-ios-steps")).toBeTruthy();
        });
        expect(screen.getByText("Ajouter a l'ecran d'accueil")).toBeTruthy();
        expect(mockHookState.promptInstall).not.toHaveBeenCalled();
    });

    it("dismisses through the hook, so the refusal is remembered", () => {
        mockHookState.shouldOffer = true;
        mockHookState.canPrompt = true;
        const onDismiss = vi.fn();

        render(<InstallPrompt labels={{ dismissButton: "Plus tard" }} onDismiss={onDismiss} />);
        fireEvent.click(screen.getByText("Plus tard"));

        expect(mockHookState.dismiss).toHaveBeenCalled();
        expect(onDismiss).toHaveBeenCalled();
    });

    it("renders the modal variant when asked", () => {
        mockHookState.shouldOffer = true;
        mockHookState.canPrompt = true;

        render(<InstallPrompt variant="modal" labels={{ title: "Installer" }} />);
        const root = screen.getByTestId("install-prompt");
        expect(root.className).toContain("inset-0");
    });
});
