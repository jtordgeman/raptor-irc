import { Plugin, IPluginManager, PluginResult } from "../interfaces/Plugin";
import { MessageObject } from "../interfaces/Message";

class Ping implements Plugin {
    constructor(public pluginManager: IPluginManager) {
        pluginManager.addCommand("PING", this);
    }

    onCommand(data: MessageObject): PluginResult {
        const payload = data.params[0];

        console.log("reached ping with payload:", payload);
        this.pluginManager.write(`PONG :${payload}`);

        return {
            eventName: "ping",
            payload,
        };
    }
}

export = Ping;
