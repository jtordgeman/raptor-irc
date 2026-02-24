import type { MessageObject } from './Message.js';

export interface PluginResult {
    eventName: string;
    payload: unknown;
}

export interface Plugin {
    onCommand(data: MessageObject): PluginResult;
}

export interface IPluginManager {
    setCommand(command: string, plugin: Plugin): void;
    write(line: string): void;
}
