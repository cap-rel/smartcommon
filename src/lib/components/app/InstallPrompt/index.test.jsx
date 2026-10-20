import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";

const { mockHookState } = vi.hoisted(() => ({
    mockHookState: {
        shouldOffer: false,
        canPrompt: false,
        needsManualInstructions: false,
        installGuide: "android",
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
    INSTALL_PROMPT_OPEN_EVENT: "smartcommon:install-prompt:open",
    useInstallPrompt: () => mockHookState,
}));

import { InstallPrompt } from "./index";

const openOnDemand = () => {
    act(() => {
        window.dispatchEvent(new Event("smartcommon:install-prompt:open"));
    });
};

describe("InstallPrompt", () => {
    beforeEach(() => {
        mockHookState.shouldOffer = false;
        mockHookState.canPrompt = false;
        mockHookState.needsManualInstructions = false;
        mockHookState.installGuide = "android";
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
        expect(screen.queryByTestId("install-prompt-steps")).toBeNull();
    });

    it("shows the manual steps on iOS instead of calling a prompt that does not exist", async () => {
        mockHookState.shouldOffer = true;
        mockHookState.canPrompt = false;
        mockHookState.needsManualInstructions = true;
        mockHookState.installGuide = "ios";

        render(<InstallPrompt labels={{ installButton: "Installer", iosTitle: "Ajouter a l'ecran d'accueil" }} />);
        fireEvent.click(screen.getByText("Installer"));

        await waitFor(() => {
            expect(screen.getByTestId("install-prompt-steps")).toBeTruthy();
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

    it("shows the steps of the current browser in the modal when no native prompt exists", () => {
        mockHookState.shouldOffer = true;
        mockHookState.needsManualInstructions = true;
        mockHookState.installGuide = "macos-safari";

        render(
            <InstallPrompt
                variant="modal"
                labels={{
                    gotItButton: "J'ai compris",
                    dismissButton: "Plus tard",
                    guides: { "macos-safari": ["Menu Fichier", "Ajouter au Dock"] },
                }}
            />
        );

        expect(screen.getByTestId("install-prompt-guide").dataset.guide).toBe("macos-safari");
        expect(screen.getByText("Ajouter au Dock")).toBeTruthy();
        // No native dialog to open: an "Install" button would do nothing.
        expect(screen.queryByText("Install")).toBeNull();
        expect(screen.queryByText("Plus tard")).toBeNull();

        fireEvent.click(screen.getByText("J'ai compris"));
        expect(mockHookState.dismiss).toHaveBeenCalled();
    });

    it("keeps the default steps of the guides a consumer did not translate", () => {
        mockHookState.shouldOffer = true;
        mockHookState.needsManualInstructions = true;
        mockHookState.installGuide = "desktop-firefox";

        render(<InstallPrompt variant="modal" labels={{ guides: { android: ["Menu"] } }} />);

        expect(screen.getByText("Open this page in Chrome or Edge to install it")).toBeTruthy();
    });

    it("falls back to the generic guide for an unlisted browser", () => {
        mockHookState.shouldOffer = true;
        mockHookState.installGuide = "something-new";

        render(<InstallPrompt variant="modal" />);

        expect(screen.getByText("Open your browser menu")).toBeTruthy();
    });

    it("opens on demand even when the reminder policy says no", () => {
        mockHookState.shouldOffer = false;
        mockHookState.needsManualInstructions = true;
        mockHookState.installGuide = "android-firefox";

        const { container } = render(<InstallPrompt labels={{ gotItButton: "J'ai compris" }} />);
        expect(container.firstChild).toBeNull();

        openOnDemand();

        expect(screen.getByTestId("install-prompt-guide").dataset.guide).toBe("android-firefox");

        fireEvent.click(screen.getByText("J'ai compris"));
        expect(screen.queryByTestId("install-prompt")).toBeNull();
        // Asked for by the user: closing it must not count as a refusal.
        expect(mockHookState.dismiss).not.toHaveBeenCalled();
    });

    it("runs the native prompt when opened on demand on Chromium", async () => {
        mockHookState.shouldOffer = false;
        mockHookState.canPrompt = true;

        render(<InstallPrompt labels={{ installButton: "Installer" }} />);
        openOnDemand();

        fireEvent.click(screen.getByText("Installer"));
        await waitFor(() => {
            expect(mockHookState.promptInstall).toHaveBeenCalled();
        });
        await waitFor(() => {
            expect(screen.queryByTestId("install-prompt")).toBeNull();
        });
    });
});
