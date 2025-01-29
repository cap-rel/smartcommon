import { useStates } from "../../../hooks";
import { BooleanDol, FormItemDol, IconDol, LabelDol, SelectDol, FilterTagItemDol, InputDol } from "../../../dol";
import { useEffect, useMemo } from "react";
import { isEmpty } from "../../../../globals/functions";

const SmartFiltersDol = (props) => {
    const { value, onChange, attributes } = props;

    const FILTER_EMPTY_VALUES_MAP = useMemo(()=> ({
        boolean         : { value: false },
        checkbox        : { value: false },
        multiCheckbox: { strict: false, value: [] },
        radio           : { value: "" },
        select          : { value: "" },
        multiSelect  : { strict: false, value: [] },
        array           : { strict: false, value: [] },
        varchar         : { strict: false, value: "" },
        mail            : { strict: false, value: "" },
        // password        : , 
        phone           : { strict: false, value: "" },
        ip              : { strict: false, value: "" },
        link            : { strict: false, value: "" },
        int             : { strict: false, value: "", interval: { min: "", max: "" } },
        reel            : { strict: false, value: "", interval: { min: "", max: "" } },
        double          : { strict: false, value: "", interval: { min: "", max: "" } }, // TODO
        price           : { strict: false, value: "", interval: { min: "", max: "" } },
        pricey         : { strict: false, value: "", interval: { min: "", max: "" } },
        // timestamp       : , 
        date            : { value: "", interval: { min: "", max: "" } },
        datetime        : { value: "", interval: { min: "", max: "" } },
        time            : { value: "", interval: { min: "", max: "" } }, // TODO
        duration        : { value: "", interval: { min: "", max: "" } }, // TODO
        // text            : , 
        // html            : , 
        address         : { strict: false, value: "" },
        // gps             : , 
        // file            : , 
        // audio           : , 
        // video           : , 
        // photo           : , 
        // signature       : , 
        // drawing         : , 
        // color           : , 
        stepper         : { value: "" }, // TODO
        note            : { value: "" }, // TODO
        // case "fk": return "";
    
        // default: return "" TODO à voir avec ERIC
      }), []);

      useEffect(() => console.log(attributes), []);

    const { states, set } = useStates({
        selectedAttributeName: Object.keys(attributes)[0],
        filterMode: "inclusive",
        skelFilters: Object.fromEntries(Object.entries(attributes).map(([key, attribute]) => [
            key,
            {
              inclusive: FILTER_EMPTY_VALUES_MAP[attribute.type],
              exclusive: FILTER_EMPTY_VALUES_MAP[attribute.type],
            }
        ]))
    });

        const selectedAttributeName = states.selectedAttributeName;
        const filterMode = states.filterMode;
    
        const selectedFilterLink = `${selectedAttributeName}.${filterMode}`;

        const selectedSkelFilterLink = `skelFilters.${selectedAttributeName}.${filterMode}`;
        const selectedFilter = selectedAttributeName ? states.skelFilters[selectedAttributeName][filterMode] : null;

        // useEffect(() => console.log(states.filters), [states.filters]);

        return (
            <div className={`col lg:row-v-center border border-dol divide-y lg:divide-x divide-dol`}>
                <div className={`col divide-y divide-dol basis-1/2`}>
                    <SelectDol value={selectedAttributeName} onChange={(newState) => { set("selectedAttributeName", newState); set("filterMode", "inclusive"); }} options={Object.entries(attributes).map(([key, attribute]) => ({ label: attribute.label, value: key }))} />
                    <div className={`col divide-y divide-dol`}>
                        <div className={`row-v-center divide-x divide-dol`}>
                            <button onClick={() => set("filterMode", "inclusive")} className={`row-full-center flex-grow duration-100 gap-2 p-2 ${filterMode === "inclusive" ? "bg-success-20 text-success" : "bg-dol text-soft-dol button-dol"}`}>
                                <IconDol library={`fa`} icon={`FaCheck`} />
                                <span>Filtre inclusif</span>
                            </button>
                            <button onClick={() => set("filterMode", "exclusive")} className={`row-full-center flex-grow duration-100 gap-2 p-2 ${filterMode === "exclusive" ? "bg-error-20 text-error" : "bg-dol text-soft-dol button-dol"}`}>
                                <IconDol library={`fa6`} icon={`FaBan`} />
                                <span>Filtre exclusif</span>
                            </button>
                        </div>
                        <div className={`col gap-6 p-6`}>

                            {"strict" in selectedFilter && <BooleanDol label={"Filtre Strict"} value={selectedFilter.strict} onChange={value => set(`${selectedSkelFilterLink}.strict`, value)} />}
                            <FormItemDol value={selectedFilter.value} onChange={value => set(`${selectedSkelFilterLink}.value`, value)} { ...attributes[selectedAttributeName]} label={`Valeur`} />
                            {"interval" in selectedFilter && 
                            <LabelDol label={`Intervalle`}>
                                <div className={`row-v-center gap-4`}>
                                    <InputDol placeholder={`Minimum ...`} value={selectedFilter.interval.min} onChange={value => set(`${selectedSkelFilterLink}.interval.min`, value)} />
                                    <InputDol placeholder={`Maximum ...`} value={selectedFilter.interval.max} onChange={value => set(`${selectedSkelFilterLink}.interval.max`, value)} />
                                </div>
                            </LabelDol>
                            }
                            
                            <button
                                disabled={isEmpty(selectedFilter.value) && ("interval" in selectedFilter && isEmpty(selectedFilter.interval))}
                                className={`
                                    py-2 px-4 rounded-md border button-dol
                                    ${filterMode === "inclusive" ? "bg-success-20 text-success border-success" : "bg-error-20 text-error border-error"}
                                `}
                                onClick={() => (!isEmpty(selectedFilter.value) || ("interval" in selectedFilter && !isEmpty(selectedFilter.interval))) && onChange(selectedFilterLink, selectedFilter)}
                            >
                                Appliquer
                            </button>
                        </div>
                    </div>
                </div>
                <div className={`h-full col-h-center gap-6 p-6 basis-1/2`}>
                    <span className={`uppercase text-dol`}>Filtres</span>
                    <div className={`col w-full divide-y divide-dol gap-2`}>
                        {Object.entries(value).map(([key, filter], FI) => {
                            const { inclusive, exclusive } = filter;
                            const attribute = attributes[key];
                            const { label, type } = attribute;
                            return (
                                <>
                                    {inclusive && 
                                        <div key={"inclusiveFilter" + FI} className={`row-between-center gap-2 py-2`}>
                                            {(!inclusive.value && inclusive.interval) &&
                                                <>
                                                    {inclusive.interval.min && 
                                                        <>
                                                            <span><FilterTagItemDol type={type} value={inclusive.interval.min} /></span>
                                                            <span className={`text-3xl text-success`}>≤</span>
                                                        </>
                                                    }
                                                    <span>{label}</span>
                                                    {inclusive.interval.max && 
                                                        <>
                                                            <span className={`text-3xl text-success`}>≤</span>
                                                            <span><FilterTagItemDol type={type} value={inclusive.interval.max} /></span>
                                                        </>
                                                    }
                                                </>
                                            }
                                            {!isEmpty(inclusive.value) &&
                                                <>
                                                    <span>{label}</span>
                                                    <span className={`text-3xl text-success`}>{(!("strict" in inclusive) || inclusive.strict) ? "=" : "≈"}</span>
                                                    <span><FilterTagItemDol type={type} value={inclusive.value} /></span>
                                                </>
                                            }
                                        </div>
                                    }
                                    {exclusive && 
                                        <div key={"exclusiveFilter" + FI} className={`row-between-center gap-2 py-2`}>
                                            {(!exclusive.value && exclusive.interval) &&
                                                <>
                                                    {exclusive.interval.min && 
                                                        <>
                                                            <span><FilterTagItemDol type={type} value={exclusive.interval.min} /></span>
                                                            <span className={`text-3xl text-error`}>≤</span>
                                                        </>
                                                    }
                                                    <span>{label}</span>
                                                    {exclusive.interval.max && 
                                                        <>
                                                            <span className={`text-3xl text-error`}>≤</span>
                                                            <span><FilterTagItemDol type={type} value={exclusive.interval.max} /></span>
                                                        </>
                                                    }
                                                </>
                                            }
                                            {!isEmpty(exclusive.value) &&
                                                <>
                                                    <span>{label}</span>
                                                    <span className={`text-3xl text-error`}>{(!("strict" in exclusive) || exclusive.strict) ? "=" : "≈"}</span>
                                                    <span><FilterTagItemDol type={type} value={exclusive.value} /></span>
                                                </>
                                            }
                                        </div>
                                    }
                                </>
                            );
                        })}
                    </div>
                </div>
            </div>
        );

};

export default SmartFiltersDol;