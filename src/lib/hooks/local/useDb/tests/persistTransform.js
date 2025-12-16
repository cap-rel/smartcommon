// persistTransform.ts
import { createTransform } from "redux-persist";
import { strToU8, decompressSync, compressSync, strFromU8 } from "fflate";

const fflateTransform = createTransform(
  // Compress state on save
  (inboundState) => {
    const json = JSON.stringify(inboundState);
    const compressed = compressSync(strToU8(json));
    return Array.from(compressed); // Store as array for IndexedDB
  },

  // Decompress state on rehydration
  (outboundState) => {
    const compressed = new Uint8Array(outboundState);
    const json = strFromU8(decompressSync(compressed));
    return JSON.parse(json);
  }
);

export default fflateTransform;
