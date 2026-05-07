export const RequireAuthBlocked = {
    args: {
        requireAuth: true,
        children: (
            <div className="p-4 rounded-app-md bg-soft-bg border border-border text-app-base">
                Protected content (you should not see this)
            </div>
        ),
    },
    parameters: {
        fakeUser: null,
        docs: {
            description: {
                story:
                    "When the user is not authenticated, the guard immediately " +
                    "navigates to `redirectTo` (default `/login`). The DemoPage " +
                    "for `/login` is shown by the router decorator.",
            },
        },
    },
};
