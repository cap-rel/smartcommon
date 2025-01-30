import { useEffect, useState } from "react";

export const AlertDol = (props) => {
    const isOpened    = props.isOpened;
    const setIsOpened = props.setIsOpened
    const className = props.className;

    const [isNotOpened, setIsNotOpened] = useState(true);

    useEffect(() => {
      if (isOpened) {
        setIsNotOpened(false);
      } else {
        setTimeout(() => {
          setIsNotOpened(true)
        }, 300);
      }
    }, [isOpened])

    return (
        <div 
            className={`
              ${isOpened ? "bg-black-50 dark:bg-white-20" : `bg-black-0`}
              ${isNotOpened ? `w-0 top-0 bottom-0` : `inset-0`}
              duration-300 fixed z-60
            `}
            onClick={() =>   
              Array.isArray(setIsOpened)
                ? setIsOpened[0](prevState => ({ ...prevState, [setIsOpened[1]]: false }))
                : setIsOpened(false)
            }
        >
            <div 
                className={`
                    ${!isOpened && "hidden"}
                    duration-300 absolute-full-center overflow-auto 
                    ${className}
                `}
                onClick={(e) => e.stopPropagation()}
            >
                {props.children}
            </div>
        </div>
    );
};