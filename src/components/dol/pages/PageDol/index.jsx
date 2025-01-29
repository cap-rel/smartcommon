import { 
    ListPageDol, 
    MapPageDol, 
    LoginPageDol,
    RegisterPageDol,
    ForgotPasswordPageDol,
    NewPasswordPageDol,
    ItemPageDol,
    SettingsPageDol
  } from "../../../dol";
import SmartDashboardPageDol from "../../pages/private/SmartDashboardPageDol"
import TestPageDol from "../../pages/private/TestPageDol";

const PageDol = (props) => {
  const { config, type, page,} = props;

  const typeOfPage = {
    "login"         : LoginPageDol,
    "register"      : RegisterPageDol,
    "forgotPassword": ForgotPasswordPageDol,
    "newPassword"   : NewPasswordPageDol,

    "list"          : ListPageDol,
    "item"          : ItemPageDol,
    "map"           : MapPageDol,
    "settings"      : SettingsPageDol,  
    "test"          : TestPageDol,

    "smartDashboard": SmartDashboardPageDol,
  }

  const Page = typeOfPage[type];

  return (<Page config={config} page={page} />);
};

export default PageDol;