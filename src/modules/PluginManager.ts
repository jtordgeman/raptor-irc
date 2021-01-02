import { IPluginManager, Plugin, PluginResult } from "../interfaces/Plugin";
import requireDir from "require-dir";
import { MessageObject } from "../interfaces/Message";
import Debug from "debug";
import { Raptor } from "../Raptor";
const pluginObjects = requireDir("../plugins");

const debug: Debug.Debugger = Debug("Raptor:PluginManager");

interface Plugins {
    [key: string]: Plugin;
}

export class PluginManager implements IPluginManager {
    plugins = {} as Plugins;
    constructor(public raptor: Raptor) {
        Object.entries(pluginObjects).forEach(
            ([_, plugin]) => new plugin(this)
        );
        this.raptor.on("rawMessage", (data: MessageObject) => {
            let pluginResult = {} as PluginResult;
            if (this.plugins[data.command]) {
                pluginResult = this.plugins[data.command].onCommand(data);
                this.raptor.emit(pluginResult.eventName, pluginResult.payload);
            }
            this.raptor.emit("message", {
                raw: data,
                parsed: pluginResult,
            });
        });
    }
    setCommand(command: string, plugin: Plugin): void {
        debug(`registering handler for command: ${command}`);
        this.plugins[command] = plugin;
    }
    write(line: string): void {
        this.raptor.write(line);
    }
}
