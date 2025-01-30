import { HelpDol, IconDol, InputDol, SpinnerDol } from "../../..";
import { useStates, useApi, useWindow } from "../../../../hooks";
// import { toast } from "../../../../../reduxStore/reducers/toastsSlice";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";

export const ForgotPasswordPageDol = (props) => {
  const { config } = props;

  const { darkMode } = useWindow();
  const { t }        = useTranslation();
  
  const { states, set } = useStates({
    email: { root: "" },
    isProvidingEmail: false
  });

const handleEmailProvidingForm = (e) => {
    e.preventDefault();
    set("isProvidingEmail", true);
    if (email.root === "test") {
      set("isProvidingEmail", false);
      toast(
        "Si votre compte existe, un email a de réinitialisation de mot de passe vous a été envoyé...",
        { icon: '📧' }
      );
    } else {
      setTimeout(() => {
        set("isProvidingEmail", false);
        toast(
          "Si votre compte existe, un email a de réinitialisation de mot de passe vous a été envoyé...",
          { 
            icon: <IconDol library="io5" icon="IoMailUnreadSharp" className="text-5xl text-primary" />, 
            duration: 10000
          }
        );
      }, 2000);
    }
  } 


  return (
    <div className={`col gap-3`}>
      {states.isProvidingEmail &&
        <div className={`bg-alert-dol z-50`}>
            <SpinnerDol type={`dots`} />
        </div>
      }
      <p className={`text-dol font-bold uppercase text-2xl`}>
        {t("public.forgotPasswordTitle")}
      </p>
      <p className={`text-sm text-soft-dol`}>
        {t("public.forgotPasswordDescription")}
      </p>
      <form 
        onSubmit={handleEmailProvidingForm} 
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
            <div className={`row-v-center gap-3 bg-light-soft dark:bg-transparent p-3 rounded-md border border-dol`}>
              <IconDol
                library={`fa`}
                icon={`FaUser`}
                className={`text-2xl text-primary`}
                style={{ fill: darkMode && `url(#gradientSvg)` }}
              />
              <input
                id={`email`}
                type={`text`}
                placeholder={t("public.emailLabel")}
                value={states.email.root}
                onChange={(e) => {
                  e.preventDefault();
                  set("email.root", e.target.value);
                }}
                className={`min-w-0 flex-grow outline-none bg-transparent placeholder-dol`}
                required={false}
              />
            </div>
          </div>          
        </div>
        <div className={`
          col gap-3 text-sm 
          sm:gap-4
        `}>
          <button className={`bg-gradient-to-r from-primary to-secondary button-dol text-white p-4 rounded-md w-full text-lg uppercase tracking-wide font-semibold`}>
            {t("public.forgotPasswordSubmitButton")}
          </button>
          <p className={`ml-2 row-v-center gap-2`}>
            <span className={`text-soft-dol`}>{t("public.loginLinkLabel")}</span>
            <Link 
              to={`/login`} 
              className={`link-dol text-primary`}
            >
              {t("public.loginLink")}
            </Link>
          </p>
          <p className="ml-2 row-v-center gap-2">
            <span className={`text-soft-dol`}>{t("public.registerLinkLabel")}</span>
            <Link 
              to={`/register`} 
              className={`link-dol text-primary`}
            >
              {t("public.registerLink")}
            </Link>
          </p>
        </div>   
      </form> 
    </div>
  );
};
