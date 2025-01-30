import { useNavigator } from "../../hooks";
import DesktopSidebar from "./DesktopSidebar";
import MobileSidebar from "./MobileSidebar";

export const Sidebar = (props) => {
  const { config } = props;

  const { deviceType } = useNavigator();
  
  return (
    deviceType === "desktop"
      ? <DesktopSidebar config={config} />
      : <MobileSidebar config={config} />
  );
};