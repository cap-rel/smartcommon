import { useGlobalStates, useStates } from "lib/hooks";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { Button, Checker, Form, Input, Page, PhotosUploader } from "lib/components";
import { useApi, useForm } from "lib/export";
import { setGlobalStates } from "lib/global-state";
import { v4 } from "uuid";
// import z from "zod";
// import db from "dev/components";

export const DevPage3 = () => {
    // const { login } = useApi();

    const dispatch = useDispatch();

    // const initialStates = {
    //     loginData: {
    //         email: "",
    //         password: "",
    //         entities: [
    //             "bonjour", { test: "" }
    //         ]
    //     },
    //     isLoggingIn: false,
    //     formErrors: {},
    //     photos: {}
    // };

    const initialStates = { isRequesting: false };

    const { values, set, unset, get } = useStates({ initialStates, debug: true });

    // const initialGlobalStates = {
    //     local: {
    //         "loginData.bonjour": [],
    //     },
    //     session: {
    //         "loginData.bonjour": "bonjour"
    //     },
    // }
    
    // const { set: setGlobal, unset: unsetGlobal, get: getGlobal } = useGlobalStates({ initialStates: initialGlobalStates, debug: true })

    // useEffects({
    //     statesChange: {
    //         deps: states,
    //         effect: () => console.log(states)
    //     }
    // });

    // const test = () => {
    //     login({ email: "jeangeorges", password: "MoN4fPrxUbU5", rememberMe: true })
    //         .then(json => {
    //             const data = json?.data ?? {};

    //             console.log(data);
    //         })
    //     set("email", "paolo");
    // };

    const handleFormErrorsOnChange = (error, value) => {
        set(`formErrors.${error}`, value);
    };

    // const test = (options) => {
    //     // options = z.object().loose().optional().parse(options);
    //     // db.users.add({ bonjour: "paolo" });
    // };

    // test();

    const api = useApi();

    const form = useForm();

    const onPreSubmit = () => {        
        const values = form.values.set("email", "blabla");
        // const errors = form.errors.unset("fruit");

        return { values };
    }

    const onSubmit = async (newForm) => {
        console.log("submit");
        // set("isRequesting", true);
        
        await api
            .login({ email: "jeangeorges", password: "MoN4fPrxUbU5", rememberMe: false }, { delay: false })
            .then((data) => console.log(data))
            .catch((error) => {
                // gst.session.set("error", "il y a error");
                console.error(error)
            });
            // .finally(() => set("isRequesting", false));
        
    };

    const gst = useGlobalStates();

    console.log(gst.values);

    const test = () => {
        gst.session.set("user", (prev) => ({ ...prev, test: "test" }));
    }

    return (
        <Page id="login-page">
            <Form form={form} onPreSubmit={onPreSubmit} onSubmit={onSubmit}>
                <Input 
                    name="email"
                    label="email"
                    required
                />
                <Checker
                    name="fruit"
                    type="checkbox"
                    options={["pomme", "banane"]}
                    required
                />
                <Button
                    type="submit"
                    label="Save"
                />
            </Form>
            <button onClick={test}>db</button>
            {/* <PhotosUploader 
                id="photos"
                onError={handleFormErrorsOnChange}
                value={states.photos}
                onChange={value => set("photos", value)}
            /> */}
            {/* <Input onError={handleFormErrorsOnChange} /> */}
            {/* <div className="flex flex-col gap-app-base">
                <button onClick={() => set("email", "paolo")}>email test</button>
                <button onClick={() => set("loginData.entities.test", "paolo")}>email</button>
                <button onClick={() => console.log(getGlobal("loginData.bonjour[0]"))}>mot de passe</button>
                <button onClick={() => setGlobal("loginData.bonjour", "blabla", "session")}>connexion</button>
            </div> */}
        </Page>
    );
};