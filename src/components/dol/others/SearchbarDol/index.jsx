import styled from "styled-components";
import { IconDol } from "../../../dol";
import { useEffect, useRef, useState } from "react";
import { isEmpty } from "../../../../globals/functions";

const BadgeSty = styled.div`
  background-color: ${props => props.primaryColor};
`
const SearchBarDol = (props) => {
  const primaryColor = props.primaryColor;
  const badge        = props.badge;
  const setIsOpened  = props.setIsOpened;
  const isOpened     = props.isOpened;
  const onChange     = props.onChange;
  const placeholder  = props.placeholder;
  const className    = props.className;

  const searchBar = useRef(null);

  const [isNotOpened, setIsNotOpened] = useState(true);

  useEffect(() => {
    if (isOpened) {
      setIsNotOpened(false);
      searchBar.current.focus()
    } else {
      setTimeout(() => {
        setIsNotOpened(true)
      }, 300);
    }
  }, [isOpened]);

  // Pour searchbar ouvrante
  // ${(isOpened) ? "translate-y-0" : "-translate-y-full"}

  return (
    <div 
      className={`
        row-between-center gap-2 bg-white text-lg dark:bg-dark z-30 ${className}
          ${(isOpened) ? "p-2 duration-300 w-full opacity-100" : "w-0 opacity-0"}
          h-16 fixed-h-center top-0 
      `}
    >
      <div className={`${!isOpened && "hidden"} row-v-center gap-2`}>
        <div className="rounded-md rounded-r-none pr-2 border-r-2 border-gray-400 ">
          &#128269;
        </div>
        <input
          className="w-full rounded-l-none bg-transparent focus:outline-none text-black dark:text-white"
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          ref={searchBar}
        />
      </div>
      <div className={`row-v-center gap-2 ${!isOpened && "hidden"}`}>
        {/* {(badge || badge === 0) && 
          <BadgeSty 
            primaryColor={primaryColor}
            className="text-white btn btn-sm btn-circle no-animation border-none"
          >
            {badge}
          </BadgeSty>
        } */}
        <button 
          className="button-dol bg-white text-gray-400 p-2 rounded-full text-3xl"
          onClick={() => {
            if (!isEmpty(searchBar.current.value)) {
              searchBar.current.value = "";
              searchBar.current.focus();
            } else {
              Array.isArray(setIsOpened)
                ? setIsOpened[0](prevState => ({ ...prevState, [setIsOpened[1]]: false }))
                : setIsOpened(false);
            }
          }}
        >
          <IconDol
            library="io5"
            icon="IoCloseSharp"
          /> 
        </button>
      </div>
    </div>
  );
};

export default SearchBarDol;
