import { FaLink } from "react-icons/fa6";

import { useVariantMerger } from "lib/hooks";

import { propTypes } from "./props";

export const Url = (props) => {
    const { variantProps, mergeProps } = useVariantMerger("Url", props);

    const { value } = variantProps;

    // Allow-list URL schemes so a value like "javascript:..." never lands in
    // href (React does not block all dangerous schemes). A relative/scheme-less
    // value has no scheme to abuse and is allowed through; an absolute URL must
    // use http(s)/mailto/tel, otherwise href is dropped (the text still shows).
    const SAFE_SCHEMES = ["http:", "https:", "mailto:", "tel:"];
    let safeHref;
    if (typeof value === "string" && value.trim() !== "") {
        try {
            safeHref = SAFE_SCHEMES.includes(new URL(value).protocol) ? value : undefined;
        } catch {
            safeHref = value; // relative path / fragment: no scheme to abuse
        }
    }

    return (
        <a { ...mergeProps("link", props => ({
            href: safeHref,
            ...props,
            className: `flex items-center gap-app-xs active:brightness-soft active:underline`,
        }))}>
            <div { ...mergeProps("icon", props => ({
                ...props,
                className: ``
            }))}>
                <FaLink />
            </div>
            <div { ...mergeProps("url", props => ({
                ...props,
                className: ``
            }))}>
                {value}
            </div>
        </a>
    );
};

Url.propTypes = propTypes;