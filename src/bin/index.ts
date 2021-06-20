#!/usr/bin/env node

import * as chalk from 'chalk';
import { path as RootPath } from 'app-root-path';
import * as fs from 'fs-extra';
import * as path from 'path';
import { encrypt, decrypt } from '../lib/crypto-utils';
import { getFirstLine } from '../lib/fs-utils';
import { ENCRYPTED_FILE_EXT, KEY_FILE_EXT, APP_NAME } from '../lib/constants';

function getEncryptedFiles() {
    return fs
        .readdirSync(RootPath)
        .filter(
            (file) => file.endsWith(ENCRYPTED_FILE_EXT) && !fs.lstatSync(path.resolve(RootPath, file)).isDirectory()
        )
        .map((file) => path.resolve(RootPath, file));
}

async function getKey(encryptedFile: string) {
    const keyFile = encryptedFile.slice(0, encryptedFile.length - ENCRYPTED_FILE_EXT.length) + KEY_FILE_EXT;
    return fs.existsSync(keyFile) ? getFirstLine(keyFile) : Promise.resolve(null);
}

async function decryptFile(encryptedFile: string, key: string) {
    if (!key) return;
    const decryptedContent = decrypt(fs.readFileSync(encryptedFile, 'utf8'), key);
    const secretsFile = encryptedFile.slice(0, encryptedFile.length - ENCRYPTED_FILE_EXT.length);
    let currentContent = null;
    if (fs.existsSync(secretsFile)) {
        currentContent = fs.readFileSync(secretsFile, 'utf-8');
    }
    if (decryptedContent !== currentContent) {
        fs.writeFileSync(secretsFile, decryptedContent);
    }
}

async function runFileDecrypt() {
    const encryptedFiles = getEncryptedFiles();
    for (const file of encryptedFiles) {
        const key = await getKey(file);
        if (key) await decryptFile(file, key);
    }
}

async function encryptNewFile() {
    const fileToEncrypt = path.resolve(RootPath, process.argv[2]);
    if (!fs.existsSync(fileToEncrypt)) {
        console.error(chalk.red(`Cannot find file "${fileToEncrypt}" to encrypt it`));
        return;
    }
    let key = process.argv[3];
    if (!key && fs.existsSync(fileToEncrypt + KEY_FILE_EXT)) {
        // check if .key file already exists
        key = await getFirstLine(fileToEncrypt + KEY_FILE_EXT);
    }
    if (!key || key.length < 8) {
        console.error(chalk.red(`Key must be at least 8 characters long`));
        return;
    }
    const encryptedData = encrypt(fs.readFileSync(fileToEncrypt, 'utf-8'), key);
    fs.writeFileSync(fileToEncrypt + ENCRYPTED_FILE_EXT, encryptedData);
    fs.writeFileSync(fileToEncrypt + KEY_FILE_EXT, key);
    console.info(chalk.blue(`File "${fileToEncrypt}" encrypted successfully`));
}

function showInfo() {
    console.info(
        chalk.blue(
            `run without parameters to decrypt existing files \n(make sure you have a corresponding "${KEY_FILE_EXT}" file for the "${ENCRYPTED_FILE_EXT}" files you want to decrypt)
\nTo encrypt a new file type \`npx ${APP_NAME} encrypt file_to_encrypt key_to_use_for_encryption\`
e.g. npx ${APP_NAME} encrypt .env mySuperSecretKey!`
        )
    );
}

if (process.argv.length === 2) {
    runFileDecrypt(); // no arguments passed
} else if (['?', 'help', '--help'].includes(process.argv[2].toLowerCase())) {
    showInfo();
} else {
    encryptNewFile();
}
