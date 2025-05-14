export function locate(success = () => {}, error = () => {}) {
    navigator.geolocation.getCurrentPosition(
        position => {
          const coords = [position.coords.latitude, position.coords.longitude];
          console.log(`Geolocation success`, coords);
          success(coords);
        },
        err => {
          console.error(`Geolocation error`, err);
          error(err);
        }
    )
}