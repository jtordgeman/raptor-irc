import { IPluginManager, Plugin } from "../interfaces/Plugin";
import requireDir from "require-dir";
import { EventEmitter } from "events";
import { MessageObject } from "../interfaces/Message";
import Debug from "debug";
const pluginObjects = requireDir("../plugins");

const debug:Debug.Debugger = Debug("Raptor:PluginManager");
type Callback = (...args: any[]) => void;

interface Plugins {
    [key: string]: Callback[];
}

export class PluginManager implements IPluginManager {
    plugins = {} as Plugins;
    constructor(public eventEmitter: EventEmitter) {
        Object.entries(pluginObjects).forEach(
            ([_, plugin]) => new plugin(this)
        );
        this.eventEmitter.on("rawMessage", (data: MessageObject) => {
            this.plugins[data.command] &&
                this.plugins[data.command].some((c) => {
                    c(data);
                    if (data.handled) {
                        return true;
                    }
                });
        });
    }
    addPlugin(command: string, callback: Callback): void {
        const subscribers =
            this.plugins[command] || (this.plugins[command] = []);
        subscribers.push(callback);
    }
    emit(eventName: string, payload: object): void {
        this.eventEmitter.emit(eventName, payload);
    }
}
