import { useSelector } from "react-redux";

/**
 * @param {*} props
 * @param {string} centered (bool) Si true, le spinner est au milieu de la page
 */
const SpinnerDol = (props) => {
  const { type, size } = props;

  const finalSize = size || "8";

  return (
    <>
        {type === "dots" ? (
          <div className="flex gap-2 p-2">
            <div
              className={`bg-primary rounded-full animate-bounce [animation-delay:-0.3s]`}
              style={{ width: `${4 * finalSize}px`, height: `${4 * finalSize}px` }}
            ></div>
            <div
              className={`bg-secondary rounded-full animate-bounce [animation-delay:-0.15s]`}
              style={{ width: `${4 * finalSize}px`, height: `${4 * finalSize}px` }}
            ></div>
            <div
              className={`bg-primary rounded-full animate-bounce`}
              style={{ width: `${4 * finalSize}px`, height: `${4 * finalSize}px` }}
            ></div>
          </div>
        ) : type === "pulse" ? (
          <div className="relative inline-flex p-2">
            <div
              className={`bg-primary dark:bg-primary rounded-full absolute top-0 left-0 animate-ping`}
              style={{ width: `${4 * finalSize}px`, height: `${4 * finalSize}px` }}
            ></div>
            <div
              className={`bg-primary dark:bg-primary rounded-full absolute top-0 left-0 animate-pulse`}
              style={{ width: `${4 * finalSize}px`, height: `${4 * finalSize}px` }}
            ></div>
          </div>
        ) : type === "ping" ? (
          <div
            className={`rounded-full bg-primary dark:bg-primary animate-ping p-2`}
            style={{ width: `${4 * finalSize}px`, height: `${4 * finalSize}px` }}
          ></div>
        ) : type === "windmill" ? (
       <></>
        ) : (
          <div
            className={`border-light-border dark:border-dark-border animate-spin rounded-full
            border-t-primary border-r-primary border-b-primary 
            dark:border-t-primary dark:border-r-primary dark:border-b-primary p-2`}
            style={{ padding: `${4 * finalSize}px`, borderWidth: `${4}px` }}
          />
        )}

      {/* <div class="fixed-center h-6 w-6 animate-spin rounded-full border-2 border-current border-[#6b7280] border-e-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div> */}
    </>
  );
};

export default SpinnerDol;
