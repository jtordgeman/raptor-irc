import { Plugin, IPluginManager, PluginResult } from "../interfaces/Plugin";
import { MessageObject } from "../interfaces/Message";
import Debug from "debug";

const debug: Debug.Debugger = Debug("Raptor:Plugin");

class Away implements Plugin {
    constructor(public pluginManager: IPluginManager) {
        pluginManager.setCommand("RPL_AWAY", this);
    }

    onCommand(data: MessageObject): PluginResult {
        const [nick, message] = data.params;
        debug("away", nick, message);
    }
}

export = Away;
