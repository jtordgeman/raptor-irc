import { Plugin, IPluginManager, PluginResult } from "../interfaces/Plugin";
import { MessageObject } from "../interfaces/Message";

class Join implements Plugin {
    constructor(public pluginManager: IPluginManager) {
        pluginManager.setCommand("JOIN", this);
    }

    onCommand(data: MessageObject): PluginResult {
        const [nick, hostname] = data.prefix.split("!");
        const payload = {
            nick,
            hostname,
            channel: data.params[0],
        };

        return {
            eventName: "join",
            payload,
        };
    }
}

export = Join;
