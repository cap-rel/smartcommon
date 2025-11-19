import { useApi } from "lib/hooks";
import { useDispatch } from "react-redux";
import { setUser } from "lib/global-state";

export const DevPage3 = () => {
    const { login } = useApi();

    const dispatch = useDispatch();

    const test = () => {
        login({ email: "jeangeorges", password: "MoN4fPrxUbU5", rememberMe: true })
            .then(json => {
                const data = json?.data ?? {};

                console.log(data);
            })
    };

    return <button onClick={test}>Dev page 3</button>
};