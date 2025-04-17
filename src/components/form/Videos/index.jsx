import { useRef } from "react";
import { Input, Label, Textarea } from "../../form"
import { Button, Spinner } from "../../others";
import { isEmpty, isNil, splitFileExtension } from "../../../globals/functions";
import { useStates } from "../../../hooks";
import { propTypes } from "./props";
import { FaVideo, FaFileVideo } from "react-icons/fa6";
import { twMerge } from "tailwind-merge";
import { RiCloseLargeFill } from "react-icons/ri";

// TODO Add retake or reimport system

// IDEA Add GpsPoints and Address

export const Videos = ({
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
    videoProps,
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

    const { required, readOnly, disabled, id, defaultValue, value, name } = inputPs;
  
    const inputPsForLabel = { required, readOnly, disabled, id };
    const allLabelPs = { label, labelRow, help, containerProps, labelProps, requiredStarProps, helpProps, ...inputPsForLabel };
    
    const inputRef = useRef(null);

    const emptyVideo = { url: "", title: "", description: "", capture: false };

    const { states, set } = useStates({
        selectedVideoId: null, // for multiple videos
        isVideoSelected: false, // for one video
        capture: false,
        localValue: defaultValue ?? (multiple ? [] : emptyVideo),
        isVideoLoading: false
    }) 

    const { selectedVideoId, isVideoSelected, capture, localValue, isVideoLoading } = states;

    const realValue = value ?? localValue

    const isRealValueEmpty = multiple ? isEmpty(realValue) : isEmpty(realValue.url);

    const videoRefs = useRef(multiple ? [] : null);

    const handleVideosOnChange = (e) => {
        set("isVideoLoading", true);
        setTimeout(() => {
            const file = e.target.files[0];
            const url = URL.createObjectURL(file);
            // if (isNull(selectedVideoId)) {
            const newVideo = { url: url, title: splitFileExtension(file.name)[0], description: "", capture: capture };
            const newValue = multiple ? [...realValue, newVideo] : newVideo;
            if (isNil(value)) {
                set("localValue", newValue);
            } else {
                onValueChange(newValue);
            }
            // set("selectedVideoId", localValue.length);                    
            // } else {
            //     const newVideos = [...localValue];
            //     newVideos[selectedVideoId].url = url;
            //     set("localValue", newVideos);    
            // }
            set("isVideoLoading", false);
            return () => URL.revokeObjectURL(url);
        }, 1000);
    };

    const deleteVideo = (e, index) => {
        e.preventDefault();
        e.stopPropagation();
        let newValue;

        if (multiple) {
            newValue = [...realValue.slice(0, index), ...realValue.slice(index + 1)];
        } else {
            newValue = emptyVideo;
        }

        if (isNil(value)) {
            set("localValue", newValue);
        } else {
            onValueChange(newValue)
        }
    }

    const recordVideo = (e) => {
        e.preventDefault(e);
        set("capture", true);
        setTimeout(() => inputRef.current.click(), 0);
    };

    const importVideo = (e) => {
        e.preventDefault();
        set("capture", false);
        setTimeout(() => inputRef.current.click(), 0);
    };

    const openVideo = (e, index) => {
        e.preventDefault();
        if (multiple) {
            set("selectedVideoId", index);
        } else {
            set("isVideoSelected", true);
        }
    };

    const onInfoChange = (prop, newProp) => {
        let newValue;

        if (multiple) {
            newValue = [...realValue];
            newValue[selectedVideoId][prop] = newProp;
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
            videoRefs.current[index].pause();
            videoRefs.current[index].currentTime = 0;
            set("selectedVideoId", null);
        } else {
            videoRefs.current.pause();
            videoRefs.current.currentTime = 0;
            set("isVideoSelected", false);
        }
    }

    const Video = (video, index) => {
        return (
            <>
                <li 
                    { ...listItemProps}
                    onClick={e => openVideo(e, index)}
                    className={twMerge(`first:rounded-t-md gap-4 p-2 row-v-center active:brightness-soft duration-100 bg-strong`, listItemProps?.className)}
                >
                    <input
                        { ...urlInputProps}
                        name={name}
                        onChange={() => {}}
                        value={video.url}
                        className={twMerge(`hidden`, urlInputProps?.className)}
                    />
                    <input
                        { ...originInputProps}
                        name={name}
                        onChange={() => {}}
                        value={video.capture}
                        className={twMerge(`hidden`, originInputProps?.className)}
                    />
                    {video.capture
                        ?   <FaVideo
                                { ...iconProps} 
                                className={twMerge(` text-primary text-xl shrink-0`, iconProps?.className)}
                            />
                        :   <FaFileVideo
                                { ...iconProps} 
                                className={twMerge(` text-secondary text-xl shrink-0`, iconProps?.className)}
                            />
                    }
                    <div 
                        { ...titleProps}
                        className={twMerge(`truncate grow`, titleProps?.className)}
                    >
                        {isEmpty(video.title) ? "Sans titre" : video.title}
                    </div>
                    <Button
                        left={<RiCloseLargeFill { ...deleteButtonIconProps} />}
                        { ...deleteButtonProps}
                        onClick={e => deleteVideo(e, index)}
                        className={twMerge(`rounded-full bg-strong text-soft-text`, deleteButtonProps?.className)}
                    />
                </li>
                {/* <Panel
                    isOpen={multiple ? selectedVideoId == index : isVideoSelected}
                    closePanel={() => closePanel(index)}
                    position={`bottom`}
                >
                    <video
                        { ...videoProps}
                        ref={el => multiple ? (videoRefs.current[index] = el) : (videoRefs.current = el)}
                        src={video.url}
                        controls={true}
                        // onLoadedMetadata={(e) => {
                        //     const newValue = [...value];
                        //     newValue[selectedVideoId] = { ...newValue[selectedVideoId], duration: e.target.duration };
                        //     onChange(newValue);
                        // }} 
                        className={`w-full`}
                    ></video>
                    <Input
                        label={`Titre`}
                        { ...titleInputProps}
                        name={name}
                        value={video.title}
                        onValueChange={newTitle => onInfoChange("title", newTitle)}
                    />
                    <Textarea
                        label={`Description`}
                        { ...descriptionInputProps}
                        name={name}
                        value={video.description}
                        onValueChange={newDescription => onInfoChange("description", newDescription)}
                    />
                </Panel> */}
            </>
        );
    }

    return (
        <Label { ...allLabelPs}>
            <input
                accept={`video/*`} // let the dev choose an image type
                { ...inputPs}
                name={null}
                ref={inputRef}
                type={`file`}
                capture={capture}
                onChange={handleVideosOnChange}
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
                            ?   !isEmpty(realValue) && realValue.map((audio, PI) => Video(audio, PI))
                            :   !isEmpty(realValue.url) && Video(realValue)
                        
                    }
                </ul>
                <div
                    { ...buttonContainerProps}
                    className={twMerge(`row-v-center rounded-b-md ${isRealValueEmpty ? "rounded-t-md" :  "rounded-t-none"}`, buttonContainerProps?.className)}
                >
                    <Button
                        { ...cameraButtonProps}
                        onClick={recordVideo}
                        disabled={isVideoLoading}
                        className={twMerge(`flex-1 p-2 gap-1 rounded-none rounded-bl-md col-h-center ${isRealValueEmpty ? "rounded-tl-md" :  "rounded-tl-none"}`, cameraButtonProps?.className)}
                    >
                        {(isVideoLoading && capture)
                            ? <Spinner 
                                { ...cameraButtonSpinnerProps}
                                className={twMerge(`border-white/50 border-l-white`, cameraButtonSpinnerProps?.className)}
                                />
                            : <FaVideo
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
                        onClick={importVideo}
                        disabled={isVideoLoading}
                        className={twMerge(`flex-1 p-2 gap-1 rounded-none rounded-br-md bg-secondary col-h-center ${isRealValueEmpty ? "rounded-tr-md" :  "rounded-tr-none"}`, filesButtonProps?.className)}
                    >
                        {(isVideoLoading && !capture) 
                            ? <Spinner 
                                { ...filesButtonSpinnerProps}
                                className={twMerge(`border-white/50 border-l-white`, filesButtonSpinnerProps?.className)}
                                />
                            : <FaFileVideo
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

Videos.propTypes = propTypes;