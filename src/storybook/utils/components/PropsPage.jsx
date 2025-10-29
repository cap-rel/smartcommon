import { Meta, Title, ArgTypes, Subtitle, Description, Primary, Controls, Stories, Source, Canvas, Story, DocsContainer, DocsPage } from "@storybook/addon-docs/blocks";

export const PropsPage = (props) => {
    const { of } = props;
    return (
        <>
            <Title />
            <Description />

            <Canvas sourceState="none" of={of.Default} />

            <Source of={of.Default} />

            <div className="h2" style={{ fontSize: "13px" }}>Props</div>
            <ArgTypes />
            {/* <Controls /> */}
        </>
    );
};


