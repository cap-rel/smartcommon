import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import { FilesUploader } from "./index";

const star = (container) => container.querySelector("label")?.parentElement?.querySelector("[class*='star-test']");

describe("FilesUploader - Label slots", () => {
    it("styles the required star through starProps", () => {
        const { container } = render(
            <FilesUploader label="Pièces jointes" required starProps={{ className: "star-test" }} />
        );
        expect(star(container)).toBeTruthy();
    });

    it("still accepts the former requiredStarProps name", () => {
        const { container } = render(
            <FilesUploader label="Pièces jointes" required requiredStarProps={{ className: "star-test" }} />
        );
        expect(star(container)).toBeTruthy();
    });

    it("styles the label container through labelContainerProps", () => {
        const { container } = render(
            <FilesUploader label="Pièces jointes" labelContainerProps={{ className: "label-row-test" }} />
        );
        expect(container.querySelector(".label-row-test")).toBeTruthy();
    });
});
