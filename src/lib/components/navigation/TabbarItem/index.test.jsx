import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FaInbox } from "react-icons/fa6";

import { TabbarItem } from "./";

describe("TabbarItem - badge", () => {
    it("pins the badge to the icon", () => {
        render(<TabbarItem id="inbox" label="Inbox" icon={FaInbox} badge={2} />);
        const badge = screen.getByTestId("badge");
        expect(badge.textContent).toBe("2");
        expect(badge.parentElement.querySelector("svg")).not.toBeNull();
    });

    it("still shows the badge on a tab without icon", () => {
        render(<TabbarItem id="inbox" label="Inbox" badge={5} />);
        expect(screen.getByTestId("badge").textContent).toBe("5");
    });

    it.each([[0], [undefined], [""]])("renders no badge for %p", (badge) => {
        render(<TabbarItem id="inbox" label="Inbox" icon={FaInbox} badge={badge} />);
        expect(screen.queryByTestId("badge")).toBeNull();
    });

    it("caps a large count", () => {
        render(<TabbarItem id="inbox" label="Inbox" icon={FaInbox} badge={1000} />);
        expect(screen.getByTestId("badge").textContent).toBe("99+");
    });
});
