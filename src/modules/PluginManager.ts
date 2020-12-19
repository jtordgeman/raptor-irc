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
            const cmd = this.plugins[data.command]
            if (cmd) {
                cmd.onCommand(data);
                this.raptor.emit("COMMAND_"+data.command, data);
            }
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
