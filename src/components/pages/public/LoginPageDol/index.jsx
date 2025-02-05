import { useDispatch } from "react-redux";
import { loginSuccess } from "../../../../reduxStore/reducers/authSlice";
import { Help, Icon, Input, Spinner } from "../../../dol";
import { useStates, useApi, useWindow } from "../../../hooks";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";

export const LoginPage = (props) => {
  const { config } = props;
  
  const { darkMode } = useWindow();
  const dispatch     = useDispatch();
  const { login, isLoggingIn } = useApi();
  const { t }        = useTranslation();

  const { states, set } = useStates({
    loginInfo: {
      email: "",
      password: "",
      rememberMe: false
    },
    isPasswordVisible: false
  });

  const handleLoginFormSubmit = (e) => {
    e.preventDefault();
    login(states.loginInfo);
  } 

  return (
      <div className={`col gap-3 max-w-full`}>
      {isLoggingIn &&
        <div className={`bg-alert-smt z-50`}>
          <Spinner type={`dots`} />
        </div>
      }
      <p className={`font-bold uppercase text-2xl`}>
        {t("public.loginTitle")}
      </p>
        <form 
          onSubmit={handleLoginFormSubmit} 
          className={`col gap-6`}
        >
        <div className={`col gap-3 sm:gap-4`}>
          <div className={`col gap-3`}>
            <label 
              htmlFor={`email`}
              className={`hidden sm:block sm:self-start lg:cursor-pointer`}
            >
              {t("public.emailLabel")}
            </label>
            <div 
              className={`border border-smt row-v-center gap-3 p-3 rounded-md bg-light-soft dark:bg-transparent`}
              // style={{ borderImage: darkMode && `linear-gradient(to right, var(--primary-color), var(--secondary-color)) 1` }}
            >
              <Icon
                library={`fa`}
                name={`FaUser`}
                className={`text-2xl text-primary flex-shrink-0`}
                style={{ fill: darkMode && `url(#gradientSvg)` }}
              />
              <input
                id={`email`}
                type={`text`}
                placeholder={t("public.emailLabel")}
                value={states.loginInfo.email}
                onChange={(e) => {
                  e.preventDefault();
                  set("loginInfo.email", e.target.value);
                }}
                className={`min-w-0 flex-grow outline-none bg-transparent placeholder-smt`}
                required={false}
              />
            </div>
          </div>
          <div className={`col gap-3`}>
            <label 
              htmlFor={`password`}
              className={`hidden sm:block sm:self-start lg:cursor-pointer`} 
            >
              {t("public.passwordLabel")}
            </label>
            <div 
              className={`border border-smt row-v-center gap-3 p-3 rounded-md bg-light-soft dark:bg-transparent`}
            >
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
                value={states.loginInfo.password}
                onChange={(e) => {
                  e.preventDefault();
                  set("loginInfo.password", e.target.value);
                }}
                required={false}
                title={`Mot de passe`}
                className={`flex-grow min-w-0 outline-none bg-transparent placeholder-smt`}
              />
              <button 
                title={`Voir mot de passe`}
                onClick={(e) => {
                  e.preventDefault();
                  set("isPasswordVisible", !states.isPasswordVisible);
                }}
                className={`flex-shrink-0 text-soft-smt text-2xl button-smt`}
              >
                <Icon
                  library={`fa`}
                  name={states.isPasswordVisible ? "FaEyeSlash" : "FaEye"}
                />
              </button>
            </div>
          </div>
          <div className={`row-between-center gap-3 text-sm`}>
            <div className={`row-v-center ml-1 flex-grow`}>
              <label
                htmlFor={`rememberMe`}
                className={`row-v-center gap-2 cursor-pointer`}
              >
                <input 
                  id={`rememberMe`}
                  type={`checkbox`}
                  value={states.loginInfo.rememberMe}
                  onChange={(e) => set("loginInfo.rememberMe", e.target.checked)}
                  className={`peer sr-only`}
                />
                <div className={`border border-smt w-7 h-7 rounded-md relative flex-shrink-0 bg-light-soft dark:bg-transparent`}>
                  <Icon
                    library={`fa`}
                    name={`FaCheck`}
                    className={`  
                      w-4 h-4 duration-100 text-primary
                      ${states.rememberMe ? "absolute-full-center opacity-100" : "opacity-0 absolute-h-center bottom-0"}
                    `}
                    style={{ fill: darkMode && "url(#gradientSvg)" }}
                  />
                </div>
                <span className={`text-soft-smt`}>{t("public.rememberMeLabel")}</span>
              </label>
              <Help
                content={`Si cette option est activée, votre session sera sauvegardé.`}
                className={`relative lg:cursor-pointer`}
              />
            </div>
            <Link 
              to={`/forgot-password`} 
              className={`link-smt text-primary mr-2`}
            >
              {t("public.forgotPasswordLink")}
            </Link>
          </div>
        </div>
        <div className={`col gap-3 sm:gap-4 text-sm`}>
          <button className={`bg-gradient-to-r from-primary to-secondary button-smt text-white p-4 rounded-md w-full text-lg uppercase tracking-wide font-semibold`}>
            {t("public.loginSubmitButton")}
          </button>
            <p className={`row-v-center gap-2 ml-2`}>
              <span className={`text-soft-smt`}>{t("public.registerLinkLabel")}</span>
              <Link 
                to={`/register`}
                className={`link-smt text-primary`}
              >
                {t("public.registerLink")}
              </Link>
            </p>
        </div>   
      </form>     
    </div>
  );
};


