import { createElement, isValidElement } from "react";
import { FaPencil } from "react-icons/fa6";
import { isNil } from "lodash";

import { useVariantMerger } from "lib/hooks";
import { applyFunctionIfNotNil } from "lib/utils";
import { defaultProps, propTypes } from "./props";

// Trailing icon after the title: the pencil when the item is a `link`, or
// the one asked for through `trailingIcon` (true = pencil, a component or an
// element = that icon, false = none even on a link).
const resolveTrailingIcon = (trailingIcon, link) => {
    if (trailingIcon === false) return null;
    if (isNil(trailingIcon)) return link ? FaPencil : null;
    if (trailingIcon === true) return FaPencil;
    return trailingIcon;
};

export const ListItem = (props) => {
    const { variantProps, mergeProps } = useVariantMerger("ListItem", props);
    const {
        logo,
        logoAlt = "Logo", // Default alt text for accessibility
        icon,
        link = false,
        trailingIcon,
        onClick,
        href,
        target,
        rel,
        status,
        title,
        subtitle,
        description,
    } = variantProps;

    const TrailingIcon = resolveTrailingIcon(trailingIcon, link);
    const isAnchor = !isNil(href);
    const isButton = !isAnchor && typeof onClick === "function";
    const isInteractive = isAnchor || isButton;

    // role="button" on a div (not a <button>): the item lays out block
    // content, which a <button> may not contain. Enter activates on key
    // down, Space on key up, like a native button.
    const buttonProps = isButton
        ? {
            role: "button",
            tabIndex: 0,
            onKeyDown: (e) => {
                if (e.target !== e.currentTarget) return;
                if (e.key === "Enter") {
                    e.preventDefault();
                    onClick(e);
                } else if (e.key === " ") {
                    // Keep the page from scrolling.
                    e.preventDefault();
                }
            },
            onKeyUp: (e) => {
                if (e.target === e.currentTarget && e.key === " ") {
                    e.preventDefault();
                    onClick(e);
                }
            },
        }
        : {};

    const Root = isAnchor ? "a" : "div";

    return (
        <Root { ...mergeProps("container", p => ({
            ...buttonProps,
            ...(isAnchor ? { href, target, rel } : {}),
            ...p,
            "data-component": "ListItem",
            onClick: isInteractive
                ? (e) => {
                    applyFunctionIfNotNil(onClick, e);
                    applyFunctionIfNotNil(p.onClick, e);
                }
                : p.onClick,
            className: `flex items-center ${isInteractive
                ? "cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
                : ""}`,
        }), { forwardAttributes: true })}>
            <div
                className={`
                    w-full flex items-center gap-app-sm text-soft-text px-app-base py-app-xs
                    duration-(--quick) bg-soft-bg
                `}
            >
                {logo
                    ? <img src={logo} alt={logoAlt} className="size-12" />
                    : icon &&
                        <div className={`p-app-sm bg-primary/15 rounded-app-md relative text-primary text-app-xl`}>
                            {icon?.()}
                        </div>
                }
                <div className={`flex flex-col grow`}>
                    <div className="flex gap-app-sm justify-between items-center -mr-app-xs">
                        <div className="flex gap-app-xs items-center grow">
                            <div className="text-primary font-app-semibold line-clamp-1">
                                {title}
                            </div>
                            {TrailingIcon && (isValidElement(TrailingIcon)
                                ? TrailingIcon
                                : createElement(TrailingIcon, mergeProps("trailingIcon", p => ({
                                    "aria-hidden": "true",
                                    ...p,
                                    className: `text-primary shrink-0`,
                                })))
                            )}
                        </div>
                        {status}
                    </div>
                    <div className="flex gap-app-sm justify-between items-center">
                        <div className={`text-soft-text italic ${!subtitle ? "opacity-0" : ""}`}>
                            {subtitle}
                        </div>
                    </div>
                    <div className="flex gap-app-sm justify-between items-center">
                        <div className={`text-strong-text line-clamp-1 ${!description ? "opacity-0" : ""}`}>
                            {description}
                        </div>
                    </div>
                </div>
            </div>
        </Root>
    );
};

ListItem.propTypes = propTypes;
ListItem.defaultProps = defaultProps;
