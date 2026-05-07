import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { ErrorBoundary } from "./index";

const Boom = ({ message = "boom" }) => {
    throw new Error(message);
};

describe("ErrorBoundary", () => {
    let consoleErrorSpy;

    beforeEach(() => {
        consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    it("renders children when no error is thrown", () => {
        render(
            <ErrorBoundary>
                <p>safe content</p>
            </ErrorBoundary>
        );

        expect(screen.getByText("safe content")).toBeDefined();
    });

    it("renders default fallback UI when a child throws", () => {
        render(
            <ErrorBoundary>
                <Boom message="kaboom" />
            </ErrorBoundary>
        );

        expect(screen.getByText("Une erreur est survenue")).toBeDefined();
        expect(screen.getByText("kaboom")).toBeDefined();
        expect(screen.getByRole("button", { name: "Réessayer" })).toBeDefined();
    });

    it("renders provided fallback node instead of default UI", () => {
        render(
            <ErrorBoundary fallback={<p>custom fallback</p>}>
                <Boom />
            </ErrorBoundary>
        );

        expect(screen.getByText("custom fallback")).toBeDefined();
        expect(screen.queryByText("Une erreur est survenue")).toBeNull();
    });

    it("renders FallbackComponent with error and resetError props", () => {
        const FallbackComponent = vi.fn(({ error, resetError }) => (
            <div>
                <p>fallback comp: {error.message}</p>
                <button onClick={resetError}>reset from comp</button>
            </div>
        ));

        render(
            <ErrorBoundary FallbackComponent={FallbackComponent}>
                <Boom message="from-comp" />
            </ErrorBoundary>
        );

        expect(screen.getByText("fallback comp: from-comp")).toBeDefined();
        expect(FallbackComponent).toHaveBeenCalled();
        const callProps = FallbackComponent.mock.calls[0][0];
        expect(callProps.error).toBeInstanceOf(Error);
        expect(typeof callProps.resetError).toBe("function");
    });

    it("calls onError callback with error and errorInfo", () => {
        const onError = vi.fn();

        render(
            <ErrorBoundary onError={onError}>
                <Boom message="cb-test" />
            </ErrorBoundary>
        );

        expect(onError).toHaveBeenCalledTimes(1);
        const [errorArg, infoArg] = onError.mock.calls[0];
        expect(errorArg).toBeInstanceOf(Error);
        expect(errorArg.message).toBe("cb-test");
        expect(infoArg).toHaveProperty("componentStack");
    });

    it("logs error to console.error", () => {
        render(
            <ErrorBoundary>
                <Boom />
            </ErrorBoundary>
        );

        const wasLoggedByBoundary = consoleErrorSpy.mock.calls.some(
            (args) => typeof args[0] === "string" && args[0].includes("ErrorBoundary caught an error")
        );
        expect(wasLoggedByBoundary).toBe(true);
    });

    it("resets state when the default Réessayer button is clicked", () => {
        let shouldThrow = true;
        const Toggle = () => {
            if (shouldThrow) throw new Error("toggle");
            return <p>recovered</p>;
        };

        render(
            <ErrorBoundary>
                <Toggle />
            </ErrorBoundary>
        );

        expect(screen.getByText("Une erreur est survenue")).toBeDefined();

        shouldThrow = false;
        fireEvent.click(screen.getByRole("button", { name: "Réessayer" }));

        expect(screen.getByText("recovered")).toBeDefined();
        expect(screen.queryByText("Une erreur est survenue")).toBeNull();
    });

    it("resets state when FallbackComponent calls resetError", () => {
        let shouldThrow = true;
        const Toggle = () => {
            if (shouldThrow) throw new Error("via-comp");
            return <p>back to normal</p>;
        };

        const FallbackComponent = ({ resetError }) => (
            <button onClick={resetError}>reset</button>
        );

        render(
            <ErrorBoundary FallbackComponent={FallbackComponent}>
                <Toggle />
            </ErrorBoundary>
        );

        shouldThrow = false;
        fireEvent.click(screen.getByRole("button", { name: "reset" }));

        expect(screen.getByText("back to normal")).toBeDefined();
    });
});
