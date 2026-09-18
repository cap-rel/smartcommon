/**
 * useStates: get() must reflect the state of the render it is called from.
 *
 * Regression guarded here: the get() mirror used to be refreshed only in a
 * LAYOUT effect, so a component reading through get() during a render that
 * set() had just triggered still saw the PREVIOUS state. The screen then stayed
 * one step behind the data, and only an unrelated re-render caught it up.
 *
 * Found in a POS cart: clicking "+" moved the order to qty 2 while the line and
 * the totals kept showing qty 1.
 */

import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';

import { useStates } from 'lib/hooks';

const Counter = () => {
    const st = useStates({ initialStates: { count: 0, nested: { items: [] } } });

    return (
        <div>
            <span data-testid="read-get">{String(st.get('count'))}</span>
            <span data-testid="read-values">{String(st.values.count)}</span>
            <span data-testid="read-nested">{(st.get('nested.items') || []).join(',')}</span>
            <button type="button" onClick={() => st.set('count', st.get('count') + 1)}>
                inc
            </button>
            <button
                type="button"
                onClick={() => st.set('nested.items', [...(st.get('nested.items') || []), 'x'])}
            >
                push
            </button>
        </div>
    );
};

describe('useStates render synchronisation', () => {
    it('reflects a set() in the very next render, read through get()', async () => {
        render(<Counter />);

        expect(screen.getByTestId('read-get').textContent).toBe('0');

        await act(async () => {
            screen.getByText('inc').click();
        });

        // Before the fix this read '0': the mirror was still the pre-set state.
        expect(screen.getByTestId('read-get').textContent).toBe('1');
        expect(screen.getByTestId('read-values').textContent).toBe('1');
    });

    it('reflects a nested path write in the very next render', async () => {
        render(<Counter />);

        await act(async () => {
            screen.getByText('push').click();
        });

        expect(screen.getByTestId('read-nested').textContent).toBe('x');
    });

    it('keeps get() and values in agreement across several writes', async () => {
        render(<Counter />);

        for (let i = 0; i < 3; i++) {
            await act(async () => {
                screen.getByText('inc').click();
            });
        }

        expect(screen.getByTestId('read-get').textContent).toBe('3');
        expect(screen.getByTestId('read-values').textContent).toBe('3');
    });
});
