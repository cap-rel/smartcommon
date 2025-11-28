import { useFetchApi } from "../useFetchApi";

export const useGetEntities = (deviceId) => {

    const { GET } = useFetchApi(deviceId);

    const getEntities = async () => {
        return GET("login");
    };

    return getEntities;
};