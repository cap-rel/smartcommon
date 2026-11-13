import { fn } from "storybook/test";
import { FaEllipsisVertical, FaFolderOpen, FaPaperPlane, FaTrash } from "react-icons/fa6";

import { useContextMenu } from "lib/hooks";

import { Dropdown } from "../../Dropdown";
import { ContextMenu } from "../";

const ROWS = [
    { ref: "FA2611-0042", customer: "Atelier Martin", amount: "1 240,00", paid: false },
    { ref: "FA2611-0043", customer: "Boulangerie Petit", amount: "86,50", paid: true },
    { ref: "FA2611-0044", customer: "Garage du Centre", amount: "3 410,20", paid: false },
];

const onOpen = fn();
const onSend = fn();
const onRemove = fn();

// Entries depend on the row: a paid invoice cannot be sent again.
const itemsFor = (row) => [
    { label: "Open", icon: <FaFolderOpen />, onClick: () => onOpen(row.ref) },
    { label: "Send reminder", icon: <FaPaperPlane />, disabled: row.paid, onClick: () => onSend(row.ref) },
    { divider: true },
    { label: "Delete", icon: <FaTrash />, danger: true, onClick: () => onRemove(row.ref) },
];

// One menu state for the whole list, one <ContextMenu> rendered once.
// `withKebab` adds a Dropdown per row with the same entries.
export const ContextMenuDemo = ({ withKebab = false, ...args }) => {
    const ctx = useContextMenu();

    return (
        <div className="p-app-base">
            <p className="mb-app-sm text-app-sm text-soft-text">
                Right-click a row (or focus it and press Shift+F10).
            </p>
            <table className="w-full max-w-[640px] text-app-sm border border-border">
                <tbody>
                    {ROWS.map((row) => (
                        <tr
                            key={row.ref}
                            tabIndex={0}
                            onContextMenu={(e) => ctx.open(e, itemsFor(row))}
                            className="border-b border-border hover:bg-medium-bg outline-none focus-visible:bg-medium-bg"
                        >
                            <td className="px-app-sm py-app-xs font-app-semibold">{row.ref}</td>
                            <td className="px-app-sm py-app-xs">{row.customer}</td>
                            <td className="px-app-sm py-app-xs text-right">{row.amount}</td>
                            {withKebab ? (
                                <td className="px-app-sm py-app-xxs w-12">
                                    <Dropdown
                                        items={itemsFor(row)}
                                        trigger={(
                                            <button
                                                type="button"
                                                aria-label={`Actions ${row.ref}`}
                                                className="flex items-center justify-center w-8 h-8 rounded-app-md text-medium-text hover:bg-soft-bg"
                                            >
                                                <FaEllipsisVertical />
                                            </button>
                                        )}
                                    />
                                </td>
                            ) : null}
                        </tr>
                    ))}
                </tbody>
            </table>
            <ContextMenu { ...args } state={ctx} />
        </div>
    );
};
