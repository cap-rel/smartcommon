import { Icon } from "../../../others";

export const CheckedIcon = ({
    library,
    name,
    cursor = "cursor-pointer",
    onClick,
    classNames = {
        input: null,
    }
}) => {
    const iconProps = { library, name, onClick };
    return (
        <Icon
            className={`
                text-2xl flex-shrink-0 text-primary
                ${cursor}
                ${classNames.input}
            `}
            { ...iconProps}
        />
    );
};