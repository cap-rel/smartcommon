import { AddressDol, AudiosDol, BooleanDol, CheckboxDol, ColorDol, DrawingDol, DurationDol, EditorDol, GpsDol, InputDol, PhotosDol, RadioDol, RatingDol, SelectDol, SignatureDol, StepperDol, TagsDol, TextareaDol, VideosDol } from "../../../../dol";
import { useStates } from "../../../../hooks";
import IconSelectDol from "../../../form/IconSelectDol";
import MultiNumberDol from "../../../form/MultiNumberDol";

const TestPageDol = () => {

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
        <div className="bg-dol p-12 col items-start">
            <div className={`col gap-6`}>
                {/* {inputs.map(input =>
                    <InputDol label={input} type={input} value={states.inputs[input]} onChange={value => set(`inputs.${input}`, value)} />
                )}
                {steppers.map(stepper =>
                    <StepperDol label={stepper} type={stepper} value={states.steppers[stepper]} onChange={value => set(`steppers.${stepper}`, value)} />
                )} */}
                {/* <DurationDol label={"duration"} value={states.duration} onChange={value => set(`duration`, value)} />
                <MultiNumberDol label={"double"} value={states.double} onChange={value => set(`double`, value)} />
                <TextareaDol label={"text"} value={states.text} onChange={value => set(`text`, value)} />
                <EditorDol label={"editor"} value={states.editor} onChange={value => set(`editor`, value)} />
                <SignatureDol label={"signature"} value={states.signature} onChange={value => set(`signature`, value)}/>
                <DrawingDol />
                <AddressDol label={"address"} value={states.address} onChange={value => set(`address`, value)}/>
                <GpsDol label={"gps"} value={states.gps} onChange={value => set(`gps`, value)}/> */}
                <PhotosDol label={"photos"} value={states.photos} onChange={value => set(`photos`, value)}/>
                <AudiosDol label={"audios"} value={states.audios} onChange={value => set(`audios`, value)}/>
                <VideosDol label={"videos"} value={states.videos} onChange={value => set(`videos`, value)}/>
                {/* <BooleanDol label={"boolean"} value={states.boolean} onChange={value => set(`boolean`, value)}/>
                <CheckboxDol label={"checkbox"} value={states.checkbox} onChange={value => set(`checkbox`, value)}/>
                <CheckboxDol multiple={true} name={`checkboxMultiple`} label={"checkboxMultiple"} value={states.checkboxMultiple} onChange={value => set(`checkboxMultiple`, value)} options={["Pomme", "Banane", "Fraise"]}/>
                <RadioDol name={`radio`} label={"radio"} value={states.radio} onChange={value => set(`radio`, value)} options={["Pomme", "Banane", "Fraise"]}/>
                <SelectDol label={"select"} value={states.select} onChange={value => set(`select`, value)} options={["Pomme", "Banane", "Fraise"]}/>
                <SelectDol multiple={true} label={"selectMultiple"} value={states.selectMultiple} onChange={value => set(`selectMultiple`, value)} options={["Pomme", "Banane", "Fraise"]}/>
                <TagsDol label={"array"} value={states.array} onChange={value => set(`array`, value)}/>
                <RatingDol label={`rating`} value={states.rating} onChange={value => set("rating", value)}/>
                <RangeDol label={`range`} value={states.range} onChange={value => set("range", value)}/>
                <IconSelectDol label={`icon`} value={states.icon} onChange={value => set("icon", value)}/>
                <ColorDol label={`Note`} value={states.color} onChange={value => set("color", value)}/> */}

            </div>
        </div>
    );
};

export default TestPageDol;
