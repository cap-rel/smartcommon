import { Meta, Title, ArgTypes, Subtitle, Description, Primary, Controls, Stories, Source, Canvas, Story, DocsContainer, DocsPage } from "@storybook/addon-docs/blocks";

export const PropsPage = (props) => {
    const { stories } = props;
    return (
        <>
            <Meta of={stories} />

            <Title />
            <Subtitle />
            <Description />
            <Primary />
            <ArgTypes />
            {/* <Controls /> */}
            <Stories />
        </>
    );
};
