import { Address, Audios, Boolean, Checkbox, Checkbox, Drawing, Duration, Editor, GpsPoints, Input, Photos, Radio, Rating, Select, Signature, Stepper, Array, Textarea, Videos } from "../../../dol";
import { useStates } from "../../../hooks";
import IconSelect from "../../../form/IconSelect";
import MultiNumber from "../../../form/MultiNumber";

export const TestPage = () => {

    const inputs = [
        // "boolean"      ,  
        // "checkbox"     ,
        // "multiCheckbox",
        // "radio"        ,
        // "select"       ,
        // "multiSelect"  ,
        // "array"        ,

        "varchar"      ,
        "mail"         ,
        "password"     ,
        "phone"        ,
        "ip"           ,
        "url"          ,
        "link"         ,
        "date"         ,
        "datetime"     ,
        "time"         ,
        "timestamp"    ,

        // "double"       ,
        // "duration"     ,

        // "text"         ,
        // "html"         ,

        // "address"      ,
        // "gps"          ,
        // "file"         ,
        // "audio"        ,
        // "video"        ,
        // "photo"        ,
        // "signature"    ,
        // "drawing"      ,

        // "color"        ,
        // "icon"         ,

        // "rating"       ,
        // "range"        ,
    ];

    const steppers = [
        "stock"        ,
        "int"          ,
        "reel"         ,
        "price"        ,
        "pricey"       
    ]

    const setInputs = (array, init) => {
        let inputs = {};
        array.forEach(input => inputs[input] = init);
        return inputs;
    };

    const { states, set } = useStates({
        inputs: setInputs(inputs, ""),
        steppers: setInputs(steppers, 0),
        duration: 0,
        double: [0, 0],
        text: "",
        editor: "",
        signature: "",
        address: "",
        gps: [],
        photos: [],
        audios: [],
        videos: [],
        boolean: false,  
        checkbox: false,
        multiCheckbox: [],
        radio: null,
        select: "",
        multiSelect: [],
        array: [],
        rating: 0,
        range: 0,
        color: null,
        icon: null
    });

    return (
        <div className="items-start p-12 bg-smt col">
            <div className={`gap-6 col`}>
                {/* {inputs.map(input =>
                    <Input label={input} type={input} value={states.inputs[input]} onChange={value => set(`inputs.${input}`, value)} />
                )}
                {steppers.map(stepper =>
                    <Stepper label={stepper} type={stepper} value={states.steppers[stepper]} onChange={value => set(`steppers.${stepper}`, value)} />
                )} */}
                {/* <Duration label={"duration"} value={states.duration} onChange={value => set(`duration`, value)} />
                <MultiNumber label={"double"} value={states.double} onChange={value => set(`double`, value)} />
                <Textarea label={"text"} value={states.text} onChange={value => set(`text`, value)} />
                <Editor label={"editor"} value={states.editor} onChange={value => set(`editor`, value)} />
                <Signature label={"signature"} value={states.signature} onChange={value => set(`signature`, value)}/>
                <Drawing />
                <Address label={"address"} value={states.address} onChange={value => set(`address`, value)}/>
                <GpsPoints label={"gps"} value={states.gps} onChange={value => set(`gps`, value)}/> */}
                <Photos label={"photos"} value={states.photos} onChange={value => set(`photos`, value)}/>
                <Audios label={"audios"} value={states.audios} onChange={value => set(`audios`, value)}/>
                <Videos label={"videos"} value={states.videos} onChange={value => set(`videos`, value)}/>
                {/* <Boolean label={"boolean"} value={states.boolean} onChange={value => set(`boolean`, value)}/>
                <Checkbox label={"checkbox"} value={states.checkbox} onChange={value => set(`checkbox`, value)}/>
                <Checkbox multiple={true} name={`checkboxMultiple`} label={"checkboxMultiple"} value={states.checkboxMultiple} onChange={value => set(`checkboxMultiple`, value)} options={["Pomme", "Banane", "Fraise"]}/>
                <Radio name={`radio`} label={"radio"} value={states.radio} onChange={value => set(`radio`, value)} options={["Pomme", "Banane", "Fraise"]}/>
                <Select label={"select"} value={states.select} onChange={value => set(`select`, value)} options={["Pomme", "Banane", "Fraise"]}/>
                <Select multiple={true} label={"selectMultiple"} value={states.selectMultiple} onChange={value => set(`selectMultiple`, value)} options={["Pomme", "Banane", "Fraise"]}/>
                <Tags label={"array"} value={states.array} onChange={value => set(`array`, value)}/>
                <Rating label={`rating`} value={states.rating} onChange={value => set("rating", value)}/>
                <Range label={`range`} value={states.range} onChange={value => set("range", value)}/>
                <IconSelect label={`icon`} value={states.icon} onChange={value => set("icon", value)}/>
                <Checkbox label={`Note`} value={states.color} onChange={value => set("color", value)}/> */}

            </div>
        </div>
    );
};
