import { useRef } from "react";
import { Input, Label, Textarea } from "../../form"
import { Button, Spinner } from "../../others";
import { isEmpty, isNil, splitFileExtension } from "../../../globals/functions";
import { useStates } from "../../../hooks";
import { propTypes } from "./props";
import { FaCamera, FaFileImage } from "react-icons/fa6";
import { twMerge } from "tailwind-merge";
import { RiCloseLargeFill } from "react-icons/ri";

// TODO Add retake or reimport system

// IDEA Add GpsPoints and Address
// IDEA Add full size mode for images

export const Photos = ({
    id,
    name,
    label,
    help,
    icon,
    prefix,
    suffix,
    defaultValue,
    required,
    readOnly,
    disabled,
    min,
    max,
    size,
    rows = 5,
    accept,
    multiple = false,
    compressionSettings = {},
    value,
    onValueChange = () => {},
    
    containerProps,
    labelContainerProps,
    labelProps,
    requiredStarProps,
    helpProps,
    inputProps,
    listAndButtonsContainerProps,
    listProps,
    listItemProps,
    urlInputProps,
    originInputProps,
    iconProps,
    titleProps,
    deleteButtonProps,
    deleteButtonIconProps,
    panelProps,
    imageProps,
    titleInputProps,
    descriptionInputProps,
    buttonContainerProps,
    cameraButtonProps,
    cameraButtonSpinnerProps,
    cameraButtonIconProps,
    cameraButtonLabelProps,
    filesButtonProps,
    filesButtonSpinnerProps,
    filesButtonIconProps,
    filesButtonLabelProps,
    ...props
}) => {
    const inputPs = { ...props, ...inputProps };
  
    const inputPsForLabel = { required, readOnly, disabled, id };
    const allLabelPs = { label, help, containerProps, labelProps, requiredStarProps, helpProps, ...inputPsForLabel };
    
    const inputRef = useRef(null);

    const emptyPhoto = { url: "", title: "", description: "", capture: false };

    const { states, set } = useStates({
        selectedPhotoIndex: null, // for multiple photos
        isPhotoSelected: false, // for one photo
        // isImageFullScreen: false,
        capture: false,
        localValue: defaultValue ?? (multiple ? [] : emptyPhoto),
        isImageLoading: false
    }) 

    const { selectedPhotoIndex, isPhotoSelected, capture, localValue, isImageLoading } = states;

    const realValue = value ?? localValue

    const isRealValueEmpty = multiple ? isEmpty(realValue) : isEmpty(realValue.url);

    const handlePhotosOnChange = (e) => {
        set("isImageLoading", true);
        setTimeout(() => {
            const file = e.target.files[0];
            const url = URL.createObjectURL(file);
            // if (isNull(selectedPhotoIndex)) {
            const newPhoto = { url: url, title: splitFileExtension(file.name)[0], description: "", capture: capture };
            const newValue = multiple ? [...realValue, newPhoto] : newPhoto;
            if (isNil(value)) {
                set("localValue", newValue);
            } else {
                onValueChange(newValue);
            }
            // set("selectedPhotoIndex", localValue.length);                    
            // } else {
            //     const newPhotos = [...localValue];
            //     newPhotos[selectedPhotoIndex].url = url;
            //     set("localValue", newPhotos);    
            // }
            set("isImageLoading", false);
            return () => URL.revokeObjectURL(url);
        }, 1000);
    };

    const deletePhoto = (e, index) => {
        e.preventDefault();
        e.stopPropagation();
        let newValue;

        if (multiple) {
            newValue = [...realValue.slice(0, index), ...realValue.slice(index + 1)];
        } else {
            newValue = emptyPhoto;
        }

        if (isNil(value)) {
            set("localValue", newValue);
        } else {
            onValueChange(newValue)
        }
    }

    const takePhoto = (e) => {
        e.preventDefault(e);
        set("capture", true);
        setTimeout(() => inputRef.current.click(), 0);
    };

    const importPhoto = (e) => {
        e.preventDefault();
        set("capture", false);
        setTimeout(() => inputRef.current.click(), 0);
    };

    const openPhoto = (e, index) => {
        e.preventDefault();
        if (multiple) {
            set("selectedPhotoIndex", index);
        } else {
            set("isPhotoSelected", true);
        }
    };

    const onInfoChange = (prop, newProp) => {
        let newValue;

        if (multiple) {
            newValue = [...realValue];
            newValue[selectedPhotoIndex][prop] = newProp;
        } else {
            newValue = { ...realValue, [prop]: newProp };
        }

        if (isNil(value)) {
            set("localValue", newValue);
        } else {
            onValueChange(newValue)
        }
    };

    const Photo = (photo, index) => {
        return (
            <>
                <li 
                    { ...listItemProps}
                    onClick={e => openPhoto(e, index)}
                    className={twMerge(`first:rounded-t-md gap-4 p-2 row-v-center active:brightness-soft duration-100 bg-strong`, listItemProps?.className)}
                >
                    <input
                        { ...urlInputProps}
                        name={name}
                        onChange={() => {}}
                        value={photo.url}
                        className={twMerge(`hidden`, urlInputProps?.className)}
                    />
                    <input
                        { ...originInputProps}
                        name={name}
                        onChange={() => {}}
                        value={photo.capture}
                        className={twMerge(`hidden`, originInputProps?.className)}
                    />
                    {photo.capture
                        ?   <FaCamera
                                { ...iconProps} 
                                className={twMerge(` text-primary text-xl shrink-0`, iconProps?.className)}
                            />
                        :   <FaFileImage
                                { ...iconProps} 
                                className={twMerge(` text-secondary text-xl shrink-0`, iconProps?.className)}
                            />
                    }
                    <div 
                        { ...titleProps}
                        className={twMerge(`truncate grow`, titleProps?.className)}
                    >
                        {isEmpty(photo.title) ? "Sans titre" : photo.title}
                    </div>
                    <Button
                        left={<RiCloseLargeFill { ...deleteButtonIconProps} />}
                        { ...deleteButtonProps}
                        onClick={e => deletePhoto(e, index)}
                        className={twMerge(`rounded-full bg-strong text-soft-text`, deleteButtonProps?.className)}
                    />
                </li>
                {/* <Panel
                    isOpen={multiple ? selectedPhotoIndex == index : isPhotoSelected}
                    closePanel={() => multiple ? set("selectedPhotoIndex", null) : set("isPhotoSelected", false)}
                    position={`bottom`}
                >
                    <img 
                        { ...imageProps}
                        src={photo.url} 
                        // onClick={() => set("isImageFullScreen", !isImageFullScreen)}
                        className={twMerge(`max-h-full border border-soft-border`, imageProps?.className)}
                    />
                    <Input
                        label={`Titre`}
                        { ...titleInputProps}
                        name={name}
                        value={photo.title}
                        onValueChange={newTitle => onInfoChange("title", newTitle)}
                    />
                    <Textarea
                        label={`Description`}
                        { ...descriptionInputProps}
                        name={name}
                        value={photo.description}
                        onValueChange={newDescription => onInfoChange("description", newDescription)}
                    />
                </Panel> */}
            </>
        );
    }

    return (
        <Label { ...allLabelPs}>
            <input
                accept={`image/*`} // let the dev choose an image type
                { ...inputPs}
                name={null}
                ref={inputRef}
                type={`file`}
                capture={capture}
                onChange={handlePhotosOnChange}
                className={twMerge(`hidden`, inputPs?.className)}
            />
            <div 
                { ...listAndButtonsContainerProps}
                className={twMerge(`rounded-md bg-strong col`, listAndButtonsContainerProps?.className)}
            >
                <ul 
                    { ...listProps}
                    className={twMerge(`divide-y col rounded-t-md divide-soft-border ${!isRealValueEmpty && "border border-b-0 border-soft-border"}`, listProps?.className)}
                >
                    {
                        multiple 
                            ?   !isEmpty(realValue) && realValue.map((photo, PI) => Photo(photo, PI)
                                    // <Photo key={`photo${PI}`} photo={photo} index={PI} />
                                )
                            :   !isEmpty(realValue.url) && Photo(realValue)
                        
                    }
                </ul>
                <div
                    { ...buttonContainerProps}
                    className={twMerge(`row-v-center rounded-b-md ${isRealValueEmpty ? "rounded-t-md" :  "rounded-t-none"}`, buttonContainerProps?.className)}
                >
                    <Button
                        { ...cameraButtonProps}
                        onClick={takePhoto}
                        disabled={isImageLoading}
                        className={twMerge(`flex-1 p-2 gap-1 rounded-none rounded-bl-md col-h-center ${isRealValueEmpty ? "rounded-tl-md" :  "rounded-tl-none"}`, cameraButtonProps?.className)}
                    >
                        {(isImageLoading && capture)
                            ? <Spinner 
                                { ...cameraButtonSpinnerProps}
                                className={twMerge(`border-white/50 border-l-white`, cameraButtonSpinnerProps?.className)}
                                />
                            : <FaCamera
                                { ...cameraButtonIconProps}
                                className={twMerge(`text-3xl`, cameraButtonIconProps?.className)}
                                />
                        }
                        <div
                            { ...cameraButtonLabelProps}
                            className={twMerge(`italic font-semibold`, cameraButtonLabelProps?.className)}
                        >
                            Caméra
                        </div>
                    </Button>
                    <Button 
                        { ...filesButtonProps}
                        onClick={importPhoto}
                        disabled={isImageLoading}
                        className={twMerge(`flex-1 p-2 gap-1 rounded-none rounded-br-md bg-secondary col-h-center ${isRealValueEmpty ? "rounded-tr-md" :  "rounded-tr-none"}`, filesButtonProps?.className)}
                    >
                        {(isImageLoading && !capture) 
                            ? <Spinner 
                                { ...filesButtonSpinnerProps}
                                className={twMerge(`border-white/50 border-l-white`, filesButtonSpinnerProps?.className)}
                                />
                            : <FaFileImage
                                { ...filesButtonIconProps}
                                className={twMerge(`text-3xl`, filesButtonIconProps?.className)}
                                />
                        }
                        <div
                            { ...filesButtonLabelProps}
                            className={twMerge(`italic font-semibold`, filesButtonLabelProps?.className)}
                        >
                            Fichiers
                        </div>
                    </Button>
                </div>     
            </div>
        </Label>
    );
};

Photos.propTypes = propTypes;