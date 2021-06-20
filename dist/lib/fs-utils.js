"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFirstLine = void 0;
const tslib_1 = require("tslib");
const readline = require("readline");
const fs = require("fs-extra");
function getFirstLine(pathToFile) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const readable = fs.createReadStream(pathToFile);
        const reader = readline.createInterface({ input: readable });
        const line = yield new Promise((resolve) => {
            reader.on('line', (line) => {
                reader.close();
                resolve(line);
            });
        });
        readable.close();
        return line;
    });
}
exports.getFirstLine = getFirstLine;
//# sourceMappingURL=fs-utils.js.map