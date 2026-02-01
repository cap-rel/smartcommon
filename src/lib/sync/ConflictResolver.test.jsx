import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ConflictResolver } from './ConflictResolver';

describe('ConflictResolver', () => {
    const mockConflicts = [
        {
            conflict_id: 'c1',
            table: 'thirdparty',
            object_id: 123,
            object_ref: 'SOC001',
            client_data: { name: 'Client Name', email: 'client@test.com' },
            server_data: { name: 'Server Name', email: 'server@test.com' },
            client_tms: '2024-01-15T09:00:00Z',
            server_tms: '2024-01-15T10:00:00Z',
            field_conflicts: ['name', 'email']
        }
    ];

    const defaultProps = {
        conflicts: mockConflicts,
        onResolve: vi.fn().mockResolvedValue(),
        onCancel: vi.fn()
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('rendering', () => {
        it('should render nothing when no conflicts', () => {
            const { container } = render(
                <ConflictResolver {...defaultProps} conflicts={[]} />
            );
            expect(container.firstChild).toBeNull();
        });

        it('should render conflict title with object reference', () => {
            render(<ConflictResolver {...defaultProps} />);
            expect(screen.getByText(/SOC001/)).toBeTruthy();
        });

        it('should render all fields from both versions', () => {
            render(<ConflictResolver {...defaultProps} />);
            expect(screen.getByText('name')).toBeTruthy();
            expect(screen.getByText('email')).toBeTruthy();
        });

        it('should display client and server values', () => {
            render(<ConflictResolver {...defaultProps} />);
            expect(screen.getByText('Client Name')).toBeTruthy();
            expect(screen.getByText('Server Name')).toBeTruthy();
        });
    });

    describe('navigation', () => {
        const multipleConflicts = [
            { ...mockConflicts[0], conflict_id: 'c1', object_ref: 'SOC001' },
            { ...mockConflicts[0], conflict_id: 'c2', object_ref: 'SOC002' }
        ];

        it('should show navigation when multiple conflicts', () => {
            render(<ConflictResolver {...defaultProps} conflicts={multipleConflicts} />);
            expect(screen.getByText(/1 sur 2/)).toBeTruthy();
        });

        it('should navigate to next conflict', () => {
            render(<ConflictResolver {...defaultProps} conflicts={multipleConflicts} />);

            fireEvent.click(screen.getByText(/Suivant/));

            expect(screen.getByText(/SOC002/)).toBeTruthy();
            expect(screen.getByText(/2 sur 2/)).toBeTruthy();
        });

        it('should navigate to previous conflict', () => {
            render(<ConflictResolver {...defaultProps} conflicts={multipleConflicts} />);

            fireEvent.click(screen.getByText(/Suivant/));
            fireEvent.click(screen.getByText(/Precedent/));

            expect(screen.getByText(/SOC001/)).toBeTruthy();
        });
    });

    describe('resolution actions', () => {
        it('should call onResolve with client resolution', async () => {
            const onResolve = vi.fn().mockResolvedValue();
            render(<ConflictResolver {...defaultProps} onResolve={onResolve} />);

            fireEvent.click(screen.getByText(/Garder ma version/));

            await waitFor(() => {
                expect(onResolve).toHaveBeenCalledWith('c1', 'client', null);
            });
        });

        it('should call onResolve with server resolution', async () => {
            const onResolve = vi.fn().mockResolvedValue();
            render(<ConflictResolver {...defaultProps} onResolve={onResolve} />);

            fireEvent.click(screen.getByText(/Garder serveur/));

            await waitFor(() => {
                expect(onResolve).toHaveBeenCalledWith('c1', 'server', null);
            });
        });

        it('should call onCancel when cancel clicked', () => {
            const onCancel = vi.fn();
            render(<ConflictResolver {...defaultProps} onCancel={onCancel} />);

            fireEvent.click(screen.getByText(/Annuler/));

            expect(onCancel).toHaveBeenCalled();
        });

        it('should move to next conflict after resolution', async () => {
            const multipleConflicts = [
                { ...mockConflicts[0], conflict_id: 'c1', object_ref: 'SOC001' },
                { ...mockConflicts[0], conflict_id: 'c2', object_ref: 'SOC002' }
            ];
            const onResolve = vi.fn().mockResolvedValue();

            render(<ConflictResolver {...defaultProps} conflicts={multipleConflicts} onResolve={onResolve} />);

            fireEvent.click(screen.getByText(/Garder ma version/));

            await waitFor(() => {
                expect(screen.getByText(/SOC002/)).toBeTruthy();
            });
        });

        it('should call onCancel after resolving last conflict', async () => {
            const onResolve = vi.fn().mockResolvedValue();
            const onCancel = vi.fn();

            render(<ConflictResolver {...defaultProps} onResolve={onResolve} onCancel={onCancel} />);

            fireEvent.click(screen.getByText(/Garder ma version/));

            await waitFor(() => {
                expect(onCancel).toHaveBeenCalled();
            });
        });
    });

    describe('merge mode', () => {
        it('should enter merge mode when clicking merge button', () => {
            render(<ConflictResolver {...defaultProps} />);

            fireEvent.click(screen.getByText(/Fusionner/));

            expect(screen.getByText(/Appliquer/)).toBeTruthy();
        });

        it('should show selection buttons in merge mode', () => {
            render(<ConflictResolver {...defaultProps} />);

            fireEvent.click(screen.getByText(/Fusionner/));

            expect(screen.getAllByText('Client').length).toBeGreaterThan(0);
            expect(screen.getAllByText('Serveur').length).toBeGreaterThan(0);
        });

        it('should call onResolve with merged data after selections', async () => {
            const onResolve = vi.fn().mockResolvedValue();
            render(<ConflictResolver {...defaultProps} onResolve={onResolve} />);

            fireEvent.click(screen.getByText(/Fusionner/));

            // Select client for all conflicting fields
            const clientButtons = screen.getAllByRole('button', { name: 'Client' });
            clientButtons.forEach(btn => fireEvent.click(btn));

            fireEvent.click(screen.getByText(/Appliquer/));

            await waitFor(() => {
                expect(onResolve).toHaveBeenCalledWith(
                    'c1',
                    'merged',
                    expect.objectContaining({
                        name: 'Client Name',
                        email: 'client@test.com'
                    })
                );
            });
        });

        it('should exit merge mode when cancel clicked in merge mode', () => {
            render(<ConflictResolver {...defaultProps} />);

            fireEvent.click(screen.getByText(/Fusionner/));
            expect(screen.getByText(/Appliquer/)).toBeTruthy();

            fireEvent.click(screen.getByText(/Annuler/));
            expect(screen.queryByText(/Appliquer/)).toBeNull();
        });
    });

    describe('custom labels', () => {
        it('should use custom labels when provided', () => {
            render(
                <ConflictResolver
                    {...defaultProps}
                    labels={{
                        title: 'Custom Title',
                        keepClient: 'Keep Mine',
                        keepServer: 'Keep Server'
                    }}
                />
            );

            expect(screen.getByText(/Custom Title/)).toBeTruthy();
            expect(screen.getByText('Keep Mine')).toBeTruthy();
            expect(screen.getByText('Keep Server')).toBeTruthy();
        });
    });

    describe('custom field rendering', () => {
        it('should use renderField when provided', () => {
            const renderField = vi.fn((field, clientValue, serverValue, source) => {
                return <span data-testid={`custom-${field}-${source}`}>{source === 'client' ? clientValue : serverValue}</span>;
            });

            render(<ConflictResolver {...defaultProps} renderField={renderField} />);

            expect(screen.getByTestId('custom-name-client')).toBeTruthy();
            expect(screen.getByTestId('custom-name-server')).toBeTruthy();
        });
    });

    describe('metadata display', () => {
        it('should display server timestamp', () => {
            render(<ConflictResolver {...defaultProps} />);
            expect(screen.getByText(/Serveur:/)).toBeTruthy();
        });

        it('should display client timestamp when available', () => {
            render(<ConflictResolver {...defaultProps} />);
            expect(screen.getByText(/Local:/)).toBeTruthy();
        });
    });

    describe('edge cases', () => {
        it('should handle null values', () => {
            const conflictWithNull = [{
                ...mockConflicts[0],
                client_data: { name: null },
                server_data: { name: 'Server Name' }
            }];

            render(<ConflictResolver {...defaultProps} conflicts={conflictWithNull} />);
            expect(screen.getByText('-')).toBeTruthy();
        });

        it('should handle boolean values', () => {
            const conflictWithBoolean = [{
                ...mockConflicts[0],
                client_data: { active: true },
                server_data: { active: false }
            }];

            render(<ConflictResolver {...defaultProps} conflicts={conflictWithBoolean} />);
            expect(screen.getByText('Oui')).toBeTruthy();
            expect(screen.getByText('Non')).toBeTruthy();
        });

        it('should handle object values', () => {
            const conflictWithObject = [{
                ...mockConflicts[0],
                client_data: { meta: { key: 'value' } },
                server_data: { meta: { key: 'other' } }
            }];

            render(<ConflictResolver {...defaultProps} conflicts={conflictWithObject} />);
            expect(screen.getByText('{"key":"value"}')).toBeTruthy();
        });
    });
});
