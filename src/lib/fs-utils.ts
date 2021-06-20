import * as readline from 'readline';
import * as fs from 'fs-extra';

export async function getFirstLine(pathToFile: string): Promise<string> {
    const readable = fs.createReadStream(pathToFile);
    const reader = readline.createInterface({ input: readable });
    const line: string = await new Promise((resolve) => {
        reader.on('line', (line) => {
            reader.close();
            resolve(line);
        });
    });
    readable.close();
    return line;
}
