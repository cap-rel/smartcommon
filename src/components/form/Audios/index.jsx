import { useRef } from "react";
import { Input, Label, Textarea } from "../../form"
import { Button, Spinner } from "../../others";
import { isEmpty, isNil, splitFileExtension } from "../../../globals/functions";
import { useStates } from "../../../hooks";
import { propTypes } from "./props";
import { FaFileAudio, FaMicrophoneLines } from "react-icons/fa6";
import { twMerge } from "tailwind-merge";
import { RiCloseLargeFill } from "react-icons/ri";

// TODO Add retake or reimport system

// IDEA Add GpsPoints and Address

export const Audios = ({
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
    originInputProps,
    iconProps,
    titleProps,
    deleteButtonProps,
    deleteButtonIconProps,
    panelProps,
    audioProps,
    titleInputProps,
    descriptionInputProps,
    buttonContainerProps,
    microphoneButtonProps,
    microphoneButtonSpinnerProps,
    microphoneButtonIconProps,
    microphoneButtonLabelProps,
    filesButtonProps,
    filesButtonSpinnerProps,
    filesButtonIconProps,
    filesButtonLabelProps,
    ...props
}) => {
    const inputPs = { ...props, ...inputProps };

    const { required, readOnly, disabled, id, defaultValue, value, name } = inputPs;
  
    const inputPsForLabel = { required, readOnly, disabled, id };
    const allLabelPs = { label, labelRow, help, containerProps, labelProps, requiredStarProps, helpProps, ...inputPsForLabel };
    
    const inputRef = useRef(null);

    const emptyAudio = { url: "", title: "", description: "", capture: false };

    const { states, set } = useStates({
        selectedAudioIndex: null, // for multiple audios
        isAudioSelected: false, // for one audio
        capture: false,
        localValue: defaultValue ?? (multiple ? [] : emptyAudio),
        isAudioLoading: false
    }) 

    const { selectedAudioIndex, isAudioSelected, capture, localValue, isAudioLoading } = states;

    const realValue = value ?? localValue

    const isRealValueEmpty = multiple ? isEmpty(realValue) : isEmpty(realValue.url);

    const audioRefs = useRef(multiple ? [] : null)

    const handleAudiosOnChange = (e) => {
        set("isAudioLoading", true);
        setTimeout(() => {
            const file = e.target.files[0];
            const url = URL.createObjectURL(file);
            // if (isNull(selectedAudioIndex)) {
            const newAudio = { url: url, title: splitFileExtension(file.name)[0], description: "", capture: capture };
            const newValue = multiple ? [...realValue, newAudio] : newAudio;
            if (isNil(value)) {
                set("localValue", newValue);
            } else {
                onValueChange(newValue);
            }
            // set("selectedAudioIndex", localValue.length);                    
            // } else {
            //     const newAudios = [...localValue];
            //     newAudios[selectedAudioIndex].url = url;
            //     set("localValue", newAudios);    
            // }
            set("isAudioLoading", false);
            return () => URL.revokeObjectURL(url);
        }, 1000);
    };

    const deleteAudio = (e, index) => {
        e.preventDefault();
        e.stopPropagation();
        let newValue;

        if (multiple) {
            newValue = [...realValue.slice(0, index), ...realValue.slice(index + 1)];
        } else {
            newValue = emptyAudio;
        }

        if (isNil(value)) {
            set("localValue", newValue);
        } else {
            onValueChange(newValue)
        }
    }

    const recordAudio = (e) => {
        e.preventDefault(e);
        set("capture", true);
        setTimeout(() => inputRef.current.click(), 0);
    };

    const importAudio = (e) => {
        e.preventDefault();
        set("capture", false);
        setTimeout(() => inputRef.current.click(), 0);
    };

    const openAudio = (e, index) => {
        e.preventDefault();
        if (multiple) {
            set("selectedAudioIndex", index);
        } else {
            set("isAudioSelected", true);
        }
    };

    const onInfoChange = (prop, newProp) => {
        let newValue;

        if (multiple) {
            newValue = [...realValue];
            newValue[selectedAudioIndex][prop] = newProp;
        } else {
            newValue = { ...realValue, [prop]: newProp };
        }

        if (isNil(value)) {
            set("localValue", newValue);
        } else {
            onValueChange(newValue)
        }
    };

    const closePanel = (index) => {
        if (multiple) {
            audioRefs.current[index].pause();
            audioRefs.current[index].currentTime = 0;
            set("selectedAudioIndex", null);
        } else {
            audioRefs.current.pause();
            audioRefs.current.currentTime = 0;
            set("isAudioSelected", false);
        }
    }

    const Audio = (audio, index) => {
        return (
            <>
                <li 
                    { ...listItemProps}
                    onClick={e => openAudio(e, index)}
                    className={twMerge(`first:rounded-t-md gap-4 p-2 row-v-center active:brightness-soft duration-100 bg-strong`, listItemProps?.className)}
                >
                    <input
                        { ...urlInputProps}
                        name={name}
                        onChange={() => {}}
                        value={audio.url}
                        className={twMerge(`hidden`, urlInputProps?.className)}
                    />
                    <input
                        { ...originInputProps}
                        name={name}
                        onChange={() => {}}
                        value={audio.capture}
                        className={twMerge(`hidden`, originInputProps?.className)}
                    />
                    {audio.capture
                        ?   <FaMicrophoneLines
                                { ...iconProps} 
                                className={twMerge(` text-primary text-xl shrink-0`, iconProps?.className)}
                            />
                        :   <FaFileAudio
                                { ...iconProps} 
                                className={twMerge(` text-secondary text-xl shrink-0`, iconProps?.className)}
                            />
                    }
                    <div 
                        { ...titleProps}
                        className={twMerge(`truncate grow`, titleProps?.className)}
                    >
                        {isEmpty(audio.title) ? "Sans titre" : audio.title}
                    </div>
                    <Button
                        left={<RiCloseLargeFill { ...deleteButtonIconProps} />}
                        { ...deleteButtonProps}
                        onClick={e => deleteAudio(e, index)}
                        className={twMerge(`rounded-full bg-strong text-soft-text`, deleteButtonProps?.className)}
                    />
                </li>
                {/* <Panel
                    isOpen={multiple ? selectedAudioIndex == index : isAudioSelected}
                    closePanel={() => closePanel(index)}
                    position={`bottom`}
                >
                    <audio
                        { ...audioProps}
                        ref={el => multiple ? (audioRefs.current[index] = el) : (audioRefs.current = el)}
                        src={audio.url}
                        controls={true}
                        // onLoadedMetadata={(e) => {
                        //     const newValue = [...value];
                        //     newValue[selectedAudioIndex] = { ...newValue[selectedAudioIndex], duration: e.target.duration };
                        //     onChange(newValue);
                        // }} 
                        className={`w-full`}
                    ></audio>
                    <Input
                        label={`Titre`}
                        { ...titleInputProps}
                        name={name}
                        value={audio.title}
                        onValueChange={newTitle => onInfoChange("title", newTitle)}
                    />
                    <Textarea
                        label={`Description`}
                        { ...descriptionInputProps}
                        name={name}
                        value={audio.description}
                        onValueChange={newDescription => onInfoChange("description", newDescription)}
                    />
                </Panel> */}
            </>
        );
    }

    return (
        <Label { ...allLabelPs}>
            <input
                accept={`audio/*`} // let the dev choose an image type
                { ...inputPs}
                name={null}
                ref={inputRef}
                type={`file`}
                capture={capture}
                onChange={handleAudiosOnChange}
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
                            ?   !isEmpty(realValue) && realValue.map((audio, PI) => Audio(audio, PI))
                            :   !isEmpty(realValue.url) && Audio(realValue)
                        
                    }
                </ul>
                <div
                    { ...buttonContainerProps}
                    className={twMerge(`row-v-center rounded-b-md ${isRealValueEmpty ? "rounded-t-md" :  "rounded-t-none"}`, buttonContainerProps?.className)}
                >
                    <Button
                        { ...microphoneButtonProps}
                        onClick={recordAudio}
                        disabled={isAudioLoading}
                        className={twMerge(`flex-1 p-2 gap-1 rounded-none rounded-bl-md col-h-center ${isRealValueEmpty ? "rounded-tl-md" :  "rounded-tl-none"}`, microphoneButtonProps?.className)}
                    >
                        {(isAudioLoading && capture)
                            ? <Spinner 
                                { ...microphoneButtonSpinnerProps}
                                className={twMerge(`border-white/50 border-l-white`, microphoneButtonSpinnerProps?.className)}
                                />
                            : <FaMicrophoneLines
                                { ...microphoneButtonIconProps}
                                className={twMerge(`text-3xl`, microphoneButtonIconProps?.className)}
                                />
                        }
                        <div
                            { ...microphoneButtonLabelProps}
                            className={twMerge(`italic font-semibold`, microphoneButtonLabelProps?.className)}
                        >
                            Microphone
                        </div>
                    </Button>
                    <Button 
                        { ...filesButtonProps}
                        onClick={importAudio}
                        disabled={isAudioLoading}
                        className={twMerge(`flex-1 p-2 gap-1 rounded-none rounded-br-md bg-secondary col-h-center ${isRealValueEmpty ? "rounded-tr-md" :  "rounded-tr-none"}`, filesButtonProps?.className)}
                    >
                        {(isAudioLoading && !capture) 
                            ? <Spinner 
                                { ...filesButtonSpinnerProps}
                                className={twMerge(`border-white/50 border-l-white`, filesButtonSpinnerProps?.className)}
                                />
                            : <FaFileAudio
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

Audios.propTypes = propTypes;