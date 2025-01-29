import { Toaster as ReactHotToaster } from "react-hot-toast";
import { useWindow } from "../../../hooks";

const Toaster = () => {
    const { darkMode } = useWindow();

    return (
        <ReactHotToaster 
            position={`top-center`}
            toastOptions={{
                style: {
                    backgroundColor: darkMode ? "#0f172a" : "white",
                    color: darkMode ? "white" : "#0f172a",
                }
            }}
        />
    );
};

export default Toaster;