import { Plugin, IPluginManager, PluginResult } from "../interfaces/Plugin";
import { MessageObject } from "../interfaces/Message";
import Debug from "debug";

const debug: Debug.Debugger = Debug("Raptor:Plugin");

class Part implements Plugin {
    constructor(public pluginManager: IPluginManager) {
        pluginManager.setCommand("PART", this);
    }

    onCommand(data: MessageObject): PluginResult {
        const [nick, hostname] = data.prefix.split("!");
        const channel = data.params[0];
        debug('part', nick, hostname, channel);
    }
}

export = Part;
