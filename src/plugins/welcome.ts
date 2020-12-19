import { Plugin, IPluginManager, PluginResult } from "../interfaces/Plugin";
import { MessageObject } from "../interfaces/Message";
import Debug from "debug";

const debug: Debug.Debugger = Debug("Raptor:Plugin");

class Welcome implements Plugin {
    constructor(public pluginManager: IPluginManager) {
        pluginManager.setCommand("RPL_WELCOME", this);
    }

    onCommand(data: MessageObject): PluginResult {
        debug("welcome");
    }
}

export = Welcome;
