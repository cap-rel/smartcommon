import { useEffect, useMemo, useState } from "react";
import { isEmpty, mapValues } from "lodash";

export const useAnimation = (initialValues) => {
  const [animations, setAnimations] = useState(initialValues);
  const [start, setStart] = useState(false);

  // An animation whose `state` is no longer empty has been triggered, so its
  // `value` flips on and stays on. Derived on read: the previous version wrote
  // this back through an effect, which cost a second render pass, mutated the
  // nested entries in place (the spread above them is shallow) and depended on
  // an array whose length changed with the number of animations - something
  // React explicitly forbids.
  const resolvedAnimations = useMemo(
    () => mapValues(animations, (animation) =>
      !isEmpty(animation.state) && !animation.value
        ? { ...animation, value: true }
        : animation
    ),
    [animations]
  );

  // Deliberate two-pass mount: the first paint must happen with start=false so
  // the CSS transition has an initial state to move away from. There is no way
  // to express "after the first paint" without a post-mount state flip.
  // oxlint-disable-next-line react/set-state-in-effect
  useEffect(() => setStart(true), []);

  return { start, animations: resolvedAnimations, setAnimations };
};
