import { MessageObject } from "./Message";

export interface PluginResult {
    eventName: string;
    payload: any;
}

export interface Plugin {
    pluginManager: IPluginManager;
    onCommand(data: MessageObject): PluginResult;
}

export interface IPluginManager {
    setCommand(command: string, plugin: Plugin): void;
    write(line: string): void;
}
