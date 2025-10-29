import { FaUser } from "react-icons/fa6";

export const ButtonWithIcon = {
    args: {
        label: "Login",
        icon: FaUser,
    },
    argTypes: {
        label: { table: { category: null } },
        badge: { table: { category: null } },
        variant: { table: { category: null } },
        disabled: { table: { category: null } },
        loading: { table: { category: null } },

        id: { table: { disable: true } },
        icon: { table: { disable: true } },
        children: { table: { disable: true } },
        onClick: { table: { disable: true } },
        buttonProps: { table: { disable: true } },
        Spinner: { table: { disable: true } },
        iconProps: { table: { disable: true } },
        labelProps: { table: { disable: true } },
        badgeProps: { table: { disable: true } },
    }
};
