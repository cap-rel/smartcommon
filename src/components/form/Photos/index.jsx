import { useEffect, useRef } from "react";
import { Input, Label, Textarea } from "../../form"
import { Button, Icon } from "../../others";
import { isEmpty, isNull, removeFileExtension, secondsToTime } from "../../../globals/functions";
import { useNavigator, useStates } from "../../../hooks";
import { propTypes } from "./props";

// TODO Change trash icon into FontAwesome icon
// TODO Add GpsPoints and Address
// TODO Put all inputs in map for name data getting

export const Photos = ({
    label,
    labelRow = false,
    help,
    onPost,
    provideTitle = true,
    provideDescription = true,
    provideGspPoints = false,
    provideAddress = false,

    containerProps,
    labelContainerProps,
    labelProps,
    requiredStarProps,
    helpProps,
    photosContainerProps,
    inputProps,
    ...props
}) => {
    const inputPs = { ...props, ...inputProps };

    const { required, readOnly, disabled, id, defaultValue, value, name } = inputPs;
  
    const inputPsForLabel = { required, readOnly, disabled, id };
    const allLabelPs = { label, labelRow, help, containerProps, labelProps, requiredStarProps, helpProps, ...inputPsForLabel };
    
    const { deviceType } = useNavigator();

    const inputRef = useRef(null);

    const { states, set } = useStates({
        selectedPhotoIndex: null,
        isImageFullScreen: false,
        capture: false,
        photos: value ?? defaultValue ?? []
    }) 

    const { selectedPhotoIndex, isImageFullScreen, capture, photos } = states;

    const selectedPhoto = photos[selectedPhotoIndex];

    useEffect(() => onPost && onPost(photos), [photos]);

    const handlePhotosOnChange = (e) => {
        const file = e.target.files[0];
        const url = URL.createObjectURL(file);
        if (isNull(selectedPhotoIndex)) {
            set("photos", [...photos, { file: file, url: url, title: "", description: "" }]);
            set("selectedPhotoIndex", photos.length);                    
        } else {
            const newPhotos = [...photos];
            newPhotos[selectedPhotoIndex].url = url;
            set("photos", newPhotos);    
        }
        return () => URL.revokeObjectURL(url);
    };

    const handlePhotoOnClick = (capture) => {
        set("capture", capture);
        setTimeout(() => inputRef.current.click(), 0);
    }

    return (
        <Label { ...allLabelPs}>
            <input
                ref={inputRef}
                type={`file`}
                accept={`image/*`}
                capture={capture}
                onChange={handlePhotosOnChange}
                { ...inputPs}
                className={`hidden`}
            />
            <div className={`w-full rounded-md border border-smt col max-w-120`}>
                <div className={`p-2 row-between-center bg-soft-smt`}>
                    <div className={`gap-2 row-v-center`}>
                        <Button
                            leftIcon={{ library: "fa6", name: "FaCamera" }}
                            onClick={() => handlePhotoOnClick(true)}
                            className={`p-2 text-2xl rounded-full bg-soft-smt button-smt`}
                        />
                        <Button 
                            leftIcon={{ library: "fa6", name: "FaFileImport" }}
                            onClick={() => handlePhotoOnClick(false)}
                            className={`p-2 text-2xl rounded-full bg-soft-smt button-smt`}
                        />
                    </div>
                    <Button
                        leftIcon={{ library: "io5", name: "IoTrash" }}
                        onClick={() => set("photos", [])}
                        className={`p-2 text-2xl rounded-full bg-soft-smt text-error button-smt`}
                    />
                </div>
                {!isEmpty(photos) 
                    ?   <table className={`text-smt`}>
                            <tbody>
                                {photos.map((record, RI) => 
                                    <tr key={"photo_" + RI}>
                                        <td className={`p-2`}>
                                            <Icon 
                                                library={`fa6`}
                                                name={`FaEye`}
                                                onClick={() => set("selectedPhotoIndex", RI)}
                                                className={`p-2 text-2xl rounded-full button-smt bg-smt`}
                                            />
                                        </td>
                                        <td className={`p-2 truncate text-soft-smt max-w-40`}>
                                            <div>{record.title}</div>
                                        </td>
                                        <td className={`p-2 text-right`}>
                                            <Icon 
                                                library={`io5`}
                                                name={`IoTrash`}
                                                onClick={() => set("photos", [...photos.slice(0, RI), ...photos.slice(RI + 1)])}
                                                className={`p-2 text-2xl rounded-full button-smt bg-smt text-error`}
                                            />
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    :   <div className={`gap-2 p-4 col-h-center text-soft-smt`}>
                            <Icon 
                                library={`fa6`}
                                name={`FaFileImage`}
                                className={`text-4xl`}
                            />
                            <div className={`italic`}>Aucune photo</div>
                        </div>
                }
                <div className={`${!isNull(selectedPhotoIndex)  ? "translate-y-0" : "translate-y-full"} ${deviceType !== "desktop" && "w-full"} ${isImageFullScreen && "top-0"} fixed-h-center bottom-0 z-60 duration-300 max-h-full col gap-4 overflow-y-auto bg-smt rounded-t-md`}>
                    <div className={`sticky top-0 z-30 p-2 border-b border-smt bg-soft-smt`}>
                        <div className={`gap-2 row-full-center`}>
                            <Button
                                leftIcon={{ library: "fa6", name: "FaCamera" }}
                                onClick={() => handlePhotoOnClick(true)}
                                className={`p-2 text-2xl rounded-full bg-soft-smt button-smt`}
                            />
                            <Button 
                                leftIcon={{ library: "fa6", name: "FaFileImport" }}
                                onClick={() => handlePhotoOnClick(false)}
                                className={`p-2 text-2xl rounded-full bg-soft-smt button-smt`}
                            />
                            <Icon 
                                library={`io5`}
                                name={`IoTrash`}
                                onClick={() => {
                                    set("photos", [...photos.slice(0, selectedPhotoIndex), ...photos.slice(selectedPhotoIndex + 1)])
                                    set("selectedPhotoIndex", null);
                                }}
                                className={`p-2 text-2xl rounded-full bg-soft-smt text-error button-smt`}
                            />
                        </div>
                        <Icon 
                            library={`io5`}
                            name={`IoClose`}
                            onClick={() => {
                                const newPhotos = [...photos];
                                if (isEmpty(newPhotos[selectedPhotoIndex].title)) {
                                    newPhotos[selectedPhotoIndex].title = `Photo ${selectedPhotoIndex + 1}`;
                                    set("photos", newPhotos);
                                }
                                set("selectedPhotoIndex", null);
                            }}
                            className={`absolute top-2 right-2 p-2 text-2xl rounded-full button-smt bg-soft-smt`}
                        />
                    </div>
                        
                    <div className={`gap-4 p-6 col`}>
                        <div 
                            className={`${isImageFullScreen ? "fixed inset-0 z-40 bg-smt row-full-center" : "relative"}`}
                        >
                            <img src={selectedPhoto?.url} className={`max-h-full`}/>
                            <Icon 
                                library={`fa`}
                                name={isImageFullScreen ? "FaCompressArrowsAlt" : "FaExpandArrowsAlt"}
                                onClick={() => set("isImageFullScreen", !isImageFullScreen)}
                                className={`p-2 rounded-full text-2xl button-smt absolute top-2 right-2 z-20 ${isImageFullScreen ? "bg-smt" : "bg-light-20 dark:bg-dark-20"}`}
                            />
                        </div>
                        <Input
                            name={`${name}[${photos.length}][title]`}
                            placeholder={`Titre de la photo...`}
                            photos={selectedPhoto?.title}
                            onChange={newState => {
                                const newPhotos = [...photos];
                                newPhotos[selectedPhotoIndex].title = newState;
                                set("photos", newPhotos);
                            }}
                            className={`mx-2 rounded-md bg-smt`}
                        />
                        <Textarea
                            name={`${name}[${photos.length}][descriptionb]`}
                            placeholder={`Description de la photo...`}
                            photos={selectedPhoto?.description}
                            onChange={newState => {
                                const newPhotos = [...photos];
                                newPhotos[selectedPhotoIndex].description = newState;
                                set("photos", newPhotos);
                            }}
                            className={`mx-2 rounded-md bg-smt`}
                        />
                    </div>
                </div>
            </div>
        </Label>
    );
};

Photos.propTypes = propTypes;