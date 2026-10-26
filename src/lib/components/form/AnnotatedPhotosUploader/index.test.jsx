import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import { render, fireEvent, waitFor, act } from "@testing-library/react";

// ---------------------------------------------------------------------------
// Hoisted mocks, same set as PhotosUploader's own tests: the real uploader
// runs (it is what this component wraps), only its I/O is stubbed.
// ---------------------------------------------------------------------------

const { uploadMock, queueMock, fileMock, annotatorMock, uploaderHolder } = vi.hoisted(() => ({
    uploadMock: {
        uploadFile: () => Promise.resolve({}),
        cancelUpload: () => Promise.resolve({}),
    },
    queueMock: {
        enqueue: () => Promise.resolve({ pending_id: "PID" }),
        pending: [],
        retry: () => Promise.resolve(),
        cancel: () => Promise.resolve(),
        flush: () => Promise.resolve(),
        onResolved: () => () => {},
    },
    fileMock: {
        resizeImage: (file) => file,
    },
    // Last props received by the PhotoAnnotator stub.
    annotatorMock: { props: null },
    // The real PhotosUploader, imported normally below: through
    // importActual("lib/components") it would keep the real lib/hooks
    // (real upload, real compression) instead of the mocks above.
    uploaderHolder: { Component: null },
}));

vi.mock("lib/hooks", async () => {
    const real = await vi.importActual("lib/hooks");
    return {
        ...real,
        useUpload: () => uploadMock,
        useUploadQueue: () => queueMock,
        useFile: () => fileMock,
    };
});

vi.mock("lib/components", async () => {
    const real = await vi.importActual("lib/components");
    return {
        ...real,
        Button: ({ icon: Icon, label, onClick, disabled, buttonProps = {} }) => (
            <button type="button" disabled={disabled} onClick={onClick} className={buttonProps.className}>
                {Icon ? <Icon /> : null}
                {label}
            </button>
        ),
        Input: ({ name, value, onChange, label }) => (
            <label>
                <span>{label}</span>
                <input name={name} value={value ?? ""} onChange={(e) => onChange?.(e.target.value)} />
            </label>
        ),
        Textarea: ({ name, value, onChange, label }) => (
            <label>
                <span>{label}</span>
                <textarea name={name} value={value ?? ""} onChange={(e) => onChange?.(e.target.value)} />
            </label>
        ),
        Label: ({ children }) => <div>{children}</div>,
        Popup: ({ children, isOpen }) => (isOpen ? <div data-testid="popup">{children}</div> : null),
        PhotosUploader: (props) => {
            const Uploader = uploaderHolder.Component;
            return <Uploader {...props} />;
        },
    };
});

// Modal and PhotoAnnotator are stubbed by module path: the component reaches
// them through the components barrel, whose real graph the barrel mock above
// does not rewire.
vi.mock("lib/components/others/Modal/index.jsx", () => ({
    Modal: ({ children, isOpen, title, onClose }) => (isOpen
        ? (
            <div data-testid="modal" data-title={title}>
                <button type="button" data-testid="modal-close" onClick={onClose}>x</button>
                {children}
            </div>
        )
        : null),
}));

vi.mock("lib/components/others/PhotoAnnotator/index.jsx", () => ({
    PhotoAnnotator: (props) => {
        annotatorMock.props = props;
        return <div data-testid="annotator" data-src={props.src} data-readonly={String(!!props.readOnly)} />;
    },
}));

vi.mock("react-hot-toast", () => {
    const fn = vi.fn();
    fn.success = vi.fn();
    fn.error = vi.fn();
    return { default: fn };
});

beforeAll(() => {
    if (!URL.createObjectURL) URL.createObjectURL = () => "blob:mock";
    if (!URL.revokeObjectURL) URL.revokeObjectURL = () => {};
});

import { PhotosUploader } from "lib/components/form/PhotosUploader/index.jsx";
import { AnnotatedPhotosUploader } from "./index";

uploaderHolder.Component = PhotosUploader;

const NOTE = { note: { label: "Note", renderMarker: () => null, renderEditor: () => null } };

const fireFileChange = (container, file) => {
    const input = container.querySelector('input[type="file"]');
    Object.defineProperty(input, "files", { value: [file], configurable: true });
    fireEvent.change(input);
};

beforeEach(() => {
    uploadMock.uploadFile = vi.fn(() => Promise.resolve({ upload_id: "U1", filename: "p.png", mime: "image/png", size: 5 }));
    uploadMock.cancelUpload = vi.fn(() => Promise.resolve({ deleted: true }));
    queueMock.onResolved = vi.fn(() => () => {});
    annotatorMock.props = null;
});

describe("AnnotatedPhotosUploader - adding photos", () => {
    it("gives a new photo a uid and an empty annotation list", async () => {
        const onChange = vi.fn();
        const { container } = render(
            <AnnotatedPhotosUploader name="photos" outputFormat="upload" annotationTypes={NOTE} value={[]} onChange={onChange} />
        );

        await act(async () => { fireFileChange(container, new File(["d"], "shot.png", { type: "image/png" })); });
        await waitFor(() => expect(onChange).toHaveBeenCalled());

        const [photo] = onChange.mock.calls.at(-1)[0];
        expect(photo.uploadId).toBe("U1");
        expect(photo.uid).toMatch(/^[A-Za-z0-9]{6,64}$/);
        expect(photo.annotations).toEqual([]);
    });

    it("keeps the uid and annotations of the photos already there", async () => {
        const existing = { uid: "keep-me", uploadId: "U0", previewUrl: "blob:0", title: "a", annotations: [{ id: "n1", type: "note", x: 1, y: 2 }] };
        const onChange = vi.fn();
        const { container } = render(
            <AnnotatedPhotosUploader name="photos" outputFormat="upload" annotationTypes={NOTE} value={[existing]} onChange={onChange} />
        );

        await act(async () => { fireFileChange(container, new File(["d"], "shot.png", { type: "image/png" })); });
        await waitFor(() => expect(onChange).toHaveBeenCalled());

        const next = onChange.mock.calls.at(-1)[0];
        expect(next).toHaveLength(2);
        expect(next[0].uid).toBe("keep-me");
        expect(next[0].annotations).toEqual(existing.annotations);
        expect(next[1].uid).not.toBe("keep-me");
    });

    it("disables capture once max photos are there", () => {
        const photos = [1, 2].map((i) => ({ uid: `u${i}`, previewUrl: `blob:${i}`, annotations: [] }));
        const { container } = render(
            <AnnotatedPhotosUploader name="photos" annotationTypes={NOTE} max={2} value={photos} onChange={() => {}} />
        );
        const buttons = [...container.querySelectorAll('[data-testid="photos-capture-controls"] button')];
        expect(buttons).toHaveLength(2);
        buttons.forEach((button) => expect(button.disabled).toBe(true));
    });
});

describe("AnnotatedPhotosUploader - annotations", () => {
    const photos = () => [
        { uid: "a", previewUrl: "blob:a", title: "a", annotations: [] },
        { uid: "b", src: "https://x/b.jpg", title: "b", annotations: [{ id: "n1", type: "note", x: 10, y: 20 }] },
    ];

    it("shows one annotate button per photo, with the marker count", () => {
        const { getByTestId } = render(
            <AnnotatedPhotosUploader name="photos" annotationTypes={NOTE} value={photos()} onChange={() => {}} />
        );
        expect(getByTestId("annotated-photos-annotate-0").getAttribute("data-annotation-count")).toBe("0");
        expect(getByTestId("annotated-photos-annotate-1").getAttribute("data-annotation-count")).toBe("1");
    });

    it("opens the annotator on the clicked photo, not the photo popup", () => {
        const { getByTestId, queryByTestId } = render(
            <AnnotatedPhotosUploader name="photos" annotationTypes={NOTE} value={photos()} onChange={() => {}} />
        );
        fireEvent.click(getByTestId("annotated-photos-annotate-1"));

        expect(queryByTestId("popup")).toBeNull();
        expect(getByTestId("modal").getAttribute("data-title")).toBe("Annotations - photo 2");
        expect(getByTestId("annotator").getAttribute("data-src")).toBe("https://x/b.jpg");
        expect(annotatorMock.props.annotations).toEqual(photos()[1].annotations);
        expect(annotatorMock.props.annotationTypes).toBe(NOTE);
    });

    it("writes the annotator changes on that photo only", () => {
        const onChange = vi.fn();
        const { getByTestId } = render(
            <AnnotatedPhotosUploader name="photos" annotationTypes={NOTE} value={photos()} onChange={onChange} />
        );
        fireEvent.click(getByTestId("annotated-photos-annotate-0"));
        const marker = { id: "n2", type: "note", x: 50, y: 50 };
        act(() => { annotatorMock.props.onChange([marker]); });

        const next = onChange.mock.calls.at(-1)[0];
        expect(next[0].annotations).toEqual([marker]);
        expect(next[1].annotations).toEqual(photos()[1].annotations);
        expect(next[0].uid).toBe("a");
    });

    it("gives a uid to a server photo annotated without any other change", () => {
        const onChange = vi.fn();
        const serverPhoto = { src: "https://example.test/p.jpg", title: "s" };
        const { getByTestId } = render(
            <AnnotatedPhotosUploader name="photos" annotationTypes={NOTE} value={[serverPhoto]} onChange={onChange} />
        );
        fireEvent.click(getByTestId("annotated-photos-annotate-0"));
        act(() => { annotatorMock.props.onChange([{ id: "n1", type: "note", x: 1, y: 1 }]); });

        const [photo] = onChange.mock.calls.at(-1)[0];
        expect(photo.uid).toMatch(/^[A-Za-z0-9]{6,64}$/);
        expect(photo.annotations).toHaveLength(1);
        expect(photo.src).toBe(serverPhoto.src);
    });

    it("closes the annotator", () => {
        const { getByTestId, queryByTestId } = render(
            <AnnotatedPhotosUploader name="photos" annotationTypes={NOTE} value={photos()} onChange={() => {}} />
        );
        fireEvent.click(getByTestId("annotated-photos-annotate-0"));
        fireEvent.click(getByTestId("modal-close"));
        expect(queryByTestId("modal")).toBeNull();
    });

    it("read-only: hides the button of a photo without markers, opens the others read-only", () => {
        const { getByTestId, queryByTestId } = render(
            <AnnotatedPhotosUploader name="photos" annotationTypes={NOTE} value={photos()} onChange={() => {}} readOnly />
        );
        expect(queryByTestId("annotated-photos-annotate-0")).toBeNull();

        const button = getByTestId("annotated-photos-annotate-1");
        expect(button.getAttribute("aria-label")).toBe("View annotations");
        fireEvent.click(button);
        expect(getByTestId("annotator").getAttribute("data-readonly")).toBe("true");
    });

    it("uses the labels passed in", () => {
        const { getByTestId } = render(
            <AnnotatedPhotosUploader
                name="photos"
                annotationTypes={NOTE}
                value={photos()}
                onChange={() => {}}
                labels={{ annotate: "Annoter", annotationsTitle: (i) => `Photo ${i + 1}` }}
            />
        );
        const button = getByTestId("annotated-photos-annotate-0");
        expect(button.getAttribute("aria-label")).toBe("Annoter");
        fireEvent.click(button);
        expect(getByTestId("modal").getAttribute("data-title")).toBe("Photo 1");
    });
});

describe("AnnotatedPhotosUploader - null safety", () => {
    it("renders without value, with null and with a non-array", () => {
        expect(() => render(<AnnotatedPhotosUploader annotationTypes={NOTE} />)).not.toThrow();
        expect(() => render(<AnnotatedPhotosUploader annotationTypes={NOTE} value={null} onChange={() => {}} />)).not.toThrow();
        expect(() => render(<AnnotatedPhotosUploader annotationTypes={NOTE} value={{}} onChange={() => {}} />)).not.toThrow();
        expect(() => render(<AnnotatedPhotosUploader value={[{}]} onChange={() => {}} />)).not.toThrow();
    });
});
