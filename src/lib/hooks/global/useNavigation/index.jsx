import { useContext } from "react";
import { useParams } from "react-router-dom";

import { NavigationContext } from "lib/components";

export { useNavigationContext } from "./context";

// useParams() is called HERE (in the consumer-facing hook), not in
// useNavigationContext, because NavigationProvider is mounted ABOVE
// <Routes>. At provider level no route is matched yet, so useParams()
// returns {} and that empty object would be frozen in the context for
// every consumer. Calling useParams() from useNavigation() means it
// runs in the leaf component, inside the matched <Route>, and params
// resolve correctly.
// Note: useSearchParams() does NOT need the same treatment - it reads
// the URL query string, not the route match - so it stays in
// useNavigationContext.
export const useNavigation = () => {
    const ctx = useContext(NavigationContext) ?? {};
    const params = useParams();
    return { ...ctx, params };
};