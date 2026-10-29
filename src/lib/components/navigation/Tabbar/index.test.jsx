import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FaHouse, FaGear, FaUser, FaBell, FaPlus } from "react-icons/fa6";

import { Tabbar } from "./";
import { TabbarItem } from "../TabbarItem";

const tabs = (count) => [FaHouse, FaGear, FaUser, FaBell].slice(0, count).map((Icon, i) => (
    <TabbarItem key={i} id={`tab-${i}`} icon={Icon} label={`Tab ${i}`} />
));

// Order of the rendered entries: tab labels and the central button marker.
const order = (container) => [...container.querySelector("[data-component='Tabbar']").children].map((el) => (
    el.querySelector("[data-tabbar-central]") ? "central" : el.textContent
));

describe("Tabbar - centralButton", () => {
    it("renders no central button by default", () => {
        render(<Tabbar id="main" hideOnScroll={false}>{tabs(4)}</Tabbar>);
        expect(document.querySelector("[data-tabbar-central]")).toBeNull();
    });

    it("places the central button between the tabs", () => {
        const { container } = render(
            <Tabbar id="main" hideOnScroll={false} centralButton={{ icon: FaPlus, label: "New" }}>{tabs(4)}</Tabbar>
        );
        expect(order(container)).toEqual(["Tab 0", "Tab 1", "central", "Tab 2", "Tab 3"]);
    });

    it("counts tabs passed inside a fragment one by one", () => {
        const { container } = render(
            <Tabbar id="main" hideOnScroll={false} centralButton={{ icon: FaPlus, label: "New" }}>
                <>{tabs(2)}</>
            </Tabbar>
        );
        expect(order(container)).toEqual(["Tab 0", "central", "Tab 1"]);
    });

    it("names the button by its label and calls onClick", () => {
        const onClick = vi.fn();
        render(<Tabbar id="main" hideOnScroll={false} centralButton={{ icon: FaPlus, label: "New report", onClick }}>{tabs(2)}</Tabbar>);
        fireEvent.click(screen.getByRole("button", { name: "New report" }));
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("does not call onClick when disabled", () => {
        const onClick = vi.fn();
        render(<Tabbar id="main" hideOnScroll={false} centralButton={{ icon: FaPlus, label: "New", onClick, disabled: true }}>{tabs(2)}</Tabbar>);
        const button = screen.getByRole("button", { name: "New" });
        expect(button.disabled).toBe(true);
        fireEvent.click(button);
        expect(onClick).not.toHaveBeenCalled();
    });

    it("shows a counter badge on the central button", () => {
        render(<Tabbar id="main" hideOnScroll={false} centralButton={{ icon: FaPlus, label: "Inbox", badge: 140 }}>{tabs(2)}</Tabbar>);
        expect(screen.getByTestId("badge").textContent).toBe("99+");
    });
});
