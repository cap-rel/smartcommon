/* eslint-disable react-refresh/only-export-components -- Storybook decorators
   intentionally co-locate components + helper type registries for ergonomics. */
import { useState } from "react";
import {
    FaCommentDots,
    FaBoxesStacked,
    FaCamera,
    FaTriangleExclamation,
} from "react-icons/fa6";

// Inline SVG so the stories work offline. The viewport is wide enough that
// markers placed in 0..100 percentage coordinates land on visible content.
const SAMPLE_IMAGE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#7dd3fc"/>
      <stop offset="100%" stop-color="#bae6fd"/>
    </linearGradient>
  </defs>
  <rect width="800" height="600" fill="url(#sky)"/>
  <rect x="100" y="280" width="600" height="280" fill="#a3a3a3"/>
  <rect x="160" y="320" width="80" height="120" fill="#525252"/>
  <rect x="280" y="320" width="80" height="120" fill="#525252"/>
  <rect x="400" y="320" width="80" height="120" fill="#525252"/>
  <rect x="520" y="320" width="80" height="120" fill="#525252"/>
  <polygon points="100,280 400,150 700,280" fill="#92400e"/>
  <text x="400" y="50" text-anchor="middle" font-family="sans-serif" font-size="22" fill="#0c4a6e" font-weight="bold">
    Sample photo - try the toolbar or long-press the image
  </text>
</svg>
`.trim();

export const SAMPLE_IMAGE = `data:image/svg+xml,${encodeURIComponent(SAMPLE_IMAGE_SVG)}`;

const Circle = ({ children, color }) => (
    <span
        style={{ backgroundColor: color }}
        className="size-7 flex items-center justify-center rounded-full text-white text-xs font-bold shadow"
    >
        {children}
    </span>
);

// Inline note editor: textarea + color swatch.
const NoteEditor = ({ annotation, onSave, onCancel }) => {
    const [description, setDescription] = useState(annotation.payload?.description || "");
    const [color, setColor] = useState(annotation.payload?.color || "#F59E0B");
    return (
        <div className="p-4 flex flex-col gap-3 min-w-[300px]">
            <h3 className="text-base font-semibold">Note</h3>
            <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="border border-gray-200 rounded-lg p-2 text-sm min-h-24"
                placeholder="Décrivez l'observation..."
            />
            <div className="flex items-center gap-2">
                <span className="text-sm">Couleur</span>
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
            </div>
            <div className="flex gap-2 mt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 px-3 py-2 rounded-lg bg-gray-100 text-sm"
                >
                    Annuler
                </button>
                <button
                    type="button"
                    onClick={() => onSave({ payload: { description, color } })}
                    className="flex-1 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm"
                >
                    Valider
                </button>
            </div>
        </div>
    );
};

// Stub product editor (a real consumer would mount <ProductCategoryBrowser>).
const ProductEditor = ({ annotation, onSave, onCancel }) => {
    const [ref, setRef] = useState(annotation.payload?.product_ref || "");
    return (
        <div className="p-4 flex flex-col gap-3 min-w-[300px]">
            <h3 className="text-base font-semibold">Produit</h3>
            <p className="text-xs text-gray-500">
                (En production, ouvre &lt;ProductCategoryBrowser&gt;)
            </p>
            <input
                type="text"
                value={ref}
                onChange={(e) => setRef(e.target.value)}
                placeholder="ROB-001"
                className="border border-gray-200 rounded-lg p-2 text-sm"
            />
            <div className="flex gap-2 mt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 px-3 py-2 rounded-lg bg-gray-100 text-sm"
                >
                    Annuler
                </button>
                <button
                    type="button"
                    onClick={() => onSave({
                        payload: {
                            fk_product: 100 + Math.floor(Math.random() * 1000),
                            product_ref: ref || "REF-X",
                            product_label: "Article démo",
                            qty: 1,
                        },
                    })}
                    className="flex-1 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm"
                >
                    Valider
                </button>
            </div>
        </div>
    );
};

// Stub photo editor: simulates capturing a sub-photo and linking it.
const PhotoEditor = ({ onSave, onCancel }) => (
    <div className="p-4 flex flex-col gap-3 min-w-[300px]">
        <h3 className="text-base font-semibold">Photo détaillée</h3>
        <p className="text-sm text-gray-600">
            {"En production, ouvre l'appareil photo, stocke le blob et obtient un `targetPhotoId` du backend."}
        </p>
        <div className="flex gap-2 mt-2">
            <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-3 py-2 rounded-lg bg-gray-100 text-sm"
            >
                Annuler
            </button>
            <button
                type="button"
                onClick={() => onSave({
                    payload: { targetPhotoId: `photo-${Date.now()}` },
                })}
                className="flex-1 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm"
            >
                Simuler la capture
            </button>
        </div>
    </div>
);

export const sampleNoteType = {
    label: "Note",
    icon: <FaCommentDots />,
    color: "#F59E0B",
    newPayload: () => ({ description: "", color: "#F59E0B" }),
    renderMarker: (a, { num }) => (
        <Circle color={a.payload?.color || "#F59E0B"}>{num}</Circle>
    ),
    renderEditor: NoteEditor,
    renderListItem: (a, { num }) => (
        <div className="flex items-center gap-3 min-w-0">
            <Circle color={a.payload?.color || "#F59E0B"}>{num}</Circle>
            <span className="text-sm truncate">
                {a.payload?.description || "(sans texte)"}
            </span>
        </div>
    ),
};

export const sampleProductType = {
    label: "Produit",
    icon: <FaBoxesStacked />,
    color: "#3B82F6",
    newPayload: () => ({ qty: 1 }),
    renderMarker: (a, { num }) => <Circle color="#3B82F6">{num}</Circle>,
    renderEditor: ProductEditor,
    renderListItem: (a, { num }) => (
        <div className="flex items-center gap-3 min-w-0">
            <Circle color="#3B82F6">{num}</Circle>
            <span className="text-sm truncate">
                {a.payload?.product_label || "Produit"} x {a.payload?.qty || 1}
            </span>
        </div>
    ),
};

export const samplePhotoType = {
    label: "Photo détaillée",
    icon: <FaCamera />,
    color: "#10B981",
    newPayload: () => ({}),
    renderMarker: (a, { num }) => <Circle color="#10B981">{num}</Circle>,
    renderEditor: PhotoEditor,
    renderListItem: (a, { num }) => (
        <div className="flex items-center gap-3 min-w-0">
            <Circle color="#10B981">{num}</Circle>
            <span className="text-sm truncate">
                {a.payload?.targetPhotoId ? `→ ${a.payload.targetPhotoId}` : "(non lié)"}
            </span>
        </div>
    ),
};

export const sampleAlertType = {
    label: "Alerte",
    icon: <FaTriangleExclamation />,
    color: "#DC2626",
    newPayload: () => ({ description: "", severity: "medium" }),
    renderMarker: (a, { num }) => <Circle color="#DC2626">{num}</Circle>,
    renderEditor: NoteEditor,
};

// Stories run inside Storybook's iframe and need a fixed-height container so
// the image canvas + list can compute their layouts.
export const StatefulHost = (Story, ctx) => (
    <div className="h-[600px] w-full max-w-3xl mx-auto bg-white">
        <Story args={ctx.args} />
    </div>
);
