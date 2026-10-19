import { describe, it, expect, vi } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";

import { Input } from "lib/components/form/Input";

describe("useField modes outside <Form>", () => {
    it("renders a named field without value instead of crashing", () => {
        render(<Input label="Email" name="email" />);
        expect(screen.getByLabelText("Email")).toBeTruthy();
    });

    it("keeps its own value when uncontrolled, and still reports onChange", () => {
        const onChange = vi.fn();
        render(<Input label="Email" name="email" defaultValue="a@b.c" onChange={onChange} />);
        const input = screen.getByLabelText("Email");
        expect(input.value).toBe("a@b.c");

        fireEvent.change(input, { target: { value: "x@y.z" } });
        expect(input.value).toBe("x@y.z");
        expect(onChange).toHaveBeenCalledWith("x@y.z", expect.anything());
    });

    it("lets an uncontrolled field without onChange be typed into", () => {
        render(<Input label="Note" />);
        const input = screen.getByLabelText("Note");
        fireEvent.change(input, { target: { value: "hello" } });
        expect(input.value).toBe("hello");
    });

    it("seeds an untouched field from a defaultValue that arrives later", () => {
        const { rerender } = render(<Input label="City" />);
        rerender(<Input label="City" defaultValue="Lyon" />);
        expect(screen.getByLabelText("City").value).toBe("Lyon");
    });

    it("stays driven by the value prop when controlled", () => {
        const onChange = vi.fn();
        render(<Input label="Name" value="fixed" onChange={onChange} />);
        const input = screen.getByLabelText("Name");

        fireEvent.change(input, { target: { value: "typed" } });
        expect(onChange).toHaveBeenCalledWith("typed", expect.anything());
        expect(input.value).toBe("fixed");
    });
});
