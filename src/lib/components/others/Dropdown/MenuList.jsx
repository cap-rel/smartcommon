import { useEffect } from "react";

import { applyFunctionIfNotNil } from "lib/utils";

const ENABLED_ITEM = "[role='menuitem']:not([disabled])";

const enabledItems = (menu) => (menu ? Array.from(menu.querySelectorAll(ENABLED_ITEM)) : []);

/**
 * Menu shared by Dropdown and ContextMenu (internal, not exported).
 *
 * role="menu" with role="menuitem" buttons and role="separator" dividers.
 * The items are out of the tab order (tabIndex -1): the arrow keys move
 * between them (wrapping, disabled items skipped), Home and End jump to the
 * ends, Tab closes the menu and lets the focus move on. Escape is handled by
 * the owner, which also restores the focus.
 *
 * items: { key?, label, icon?, onClick?, danger?, disabled?, divider?, testId? }
 *
 * @param {object}   props
 * @param {Array}    props.items
 * @param {object}   props.menuRef       Ref of the role="menu" element
 * @param {Function} props.mergeProps    Owner's useVariantMerger mergeProps (menu, item, divider slots)
 * @param {Function} props.onSelect      (item) => void, called for an enabled item
 * @param {Function} props.onTabOut      Called when Tab leaves the menu
 * @param {"first"|"last"|null} [props.initialFocus="first"]
 * @param {object}   props.menuAttributes  role, ids, aria-*, style... of the menu element
 */
export const MenuList = ({
    items,
    menuRef,
    mergeProps,
    onSelect,
    onTabOut,
    initialFocus = "first",
    menuAttributes,
}) => {
    useEffect(() => {
        if (!initialFocus) {
            return;
        }
        const list = enabledItems(menuRef.current);
        const target = initialFocus === "last" ? list[list.length - 1] : list[0];
        (target ?? menuRef.current)?.focus({ preventScroll: true });
    }, []);

    const handleKeyDown = (e) => {
        const list = enabledItems(menuRef.current);
        const index = list.indexOf(document.activeElement);
        const focusAt = (next) => {
            e.preventDefault();
            list[(next + list.length) % list.length]?.focus();
        };

        switch (e.key) {
            case "ArrowDown":
                focusAt(index + 1);
                break;
            case "ArrowUp":
                focusAt(index === -1 ? list.length - 1 : index - 1);
                break;
            case "Home":
                focusAt(0);
                break;
            case "End":
                focusAt(list.length - 1);
                break;
            case "Tab":
                applyFunctionIfNotNil(onTabOut);
                break;
            default:
                break;
        }
    };

    return (
        <div { ...mergeProps("menu", p => ({
            role: "menu",
            tabIndex: -1,
            ...menuAttributes,
            ...p,
            ref: menuRef,
            onKeyDown: (e) => {
                applyFunctionIfNotNil(p.onKeyDown, e);
                handleKeyDown(e);
            },
            className: `min-w-[200px] py-app-xxs rounded-app-md border border-border bg-soft-bg shadow-lg outline-none ${menuAttributes?.className ?? ""}`,
        }))}>
            {(items ?? []).map((item, index) => (item?.divider
                ? (
                    <div key={item.key ?? `divider-${index}`} { ...mergeProps("divider", p => ({
                        role: "separator",
                        ...p,
                        className: "my-app-xxs border-t border-border",
                    }))} />
                )
                : (
                    <button key={item?.key ?? `item-${index}`} { ...mergeProps("item", p => ({
                        ...p,
                        type: "button",
                        role: "menuitem",
                        tabIndex: -1,
                        disabled: item?.disabled,
                        "data-testid": item?.testId ?? p["data-testid"],
                        onClick: (e) => {
                            applyFunctionIfNotNil(p.onClick, e);
                            if (!item?.disabled) {
                                onSelect(item);
                            }
                        },
                        className: `w-full flex items-center gap-app-sm px-app-base py-app-xs text-app-sm text-left transition-colors outline-none ${
                            item?.disabled
                                ? "text-soft-text/60 cursor-not-allowed"
                                : item?.danger
                                    ? "text-error hover:bg-error/10 focus-visible:bg-error/10"
                                    : "text-strong-text hover:bg-medium-bg focus-visible:bg-medium-bg"
                        }`,
                    }))}>
                        {item?.icon ? <span aria-hidden="true" className="text-app-base shrink-0">{item.icon}</span> : null}
                        <span className="truncate">{item?.label}</span>
                    </button>
                )
            ))}
        </div>
    );
};
