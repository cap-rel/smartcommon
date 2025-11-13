import { isEmpty } from "../../utils/functions";
import { navigatorInfo } from "../../utils";

export const useIntl = () => {
    const DateTimeFormat = (timestamp, locales = null, options = null) => {
        const { language } = navigatorInfo;
        const defaultLocales = locales || language;

        const defaultOptions = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        }

        const combinedOptions = !isEmpty(options) ? { ...defaultOptions, ...options } : defaultOptions;

        const DateTimeFormat = new Intl.DateTimeFormat(defaultLocales, combinedOptions);

        return (DateTimeFormat.format(timestamp));
    };

    return { DateTimeFormat };
};