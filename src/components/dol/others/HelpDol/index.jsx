import { useEffect, useRef, useState } from "react";
import { isEmpty } from "../../../../globals/functions";
import IconDol from "../IconDol";
import { useWindow } from "../../../hooks";

const HelpDol = (props) => {
    const title   = props.title;
    const content = props.content;
    const className = props.className;

    const [isOpened, setIsOpened] = useState(false);
    const [isClicked, setIsClicked] = useState(false);
    const [position, setPosition] = useState("");

    const iconRef = useRef(null);
    const helpRef = useRef(null);
    const { isDesktop } = useWindow();

    return (
        <IconDol
            library={`io`}
            icon={`IoMdInformationCircleOutline`}
            title={content}
            className={`${className} text-soft-dol`}
        />
    );
  
    // const listenForSettingPosition = () => {
    //     const iconRect = iconRef.current.getBoundingClientRect();
    //     const helpRect = helpRef.current.getBoundingClientRect();
    
    //     const windowWidth = window.innerWidth;
    //     const windowHeight = window.innerHeight;

    //     if (iconRect.top < helpRect.height) {
    //         if (iconRect.left < helpRect.width) {
    //             setPosition("right-0 bottom-0 absolute translate-x-full translate-y-full")
    //         } else if (windowWidth - iconRect.right < helpRect.width) {
    //             setPosition("left-0 bottom-0 absolute -translate-x-full translate-y-full")
    //         } else {
    //             setPosition("absolute-h-center bottom-0 translate-y-full")
    //         }
    //     } else if (windowHeight - iconRect.bottom < helpRect.height) {
    //         if (iconRect.left < helpRect.width) {
    //             setPosition("right-0 top-0 absolute translate-x-full -translate-y-full")
    //         } else if (windowWidth - iconRect.right < helpRect.width) {
    //             setPosition("left-0 top-0 absolute -translate-x-full -translate-y-full")
    //         } else {
    //             setPosition("absolute-h-center top-0 -translate-y-full")
    //         }
    //     } else {
    //         if (iconRect.left < helpRect.width) {
    //             setPosition("absolute-v-center right-0 translate-x-full")
    //         } else if (windowWidth - iconRect.right < helpRect.width) {
    //             setPosition("absolute-v-center left-0 -translate-x-full")
    //         } else {
    //             setPosition("absolute-h-center bottom-0 translate-y-full")
    //         }
    //     }
    // }

    // useEffect(() => {
    //     if (isOpened) {
    //         listenForSettingPosition();

    //         let timeout;
    //         if (isClicked) {
    //             timeout = setTimeout(() => {
    //                 setIsOpened(false);
    //                 setIsClicked(false);
    //             }, 5000);
    //         }
           
    //         window.addEventListener('resize', listenForSettingPosition);
    //         window.addEventListener('scroll', listenForSettingPosition);

    //         return () => {
    //             clearTimeout(timeout);
    //             window.removeEventListener('resize', listenForSettingPosition);
    //             window.removeEventListener('scroll', listenForSettingPosition);
    //         };
    //     }
    // }, [isOpened, isClicked])


    // return (
            {/* ref={iconRef} */}
                // onClick={() => {
                //     setIsClicked(true);
                //     setIsOpened(true);
                // }}
                // onMouseOver={() => {
                //     if (!isClicked) {
                //         setIsOpened(true);
                //     }
                // }}
                // onMouseOut={() => {
                //     if (!isClicked) {
                //         setIsOpened(false);
                //     }
                // }}
                // onFocus
            {/* {!isEmpty(content) &&
                <div 
                    className={`
                        col gap-1 w-48 p-4 pr-10 border bg-white shadow-md dark:border-gray-600 z-10 rounded-md 
                        ${position} ${!isOpened && "hidden"}
                    `}
                    ref={helpRef}
                >
                    {/* <div className={`w-0 h-0 border-y-4 border-y-transparent border-r-8 border-r-white absolute-v-center left-0 -translate-x-full`} /> */}
                    {/* <div className="h-6 w-6">
                        <div className={`w-6 h-6 absolute-v-center left-0 -translate-x-1/2 rotate-45 border-b border-l bg-white z-10`} />
                    </div> */}
                    
                    {/* {!isEmpty(title) && <p className={`text-sm font-bold`}>{title}</p>} */}
                    {/* <p className={`text-sm text-justify text-gray-500`}>{content}</p>
                    <IconDol
                        library="rx"
                        icon="RxCross2"
                        className={`absolute right-2 top-2 text-xl text-gray-400`}
                        onClick={() => {
                            setIsOpened(false);
                            setIsClicked(false);
                        }}
                    />
                </div>
            } */}
    // );
};

export default HelpDol;