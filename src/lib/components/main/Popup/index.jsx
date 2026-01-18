import { RiCloseLargeLine } from "react-icons/ri";
import { isNil } from "lodash";

import { Button, Overlay } from "lib/components";
import { useVariantMerger } from "lib/hooks";
import { applyFunctionIfNotNil } from "lib/utils";

import { defaultProps, propTypes } from "./props";

// TODO z-index prop

// TODO error when click on overlay (surely relative to the close function)

export const Popup = (props) => {
    const { variantProps, mergeProps } = useVariantMerger("Popup", props);

    const { 
        id,
        responsive = true,
        zIndex = 40,
        children,
        overlay = true,
        closeOnClickOverlay = true,
        closeButton,
        title,
        close = () => {},
        isOpen,
    } = variantProps;
    
    return (
        <>
            {overlay &&
                <Overlay { ...mergeProps("Overlay", props => ({
                    zIndex: zIndex,
                    ...props,
                    isOpen,
                    close: closeOnClickOverlay && close
                }))} />
            }
            <div { ...mergeProps("popupBackdrop", props => ({
                ...props,
                style: { "--z-index": zIndex + 10 },
                className: `z-(--z-index) fixed inset-0 flex justify-center items-center p-app-lg pointer-events-none`
            }))}>

                <div { ...mergeProps("popup", props => ({
                    ...props,
                    "data-component": "Popup",
                    className: `
                        w-full max-h-full duration-(--really-quick) overflow-y-auto rounded-app-md p-app-md pb-app-lg gap-app-base text-app-sm flex flex-col bg-soft-bg
                        ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
                        ${responsive && "lg:w-200 lg:h-160 lg:max-w-3/5 lg:max-h-3/5"}
                    `
                }))}>

                    {(!isNil(title) || closeButton) &&
                        <div { ...mergeProps("titleAndButtonContainer", props => ({
                            ...props,
                            className: `flex justify-between items-center w-full gap-app-base`
                        }))}>

                            <div { ...mergeProps("title", props => ({
                                ...props,
                                className: `text-app-base font-app-semibold`
                            }))}>
                                {title}
                            </div>

                            {closeButton &&
                                <Button { ...mergeProps("Button", props => ({
                                    icon: RiCloseLargeLine,
                                    ...props,
                                    onClick: e => {
                                        e.preventDefault();
                                        close();
                                        applyFunctionIfNotNil(props.onClick ?? props.buttonProps?.onClick, e);
                                    },
                                    buttonProps: {
                                        ...props.buttonProps,
                                        className: `text-app-lg z-60 bg-soft-bg text-soft-text p-app-xs rounded-app-xl -mr-app-xs -mt-app-xs`
                                    },
                                }))} />
                            }
                        </div>
                    }
                    
                    {children}

                </div>
            </div>
        </>
    );
};

Popup.propTypes = propTypes;
Popup.defaultProps = defaultProps;
