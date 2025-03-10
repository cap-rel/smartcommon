import { twMerge } from "tailwind-merge";
import { propTypes } from "./props";

export const Spinner = ({
  borderWidth = 4,
  size = 30,
  spinnerProps,
  ...props
}) => {
  const SpinnerPs = { ...props, ...spinnerProps };
  return (
  //   <>
  //       {type === "dots" ? (
  //         <div className="flex gap-2 p-2">
  //           <div
  //             className={`bg-primary rounded-full animate-bounce [animation-delay:-0.3s]`}
  //             style={{ width: `${4 * finalSize}px`, height: `${4 * finalSize}px` }}
  //           ></div>
  //           <div
  //             className={`bg-secondary rounded-full animate-bounce [animation-delay:-0.15s]`}
  //             style={{ width: `${4 * finalSize}px`, height: `${4 * finalSize}px` }}
  //           ></div>
  //           <div
  //             className={`rounded-full animate-bounce bg-primary`}
  //             style={{ width: `${4 * finalSize}px`, height: `${4 * finalSize}px` }}
  //           ></div>
  //         </div>
  //       ) : type === "pulse" ? (
  //         <div className="inline-flex relative p-2">
  //           <div
  //             className={`absolute top-0 left-0 rounded-full animate-ping bg-primary dark:bg-primary`}
  //             style={{ width: `${4 * finalSize}px`, height: `${4 * finalSize}px` }}
  //           ></div>
  //           <div
  //             className={`absolute top-0 left-0 rounded-full animate-pulse bg-primary dark:bg-primary`}
  //             style={{ width: `${4 * finalSize}px`, height: `${4 * finalSize}px` }}
  //           ></div>
  //         </div>
  //       ) : type === "ping" ? (
  //         <div
  //           className={`p-2 rounded-full animate-ping bg-primary dark:bg-primary`}
  //           style={{ width: `${4 * finalSize}px`, height: `${4 * finalSize}px` }}
  //         ></div>
  //       ) : type === "windmill" ? (
  //      <></>
  //       ) : (
  //         <div
  //           className={`p-2 rounded-full animate-spin border-light-border dark:border-dark-border // border-t-primary border-r-primary border-b-primary // dark:border-t-primary dark:border-r-primary dark:border-b-primary`}
  //           style={{ padding: `${4 * finalSize}px`, borderWidth: `${4}px` }}
  //         />
  //       )}

  //     {/* <div class="fixed-center h-6 w-6 animate-spin rounded-full border-2 border-current border-[#6b7280] border-e-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div> */}
  //   </>
        <div
          { ...SpinnerPs}
          style={{ 
            // "--border-width": `${borderWidth}px`,
            "--size": `${size}px`,
            borderWidth: `${borderWidth}px`,
            ...SpinnerPs?.style
          }}
          className={twMerge(`rounded-full animate-spin size-(--size) border-primary border-l-soft-border`, SpinnerPs?.className)}
        />
  );

};

Spinner.propTypes = propTypes;