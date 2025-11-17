export * from "./localStorage";
export * from "./sessionStorage";

export function encodeString(str) {
    const utf8Bytes = new TextEncoder().encode(str);
    const base64 = btoa(String.fromCharCode(...utf8Bytes));
    return base64;
}
  
export function decodeString(base64) {
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
    const str = new TextDecoder().decode(bytes);
    return str;
}
  