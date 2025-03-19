import { twMerge } from "tailwind-merge";
import { propTypes } from "./props";

export const Tabbar = ({
  hideOnScroll,
  tabbarProps,
  ...props
}) => {
  const tabbarPs = { ...props, ...tabbarProps };

  const { children } = tabbarPs;

  return (
    <div 
      { ...tabbarPs}
      className={twMerge(`fixed right-0 bottom-0 left-0 z-10 border-b-2 bg-softest shadow-strongest shadow-xl row-between-center`, tabbarPs?.className)}
    >
      {children}
    </div>
  );
};

Tabbar.propTypes = propTypes;