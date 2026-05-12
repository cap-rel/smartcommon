import { useCallback, useEffect, useRef, useState } from "react";

import { PrintService } from "./printService";

/**
 * React binding for the generic PrintService.
 *
 * Lazily instantiates a single PrintService per hook lifetime, registers all
 * job types declared in `templates`, exposes a thin `enqueue` wrapper, and
 * calls `cleanup()` on unmount.
 *
 * @param {object} options
 * @param {Record<string, { escpos?: function, html?: function }>} [options.templates]
 *   Map of job type -> renderers passed straight to PrintService.registerJobType.
 * @param {object} [options.labels] - Overrides for PrintService error labels.
 *
 * @returns {{
 *   enqueue: (type: string, data: object, printer: object) => Promise<void>,
 *   pendingCount: number,
 *   service: PrintService,
 * }}
 */
export const usePrintService = ({ templates, labels } = {}) => {
    const serviceRef = useRef(null);

    if (!serviceRef.current) {
        const service = new PrintService({ labels });
        if (templates) {
            for (const [type, renderers] of Object.entries(templates)) {
                service.registerJobType(type, renderers);
            }
        }
        serviceRef.current = service;
    }

    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        return () => {
            if (serviceRef.current) {
                serviceRef.current.cleanup();
            }
        };
    }, []);

    const enqueue = useCallback(async (type, data, printer) => {
        const service = serviceRef.current;
        const promise = service.enqueue(type, data, printer);
        // The service mutates its queue synchronously inside enqueue(), so the
        // count is already accurate when we read it here.
        setPendingCount(service.pendingCount);
        try {
            const result = await promise;
            setPendingCount(service.pendingCount);
            return result;
        } catch (err) {
            setPendingCount(service.pendingCount);
            throw err;
        }
    }, []);

    return {
        enqueue,
        pendingCount,
        service: serviceRef.current,
    };
};
