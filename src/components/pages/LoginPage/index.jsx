import icon from "../../../assets/images/icon.png";
import logo from "../../../assets/images/logo.png";
import { BsArrowRight } from "react-icons/bs";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { useApi, useStates } from "../../../hooks";
import { API_URL } from "../../../globals";
import { setAuth } from "../../../reduxStore/reducers/sessionSlice";
import { Button } from "../../others";
import { Input } from "../../form";
import { Page } from "../../others/Page";

export const LoginPage = () => {
    const { states, set } = useStates({
        loginData: {
            email: "",
            password: "",
            rememberMe: false
        },
        isLoggingIn: false
    })

    const { loginData, isLoggingIn } = states;
    const { email, password, rememberMe } = loginData;

    const dispatch = useDispatch();

    const { POST } = useApi(API_URL);

    const handleLoginFormOnSubmit = e => {
        e.preventDefault();
        set("isLoggingIn", true);
        setTimeout(() => {
            POST("login", loginData)
            .then(json => {
                toast.success(`Hello ${json.data.user}`);
                dispatch(setAuth(json.data));
            })
            .catch(err => {
                console.error(err);
                toast.error("Erreur lors de la connexion");
            })
            set("isLoggingIn", false);
        }, 1000);
    };

    const inputLogin = {
        labelProps: {
            className: "uppercase text-soft-text font-app-bold tracking-widest text-app-xs"
        },
        inputContainerProps: {
            className: "bg-strong-bg p-app-sm inset-shadow-sm has-[input:focus]:ring-0 border-none"
        },
        inputProps: {
            className: "font-app-semibold"
        }
    };

    return (
        <Page pageProps={{ className: "bg-soft-bg" }}>
            <div className={`p-app-xl flex flex-col gap-app-xl justify-center items-center h-full w-full`}>
                <div className={`flex flex-col items-center gap-app-base`}>
                    <img 
                        src={icon}
                        className={`size-32`}
                    />
                    <img 
                        src={logo}
                        className={`w-900`}
                    />
                </div>
                <form onSubmit={handleLoginFormOnSubmit} className={`flex flex-col gap-app-lg w-full`}>
                    <div className={`flex flex-col gap-app-md`}>
                        <Input
                            // type={`email`}
                            onChange={value => set("loginData.email", value)}
                            value={email}
                            label={`Adresse Email`}
                            placeholder={`address@email.com`}
                            variant={inputLogin}
                        />
                        <Input
                            onChange={value => set("loginData.password", value)}
                            value={password}
                            type={`password`}
                            label={`Mot de passe`}
                            placeholder={`●●●●●●●●`}
                            variant={inputLogin}
                        />
                    </div>
                    <Button
                        icon={<BsArrowRight />}
                        loading={isLoggingIn}
                        buttonProps={{
                            className: "flex-row-reverse text-app-md uppercase tracking-widest font-app-base rounded-app-xl"
                        }}
                        iconProps={{
                            className: "text-app-xl"
                        }}
                    >
                        Connexion
                    </Button>
                </form>
            </div>
        </Page>
    );
}