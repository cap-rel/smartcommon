import { useEffect, useMemo, useState } from "react";
import { isEmpty } from "../../globals/functions";

export const useAnimation = (initialValues) => {
  const [animations, setAnimations] = useState(initialValues);
  const [start, setStart] = useState(false);

  useEffect(() => {
    setAnimations((prevState) => {
      const newState = { ...prevState };
      let hasChanged = false;
      
      Object.keys(newState).forEach((key) => {
        console.log(animations[key]);
        if (!isEmpty(newState[key].state) && !newState[key].value) {
          newState[key].value = true;
          hasChanged = true;
        }
      });
      
      return hasChanged ? newState : prevState;
    });
  }, Object.values(animations).map(animation => animation.state));

  // console.log(Object.values(animations).map(animation => animation.state));

  useEffect(() => setStart(true), []);

  // const setAnimations = set;
  // const animations = values;

  return { start, animations, setAnimations };
};