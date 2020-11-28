import { Plugin, IPluginManager, PluginResult } from "../interfaces/Plugin";
import { MessageObject } from "../interfaces/Message";

class Notice implements Plugin {
    constructor(public pluginManager: IPluginManager) {
        pluginManager.addCommand("NOTICE", this);
    }

    onCommand(data: MessageObject): PluginResult {
        const [from, hostname] = data.prefix.split("!");
        const payload = {
            from,
            hostname,
            to: data.params[0] || "",
            message: data.params[1] || "",
        };

        return {
            eventName: "notice",
            payload,
        };
    }
}

export = Notice;
