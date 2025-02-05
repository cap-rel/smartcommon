import { useRef } from "react";
import { Address, Audios, Boolean, Checkbox, Color, Drawing, Duration, Editor, Files, GpsPoints, IconSelect, Input, Label, MultiNumber, Photos, Radio, Range, Rating, Select, Signature, Stepper, Tags, Textarea, Videos, DetailsItem, FilterTagItem, FormItem, ListItem, PrivateLayout, PublicLayout, Sidebar, Tabbar, Help, Icon, Img, LazyLink, Map, SearchBar, Spinner } from "../../../../components";
import { useAnimation, useApi, useFile, useFilter, useForm, useIntl, useListDnD, useNavigator, useStates, useWindow } from "../../../../hooks";
import { loginSuccess, logoutSuccess } from "../../../../reduxStore/reducers/authSlice";
import { changeLanguage } from "../../../../reduxStore/reducers/settingsSlice";

export const Error404Page = () => {
  const booleanRef = useRef();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(e.target.test.value);
    

    // première méthode => const test = e.target.test.value;

    // deuxième méthode :

    // const formDataRef = useRef({
    //   test: null,
    // });

    // ref={(el) => formRef.current.test = el}

    // Troisième méthode => useStates
  };

  const { states, set } = useStates({
    test: false,
  });

  const { test } = states;

  return (
    <div className="relative min-h-screen col gap-4 p-4 dura">
      {/* <span className="absolute-full-center text-5xl font-bold">404</span> */}
      {/* <Address /> */}
      {/* <Audios /> */}
      <form onSubmit={handleSubmit} className={`col gap-10`}>
        <Boolean 
          label={`test`}
          id={`test`}
          name={`test`}
          variant={`checkbox`}
          required={true}
          readOnly={false}
          disabled={false}
          booleanRef={booleanRef}
          value={test}
          onChange={value => set("test", value)}
          custom={{
            classNames:{
              checkIcon: "duration-200"
            }
          }}
        />
        <button className={`bg-green-500 p-2 rounded-md text-white uppercase font-semibold self-start`}>
          Test
        </button>
      </form>
      {/* <Checkbox /> */}
      {/* <Color /> */}
      {/* <Drawing /> */}
      {/* <Duration/> */}
      {/* <Editor/> */}
      {/* <Files/> */}
      {/* <GpsPoints/> */}
      {/* <IconSelect/> */}
      {/* <Input/> */}
      {/* <Label/> */}
      {/* <MultiNumber/> */}
      {/* <Photos/> */}
      {/* <Radio/> */}
      {/* <Range/> */}
      {/* <Rating/> */}
      {/* <Select/> */}
      {/* <Signature/> */}
      {/* <Stepper/> */}
      {/* <Tags/> */}
      {/* <Textarea/> */}
      {/* <Videos/> */}
      
      {/* <DetailsItem /> */}
      {/* <FilterTagItem/> */}
      {/* <FormItem/> */}
      {/* <ListItem/> */}

      {/* <PrivateLayout/> */}
      {/* <PublicLayout/> */}

      {/* <Sidebar/> */}
      {/* <Tabbar/> */}

      {/* <Help/> */}
      {/* <Icon/> */}
      {/* <Img/> */}
      {/* <LazyLink/> */}
      {/* <Map/> */}
      {/* <SearchBar/> */}
      {/* <Spinner/> */}
    </div>
  );
};
