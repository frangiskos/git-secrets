/// <reference types="node" />
import { SpawnOptions } from 'child_process';
export declare function runProcess({ command, args, spawnOptions, }: {
    command: string;
    args?: string[];
    spawnOptions: SpawnOptions;
}): Promise<void>;
