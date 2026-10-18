/**
 * Error display of the form fields: rule messages appear once the form is
 * submitted, either through the <Form> context or through the
 * `formSubmitted` prop on standalone pages. Also covers the consumer `error`
 * prop of Label and the `onError` reporting of useField.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";

import { Input } from "lib/components/form/Input";
import { Form } from "lib/components/form/Form";
import { useForm } from "lib/hooks/local/useForm";

const REQUIRED = "Ce champ est requis.";

describe("standalone field (no <Form>)", () => {
    it("hides rule messages before submit", () => {
        render(<Input label="Email" required value="" onChange={vi.fn()} />);
        expect(screen.queryByText(REQUIRED)).toBeNull();
    });

    it("shows the failing rule message with formSubmitted", () => {
        render(<Input label="Email" required value="" onChange={vi.fn()} formSubmitted />);
        const message = screen.getByText(REQUIRED);
        expect(message.closest(".text-error")).toBeTruthy();
    });

    it("shows nothing when the rules pass", () => {
        render(<Input label="Email" required value="a@b.c" onChange={vi.fn()} formSubmitted />);
        expect(screen.queryByText(REQUIRED)).toBeNull();
    });

    it("keeps help text neutral when no rule fails", () => {
        render(<Input label="Email" help="Work address" value="a@b.c" onChange={vi.fn()} formSubmitted />);
        expect(screen.getByText("Work address").closest(".text-soft-text")).toBeTruthy();
    });
});

describe("field inside <Form>", () => {
    let form;

    const Harness = () => {
        form = useForm();
        return (
            <Form form={form}>
                <Input name="email" label="Email" required />
            </Form>
        );
    };

    it("shows the rule message once the form is submitted", () => {
        render(<Harness />);
        expect(screen.queryByText(REQUIRED)).toBeNull();

        act(() => form.set("isFormSubmitted", true));
        expect(screen.getByText(REQUIRED)).toBeTruthy();
    });
});

describe("consumer error prop", () => {
    it("is rendered in red below the field, without submit", () => {
        render(<Input label="Email" value="a@b.c" onChange={vi.fn()} error="Already taken" />);
        expect(screen.getByText("Already taken").closest(".text-error")).toBeTruthy();
    });
});

describe("onError reporting", () => {
    it("reports each rule once, then only when a result flips", () => {
        const onError = vi.fn();
        const { rerender } = render(<Input required value="" onChange={vi.fn()} onError={onError} />);
        expect(onError).toHaveBeenCalledWith("required", true);

        onError.mockClear();
        rerender(<Input required value="" onChange={vi.fn()} onError={onError} />);
        expect(onError).not.toHaveBeenCalled();

        rerender(<Input required value="filled" onChange={vi.fn()} onError={onError} />);
        expect(onError).toHaveBeenCalledWith("required", false);
    });
});
