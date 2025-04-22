import { Overlay } from "../Overlay";
import { useVariantToProps } from "../../../hooks";
import { propTypes } from "./props";
import { Button } from "../Button";
import { RiCloseLargeLine } from "react-icons/ri";
import { isNil } from "../../../globals";

export const Popup = (props) => {
    const { variantProps, mergeProps } = useVariantToProps("popup", props);

    const { 
        id,
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
                    ...props,
                    isOpen,
                    close: closeOnClickOverlay && close
                }))} />
            }
            <div { ...mergeProps("popupBackdrop", props => ({
                ...props,
                className: `z-50 fixed inset-0 flex justify-center items-center p-app-lg pointer-events-none`
            }))}>

                <div { ...mergeProps("popup", props => ({
                    ...props,
                    className: `w-full max-h-full duration-(--really-quick) rounded-app-md p-app-md pb-app-lg overflow-y-auto gap-app-base text-app-base flex flex-col bg-soft-bg ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`
                }))}>

                    {(!isNil(title) || closeButton) &&
                        <div { ...mergeProps("titleAndButtonContainer", props => ({
                            ...props,
                            className: `flex justify-between items-center w-full gap-app-base`
                        }))}>

                            <div { ...mergeProps("title", props => ({
                                ...props,
                                className: `text-app-md font-app-semibold`
                            }))}>
                                {title}
                            </div>

                            {closeButton &&
                                <Button { ...mergeProps("Button", props => ({
                                    icon: <RiCloseLargeLine />,
                                    ...props,
                                    buttonProps: {
                                        ...props.buttonProps,
                                        onClick: e => {
                                            const onClick = props.buttonProps?.onClick;
                                            if (!isNil(onClick)) {
                                                onClick(e);
                                            }
                                            close();
                                        },
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

Popup.prototypes = propTypes;