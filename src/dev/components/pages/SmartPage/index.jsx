import { twMerge } from "tailwind-merge";

import { Checker } from "lib/components";
import { useStates } from "lib/hooks";

import { Variables } from "./Variables";
import { Components } from "./Components";
import { Radio } from "./Radio";

export const SmartPage = () => {
    const initialStates = {
        hideOnScroll: false,
        tabbarLinkProps: {
            linkProps: {
                className: ""
            },
            iconAndLabelContainerProps: {
                className: ""
            },
            iconContainerProps: {
                className: ""
            },
            labelProps: {
                className: ""
            },
        },
        test: {}
    };

    const { states, set } = useStates({ initialStates });

    const { hideOnScroll, tabbarLinkProps, test } = states;
    const { linkProps, iconAndLabelContainerProps, iconContainerProps, labelProps } = tabbarLinkProps;

    const stylesheet = document.styleSheets[0];

    const handleChange = (e) => {
        stylesheet.insertRule(`.testtest { @apply ${e.target.value} }`, stylesheet.cssRules.length);
        set("tabbarLinkProps.linkProps.className", e.target.value);
    } 

    // useEffect(() => console.log(document.styleSheets[0]), []);
  
    return (
        <div className={`row fixed inset-0`}>
            <Components />
            <div className={`bg-softer row justify-center items-center`}>
                <div className={`bg-softer relative overflow-auto resize translate-y-0 shadow-md border rounded-xl h-210 w-100 scale-80 border-y-20 border-x-10 border-strongest`}>
                    {/* <TabbarDev { ...test}/> */}
                </div>
            </div>

            <div className={`grow bg-softest border-x border-soft col p-6 gap-6`}>
                <div className={`col gap-4`}>
                    <div className={`text-strongest text-lg uppercase font-semibold truncate`}>
                        Attributes
                    </div>
                    <div className={`col gap-4`}>
                    <Radio
                        onClick={() => set("hideOnScroll", !hideOnScroll)}
                        checked={hideOnScroll}
                        label={`hideOnScroll`}
                    />
                    </div>
                </div>
                <div className={`text-strongest text-lg uppercase font-semibold truncate`}>
                    Variants
                </div>
                <div className={`col gap-4 text-sm`}>
                    <button onClick={() => set("test", tabbarLinkProps)}>
                        test
                    </button>
                    <textarea
                        rows={5}
                        className={twMerge(`p-2 border-2 outline-none border-strong rounded-md focus:border-primary`, linkProps.className)}
                        value={linkProps.className}
                        onChange={handleChange}
                        placeholder={`linkProps`}
                    ></textarea>
                    <Checker type="checkbox" options={["banane"]}/>
                     {/* <textarea
                        rows={5}
                        className={`p-2 border-2 outline-none border-strong rounded-md focus:border-primary`}
                        value={iconAndLabelContainerProps.className}
                        onChange={e => set("tabbarLinkProps.iconAndLabelContainerProps.className", e.target.value)}
                        placeholder={`iconAndLabelContainerProps`}
                    ></textarea>
                     <textarea
                        rows={5}
                        className={`p-2 border-2 outline-none border-strong rounded-md focus:border-primary`}
                        value={iconContainerProps.className}
                        onChange={e => set("tabbarLinkProps.iconContainerProps.className", e.target.value)}
                        placeholder={`iconContainerProps`}
                    ></textarea>
                     <textarea
                        rows={5}
                        className={`p-2 border-2 outline-none border-strong rounded-md focus:border-primary`}
                        value={labelProps.className}
                        onChange={e => set("tabbarLinkProps.labelProps.className", e.target.value)}
                        placeholder={`labelProps`}
                    ></textarea> */}
                </div>
            </div>
            <Variables />
                
        </div>
    );
};