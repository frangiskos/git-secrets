/**
 * Test coverage:
 * Encrypting new file
 * Updating existing encrypted file
 * Decrypting a file using a .key file
 */

import { spawn, SpawnOptions } from 'child_process';
import { path as RootPath } from 'app-root-path';
import * as path from 'path';
import * as fs from 'fs-extra';
import { ENCRYPTED_FILE_EXT, KEY_FILE_EXT, TEST_FILE } from './constants';
import chalk = require('chalk');

const secrets = {
    test: 0,
    user: 'admin',
    pass: 'my-secret-pass',
    port: 8080,
};

export async function runProcess({
    command,
    args,
    spawnOptions,
}: {
    command: string;
    args?: string[];
    spawnOptions: SpawnOptions;
}): Promise<void> {
    return new Promise(async (resolve, reject) => {
        args = args ?? [];

        const cmd = spawn(command, args, spawnOptions);

        cmd.on('exit', (exitCode) => {
            if (exitCode === 0) {
                resolve();
            } else {
                reject(`spawn process exited with code ${exitCode}`);
            }
        });
    });
}

async function encryptFile(file: string, key?: string) {
    const args = ['index.js', file];
    if (key) args.push(key);

    await runProcess({
        command: 'node',
        args,
        spawnOptions: {
            stdio: ['pipe', process.stdout, process.stderr],
            cwd: path.join(RootPath, 'dist'),
        },
    });
}

async function testDecryption(fileToCheck: string) {
    if (!fs.existsSync(fileToCheck + ENCRYPTED_FILE_EXT))
        throw new Error(
            `Cannot decrypt ${fileToCheck}. Encrypted file ${fileToCheck + ENCRYPTED_FILE_EXT} is missing.`
        );
    if (!fs.existsSync(fileToCheck + KEY_FILE_EXT))
        throw new Error(`Cannot decrypt ${fileToCheck}. Key file ${fileToCheck + KEY_FILE_EXT} is missing.`);

    await runProcess({
        command: 'node',
        args: ['index.js'],
        spawnOptions: {
            stdio: ['pipe', process.stdout, process.stderr],
            cwd: path.join(RootPath, 'dist'),
        },
    });

    if (!fs.existsSync(fileToCheck)) throw new Error(`Decrypting ${fileToCheck} failed.`);

    const decryptedData = fs.readFileSync(fileToCheck, 'utf-8');

    if (decryptedData !== JSON.stringify(secrets, undefined, 4)) {
        console.log('decryptedData: ', decryptedData);
        console.log('Secrets data: ', JSON.stringify(secrets, undefined, 4));
        throw new Error(`Encrypted file "${fileToCheck}" is not the same as the decrypted file`);
    }
}

async function cleanup(testFilePath: string) {
    if (fs.existsSync(testFilePath)) fs.removeSync(testFilePath);
    if (fs.existsSync(testFilePath + ENCRYPTED_FILE_EXT)) fs.removeSync(testFilePath + ENCRYPTED_FILE_EXT);
    if (fs.existsSync(testFilePath + KEY_FILE_EXT)) fs.removeSync(testFilePath + KEY_FILE_EXT);
}

async function main() {
    const testFile = path.resolve(RootPath, TEST_FILE);
    await cleanup(testFile); // just in case we have any files left from previous tests
    fs.writeFileSync(testFile, JSON.stringify(secrets, undefined, 4));

    // TEST 1
    secrets.test = 1;
    fs.writeFileSync(testFile, JSON.stringify(secrets, undefined, 4));
    await encryptFile(TEST_FILE, 'my-secret-pass');
    if (fs.existsSync(testFile + ENCRYPTED_FILE_EXT) && fs.existsSync(testFile + KEY_FILE_EXT)) {
        await testDecryption(testFile); // Test decrypting the file
        console.info(chalk.yellow(`File "${TEST_FILE}" encrypted with parameter key`));
    } else {
        console.error(chalk.red(`"${TEST_FILE}" file encryption failed`));
        return;
    }

    // TEST 2
    // Test file encryption with key from file
    secrets.test = 2;
    fs.writeFileSync(testFile, JSON.stringify(secrets, undefined, 4));
    await encryptFile(TEST_FILE);
    if (fs.existsSync(testFile + ENCRYPTED_FILE_EXT) && fs.existsSync(testFile + KEY_FILE_EXT)) {
        await testDecryption(testFile); // Test decrypting the file
        console.info(chalk.yellow(`File "${TEST_FILE}" encrypted with key in .key file`));
    } else {
        console.error(chalk.red(`"${TEST_FILE}" file encryption failed`));
        return;
    }

    // CLEANUP
    await cleanup(testFile);
}

main()
    .then(console.log)
    .catch((e) => {
        console.error(chalk.red(`TESTS FAILED !!!`));
        throw new Error(e);
    });
