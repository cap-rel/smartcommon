import { useRef } from "react";
import { Address, Audios, Boolean, ColorPicker, Duration, Editor, Files, GpsPoints, Input, Label, Photos, Range, Rating, Select, Signature, Array, Textarea, Videos, DetailsItem, FilterTagItem, FormItem, ListItem, PrivateLayout, PublicLayout, Sidebar, Tabbar, Help, Icon, Img, LazyLink, Map, SearchBar, Spinner, TabbarLink } from "../../../../components";
import { useAnimation, useApi, useFile, useFilter, useForm, useIntl, useListDnD, useNavigator, useStates, useWindow } from "../../../../hooks";
import { loginSuccess, logoutSuccess } from "../../../../reduxStore/reducers/authSlice";
import { changeLanguage } from "../../../../reduxStore/reducers/settingsSlice";

export const HomePage = () => {
  const booleanRef = useRef();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(e.target);
    
    // première méthode => const boolean = e.target.boolean.value;

    // deuxième méthode :

    // const formDataRef = useRef({
    //   boolean: null,
    // });

    // ref={(el) => formRef.current.boolean = el}

    // Troisième méthode => useStates
  };

  const { states, set } = useStates({
    boolean: false,
  });

  const { boolean } = states;

  return (
      <form onSubmit={handleSubmit} className={`gap-10 p-4 col`}>
      {/* <Address /> */}
      {/* <Audios /> */}
        <Boolean 
          label={`Bouléen`}
          id={`boolean`}
          name={`boolean`}
          variant={`switch`}
          required={true}
          readOnly={false}
          disabled={false}
          booleanRef={booleanRef}
          value={boolean}
          onChange={value => set("boolean", value)}
        />
        <button className={`self-start p-2 font-semibold text-white uppercase bg-green-500 rounded-md`}>
          see values
        </button>
      {/* <ColorPicker /> */}
      {/* <Duration/> */}
      {/* <Editor/> */}
      {/* <Files/> */}
      {/* <GpsPoints/> */}
      {/* <Input/> */}
      {/* <Label/> */}
      {/* <Photos/> */}
      {/* <Range/> */}
      {/* <Rating/> */}
      {/* <Select/> */}
      {/* <Signature/> */}
      {/* <Array/> */}
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
      </form>
  );
};
