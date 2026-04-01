import { useState, useEffect, useRef } from "react";

/**
 * Threshold ratio: if visualViewport.height < window.innerHeight * threshold,
 * we consider the virtual keyboard is open.
 */
const KEYBOARD_THRESHOLD = 0.75;

/**
 * KeyboardStickyAction - Renders children normally in the document flow.
 * When the virtual keyboard opens on mobile, a floating copy of the children
 * is displayed just above the keyboard so the action button stays accessible.
 *
 * Usage:
 *   <KeyboardStickyAction className="p-4 bg-white border-t">
 *       <Button label="Valider" onClick={handleSubmit} />
 *   </KeyboardStickyAction>
 *
 * Props:
 *   - children: the action element(s) to render
 *   - className: additional CSS classes for the floating container
 *   - style: additional inline styles for the floating container
 */
export const KeyboardStickyAction = ({ children, className = "", style = {} }) => {
    const [keyboardOpen, setKeyboardOpen] = useState(false);
    const [floatingBottom, setFloatingBottom] = useState(0);
    const placeholderRef = useRef(null);

    useEffect(() => {
        const viewport = window.visualViewport;
        if (!viewport) return;

        const handleResize = () => {
            const isOpen = viewport.height < window.innerHeight * KEYBOARD_THRESHOLD;
            setKeyboardOpen(isOpen);

            if (isOpen) {
                // Position floating element just above the keyboard
                const keyboardTop = viewport.height + viewport.offsetTop;
                const distFromBottom = window.innerHeight - keyboardTop;
                setFloatingBottom(distFromBottom);
            }
        };

        viewport.addEventListener("resize", handleResize);
        viewport.addEventListener("scroll", handleResize);
        handleResize();

        return () => {
            viewport.removeEventListener("resize", handleResize);
            viewport.removeEventListener("scroll", handleResize);
        };
    }, []);

    return (
        <>
            {/* Normal flow element - always rendered, hidden visually when floating copy is shown */}
            <div ref={placeholderRef} className={keyboardOpen ? "invisible" : ""}>
                <div className={className} style={style}>
                    {children}
                </div>
            </div>

            {/* Floating copy - only rendered when keyboard is open */}
            {keyboardOpen && (
                <div
                    className={`fixed left-0 right-0 z-50 shadow-lg ${className}`}
                    style={{
                        ...style,
                        bottom: `${floatingBottom}px`
                    }}
                >
                    {children}
                </div>
            )}
        </>
    );
};
