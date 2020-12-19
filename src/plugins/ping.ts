import { Plugin, IPluginManager, PluginResult } from "../interfaces/Plugin";
import { MessageObject } from "../interfaces/Message";
import Debug from "debug";

const debug: Debug.Debugger = Debug("Raptor:Plugin");

class Ping implements Plugin {
    constructor(public pluginManager: IPluginManager) {
        pluginManager.setCommand("PING", this);
    }

    onCommand(data: MessageObject): PluginResult {
        const payload = data.params[0];
        this.pluginManager.write(`PONG :${payload}`);
        debug('ping', payload);
    }
}

export = Ping;
