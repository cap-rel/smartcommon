import { useEffect, useRef, useState } from "react";
import { FaFolder, FaFolderOpen, FaBoxesStacked, FaBorderNone } from "react-icons/fa6";
import { twMerge } from "lib/utils";

import { ALL_PRODUCTS_ID, UNCATEGORIZED_ID } from "./props";

const MIN_TILE = 100;
const MAX_TILE = 280;
const GAP = 12;

const hexToRgba = (hex, alpha) => {
    if (!hex || typeof hex !== "string") return null;
    const cleaned = hex.replace("#", "");
    if (cleaned.length !== 3 && cleaned.length !== 6) return null;
    const full = cleaned.length === 3
        ? cleaned.split("").map((c) => c + c).join("")
        : cleaned;
    const r = parseInt(full.substring(0, 2), 16);
    const g = parseInt(full.substring(2, 4), 16);
    const b = parseInt(full.substring(4, 6), 16);
    if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const computeLayout = (width, height, count) => {
    if (width <= 0 || height <= 0 || count === 0) return { columns: 3, tile: 128 };
    let best = { columns: 3, tile: 128, score: -Infinity };
    for (let cols = 1; cols <= Math.min(count, 10); cols++) {
        const rows = Math.ceil(count / cols);
        const wPer = (width - (cols - 1) * GAP) / cols;
        const hPer = (height - (rows - 1) * GAP) / rows;
        let tile = Math.min(wPer, hPer);
        tile = Math.max(MIN_TILE, Math.min(MAX_TILE, tile));
        const totalW = cols * tile + (cols - 1) * GAP;
        const totalH = rows * tile + (rows - 1) * GAP;
        if (totalW > width || totalH > height) continue;
        const fillRatio = (totalW * totalH) / (width * height);
        const score = tile * 10 + fillRatio * 100;
        if (score > best.score) {
            best = { columns: cols, tile: Math.floor(tile), score };
        }
    }
    return best;
};

const useObjectUrl = (blob) => {
    const [url, setUrl] = useState(null);
    useEffect(() => {
        if (!blob) { setUrl(null); return undefined; }
        const u = URL.createObjectURL(blob);
        setUrl(u);
        return () => URL.revokeObjectURL(u);
    }, [blob]);
    return url;
};

const CategoryTile = ({ category, tileSize, onClick }) => {
    const blobUrl = useObjectUrl(category.image?.blob);
    const imageUrl = blobUrl || category.image?.url || null;
    const bgColor = hexToRgba(category.color, 0.15);
    const borderColor = hexToRgba(category.color, 0.4);
    const sizeStyle = { height: `${tileSize}px` };

    if (imageUrl) {
        return (
            <button
                type="button"
                onClick={onClick}
                style={{ ...sizeStyle, boxShadow: "0 6px 16px -3px rgba(0,0,0,0.35), 0 3px 6px -2px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.25)" }}
                className="rounded-2xl cursor-pointer active:scale-95 transition-transform duration-150 overflow-hidden relative border-2 border-white/40 dark:border-white/20"
            >
                <img src={imageUrl} alt={category.image?.alt || category.label} loading="lazy" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-2.5">
                    <span className="text-sm font-bold text-white leading-tight line-clamp-2" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.6)" }}>
                        {category.label}
                    </span>
                </div>
            </button>
        );
    }

    return (
        <button
            type="button"
            onClick={onClick}
            style={bgColor ? { ...sizeStyle, backgroundColor: bgColor, borderColor } : sizeStyle}
            className={`rounded-xl flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-transform border ${
                bgColor ? "" : "bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
            }`}
        >
            <FaFolder className="text-xl text-gray-400 dark:text-gray-500 mb-1" />
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200 px-2 text-center leading-tight line-clamp-2">
                {category.label}
            </span>
        </button>
    );
};

const SpecialTile = ({ icon: Icon, label, onClick, tileSize, variant }) => {
    const sizeStyle = { height: `${tileSize}px` };
    const styles = variant === "all"
        ? "border-2 border-solid border-primary/50 bg-primary/10 dark:bg-primary/20 hover:border-primary"
        : "border-2 border-dashed border-gray-300 dark:border-gray-500 bg-gray-50 dark:bg-gray-800 hover:border-gray-400";
    const colorClass = variant === "all" ? "text-primary" : "text-gray-500 dark:text-gray-400";
    return (
        <button
            type="button"
            onClick={onClick}
            style={sizeStyle}
            className={`rounded-xl flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-transform ${styles}`}
        >
            <Icon className={`text-lg mb-1 ${colorClass}`} />
            <span className={`text-sm font-medium ${colorClass}`}>{label}</span>
        </button>
    );
};

export const CategoryGrid = ({
    categories,
    loading,
    isRoot,
    onNavigate,
    showAllProductsTile,
    showUncategorizedTile,
    labels,
    ...rest
}) => {
    const [layout, setLayout] = useState({ columns: 3, tile: 128 });
    const containerRef = useRef(null);

    const specialTiles = isRoot
        ? (showAllProductsTile ? 1 : 0) + (showUncategorizedTile ? 1 : 0)
        : 0;
    const totalCount = (categories?.length || 0) + specialTiles;

    useEffect(() => {
        const el = containerRef.current;
        if (!el || loading) return undefined;
        const update = () => {
            const rect = el.getBoundingClientRect();
            setLayout(computeLayout(rect.width - 32, rect.height - 32, totalCount));
        };
        update();
        const ro = new ResizeObserver(update);
        ro.observe(el);
        return () => ro.disconnect();
    }, [loading, totalCount]);

    if (!loading && (categories?.length || 0) === 0 && isRoot && specialTiles === 0) {
        return (
            <div
                {...rest}
                className={twMerge("flex-1 flex flex-col items-center justify-center text-gray-400 px-4", rest.className)}
            >
                <FaFolderOpen className="text-5xl mb-4" />
                <p className="text-base font-medium text-gray-500">{labels.noCategories}</p>
            </div>
        );
    }

    const tileStyle = { height: `${layout.tile}px` };
    const gridStyle = {
        gridTemplateColumns: `repeat(${layout.columns}, ${layout.tile}px)`,
    };

    return (
        <div
            ref={containerRef}
            {...rest}
            className={twMerge("flex-1 overflow-y-auto p-4", rest.className)}
        >
            {loading ? (
                <div className="grid gap-3 justify-center" style={gridStyle}>
                    {[...Array(6)].map((_, i) => (
                        <div key={i} style={tileStyle} className="rounded-xl bg-gray-100 dark:bg-gray-700 animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid gap-3 justify-center" style={gridStyle}>
                    {(categories || []).map((cat) => (
                        <CategoryTile
                            key={cat.id}
                            category={cat}
                            tileSize={layout.tile}
                            onClick={() => onNavigate(cat.id, cat.label)}
                        />
                    ))}
                    {isRoot && showAllProductsTile && (
                        <SpecialTile
                            icon={FaBoxesStacked}
                            label={labels.allProductsTile}
                            tileSize={layout.tile}
                            variant="all"
                            onClick={() => onNavigate(ALL_PRODUCTS_ID, labels.allProductsTile)}
                        />
                    )}
                    {isRoot && showUncategorizedTile && (
                        <SpecialTile
                            icon={FaBorderNone}
                            label={labels.uncategorizedTile}
                            tileSize={layout.tile}
                            variant="none"
                            onClick={() => onNavigate(UNCATEGORIZED_ID, labels.uncategorizedTile)}
                        />
                    )}
                </div>
            )}
        </div>
    );
};
