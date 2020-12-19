import { Plugin, IPluginManager, PluginResult } from "../interfaces/Plugin";
import { MessageObject } from "../interfaces/Message";
import Debug from "debug";

const debug: Debug.Debugger = Debug("Raptor:Plugin");

class Mode implements Plugin {
    constructor(public pluginManager: IPluginManager) {
        pluginManager.setCommand("MODE", this);
    }

    onCommand(data: MessageObject): PluginResult {
        const [nick, hostname] = data.prefix.split("!");
        const [channel, flag] = data.params;
        debug('mode', nick, hostname, channel, flag);
    }
}

export = Mode;
