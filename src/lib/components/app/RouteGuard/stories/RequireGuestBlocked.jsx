export const RequireGuestBlocked = {
    args: {
        requireGuest: true,
        children: (
            <div className="p-4 rounded-app-md bg-soft-bg border border-border text-app-base">
                Guest content (you should not see this)
            </div>
        ),
    },
    parameters: {
        fakeUser: { id: 1, email: "alice@example.com" },
        docs: {
            description: {
                story:
                    "When the user is already authenticated, the guard " +
                    "navigates to `redirectTo` (default `/`). Useful to keep " +
                    "logged-in users away from /login, /register, /forgot-password.",
            },
        },
    },
};
