export const WithDeviceOptions = {
    args: {},
    parameters: {
        fakeUser: {
            id: 1,
            email: "alice@example.com",
            deviceOptions: [
                { uuid: "u-tablet-1", label: "Tablette caisse 1" },
                { uuid: "u-tablet-2", label: "Tablette caisse 2" },
                { uuid: "u-phone-1", label: "iPhone Eric" },
            ],
        },
        docs: {
            description: {
                story:
                    "Returning user with several registered devices. They " +
                    "can pick one of the existing entries or register a " +
                    "brand new device (the bottom 'Nouvel appareil' radio " +
                    "reveals the label input).",
            },
        },
    },
};
