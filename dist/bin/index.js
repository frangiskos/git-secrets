#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const chalk = require("chalk");
const app_root_path_1 = require("app-root-path");
const fs = require("fs-extra");
const path = require("path");
const crypto_utils_1 = require("../lib/crypto-utils");
const fs_utils_1 = require("../lib/fs-utils");
const constants_1 = require("../lib/constants");
function getEncryptedFiles() {
    return fs
        .readdirSync(app_root_path_1.path)
        .filter((file) => file.endsWith(constants_1.ENCRYPTED_FILE_EXT) && !fs.lstatSync(path.resolve(app_root_path_1.path, file)).isDirectory())
        .map((file) => path.resolve(app_root_path_1.path, file));
}
function getKey(encryptedFile) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const keyFile = encryptedFile.slice(0, encryptedFile.length - constants_1.ENCRYPTED_FILE_EXT.length) + constants_1.KEY_FILE_EXT;
        return fs.existsSync(keyFile) ? fs_utils_1.getFirstLine(keyFile) : Promise.resolve(null);
    });
}
function decryptFile(encryptedFile, key) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (!key)
            return;
        const decryptedContent = crypto_utils_1.decrypt(fs.readFileSync(encryptedFile, 'utf8'), key);
        const secretsFile = encryptedFile.slice(0, encryptedFile.length - constants_1.ENCRYPTED_FILE_EXT.length);
        let currentContent = null;
        if (fs.existsSync(secretsFile)) {
            currentContent = fs.readFileSync(secretsFile, 'utf-8');
        }
        if (decryptedContent !== currentContent) {
            fs.writeFileSync(secretsFile, decryptedContent);
        }
    });
}
function runFileDecrypt() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const encryptedFiles = getEncryptedFiles();
        for (const file of encryptedFiles) {
            const key = yield getKey(file);
            if (key)
                yield decryptFile(file, key);
        }
    });
}
function encryptNewFile() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const fileToEncrypt = path.resolve(app_root_path_1.path, process.argv[2]);
        if (!fs.existsSync(fileToEncrypt)) {
            console.error(chalk.red(`Cannot find file "${fileToEncrypt}" to encrypt it`));
            return;
        }
        let key = process.argv[3];
        if (!key && fs.existsSync(fileToEncrypt + constants_1.KEY_FILE_EXT)) {
            key = yield fs_utils_1.getFirstLine(fileToEncrypt + constants_1.KEY_FILE_EXT);
        }
        if (!key || key.length < 8) {
            console.error(chalk.red(`Key must be at least 8 characters long`));
            return;
        }
        const encryptedData = crypto_utils_1.encrypt(fs.readFileSync(fileToEncrypt, 'utf-8'), key);
        fs.writeFileSync(fileToEncrypt + constants_1.ENCRYPTED_FILE_EXT, encryptedData);
        fs.writeFileSync(fileToEncrypt + constants_1.KEY_FILE_EXT, key);
        console.info(chalk.blue(`File "${fileToEncrypt}" encrypted successfully`));
    });
}
function showInfo() {
    console.info(chalk.blue(`run without parameters to decrypt existing files \n(make sure you have a corresponding "${constants_1.KEY_FILE_EXT}" file for the "${constants_1.ENCRYPTED_FILE_EXT}" files you want to decrypt)
\nTo encrypt a new file type \`npx ${constants_1.APP_NAME} encrypt file_to_encrypt key_to_use_for_encryption\`
e.g. npx ${constants_1.APP_NAME} encrypt .env mySuperSecretKey!`));
}
if (process.argv.length === 2) {
    runFileDecrypt();
}
else if (['?', 'help', '--help'].includes(process.argv[2].toLowerCase())) {
    showInfo();
}
else {
    encryptNewFile();
}
//# sourceMappingURL=index.js.map