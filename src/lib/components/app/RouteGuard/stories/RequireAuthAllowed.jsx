export const RequireAuthAllowed = {
    args: {
        requireAuth: true,
        children: (
            <div className="p-4 rounded-app-md bg-soft-bg border border-border text-app-base">
                Protected content (user is authenticated)
            </div>
        ),
    },
    parameters: {
        fakeUser: { id: 1, email: "alice@example.com" },
        docs: {
            source: {
                code: `
import { RouteGuard } from "@cap-rel/smartcommon";

<Route element={<RouteGuard requireAuth />}>
  <Route path="/dashboard" element={<DashboardPage />} />
</Route>
                `,
            },
        },
    },
};
