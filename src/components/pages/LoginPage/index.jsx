import { useDispatch } from "react-redux";
import { loginSuccess } from "../../../reduxStore/reducers/authSlice";
import { Input, Boolean } from "../../form";
import { useApi, useStates } from "../../../hooks";
import toast from "react-hot-toast";

export const LoginPage = () => {
    const dispatch = useDispatch();
    const { fetchApi } = useApi();

    const { values, set } = useStates({
       isLoggingIn: false,
    });

    const handleSubmit = (e) => {
        set("islLoggingIn", true);
        const formData = new FormData(e.target);

        const email = formData.get("email");
        const password = formData.get("password");
        const rememberMe = formData.get("rememberMe");

        if (email && password) {
            dispatch(loginSuccess({ email, password, rememberMe }));
            fetchApi("/login", "POST", { email, password, rememberMe }) // { email: email, password: password }
                .then((response) => {
                    console.log(response.data)
                    set("islLoggingIn", false);
                })
                .catch((error) => {
                    set("islLoggingIn", false);
                    console.log(error);
                    toast.error("données non valides")
                });
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
            <Input
                name="email"
                label="Adresse Email"
                type="email"
                required
            />
            <Input
                name="password"
                help="Attention votre mot de passe doit faire plus de 4 caractères"
                minLength={4}
                label="Mot de passe"
                type="password"
                required
            />
            <Boolean
                name="rememberMe"
                labelRow
                label="Garder la session ouverte"
            />
            <button>
                Soumettre
            </button>
        </form>
    );

}