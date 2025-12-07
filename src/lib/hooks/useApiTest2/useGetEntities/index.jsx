import { useFetchApi } from "../useFetchApi";

export const useGetEntities = (deviceId) => {

    const { GET } = useFetchApi(deviceId);

    const getEntities = async (request = {}, errors = {}) => {
        return GET("login", request);
    };

    return getEntities;
};