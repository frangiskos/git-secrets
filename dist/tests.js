"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runProcess = void 0;
const tslib_1 = require("tslib");
const child_process_1 = require("child_process");
const app_root_path_1 = require("app-root-path");
const path = require("path");
const fs = require("fs-extra");
const constants_1 = require("./lib/constants");
const chalk = require("chalk");
const secrets = {
    test: 0,
    user: 'admin',
    pass: 'my-secret-pass',
    port: 8080,
};
function runProcess({ command, args, spawnOptions, }) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            args = args !== null && args !== void 0 ? args : [];
            const cmd = child_process_1.spawn(command, args, spawnOptions);
            cmd.on('exit', (exitCode) => {
                if (exitCode === 0) {
                    resolve();
                }
                else {
                    reject(`spawn process exited with code ${exitCode}`);
                }
            });
        }));
    });
}
exports.runProcess = runProcess;
function encryptFile(file, key) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const args = ['index.js', file];
        if (key)
            args.push(key);
        yield runProcess({
            command: 'node',
            args,
            spawnOptions: {
                stdio: ['pipe', process.stdout, process.stderr],
                cwd: path.join(app_root_path_1.path, 'dist', 'bin'),
            },
        });
    });
}
function testDecryption(fileToCheck) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (!fs.existsSync(fileToCheck + constants_1.ENCRYPTED_FILE_EXT))
            throw new Error(`Cannot decrypt ${fileToCheck}. Encrypted file ${fileToCheck + constants_1.ENCRYPTED_FILE_EXT} is missing.`);
        if (!fs.existsSync(fileToCheck + constants_1.KEY_FILE_EXT))
            throw new Error(`Cannot decrypt ${fileToCheck}. Key file ${fileToCheck + constants_1.KEY_FILE_EXT} is missing.`);
        yield runProcess({
            command: 'node',
            args: ['index.js'],
            spawnOptions: {
                stdio: ['pipe', process.stdout, process.stderr],
                cwd: path.join(app_root_path_1.path, 'dist', 'bin'),
            },
        });
        if (!fs.existsSync(fileToCheck))
            throw new Error(`Decrypting ${fileToCheck} failed.`);
        const decryptedData = fs.readFileSync(fileToCheck, 'utf-8');
        if (decryptedData !== JSON.stringify(secrets, undefined, 4)) {
            console.log('decryptedData: ', decryptedData);
            console.log('Secrets data: ', JSON.stringify(secrets, undefined, 4));
            throw new Error(`Encrypted file "${fileToCheck}" is not the same as the decrypted file`);
        }
    });
}
function cleanup(testFilePath) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (fs.existsSync(testFilePath))
            fs.removeSync(testFilePath);
        if (fs.existsSync(testFilePath + constants_1.ENCRYPTED_FILE_EXT))
            fs.removeSync(testFilePath + constants_1.ENCRYPTED_FILE_EXT);
        if (fs.existsSync(testFilePath + constants_1.KEY_FILE_EXT))
            fs.removeSync(testFilePath + constants_1.KEY_FILE_EXT);
    });
}
function main() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const testFile = path.resolve(app_root_path_1.path, constants_1.TEST_FILE);
        yield cleanup(testFile);
        fs.writeFileSync(testFile, JSON.stringify(secrets, undefined, 4));
        secrets.test = 1;
        fs.writeFileSync(testFile, JSON.stringify(secrets, undefined, 4));
        yield encryptFile(constants_1.TEST_FILE, 'my-secret-pass');
        if (fs.existsSync(testFile + constants_1.ENCRYPTED_FILE_EXT) && fs.existsSync(testFile + constants_1.KEY_FILE_EXT)) {
            yield testDecryption(testFile);
            console.info(chalk.yellow(`File "${constants_1.TEST_FILE}" encrypted with parameter key`));
        }
        else {
            console.error(chalk.red(`"${constants_1.TEST_FILE}" file encryption failed`));
            return;
        }
        secrets.test = 2;
        fs.writeFileSync(testFile, JSON.stringify(secrets, undefined, 4));
        yield encryptFile(constants_1.TEST_FILE);
        if (fs.existsSync(testFile + constants_1.ENCRYPTED_FILE_EXT) && fs.existsSync(testFile + constants_1.KEY_FILE_EXT)) {
            yield testDecryption(testFile);
            console.info(chalk.yellow(`File "${constants_1.TEST_FILE}" encrypted with key in .key file`));
        }
        else {
            console.error(chalk.red(`"${constants_1.TEST_FILE}" file encryption failed`));
            return;
        }
        yield cleanup(testFile);
    });
}
main()
    .then(console.log)
    .catch((e) => {
    console.error(chalk.red(`TESTS FAILED !!!`));
    throw new Error(e);
});
//# sourceMappingURL=tests.js.map