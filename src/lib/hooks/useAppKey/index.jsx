import { getLocalJSON, isEmpty, setLocalJSON } from "../../utils";
import { v4 } from "uuid";

export const useAppKeyId = () => {
    let id = getLocalJSON("APP_KEY_ID");

    if (isEmpty(appKey)) {
        id = v4();
        setLocalJSON("APP_KEY_ID", id);
    }

    return id;
};