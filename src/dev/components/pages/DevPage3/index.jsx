import { useApi, useEffects, useStates } from "lib/hooks";
import { useDispatch } from "react-redux";
import { setUser } from "lib/global-state";
import { useEffect } from "react";

export const DevPage3 = () => {
    const { login } = useApi();

    const dispatch = useDispatch();

    const initialStates = {
        loginData: {
            email: "",
            password: "",
            entities: [
                "bonjour", { test: "" }
            ]
        },
        isLoggingIn: false
    };

    const { states, set, unset, get } = useStates({ initialStates });

    const { isLoggingIn } = states;

    useEffects({
        statesChange: {
            deps: states,
            effect: () => console.log(states)
        }
    })

    // useEffect(() => {
    //     console.log(states);
    // }, [states]);

    const test = () => {
        login({ email: "jeangeorges", password: "MoN4fPrxUbU5", rememberMe: true })
            .then(json => {
                const data = json?.data ?? {};

                console.log(data);
            })
        set("email", "paolo");
    };

    return (
        <div className="flex flex-col gap-app-base">
            <button onClick={() => set("email", "paolo")}>email test</button>
            <button onClick={() => set("loginData.email", "paolo")}>email</button>
            <button onClick={() => set("loginData.test[3].test", { test: "bonjour" })}>mot de passe</button>
            <button onClick={() => test()}>connexion</button>
        </div>
    );
};