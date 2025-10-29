export const setDefaultStory = (props = {}) => {
    const { args, code } = props;

    return ({
        args,
        parameters: {
            docs: {
                source: { code }
            }
        }
    });
};

export const setVariantStory = (props = {}) => {
    const { args, variant = {}, description } = props;

    return ({
        args,
        parameters: {
            docs: {
                description: {
                    story: description
                },
                source: {
                    code: variant.toString().replace("() => (", "").slice(0, -1)
                }
            }
        }
    });
};

export const setTestStory = (props = {}) => {
    const { args, props: componentProps = {}, hidden = [] } = props;

    const argTypes = Object.fromEntries(Object.keys(componentProps).map(prop => 
        [prop, { table: hidden.includes(prop) ? { disable: true } : { category: null } }]
    ));

    return ({
        args,
        argTypes
    });
};