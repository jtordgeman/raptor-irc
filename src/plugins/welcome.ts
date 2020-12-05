import { Plugin, IPluginManager, PluginResult } from "../interfaces/Plugin";
import { MessageObject } from "../interfaces/Message";

class Welcome implements Plugin {
    constructor(public pluginManager: IPluginManager) {
        pluginManager.setCommand("RPL_WELCOME", this);
    }

    onCommand(data: MessageObject): PluginResult {
        return {
            eventName: "welcome",
            payload: data.params[0],
        };
    }
}

export = Welcome;
