import { Address, Audios, Boolean, Checkbox, Color, Drawing, Duration, Editor, Files, GpsPoints, IconSelect, Input, Label, MultiNumber, Photos, Radio, Range, Rating, Select, Signature, Stepper, Tags, Textarea, Videos, DetailsItem, FilterTagItem, FormItem, ListItem, PrivateLayout, PublicLayout, Sidebar, Tabbar, Help, Icon, Img, LazyLink, Map, SearchBar, Spinner } from "../../../../components";
import { useAnimation, useApi, useFile, useFilter, useForm, useIntl, useListDnD, useNavigator, useStates, useWindow } from "../../../../hooks";
import { loginSuccess, logoutSuccess } from "../../../../reduxStore/reducers/authSlice";
import { changeLanguage } from "../../../../reduxStore/reducers/settingsSlice";

export const Error404Page = () => {
  return (
    <div className="relative min-h-screen col gap-4 p-4">
      {/* <span className="absolute-full-center text-5xl font-bold">404</span> */}
      <Address />
      <Audios />
      <Boolean />
      <Checkbox />
      <Color />
      <Drawing />
      <Duration/>
      <Editor/>
      <Files/>
      <GpsPoints/>
      <IconSelect/>
      <Input/>
      <Label/>
      <MultiNumber/>
      <Photos/>
      <Radio/>
      <Range/>
      <Rating/>
      <Select/>
      <Signature/>
      <Stepper/>
      <Tags/>
      <Textarea/>
      <Videos/>
      
      <DetailsItem />
      <FilterTagItem/>
      <FormItem/>
      <ListItem/>

      <PrivateLayout/>
      <PublicLayout/>

      <Sidebar/>
      <Tabbar/>

      <Help/>
      <Icon/>
      <Img/>
      <LazyLink/>
      <Map/>
      <SearchBar/>
      <Spinner/>
    </div>
  );
};
