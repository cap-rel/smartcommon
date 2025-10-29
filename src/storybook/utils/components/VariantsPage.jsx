import { Meta, Title, ArgTypes, Subtitle, Description, Primary, Controls, Stories, Source, Canvas, Story, DocsContainer, DocsPage } from "@storybook/addon-docs/blocks";
import { toFirstUppercase } from "../../../lib";

export const VariantsPage = (props) => {
    const { of, variants } = props;
    return (
        <>
            <div className="h1" style={{ fontSize: "32px", marginBottom: "16px" }}>Variants</div>

            <Description />

            <div style={{ fontSize: "16px", marginTop: "20px" }}>
                <div style={{ position: "relative" }}>
                    <table class="docblock-argstable sb-unstyled st-table">
                        <thead class="docblock-argstable-head">
                            <tr>
                                <th><span>Variant</span></th>
                                <th><span>Description</span></th>
                                <th><span>Preview</span></th>
                                {/* <th><span>Code</span></th> */}
                            </tr>
                        </thead>
                        <tbody class="docblock-argstable-body st-tbody">
                            {Object.keys(variants).map(variant => {
                                return (
                                    <tr>
                                        <td class="first-td"><span class="first-span">{variant}</span></td>
                                        {/* <td><div><span>Description</span></div></td> */}
                                        <td><Description of={of[toFirstUppercase(variant)]} /></td>
                                        <td><Canvas of={of[toFirstUppercase(variant)]} /></td>
                                        {/* <td style={{ marginBottom: "-12px" }}><Source code={outlined.toString()} /></td> */}
                                    </tr>   
                                    
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};