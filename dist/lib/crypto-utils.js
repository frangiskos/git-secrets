"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decrypt = exports.encrypt = void 0;
const crypto = require("crypto");
const encrypt = (text, key, useIV = true) => {
    try {
        key = (key + '0'.repeat(32)).slice(0, 32);
        const iv = useIV ? crypto.randomBytes(16) : Buffer.from('0'.repeat(16));
        const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
        let encrypted = cipher.update(Buffer.from(JSON.stringify(text)));
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    }
    catch (error) {
        console.error(`Error encrypting: "${JSON.stringify(text)}" with key: "${key}"`, error);
        throw error;
    }
};
exports.encrypt = encrypt;
const decrypt = (encryptedString, key) => {
    try {
        key = (key + '0'.repeat(32)).slice(0, 32);
        const textParts = encryptedString.split(':');
        const ivText = textParts.shift();
        const iv = Buffer.from(ivText, 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return JSON.parse(decrypted.toString());
    }
    catch (error) {
        console.error(`Error decrypting: "${encryptedString}" with key: "${key}"`, error);
        return '';
    }
};
exports.decrypt = decrypt;
//# sourceMappingURL=crypto-utils.js.map