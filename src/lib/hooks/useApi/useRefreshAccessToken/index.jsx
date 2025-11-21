import { useDispatch, useSelector } from "react-redux";

import { useLibConfig } from "lib/hooks";
import { setUser } from "lib/global-state";

import { useLogout } from "../useLogout";

export const useRefreshAccessToken = (deviceId) => {
    const { api } = useLibConfig();
    
    const { url, errors: apiErrors } = api ?? {};

    const dispatch = useDispatch();

    const logout = useLogout(deviceId);

    const user = useSelector(state => state.user);

    const { refresh_token } = user;

     const refreshAccessToken = async () => {
        const response = await fetch(`${url}refresh`, {
            method: "GET",
            headers: { 
                Authorization: `Bearer ${refresh_token}`,
                "X-DEVICEID": deviceId
            }
        });

        const data = await response.json() ?? {};

        if (!response.ok) {
            await logout();
            throw new Error('Session expired. Please login again.');
            // throw new Error(json);
        }

        const { access_token, refresh_token: refreshToken, token_expires_in } = data;

        const refreshedUser = { ...user, access_token, refresh_token: refreshToken, tokenExpiry: Date.now() + (token_expires_in * 1000)};
        
        dispatch(setUser(refreshedUser));
    };
    
    return refreshAccessToken;
};


// POST("device", { label: label || undefined, uuid: (uuid === "noDevice" || isEmpty(deviceOptions)) ? getLocal("HTTP_X_DEVICEID") : uuid })
//             .then(data => {
//                 if ((uuid === "noDevice" || isEmpty(deviceOptions))) {
//                     setLocal("HTTP_X_DEVICEID", uuid);
//                 }
                
//                 dispatch(updateUser({ data }));
//                 dispatch(updateLocalUser({ devicesOptions: undefined }));
//             })
//             .catch(err => console.error(err));