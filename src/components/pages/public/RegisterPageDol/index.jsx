import { useState } from "react";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../../../reduxStore/reducers/authSlice";
import { Help, Icon, Input, PublicLayout, Spinner } from "../../../dol";
import { useStates, useWindow } from "../../../hooks";
// import { toast } from "../../../../../reduxStore/reducers/toastsSlice";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";

export const RegisterPage = (props) => {
    const { config } = props;

    const { darkMode } = useWindow();
    const { t }        = useTranslation();
    
    const { states, set } = useStates({
        email: { root: "" },
        password: { root: "" },
        confirmedPassword: { root: "" },
        isPasswordVisible: false,
        isConfirmedPasswordVisible: false,
        isRegistering: false
    });

    const handleRegisterFormSubmit = (e) => {
        e.preventDefault();
        set("isRegistering", true);
        if (states.password.root === states.confirmedPassword.root) {
          set("isRegistering", false);
          toast.success("Votre compte a bien été créé. Veuilez vous connecter pour y accéder...");
        } else {
          setTimeout(() => {
            set("isRegistering", false);
            toast.error("La confirmation du mot de passe est invalide...");
          }, 10000);
        }
      } 

  return (
    <div className={`col gap-3`}>
        {states.isRegistering &&
            <div className={`bg-alert-smt z-50`}>
                <Spinner type={`dots`} />
            </div>
        }
        <p className={`font-bold uppercase text-2xl`}>
            {t("public.registerTitle")}
        </p>
        <form 
          onSubmit={handleRegisterFormSubmit} 
          className={`col gap-6`}
        >
            <div className={`
                col gap-3
                sm:gap-5
            `}>
                <div className={`col gap-3`}>
                    <label 
                        htmlFor={`email`}
                        className={`
                            hidden 
                            sm:block sm:self-start 
                            lg:cursor-pointer
                        `}
                    >
                        {t("public.emailLabel")}
                    </label>
                    <div className={`row-v-center gap-3 bg-light-soft dark:bg-transparent p-3 rounded-md border border-smt`}>
                        <Icon
                            library={`fa`}
                            name={`FaUser`}
                            className={`text-2xl text-primary flex-shrink-0`}
                            style={{ fill: darkMode && `url(#gradientSvg)` }}
                        />
                        <input
                            id={`email`}
                            type={`text`}
                            placeholder={t("public.passwordLabel")}
                            value={states.email.root}
                            onChange={(e) => {
                                e.preventDefault();
                                set("email.root", e.target.value)
                            }}
                            className={`min-w-0 flex-grow outline-none bg-transparent placeholder-smt`}
                            required={true}
                        />
                    </div>
                </div>
                <div className={`col gap-3`}>
                    <label 
                        htmlFor={`password`}
                        className={`
                            hidden
                            sm:block sm:self-start
                            lg:cursor-pointer
                        `}
                    >
                        {t("public.passwordLabel")}
                    </label>
                    <div className={`row-v-center gap-3 bg-light-soft dark:bg-transparent p-3 rounded-md border border-smt`}>
                        <Icon
                            library={`fa`}
                            name={`FaLock`}
                            className={`text-2xl text-primary flex-shrink-0`}
                            style={{ fill: darkMode && `url(#gradientSvg)` }}
                        />
                        <input
                            id={`password`}
                            type={states.isPasswordVisible ? "text" : "password"}
                            placeholder={t("public.passwordLabel")}
                            value={states.password.root}
                            onChange={(e) => set("password.root", e.target.value)}
                            required={true}
                            title={`Mot de passe`}
                            className={`min-w-0 flex-grow outline-none bg-transparent placeholder-smt`}
                        />
                        <button 
                            title={`Voir mot de passe`}
                            onClick={(e) => {
                                e.preventDefault();
                                set("isPasswordVisible", !states.isPasswordVisible);
                            }}
                            className={`flex-shrink-0 text-soft-smt text-2xl`}
                        >
                            <Icon
                                library={`fa`}
                                name={states.isPasswordVisible ? "FaEyeSlash" : "FaEye"}
                            />
                        </button>
                    </div>
                </div>
                <div className={`col gap-3`}>
                    <label 
                        htmlFor={`confirmedPassword`}
                        className={`
                            hidden
                            sm:block sm:self-start
                            lg:cursor-pointer
                        `}
                    >
                        {t("public.confirmedPasswordLabel")}
                    </label>
                    <div className={`row-v-center gap-3 bg-light-soft dark:bg-transparent p-3 rounded-md border border-smt`}>
                        <Icon
                            library={`fa6`}
                            name={`FaCircleCheck`}
                            className={`text-2xl text-primary flex-shrink-0`}
                            style={{ fill: darkMode && `url(#gradientSvg)` }}
                        />
                        <input
                            id={`confirmedPassword`}
                            type={states.isConfirmedPasswordVisible ? "text" : "password"}
                            placeholder={t("public.confirmedPasswordLabel")}
                            value={states.confirmedPassword.root}
                            onChange={(e) => set("confirmedPassword.root", e.target.value)}
                            required={true}
                            title={`Mot de passe`}
                            className={`min-w-0 flex-grow outline-none bg-transparent placeholder-smt`}
                        />
                        <button 
                            title={`Voir mot de passe`}
                            onClick={(e) => {
                                e.preventDefault()
                                set("isConfirmedPasswordVisible", !states.isConfirmedPasswordVisible);
                            }}
                            className={`flex-shrink-0 text-soft-smt text-2xl`}
                        >
                            <Icon
                                library={`fa`}
                                name={states.isConfirmedPasswordVisible ? "FaEyeSlash" : "FaEye"}
                            />
                        </button>
                    </div>
                </div>          
            </div>
            <div className={`
                col gap-3 text-sm
                sm:gap-5
            `}>
                <button className={`bg-gradient-to-r from-primary to-secondary button-smt text-white p-4 rounded-md w-full text-lg uppercase tracking-wide font-semibold`}>
                    {t("public.registerSubmitButton")}
                </button>
                <p className={`ml-2 row-v-center gap-2`}>
                    <span className={`text-soft-smt`}>
                        {t("public.loginLinkLabel")}
                    </span>
                    <Link 
                        to={`/login`}
                        className={`link-smt text-primary`}
                    >
                        {t("public.loginLink")}
                    </Link>
                </p>
            </div>   
        </form> 
    </div>
  );
};