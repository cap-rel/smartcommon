import { useEffect } from "react";

// React warning/error substrings that usually hide a real bug and are worth
// pausing on. Matching is case-sensitive, substring based on the first
// argument passed to console.error.
const WATCHED_PATTERNS = [
    "Received NaN for the",
    "value` prop on `input` should not be null",
    "changing a controlled input to be uncontrolled",
    "changing an uncontrolled input to be controlled",
    "Each child in a list should have a unique",
    "Maximum update depth exceeded",
    "Cannot update a component",
    "Warning: Each child in a list",
    "Warning: Failed prop type",
    "Warning: React does not recognize",
];

// Walk up a React fiber to the nearest function/class component fiber.
const findOwnerFiber = (startFiber) => {
    let node = startFiber?._debugOwner || startFiber?.return;
    while (node) {
        const t = node.type;
        if (typeof t === "function" || (typeof t === "object" && t !== null)) {
            return node;
        }
        node = node._debugOwner || node.return;
    }
    return null;
};

// Extract a readable component name from a fiber.
const fiberDisplayName = (fiber) => {
    if (!fiber) {
        return null;
    }
    const t = fiber.type;
    if (typeof t === "function") {
        return t.displayName || t.name || "AnonymousFn";
    }
    if (typeof t === "object" && t !== null) {
        return t.displayName || t.render?.displayName || t.render?.name || "AnonymousObj";
    }
    return String(t);
};

// Read the React fiber attached to a DOM node (React 17+ pattern).
const getFiberFromDom = (node) => {
    if (!node) {
        return null;
    }
    const key = Object.keys(node).find(k =>
        k.startsWith("__reactFiber") || k.startsWith("__reactInternalInstance")
    );
    return key ? node[key] : null;
};

// Build a source-location string "filename:line:col" if the fiber carries _debugSource.
const fiberSource = (fiber) => {
    const src = fiber?._debugSource;
    if (!src) {
        return null;
    }
    return `${src.fileName}:${src.lineNumber}:${src.columnNumber}`;
};

// Best-effort: find DOM nodes that look responsible for the current warning.
// Returns [{ node, owner, source, badValue, reason }] for every suspicious element.
const findSuspectNodes = (message) => {
    const suspects = [];
    const msg = String(message || "");

    const scan = (selector, isBad) => {
        document.querySelectorAll(selector).forEach(node => {
            const reason = isBad(node);
            if (reason === false || reason === undefined || reason === null) {
                return;
            }
            const fiber = getFiberFromDom(node);
            const ownerFiber = findOwnerFiber(fiber);
            suspects.push({
                node,
                owner: fiberDisplayName(ownerFiber),
                source: fiberSource(ownerFiber),
                reason,
            });
        });
    };

    if (msg.includes("Received NaN")) {
        // Primary scan: DOM-bound fibers of form elements.
        document.querySelectorAll("input, textarea, select").forEach(node => {
            const fiber = getFiberFromDom(node);
            const propValue = fiber?.pendingProps?.value ?? fiber?.memoizedProps?.value;
            const isNumericNaN = typeof propValue === "number" && Number.isNaN(propValue);
            if (isNumericNaN) {
                const ownerFiber = findOwnerFiber(fiber);
                suspects.push({
                    node,
                    owner: fiberDisplayName(ownerFiber),
                    source: fiberSource(ownerFiber),
                    reason: `${node.tagName.toLowerCase()} pendingProps.value = NaN (number)`,
                });
            }
        });

        // Fallback: walk every fiber root via the React DevTools hook and
        // look for any Host fiber whose props.value is NaN (number).
        if (suspects.length === 0) {
            suspects.push(...scanFiberRootsForNaNValue());
        }
    }

    if (msg.includes("value` prop on `input` should not be null")) {
        // React has likely already coerced null to empty string on the DOM
        // so we rely on fiber.memoizedProps instead of node.value.
        document.querySelectorAll("input, textarea, select").forEach(node => {
            const fiber = getFiberFromDom(node);
            if (fiber?.memoizedProps?.value === null) {
                const ownerFiber = findOwnerFiber(fiber);
                suspects.push({
                    node,
                    owner: fiberDisplayName(ownerFiber),
                    source: fiberSource(ownerFiber),
                    reason: `value prop === null`,
                });
            }
        });
    }

    if (
        msg.includes("changing a controlled input to be uncontrolled") ||
        msg.includes("changing an uncontrolled input to be controlled")
    ) {
        // No reliable signal at warn time; just list every input + its current value
        // so the dev can spot the one whose value flipped.
        document.querySelectorAll("input, textarea, select").forEach(node => {
            const fiber = getFiberFromDom(node);
            const ownerFiber = findOwnerFiber(fiber);
            suspects.push({
                node,
                owner: fiberDisplayName(ownerFiber),
                source: fiberSource(ownerFiber),
                reason: `type=${node.type || node.tagName.toLowerCase()} value=${JSON.stringify(node.value)}`,
            });
        });
    }

    return suspects;
};

// Iterate every fiber from every mounted React root and invoke `visit` for each one.
const forEachFiber = (visit) => {
    const hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
    const renderers = hook?.renderers;
    if (!hook || !renderers) {
        return;
    }
    renderers.forEach((_, rendererID) => {
        let roots;
        try {
            roots = hook.getFiberRoots ? Array.from(hook.getFiberRoots(rendererID)) : [];
        } catch (_) {
            return;
        }
        roots.forEach(root => {
            const walk = (fiber) => {
                if (!fiber) {
                    return;
                }
                visit(fiber);
                if (fiber.child) {
                    walk(fiber.child);
                }
                if (fiber.sibling) {
                    walk(fiber.sibling);
                }
            };
            walk(root.current);
        });
    });
};

// Look for any host fiber whose props.value looks like NaN (number or "NaN" string).
const scanFiberRootsForNaNValue = () => {
    const hits = [];
    forEachFiber(fiber => {
        const v = fiber?.memoizedProps?.value ?? fiber?.pendingProps?.value;
        const isBad =
            (typeof v === "number" && Number.isNaN(v)) ||
            v === "NaN";
        if (isBad) {
            const ownerFiber = findOwnerFiber(fiber);
            hits.push({
                node: fiber.stateNode instanceof Element ? fiber.stateNode : null,
                owner: fiberDisplayName(ownerFiber),
                source: fiberSource(ownerFiber),
                reason: `fiber.memoizedProps.value = ${typeof v === "number" ? "NaN (number)" : "\"NaN\" (string)"} on <${typeof fiber.type === "string" ? fiber.type : "?"}>`,
            });
        }
    });
    return hits;
};

// Fallback-of-last-resort: dump every form-like fiber with its current value and owner.
const dumpAllFormFibers = () => {
    const dump = [];
    forEachFiber(fiber => {
        if (typeof fiber.type !== "string") {
            return;
        }
        if (!["input", "textarea", "select"].includes(fiber.type)) {
            return;
        }
        const v = fiber.memoizedProps?.value;
        const ownerFiber = findOwnerFiber(fiber);
        dump.push({
            element: fiber.type,
            type: fiber.memoizedProps?.type,
            name: fiber.memoizedProps?.name,
            value: v,
            valueType: typeof v,
            isNaN: typeof v === "number" && Number.isNaN(v),
            owner: fiberDisplayName(ownerFiber),
            source: fiberSource(ownerFiber),
        });
    });
    return dump;
};

// Extract "Check the render method of `XXX`" when React includes it in the message.
const extractCheckRenderOf = (message) => {
    const msg = String(message || "");
    const m = msg.match(/Check the render method of [`'"]?([A-Za-z0-9_$]+)[`'"]?/);
    return m ? m[1] : null;
};

// Drop-in component that intercepts console.error while mounted.
// When a watched warning fires, it logs a structured group with the likely
// culprit (owner component, source file:line:col, DOM node) and hits
// `debugger`. `debugger` is a no-op when DevTools are closed.
export const DebugWarnings = () => {
    useEffect(() => {
        const original = console.error;

        const patched = function patchedConsoleError(...args) {
            const first = typeof args[0] === "string" ? args[0] : "";
            const matched = WATCHED_PATTERNS.find(p => first.includes(p));

            if (matched) {
                try {
                    console.group(`%c[DebugWarnings] ${matched}`, "color:#ff8c00;font-weight:bold");

                    // 1. Raw args - React sometimes puts a componentStack in the last string arg.
                    console.log("%cRaw console.error args:", "color:#888", args);

                    // 2. Extracted hint from message.
                    const hint = extractCheckRenderOf(first);
                    if (hint) {
                        console.log(`%cReact hint: check the render method of %c${hint}`, "color:#888", "color:#fff;font-weight:bold");
                    }

                    // 3. Targeted suspect scan (snapshot at this instant).
                    const suspects = findSuspectNodes(first);
                    if (suspects.length) {
                        console.log(`%c${suspects.length} suspect node(s) (value matches warning):`, "color:#888");
                        suspects.forEach((s, i) => console.log(`#${i}`, s));
                    } else {
                        console.log(`%c(no specific suspect found — see full form dump below)`, "color:#888");
                    }

                    // 4. Full form-element dump so the dev can spot unusual values manually.
                    if (matched.startsWith("Received NaN") || matched.includes("input`") || matched.includes("controlled")) {
                        const all = dumpAllFormFibers();
                        if (all.length) {
                            console.log(`%cAll form fibers at this instant (${all.length}):`, "color:#888");
                            console.table(all);
                        }
                    }

                    console.groupEnd();
                } catch (_) {
                    // Never let our debug helper throw while logging.
                }

                // eslint-disable-next-line no-debugger
                debugger;
            }

            original.apply(console, args);
        };

        console.error = patched;

        return () => {
            if (console.error === patched) {
                console.error = original;
            }
        };
    }, []);

    return null;
};
