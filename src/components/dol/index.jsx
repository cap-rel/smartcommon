/*-----------------  Composants de conversion des attributs Dolibarr  ------------------*/
import FormItemDol           from "./item/FormItemDol";
import ListItemDol           from "./item/ListItemDol";
import DetailsItemDol        from "./item/DetailsItemDol";
import FilterTagItemDol      from "./item/FilterTagItemDol";

/*-----------------  Composants de formulaires  ------------------*/
import BooleanDol            from "./form/BooleanDol";
import CheckboxDol           from "./form/CheckboxDol";
import RadioDol              from "./form/RadioDol";
import SelectDol             from "./form/SelectDol";
import TagsDol               from "./form/TagsDol";
import InputDol              from "./form/InputDol";
import StepperDol            from "./form/StepperDol";
import MultiNumberDol        from "./form/MultiNumberDol";
import DurationDol           from "./form/DurationDol"; 
import TextareaDol           from "./form/TextareaDol";
import EditorDol             from "./form/EditorDol";
import AudiosDol             from "./form/AudiosDol";
import VideosDol             from "./form/VideosDol";
import PhotosDol             from "./form/PhotosDol";
import FileDol               from "./form/FileDol";
import LabelDol              from "./form/LabelDol";
import RatingDol             from "./form/RatingDol";
import RangeDol              from "./form/RangeDol";
import RadioImgDol           from "./form/RadioImgDol";

import AddressDol            from "./form/AddressDol";
import GpsDol                from "./form/GpsDol";
import SignatureDol          from "./form/SignatureDol";
import DrawingDol            from "./form/DrawingDol";
import ColorDol              from "./form/ColorDol";
import IconSelectDol         from "./form/IconSelectDol";

/*-----------------  Composants de navigation  ------------------*/
import SidebarDol            from "./navigation/SidebarDol";
import TabbarDol             from "./navigation/TabbarDol";

/*-----------------  Composants layouts  ------------------*/
// Import ErrorLayout           from "./layouts/ErrorLayoutDol";
import PublicLayoutDol       from "./layouts/PublicLayoutDol";
import PrivateLayoutDol      from "./layouts/PrivateLayoutDol";

/*-----------------  Composants pages  ------------------*/

// Composant principal
import PageDol               from "./pages/PageDol";

// Erreurs
import Error404PageDol       from "./pages/errors/Error404PageDol";
import Error500PageDol       from "./pages/errors/Error500PageDol";
import ErrorOnGoingPageDol   from "./pages/errors/ErrorOnGoingPageDol";

// Publiques
import LoginPageDol          from "./pages/public/LoginPageDol";
import RegisterPageDol       from "./pages/public/RegisterPageDol";
import ForgotPasswordPageDol from "./pages/public/ForgotPasswordPageDol";
import NewPasswordPageDol    from "./pages/public/NewPasswordPageDol";

// Privées
import SettingsPageDol       from "./pages/private/SettingsPageDol";
import ListPageDol           from "./pages/private/ListPageDol";
import MapPageDol            from "./pages/private/MapPageDol";
import ItemPageDol           from "./pages/private/ItemPageDol";
import SmartDashboardPageDol from "./pages/private/SmartDashboardPageDol";
// import Calender/Agenda

/*-----------------  Composants globaux  ------------------*/
import MapDol                from "./others/MapDol";
import SpinnerDol            from "./others/SpinnerDol";
import ImgDol                from "./others/ImgDol";
import HelpDol               from "./others/HelpDol";
import IconDol               from "./others/IconDol";
import SearchBarDol          from "./others/SearchbarDol";
import LazyLinkDol           from "./others/LazyLinkDol";

/*-----------------  Smart Composants  ------------------*/
import SmartFiltersDol       from "./smart/SmartFiltersDol";
import SmartActionsDol       from "./smart/SmartActionsDol";

/*-----------------  A supprimer pour l'instant  ------------------*/
import ListDol               from "./trash/ListDol";   // Composant à l'époque de konsta 
import AlertDol              from "./trash/AlertDol"; // Géré par la classe alert-dol

export {
  RangeDol,
  RadioImgDol,
  RatingDol,
  FileDol,
  IconSelectDol,
  AddressDol,
  DrawingDol,
  DurationDol,
  MultiNumberDol,
  StepperDol,
  SmartActionsDol,
  SmartFiltersDol,
  LabelDol,
  PhotosDol,
  VideosDol,
  AudiosDol,
  FilterTagItemDol,
  ColorDol,
  LazyLinkDol,
  SmartDashboardPageDol,
  FormItemDol,
  ListItemDol,
  DetailsItemDol,
  GpsDol,
  RadioDol, 
  CheckboxDol,
  BooleanDol,
  InputDol,
  ListDol,
  MapDol,
  TagsDol,
  SearchBarDol,
  SelectDol,
  SpinnerDol,
  TextareaDol,
  AlertDol,
  EditorDol,
  ImgDol ,
  IconDol,
  HelpDol,
  SignatureDol,
  TabbarDol,
  SidebarDol,
  PrivateLayoutDol,
  PublicLayoutDol,
  PageDol,
  ListPageDol,
  MapPageDol,
  SettingsPageDol,
  ItemPageDol,
  LoginPageDol,
  RegisterPageDol,
  ForgotPasswordPageDol,
  NewPasswordPageDol,
  Error404PageDol,
  Error500PageDol,
  ErrorOnGoingPageDol,
};
