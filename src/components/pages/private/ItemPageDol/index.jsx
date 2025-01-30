import DesktopItemPage from "./DesktopItemPage";
import MobileItemPage from "./MobileItemPage";

export const ItemPage = (props) => {
    return (
        <>
            <MobileItemPage />
            <DesktopItemPage />
        </>
    );
};