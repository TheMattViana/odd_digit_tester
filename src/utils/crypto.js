
function str2ab(str) {
    const buf = new ArrayBuffer(str.length);
    const bufView = new Uint8Array(buf);
    for (let i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

function pemToArrayBuffer(pem) {
    const b64 = pem.replace(/(-----(BEGIN|END) PUBLIC KEY-----|\n)/g, '');
    const str = window.atob(b64);
    return str2ab(str);
}

export async function importPublicKey(pemContent) {
    const binaryDer = pemToArrayBuffer(pemContent);

    return window.crypto.subtle.importKey(
        "spki",
        binaryDer,
        {
            name: "RSA-OAEP",
            hash: "SHA-256"
        },
        true,
        ["encrypt"]
    );
}

export async function encryptData(data, publicKey) {
    if (!data) return "";
    // If it's already a secure string or empty, verify? No, just encrypt everything.
    // Ensure data is string
    const text = String(data);

    const enc = new TextEncoder();
    const encoded = enc.encode(text);

    const encrypted = await window.crypto.subtle.encrypt(
        {
            name: "RSA-OAEP"
        },
        publicKey,
        encoded
    );

    // Convert ArrayBuffer to Base64
    let binary = '';
    const bytes = new Uint8Array(encrypted);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}
