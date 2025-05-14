import { useState } from "react";

// export const useFile = (props) => {
//   const resizeImage = (image) => {
//     return new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.onload = (event) => {
//         const img = new Image();
//         img.onload = () => {
//           const canvas = document.createElement("canvas");
//           const ctx = canvas.getContext("2d");
//           const maxWidth = 3840;
//           const maxHeight = 2160;
//           let width = img.width;
//           let height = img.height;

//           if (width > height) {
//             if (width > maxWidth) {
//               height *= maxWidth / width;
//               width = maxWidth;
//             }
//           } else {
//             if (height > maxHeight) {
//               width *= maxHeight / height;
//               height = maxHeight;
//             }
//           }

//           canvas.width = width;
//           canvas.height = height;
//           ctx.drawImage(img, 0, 0, width, height);
//           resolve(canvas.toDataURL("image/jpeg", 0.9));
//         };
//         img.onerror = reject;
//         img.src = event.target.result;
//       };
//       reader.onerror = reject;
//       reader.readAsDataURL(image);
//     });
//   };

//   return { resizeImage };
// };


//TODO
// old code -----------------

import Resizer from "react-image-file-resizer";

export const useFile = (props) => {
  const resizeImage = (image) => {
    return new Promise((resolve) =>
      Resizer.imageFileResizer(image, 3840, 2160, "JPEG", 90, 0, (uri) => resolve(uri), "base64")
    );
  };
  // await resizeFile(file).then(base64 => base64);

  return { resizeImage };
};
