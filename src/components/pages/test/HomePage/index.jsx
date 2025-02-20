import { useRef } from "react";
import { Address, Audios, Boolean, Checkbox, Color, Drawing, Duration, Editor, Files, GpsPoints, IconSelect, Input, Label, MultiNumber, Photos, Radio, Range, Rating, Select, Signature, Stepper, Array, Textarea, Videos, DetailsItem, FilterTagItem, FormItem, ListItem, PrivateLayout, PublicLayout, Sidebar, Tabbar, Help, Icon, Img, LazyLink, Map, SearchBar, Spinner, Single, Multi, TabbarLink } from "../../../../components";
import { useAnimation, useApi, useFile, useFilter, useForm, useIntl, useListDnD, useNavigator, useStates, useWindow } from "../../../../hooks";
import { loginSuccess, logoutSuccess } from "../../../../reduxStore/reducers/authSlice";
import { changeLanguage } from "../../../../reduxStore/reducers/settingsSlice";

export const HomePage = () => {
  const booleanRef = useRef();
  const singleRef = useRef();
  const multiRef = useRef();

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
    single: "",
    multi: []
  });

  const { boolean, single, multi } = states;

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
        <Single 
          label={`Simple sélection`}
          id={`single`}
          name={`single`}
          variant={`switch`}
          options={[{ label: "Pomme", value: "apple" }, { label: "Banane", value: "banana" }, { label: "Fraise", value: "strawberry" }]}
          required={true}
          readOnly={false}
          disabled={false}
          booleanRef={singleRef}
          value={single}
          onChange={value => set("single", value)}
        />
        <Multi 
          label={`Multiple sélection`}
          id={`multi`}
          name={`multi`}
          variant={{
            display: "buttons",
            mode: "radio"
          }}
          options={[{ label: "Pomme", value: "apple" }, { label: "Banane", value: "banana" }, { label: "Fraise", value: "strawberry" }]}
          required={true}
          readOnly={false}
          disabled={false}
          booleanRef={multiRef}
          value={multi}
          onChange={value => set("multi", value)}
        />
        <button className={`self-start p-2 font-semibold text-white uppercase bg-green-500 rounded-md`}>
          see values
        </button>
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
