import { useNavigator } from "../../../hooks";
import DesktopSidebarDol from "./DesktopSidebarDol";
import MobileSidebarDol from "./MobileSidebarDol";

const SidebarDol = (props) => {
  const { config } = props;

  const { deviceType } = useNavigator();
  
  return (
    deviceType === "desktop"
      ? <DesktopSidebarDol config={config} />
      : <MobileSidebarDol config={config} />
  );
};

export default SidebarDol;