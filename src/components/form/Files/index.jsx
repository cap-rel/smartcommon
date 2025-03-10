import { useRef } from "react";
import { Input, Label, Textarea } from "../../form"
import { Button, Panel, Spinner } from "../../others";
import { isEmpty, isNil, splitFileExtension } from "../../../globals/functions";
import { useStates } from "../../../hooks";
import { propTypes } from "./props";
import { FaFile } from "react-icons/fa6";
import { twMerge } from "tailwind-merge";
import { RiCloseLargeFill } from "react-icons/ri";

// TODO Add retake or reimport system

// IDEA Add GpsPoints and Address

export const Files = ({
    label,
    labelRow = false,
    help,
    multiple = false,
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
    typeInputProps,
    iconProps,
    titleProps,
    typeProps,
    deleteButtonProps,
    deleteButtonIconProps,
    panelProps,
    fileProps,
    titleInputProps,
    descriptionInputProps,
    buttonProps,
    buttonSpinnerProps,
    buttonIconProps,
    buttonLabelProps,
    ...props
}) => {
    const inputPs = { ...props, ...inputProps };

    const { required, readOnly, disabled, id, defaultValue, value, name } = inputPs;
  
    const inputPsForLabel = { required, readOnly, disabled, id };
    const allLabelPs = { label, labelRow, help, containerProps, labelProps, requiredStarProps, helpProps, ...inputPsForLabel };
    
    const inputRef = useRef(null);

    const emptyFile = { url: "", type: "", title: "", description: "" };

    const { states, set } = useStates({
        selectedFileId: null, // for multiple files
        isFileSelected: false, // for one file
        localValue: defaultValue ?? (multiple ? [] : emptyFile),
        isFileLoading: false
    }) 

    const { selectedFileId, isFileSelected, localValue, isFileLoading } = states;

    const realValue = value ?? localValue

    const isRealValueEmpty = multiple ? isEmpty(realValue) : isEmpty(realValue.url);

    const handleFilesOnChange = (e) => {
        set("isFileLoading", true);
        setTimeout(() => {
            const file = e.target.files[0];
            const url = URL.createObjectURL(file);
            // if (isNull(selectedFileId)) {
            const newFile = { url: url, title: splitFileExtension(file.name)[0], description: "", type: file.type };
            const newValue = multiple ? [...realValue, newFile] : newFile;
            if (isNil(value)) {
                set("localValue", newValue);
            } else {
                onValueChange(newValue);
            }
            // set("selectedFileId", localValue.length);                    
            // } else {
            //     const newFiles = [...localValue];
            //     newFiles[selectedFileId].url = url;
            //     set("localValue", newFiles);    
            // }
            set("isFileLoading", false);
            return () => URL.revokeObjectURL(url);
        }, 1000);
    };

    const deleteFile = (e, index) => {
        e.preventDefault();
        e.stopPropagation();
        let newValue;

        if (multiple) {
            newValue = [...realValue.slice(0, index), ...realValue.slice(index + 1)];
        } else {
            newValue = emptyFile;
        }

        if (isNil(value)) {
            set("localValue", newValue);
        } else {
            onValueChange(newValue)
        }
    }

    const importFile = (e) => {
        e.preventDefault();
        inputRef.current.click();
    };

    const openFile = (e, index) => {
        e.preventDefault();
        if (multiple) {
            set("selectedFileId", index);
        } else {
            set("isFileSelected", true);
        }
    };

    const onInfoChange = (prop, newProp) => {
        let newValue;

        if (multiple) {
            newValue = [...realValue];
            newValue[selectedFileId][prop] = newProp;
        } else {
            newValue = { ...realValue, [prop]: newProp };
        }

        if (isNil(value)) {
            set("localValue", newValue);
        } else {
            onValueChange(newValue)
        }
    };

    const File = (file, index) => {
        return (
            <>
                <li 
                    { ...listItemProps}
                    onClick={e => openFile(e, index)}
                    className={twMerge(`first:rounded-t-md gap-4 p-2 row-v-center active:brightness-soft duration-100 bg-strong`, listItemProps?.className)}
                >
                    <input
                        { ...urlInputProps}
                        name={name}
                        onChange={() => {}}
                        value={file.url}
                        className={twMerge(`hidden`, urlInputProps?.className)}
                    />
                    <FaFile 
                        { ...iconProps} 
                        className={twMerge(`text-xl text-primary shrink-0`, iconProps?.className)}
                    />
                    <div 
                        { ...titleProps}
                        className={twMerge(`truncate grow`, titleProps?.className)}
                    >
                        {isEmpty(file.title) ? "Sans titre" : file.title}
                    </div>
                    <Button
                        left={<RiCloseLargeFill { ...deleteButtonIconProps} />}
                        { ...deleteButtonProps}
                        onClick={e => deleteFile(e, index)}
                        className={twMerge(`rounded-full bg-strong text-soft-text`, deleteButtonProps?.className)}
                    />
                </li>
                <Panel
                    isOpen={multiple ? selectedFileId == index : isFileSelected}
                    closePanel={() => multiple ? set("selectedFileId", null) : set("isFileSelected", false)}
                    position={`bottom`}
                >
                    <Input
                        label={`Type`}
                        left={<FaFile />}
                        { ...typeInputProps}
                        disabled
                        name={name}
                        defaultValue={file.type}
                    />
                    <Input
                        label={`Titre`}
                        { ...titleInputProps}
                        name={name}
                        value={file.title}
                        onValueChange={newTitle => onInfoChange("title", newTitle)}
                    />
                    <Textarea
                        label={`Description`}
                        { ...descriptionInputProps}
                        name={name}
                        value={file.description}
                        onValueChange={newDescription => onInfoChange("description", newDescription)}
                    />
                </Panel>
            </>
        );
    }

    return (
        <Label { ...allLabelPs}>
            <input
                { ...inputPs}
                name={null}
                ref={inputRef}
                type={`file`}
                onChange={handleFilesOnChange}
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
                            ?   !isEmpty(realValue) && realValue.map((file, FI) => File(file, FI))
                            :   !isEmpty(realValue.url) && File(realValue)
                        
                    }
                </ul>
                <Button 
                    { ...buttonProps}
                    onClick={importFile}
                    disabled={isFileLoading}
                    className={twMerge(`w-full p-2 gap-1 rounded-none rounded-b-md bg-primary col-h-center ${isRealValueEmpty ? "rounded-t-md" :  "rounded-t-none"}`, buttonProps?.className)}
                >
                    {isFileLoading
                        ? <Spinner 
                            { ...buttonSpinnerProps}
                            className={twMerge(`border-white/50 border-l-white`, buttonSpinnerProps?.className)}
                            />
                        : <FaFile
                            { ...buttonIconProps}
                            className={twMerge(`text-3xl`, buttonIconProps?.className)}
                            />
                    }
                    <div
                        { ...buttonLabelProps}
                        className={twMerge(`italic font-semibold`, buttonLabelProps?.className)}
                    >
                        Importer Fichiers
                    </div>
                </Button>
            </div>
        </Label>
    );
};

Files.propTypes = propTypes;