import ky from "ky";

const api = async () => {
    try {
        await ky.get();
    } catch (err) {
        if (ky.isKyError(err)) console.log("ky error");
        if (ky.isHTTPError(err)) console.log("http error");
        if (ky.isTimeoutError(err)) console.log("timeout error, aborted");
        if (ky.isForceRetryError(err)) console.log("force retry error");
    }

    try {
        await ky.get();
    } catch (err) {
        if (err instanceof ky.HTTPError) console.log("http error");
        if (err instanceof ky.TimeoutError) console.log("timeout error, aborted");
        if (err instanceof ky.ForceRetryError) console.log("force retry error");
    }

    await ky.get('https://api.example.com', {
        headers: { 'Authorization': 'Bearer token' },
        method: 'GET'
    });

}