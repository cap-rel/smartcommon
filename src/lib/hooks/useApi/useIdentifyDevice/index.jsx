import { useDispatch, useSelector } from "react-redux";

import { getLocal, isEmpty, setLocal } from "lib/utils";
import { updateUser } from "lib/global-state";

import { useFetchApi } from "../useFetchApi";

export const useIdentifyDevice = (deviceId) => {
    const dispatch = useDispatch();

    const { POST } = useFetchApi(deviceId);

    const { deviceOptions } = useSelector(state => state.user);

    const identifyDevice = async ({ label, uuid }) => {
        const noUuid = (uuid === "noDevice" || isEmpty(deviceOptions));

        return POST(
            "device",
            { label: label || undefined, uuid: noUuid ? getLocal("HTTP_X_DEVICEID") : uuid }
        )
            .then(data => {
                dispatch(updateUser({ ...data, deviceOptions: undefined }));

                if (!noUuid) {
                    setLocal("HTTP_X_DEVICEID", uuid);
                }
            })
            .catch(err => console.error(err));

    };

    return identifyDevice;
};