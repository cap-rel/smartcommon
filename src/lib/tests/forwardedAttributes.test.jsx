/**
 * `data-*` and `aria-*` written on a component reach its main element.
 *
 * Before, `<Button data-testid="save">` rendered a button without the
 * attribute and without any warning: consumer projects concluded the
 * components "do not forward DOM attributes" and rebuilt them in plain HTML.
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { Button } from "lib/components/little/Button";
import { FAB } from "lib/components/little/FAB";
import { Input } from "lib/components/form/Input";
import { Select } from "lib/components/form/Select";
import { Textarea } from "lib/components/form/Textarea";
import { SearchableSelect } from "lib/components/form/SearchableSelect";
import { Range } from "lib/components/form/Range";
import { ColorPicker } from "lib/components/form/ColorPicker";
import { TabbarItem } from "lib/components/navigation/TabbarItem";

const ATTRIBUTES = { "data-testid": "target", "aria-describedby": "help" };

describe("forwarded attributes - main element of each component", () => {
    it.each([
        ["Button", () => <Button label="Save" {...ATTRIBUTES} />, "BUTTON"],
        ["Button as a link", () => <Button label="Open" href="/x" {...ATTRIBUTES} />, "A"],
        ["FAB", () => <FAB label="Add" {...ATTRIBUTES} />, "BUTTON"],
        ["Input", () => <Input label="Name" value="" onChange={() => {}} {...ATTRIBUTES} />, "INPUT"],
        ["Select", () => <Select label="Kind" options={[{ value: "a", label: "A" }]} {...ATTRIBUTES} />, "SELECT"],
        ["Textarea", () => <Textarea label="Note" {...ATTRIBUTES} />, "TEXTAREA"],
        ["SearchableSelect", () => <SearchableSelect options={[{ value: "a", label: "A" }]} {...ATTRIBUTES} />, "INPUT"],
        ["Range", () => <Range {...ATTRIBUTES} />, "INPUT"],
        ["ColorPicker", () => <ColorPicker {...ATTRIBUTES} />, "INPUT"],
        ["TabbarItem", () => <TabbarItem label="Files" {...ATTRIBUTES} />, "DIV"],
    ])("%s", (_name, renderComponent, tagName) => {
        render(renderComponent());

        const element = screen.getByTestId("target");
        expect(element.tagName).toBe(tagName);
        expect(element.getAttribute("aria-describedby")).toBe("help");
        expect(document.querySelectorAll("[data-testid='target']")).toHaveLength(1);
    });

    it("lets a consumer aria-label replace the placeholder fallback of Input", () => {
        render(<Input placeholder="Search" aria-label="Search a file" value="" onChange={() => {}} />);
        expect(screen.getByLabelText("Search a file").tagName).toBe("INPUT");
    });

    it("keeps the <element>Props slot above the component attribute", () => {
        render(<Button label="Save" data-testid="outer" buttonProps={{ "data-testid": "inner" }} />);
        expect(screen.queryByTestId("outer")).toBeNull();
        expect(screen.getByRole("button", { name: "Save" }).getAttribute("data-testid")).toBe("inner");
    });
});
