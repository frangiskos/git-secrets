import * as crypto from 'crypto';

/**
 * Encrypts a string of text
 * If iv (InitializationVector) is used (default), the output will always be different for the same data (like salt for password).
 */
export const encrypt = (text: any, key: string, useIV = true): string => {
    try {
        key = (key + '0'.repeat(32)).slice(0, 32); // should be 32 chars
        const iv = useIV ? crypto.randomBytes(16) : Buffer.from('0'.repeat(16)); // For AES, this is always 16
        const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
        let encrypted = cipher.update(Buffer.from(JSON.stringify(text)));

        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    } catch (error) {
        console.error(`Error encrypting: "${JSON.stringify(text)}" with key: "${key}"`, error);
        throw error;
    }
};

export const decrypt = (encryptedString: string, key: string): any => {
    try {
        key = (key + '0'.repeat(32)).slice(0, 32); // should be 32 chars
        const textParts = encryptedString.split(':');
        const ivText = textParts.shift() as string;
        const iv = Buffer.from(ivText, 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);

        return JSON.parse(decrypted.toString());
    } catch (error) {
        console.error(`Error decrypting: "${encryptedString}" with key: "${key}"`, error);
        return '';
    }
};
