/**
 * Browser-based print fallback using window.print() via a hidden iframe.
 *
 * Generic, no business coupling. Caller provides the complete HTML document.
 */

/**
 * Print an HTML document via the browser print dialog.
 *
 * @param {string} htmlContent - Complete HTML document
 * @returns {Promise<void>} Resolves after the print dialog is handled
 */
export function browserPrint(htmlContent) {
    return new Promise((resolve, reject) => {
        const iframe = document.createElement("iframe");
        iframe.style.position = "fixed";
        iframe.style.left = "-9999px";
        iframe.style.top = "-9999px";
        iframe.style.width = "80mm";
        iframe.style.height = "0";
        iframe.style.border = "none";
        // Defense-in-depth against a malicious printable field: the printed HTML
        // comes from a consumer renderer that may interpolate attacker-influenced
        // data. Sandbox the iframe WITHOUT "allow-scripts" so no <script>, inline
        // event handler or javascript: URL in the document can execute in our
        // origin. "allow-same-origin" is kept so the parent can still reach
        // contentDocument/contentWindow to write the markup and trigger print();
        // "allow-modals" lets the print dialog open.
        iframe.setAttribute("sandbox", "allow-same-origin allow-modals");

        iframe.onload = () => {
            try {
                const doc =
                    iframe.contentDocument || iframe.contentWindow.document;
                doc.open();
                doc.write(htmlContent);
                doc.close();

                // Wait for content to render before printing
                setTimeout(() => {
                    try {
                        iframe.contentWindow.focus();
                        iframe.contentWindow.print();
                    } catch (err) {
                        console.warn("[browserPrint] Print failed:", err.message);
                    }

                    // Clean up iframe after the print dialog closes
                    setTimeout(() => {
                        if (iframe.parentNode) {
                            iframe.parentNode.removeChild(iframe);
                        }
                        resolve();
                    }, 500);
                }, 250);
            } catch (err) {
                if (iframe.parentNode) {
                    iframe.parentNode.removeChild(iframe);
                }
                reject(err);
            }
        };

        iframe.onerror = (err) => {
            if (iframe.parentNode) {
                iframe.parentNode.removeChild(iframe);
            }
            reject(err);
        };

        document.body.appendChild(iframe);
    });
}
