import { Plugin, IPluginManager, PluginResult } from "../interfaces/Plugin";
import { MessageObject } from "../interfaces/Message";

class Mode implements Plugin {
    constructor(public pluginManager: IPluginManager) {
        pluginManager.setCommand("MODE", this);
    }

    onCommand(data: MessageObject): PluginResult {
        const payload = {
            nick: data.prefix.nick || data.prefix.host,
            hostname: data.prefix.host,
            channel: data.params[0],
            flag: data.params[1] || "",
            payload: data.params.length > 2 ? data.params.slice(2) : "",
        };

        return {
            eventName: "mode",
            payload,
        };
    }
}

export = Mode;
