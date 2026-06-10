import { useEffect, useMemo, useRef, useState } from "react";
import { FaBox, FaCheck, FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { twMerge } from "lib/utils";

import { buildDefaultPriceLabel } from "./props";

const GAP = 12;
const PADDING = 16;
const MIN_W = 100;
const MAX_W = 200;
const ASPECT = 1.4;

// Infinite-scroll mode tuning (opt-in via the `infinite` prop). Tiles fill the
// width (no fixed page that fits the viewport height); rows grow as the user
// scrolls. Denser target width than the paginated mode so a phone shows a full
// width of tiles instead of a couple of oversized ones.
const INF_PADDING = 12;
const INF_TARGET_W = 160;
const INF_MIN_W = 130;
const INF_MAX_W = 230;
const INF_INITIAL = 30; // tiles rendered before any scroll
const INF_BATCH = 24; // tiles appended each time the sentinel is reached

// Columns/tile size for the infinite grid: as many columns as fit the width at
// the target tile width, then the tile width is the exact share of the row so
// the grid fills the container (no wasted horizontal space).
const computeInfiniteLayout = (innerWidth) => {
    if (innerWidth <= 0) {
        return { columns: 2, tileWidth: 160, tileHeight: Math.floor(160 * ASPECT) };
    }
    let columns = Math.floor((innerWidth + GAP) / (INF_TARGET_W + GAP));
    columns = Math.max(2, Math.min(columns, 12));
    let tileWidth = (innerWidth - (columns - 1) * GAP) / columns;
    tileWidth = Math.max(INF_MIN_W, Math.min(INF_MAX_W, tileWidth));
    return { columns, tileWidth: Math.floor(tileWidth), tileHeight: Math.floor(tileWidth * ASPECT) };
};

const computeLayout = (width, height, count) => {
    if (width <= 0 || height <= 0 || count === 0) {
        return { columns: 4, tileWidth: 120, tileHeight: 168, rows: 3 };
    }
    let best = { columns: 4, tileWidth: 120, tileHeight: 168, rows: 3, score: -Infinity };
    for (let cols = 2; cols <= Math.min(count, 12); cols++) {
        const wPer = (width - (cols - 1) * GAP) / cols;
        let tileWidth = Math.max(MIN_W, Math.min(MAX_W, wPer));
        const tileHeight = Math.floor(tileWidth * ASPECT);
        const rows = Math.max(1, Math.floor((height + GAP) / (tileHeight + GAP)));
        const totalW = cols * tileWidth + (cols - 1) * GAP;
        const totalH = rows * tileHeight + (rows - 1) * GAP;
        if (totalW > width || totalH > height) continue;
        const fillRatio = (totalW * totalH) / (width * height);
        const visible = Math.min(cols * rows, count);
        const score = tileWidth * 10 + fillRatio * 100 + visible * 5;
        if (score > best.score) {
            best = { columns: cols, tileWidth: Math.floor(tileWidth), tileHeight, rows, score };
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

const DefaultProductTile = ({ product, tileHeight, selected, cartQty, priceLabel, onClick }) => {
    const [flash, setFlash] = useState(false);
    const flashRef = useRef(null);
    useEffect(() => () => { if (flashRef.current) clearTimeout(flashRef.current); }, []);
    const blobUrl = useObjectUrl(product.image?.blob);
    const imageUrl = blobUrl || product.image?.url || null;
    const imageHeight = Math.floor(tileHeight * 0.6);

    const handleClick = () => {
        onClick(product);
        setFlash(true);
        if (flashRef.current) clearTimeout(flashRef.current);
        flashRef.current = setTimeout(() => setFlash(false), 300);
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            style={{ height: `${tileHeight}px` }}
            className={`rounded-lg overflow-hidden text-left active:scale-95 transition-transform duration-100 relative flex flex-col ${
                selected
                    ? "border-2 border-primary bg-primary/10"
                    : "border border-border bg-medium-bg"
            }`}
        >
            {cartQty > 0 && (
                <span className="absolute top-1 right-1 z-10 w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
                    {cartQty}
                </span>
            )}
            <div
                className="bg-strong-bg relative overflow-hidden flex-shrink-0 flex items-center justify-center"
                style={{ height: `${imageHeight}px` }}
            >
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={product.image?.alt || product.label || product.ref}
                        loading="lazy"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <FaBox className="text-2xl text-soft-text" />
                )}
                {flash && (
                    <div className="absolute inset-0 bg-green-500/40 flex items-center justify-center">
                        <FaCheck className="text-white text-2xl" />
                    </div>
                )}
            </div>
            <div className="px-1.5 py-1 flex-1 flex flex-col justify-center min-h-0">
                {product.ref && (
                    <div className="text-[10px] text-soft-text font-mono truncate">{product.ref}</div>
                )}
                <div className="text-xs font-medium text-strong-text line-clamp-1 leading-tight mt-0.5">
                    {product.label || ""}
                </div>
                {priceLabel && (
                    <div className="text-xs font-bold text-primary mt-0.5 truncate">{priceLabel}</div>
                )}
            </div>
        </button>
    );
};

export const ProductGrid = ({
    categoryId,
    search,
    productsAdapter,
    productType,
    customerContext,
    getProductPriceDisplay,
    renderItem,
    selectedIds = [],
    cartQtyMap,
    onProductClick,
    labels,
    // Opt-in (default false to preserve the paginated behaviour of existing
    // consumers): render a single dense, vertically-scrolling list that loads
    // more tiles as the user reaches the bottom, instead of fixed pages.
    infinite = false,
    ...rest
}) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [visibleCount, setVisibleCount] = useState(INF_INITIAL);
    const [layout, setLayout] = useState({ columns: 4, tileWidth: 140, tileHeight: 196, rows: 3 });
    const containerRef = useRef(null);
    const sentinelRef = useRef(null);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);
        Promise.resolve(productsAdapter.search({ categoryId, query: search, type: productType }))
            .then((items) => {
                if (cancelled) return;
                const list = items || [];
                list.sort((a, b) => {
                    const ra = (a.ref || a.label || "").toLowerCase();
                    const rb = (b.ref || b.label || "").toLowerCase();
                    return ra.localeCompare(rb);
                });
                setProducts(list);
                setVisibleCount(INF_INITIAL);
            })
            .catch((err) => {
                console.error("ProductGrid: failed to load products", err);
                if (!cancelled) {
                    setError(labels.loadError);
                    setProducts([]);
                }
            })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [categoryId, search, productType, productsAdapter, labels.loadError]);

    useEffect(() => { setPage(1); }, [categoryId, search]);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return undefined;
        const update = () => {
            if (infinite) {
                setLayout(computeInfiniteLayout(el.clientWidth - INF_PADDING * 2));
                return;
            }
            const w = el.clientWidth - PADDING * 2;
            const h = el.clientHeight - PADDING * 2;
            setLayout(computeLayout(w, h, products.length || 24));
        };
        const t = setTimeout(update, 50);
        const ro = new ResizeObserver(update);
        ro.observe(el);
        return () => { clearTimeout(t); ro.disconnect(); };
    }, [products.length, infinite]);

    // Infinite mode: append a batch each time the bottom sentinel enters the
    // scroll viewport. Re-created when products change so it both re-binds the
    // fresh sentinel and stops once visibleCount reaches the full list.
    useEffect(() => {
        if (!infinite) return undefined;
        const sentinel = sentinelRef.current;
        const root = containerRef.current;
        if (!sentinel || !root) return undefined;
        const io = new IntersectionObserver((entries) => {
            if (entries.some((e) => e.isIntersecting)) {
                setVisibleCount((c) => Math.min(c + INF_BATCH, products.length));
            }
        }, { root, rootMargin: "300px" });
        io.observe(sentinel);
        return () => io.disconnect();
    }, [infinite, products.length]);

    const perPage = layout.columns * layout.rows;
    const totalPages = Math.max(1, Math.ceil(products.length / perPage));
    const visible = useMemo(() => {
        const start = (page - 1) * perPage;
        return products.slice(start, start + perPage);
    }, [products, page, perPage]);

    useEffect(() => {
        if (page > totalPages) setPage(totalPages);
    }, [page, totalPages]);

    const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

    const renderTile = (product) => {
        const display = getProductPriceDisplay?.(product, customerContext);
        const priceLabel = buildDefaultPriceLabel(display);
        const selected = selectedSet.has(product.id);
        const cartQty = cartQtyMap?.get(product.id) || 0;
        if (renderItem) {
            return renderItem(product, { selected, cartQty, priceLabel, displayPrice: display });
        }
        return (
            <DefaultProductTile
                product={product}
                tileHeight={layout.tileHeight}
                selected={selected}
                cartQty={cartQty}
                priceLabel={priceLabel}
                onClick={onProductClick}
            />
        );
    };

    return (
        <div
            {...rest}
            className={twMerge("flex flex-col flex-1 min-h-0", rest.className)}
        >
            <div ref={containerRef} className="flex-1 overflow-auto">
                {loading ? (
                    <div
                        className="grid justify-center p-4"
                        style={{ gridTemplateColumns: `repeat(${layout.columns}, ${layout.tileWidth}px)`, gap: `${GAP}px` }}
                    >
                        {Array.from({ length: Math.min(layout.columns * layout.rows, 12) }).map((_, i) => (
                            <div
                                key={i}
                                style={{ height: `${layout.tileHeight}px` }}
                                className="rounded-lg border border-border overflow-hidden bg-medium-bg animate-pulse"
                            >
                                <div className="h-3/5 bg-strong-bg" />
                                <div className="p-2 flex flex-col gap-1.5">
                                    <div className="h-3 w-16 bg-strong-bg rounded" />
                                    <div className="h-4 w-full bg-strong-bg rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-error text-center">
                        {error}
                    </div>
                ) : products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4">
                        <FaBox className="text-4xl text-soft-text mb-4" />
                        <p className="text-medium-text text-center">
                            {search ? labels.noSearchResults : labels.noProducts}
                        </p>
                    </div>
                ) : infinite ? (
                    <div className="p-3">
                        <div
                            className="grid"
                            style={{ gridTemplateColumns: `repeat(${layout.columns}, minmax(0, 1fr))`, gap: `${GAP}px` }}
                        >
                            {products.slice(0, visibleCount).map((product) => (
                                <div key={product.id} style={{ height: `${layout.tileHeight}px` }}>
                                    {renderTile(product)}
                                </div>
                            ))}
                        </div>
                        {visibleCount < products.length && (
                            <div ref={sentinelRef} className="h-10" aria-hidden="true" />
                        )}
                    </div>
                ) : (
                    <div
                        className="grid justify-center p-4"
                        style={{ gridTemplateColumns: `repeat(${layout.columns}, ${layout.tileWidth}px)`, gap: `${GAP}px` }}
                    >
                        {visible.map((product) => (
                            <div key={product.id}>{renderTile(product)}</div>
                        ))}
                    </div>
                )}
            </div>

            {!infinite && !loading && products.length > perPage && (
                <div className="flex items-center justify-center gap-4 py-3 px-4 border-t border-border bg-medium-bg flex-shrink-0">
                    <button
                        type="button"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1}
                        className="p-2 rounded-full hover:bg-strong-bg disabled:opacity-30"
                    >
                        <FaChevronLeft className="text-medium-text" />
                    </button>
                    <span className="text-sm text-medium-text font-medium min-w-20 text-center">
                        {labels.pageLabel.replace("{current}", page).replace("{total}", totalPages)}
                    </span>
                    <button
                        type="button"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages}
                        className="p-2 rounded-full hover:bg-strong-bg disabled:opacity-30"
                    >
                        <FaChevronRight className="text-medium-text" />
                    </button>
                </div>
            )}
        </div>
    );
};
