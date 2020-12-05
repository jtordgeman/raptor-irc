import { Plugin, IPluginManager, PluginResult } from "../interfaces/Plugin";
import { MessageObject } from "../interfaces/Message";

class Pong implements Plugin {
    constructor(public pluginManager: IPluginManager) {
        pluginManager.setCommand("PONG", this);
    }

    onCommand(data: MessageObject): PluginResult {
        return {
            eventName: "pong",
            payload: data.params[0],
        };
    }
}

export = Pong;
