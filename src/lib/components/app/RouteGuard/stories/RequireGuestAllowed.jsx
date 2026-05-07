export const RequireGuestAllowed = {
    args: {
        requireGuest: true,
        children: (
            <div className="p-4 rounded-app-md bg-soft-bg border border-border text-app-base">
                Guest content (no user logged in)
            </div>
        ),
    },
    parameters: {
        fakeUser: null,
        docs: {
            source: {
                code: `
import { RouteGuard } from "@cap-rel/smartcommon";

<Route element={<RouteGuard requireGuest />}>
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />
</Route>
                `,
            },
        },
    },
};
