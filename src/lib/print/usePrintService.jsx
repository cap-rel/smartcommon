import { useCallback, useEffect, useState } from "react";

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
    // The instance lives in state, not in a ref: a lazy state initializer runs
    // exactly once per mount and yields a plain value, so the service can be
    // read and returned during render. `templates` and `labels` are read on
    // first render only, as before.
    const [service] = useState(() => {
        const instance = new PrintService({ labels });
        if (templates) {
            for (const [type, renderers] of Object.entries(templates)) {
                instance.registerJobType(type, renderers);
            }
        }
        return instance;
    });

    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        return () => {
            service.cleanup();
        };
    }, [service]);

    const enqueue = useCallback(async (type, data, printer) => {
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
    }, [service]);

    return {
        enqueue,
        pendingCount,
        service,
    };
};
