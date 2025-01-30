import { 
    ListPage, 
    MapPage, 
    LoginPage,
    RegisterPage,
    ForgotPasswordPage,
    NewPasswordPage,
    ItemPage,
    SettingsPage
  } from "../../dol";
import SmartDashboardPage from "../private/SmartDashboardPage"
import TestPage from "../private/TestPage";

export const Page = (props) => {
  const { config, type, page,} = props;

  const typeOfPage = {
    "login"         : LoginPage,
    "register"      : RegisterPage,
    "forgotPassword": ForgotPasswordPage,
    "newPassword"   : NewPasswordPage,

    "list"          : ListPage,
    "item"          : ItemPage,
    "map"           : MapPage,
    "settings"      : SettingsPage,  
    "test"          : TestPage,

    "smartDashboard": SmartDashboardPage,
  }

  const Page = typeOfPage[type];

  return (<Page config={config} page={page} />);
};