import Resizer from "react-image-file-resizer";

const useFile = (props) => {
  const resizeImage = (image) => {
    return new Promise((resolve) => 
      Resizer.imageFileResizer(image, 3840, 2160, "JPEG", 90, 0, (uri) => resolve(uri), "base64")
    );
  };
  // await resizeFile(file).then(base64 => base64);

    return { resizeImage };
};

export default useFile;