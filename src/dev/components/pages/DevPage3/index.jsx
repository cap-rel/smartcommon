import { useApi, useEffects, useGlobalStates, useStates } from "lib/hooks";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { Page } from "lib/components";

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

    const { states, set, unset, get } = useStates({ initialStates, debug: true });
    
    const { globalStates, setGlobal, unsetGlobal, getGlobal } = useGlobalStates({ debug: true })

    useEffects({
        statesChange: {
            deps: states,
            effect: () => console.log(states)
        }
    });

    const test = () => {
        login({ email: "jeangeorges", password: "MoN4fPrxUbU5", rememberMe: true })
            .then(json => {
                const data = json?.data ?? {};

                console.log(data);
            })
        set("email", "paolo");
    };

    return (
        <Page id="login-page">
            <div className="flex flex-col gap-app-base">
                <button onClick={() => set("email", "paolo")}>email test</button>
                <button onClick={() => set("loginData.entities.test", "paolo")}>email</button>
                <button onClick={() => console.log(getGlobal("loginData.bonjour"))}>mot de passe</button>
                <button onClick={() => setGlobal("loginData.bonjour", "paola", "session")}>connexion</button>
            </div>
        </Page>
    );
};