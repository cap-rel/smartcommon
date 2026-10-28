import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const mocks = vi.hoisted(() => ({
    post: vi.fn(async () => ({ ok: true, ref: "CSPN-1", tracking_url: "https://captests.example/t/CSPN-1" })),
    enqueueReport: vi.fn(async () => ({})),
    setQueueApiProvider: vi.fn(),
    installOnlineFlush: vi.fn(),
    flushQueue: vi.fn(async () => {}),
}));

vi.mock("lib/hooks", async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        useApi: () => ({ post: mocks.post }),
    };
});

vi.mock("./offlineQueue", () => ({
    enqueueReport: mocks.enqueueReport,
    setQueueApiProvider: mocks.setQueueApiProvider,
    installOnlineFlush: mocks.installOnlineFlush,
    flushQueue: mocks.flushQueue,
}));

vi.mock("lib/upload", () => ({
    convertImageForUpload: vi.fn(async (file) => ({ file })),
}));

import { FeedbackButton } from "./index";
import { useFeedback } from "./useFeedback";

describe("FeedbackButton", () => {
    beforeEach(() => {
        mocks.post.mockClear();
    });

    it("renders nothing when visible is false", () => {
        const { container } = render(<FeedbackButton relayPath="feedback/report" visible={false} />);
        expect(container.firstChild).toBeNull();
    });

    it("returns focus to the trigger button when the modal closes", async () => {
        render(<FeedbackButton relayPath="feedback/report" appVersion="1.0.0" />);

        const trigger = screen.getByRole("button", { name: "Report a problem" });
        fireEvent.click(trigger);

        // The modal opens and moves the focus into the form.
        await screen.findByText("Description");

        fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

        // Modal does not restore focus itself: the button must hand it
        // back to its trigger.
        await waitFor(() => expect(document.activeElement).toBe(trigger));
    });
});

describe("useFeedback", () => {
    beforeEach(() => {
        mocks.post.mockClear();
    });

    const HookHarness = () => {
        const { open, modal } = useFeedback({ relayPath: "feedback/report", appVersion: "1.0.0" });
        return (
            <>
                <button onClick={open}>Open the form</button>
                {modal}
            </>
        );
    };

    it("returns focus to the element that opened the modal", async () => {
        render(<HookHarness />);

        // In a browser, clicking a menu item focuses it; happy-dom does
        // not, so focus it explicitly before the click.
        const trigger = screen.getByRole("button", { name: "Open the form" });
        trigger.focus();
        fireEvent.click(trigger);

        // The modal opens and moves the focus into the form.
        await screen.findByText("Description");

        fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

        // The hook hands the focus back to the menu item it was opened
        // from, like FeedbackButton does with its own button.
        await waitFor(() => expect(document.activeElement).toBe(trigger));
    });
});
