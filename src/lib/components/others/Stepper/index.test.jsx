import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";

import { Stepper } from "./index";

const sampleSteps = [
    { label: "Identité", description: "Nom et prénom" },
    { label: "Coordonnées", description: "Adresse et téléphone" },
    { label: "Paiement" },
    { label: "Résumé" },
];

describe("Stepper", () => {
    it("renders one step element per item in steps", () => {
        const { container } = render(
            <Stepper steps={sampleSteps} currentStep={1} />
        );
        const stepEls = container.querySelectorAll('[data-step-index]');
        expect(stepEls.length).toBe(sampleSteps.length);
    });

    it("renders the container with the data-component attribute", () => {
        const { container } = render(
            <Stepper steps={sampleSteps} currentStep={0} />
        );
        expect(container.querySelector('[data-component="Stepper"]')).not.toBeNull();
    });

    it("derives status from currentStep when steps have no explicit status", () => {
        const { container } = render(
            <Stepper steps={sampleSteps} currentStep={1} />
        );
        const stepEls = container.querySelectorAll('[data-step-index]');

        expect(stepEls[0].getAttribute('data-status')).toBe('completed');
        expect(stepEls[1].getAttribute('data-status')).toBe('current');
        expect(stepEls[2].getAttribute('data-status')).toBe('upcoming');
        expect(stepEls[3].getAttribute('data-status')).toBe('upcoming');
    });

    it("respects an explicit status on a step (overrides derivation)", () => {
        const steps = [
            { label: "A" },
            { label: "B", status: "error" },
            { label: "C" },
        ];
        const { container } = render(<Stepper steps={steps} currentStep={2} />);
        const stepEls = container.querySelectorAll('[data-step-index]');

        // Without the override, index 1 would be "completed" (currentStep=2);
        // but the explicit status wins.
        expect(stepEls[1].getAttribute('data-status')).toBe('error');
        // Other steps still follow the derivation rule.
        expect(stepEls[0].getAttribute('data-status')).toBe('completed');
        expect(stepEls[2].getAttribute('data-status')).toBe('current');
    });

    it("renders error status with a distinct visual (red class)", () => {
        const steps = [{ label: "Boom", status: "error" }];
        const { container } = render(<Stepper steps={steps} currentStep={0} />);

        const stepEl = container.querySelector('[data-step-index="0"]');
        expect(stepEl.getAttribute('data-status')).toBe('error');

        // The indicator (or one of its descendants) should carry a red class.
        const html = stepEl.outerHTML;
        expect(html).toMatch(/red/);
    });

    it("renders without crashing when steps is an empty array", () => {
        const { container } = render(<Stepper steps={[]} currentStep={0} />);
        const root = container.querySelector('[data-component="Stepper"]');
        expect(root).not.toBeNull();
        expect(root.querySelectorAll('[data-step-index]').length).toBe(0);
    });

    it("renders without crashing when steps prop is omitted entirely", () => {
        const { container } = render(<Stepper />);
        expect(container.querySelector('[data-component="Stepper"]')).not.toBeNull();
    });

    it("fires onStepClick with (step, index) when a step is clicked", () => {
        const onStepClick = vi.fn();
        const { container } = render(
            <Stepper steps={sampleSteps} currentStep={0} onStepClick={onStepClick} />
        );
        const stepEls = container.querySelectorAll('[data-step-index]');
        fireEvent.click(stepEls[2]);

        expect(onStepClick).toHaveBeenCalledTimes(1);
        const [stepArg, indexArg] = onStepClick.mock.calls[0];
        expect(indexArg).toBe(2);
        expect(stepArg.label).toBe("Paiement");
    });

    it("marks steps as clickable (cursor-pointer + button role) when onStepClick is provided", () => {
        const onStepClick = vi.fn();
        const { container } = render(
            <Stepper steps={sampleSteps} currentStep={0} onStepClick={onStepClick} />
        );
        const stepEl = container.querySelector('[data-step-index="0"]');
        expect(stepEl.className).toMatch(/cursor-pointer/);
        expect(stepEl.getAttribute('role')).toBe('button');
    });

    it("does not fire any handler nor mark cursor-pointer when onStepClick is absent", () => {
        const { container } = render(<Stepper steps={sampleSteps} currentStep={0} />);
        const stepEl = container.querySelector('[data-step-index="0"]');
        expect(stepEl.className).not.toMatch(/cursor-pointer/);
        expect(stepEl.getAttribute('role')).toBeNull();
        // Clicking should not blow up.
        fireEvent.click(stepEl);
    });

    it("exposes orientation via data-orientation and changes layout class", () => {
        const { container: horizontal } = render(
            <Stepper steps={sampleSteps} currentStep={0} orientation="horizontal" />
        );
        const horizontalRoot = horizontal.querySelector('[data-component="Stepper"]');
        expect(horizontalRoot.getAttribute('data-orientation')).toBe('horizontal');
        expect(horizontalRoot.className).toMatch(/flex-row/);

        const { container: vertical } = render(
            <Stepper steps={sampleSteps} currentStep={0} orientation="vertical" />
        );
        const verticalRoot = vertical.querySelector('[data-component="Stepper"]');
        expect(verticalRoot.getAttribute('data-orientation')).toBe('vertical');
        expect(verticalRoot.className).toMatch(/flex-col/);
    });

    it("renders the step label and description when provided", () => {
        const { container } = render(
            <Stepper steps={sampleSteps} currentStep={0} />
        );
        expect(container.textContent).toContain("Identité");
        expect(container.textContent).toContain("Nom et prénom");
    });

    it("uses the labels.stepN function for aria-label fallback", () => {
        const labels = { stepN: (n) => `Step ${n}` };
        const { container } = render(
            <Stepper steps={sampleSteps} currentStep={0} labels={labels} />
        );
        const firstStep = container.querySelector('[data-step-index="0"]');
        expect(firstStep.getAttribute('aria-label')).toBe('Step 1');
    });

    it("falls back to French default labels when labels prop is omitted", () => {
        const { container } = render(
            <Stepper steps={sampleSteps} currentStep={0} />
        );
        const firstStep = container.querySelector('[data-step-index="0"]');
        expect(firstStep.getAttribute('aria-label')).toBe('Étape 1');
    });

    it("hides the connector after the last step", () => {
        const { container } = render(
            <Stepper steps={sampleSteps} currentStep={0} />
        );
        const connectors = container.querySelectorAll('[data-connector="true"]');
        // For N steps there are N-1 connectors.
        expect(connectors.length).toBe(sampleSteps.length - 1);
    });
});
