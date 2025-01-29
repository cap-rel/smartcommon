import { Toaster as ReactHotToaster } from "react-hot-toast";
import { useWindow } from "../../../hooks";

const Toaster = (props) => {
    const { config } = props;
    
    const { darkMode } = useWindow();

    return (
        <ReactHotToaster 
            position={`top-center`}
            toastOptions={{
                className: "dark:border-2",
                style: {
                    backgroundColor: darkMode ? "#0f172a" : "white", // TODO Automatiser les couleurs dark et light
                    color: darkMode ? "white" : "#0f172a",
                    borderImage: `linear-gradient(to right, var(--primary-color), var(--secondary-color)) 1`
                }
            }}
        />
    );
};

export default Toaster;