import { Plugin, IPluginManager, PluginResult } from "../interfaces/Plugin";
import { MessageObject } from "../interfaces/Message";
import Debug from "debug";

const debug: Debug.Debugger = Debug("Raptor:Plugin");

class Pong implements Plugin {
    constructor(public pluginManager: IPluginManager) {
        pluginManager.setCommand("PONG", this);
    }

    onCommand(data: MessageObject): PluginResult {
        debug('pong');
    }
}

export = Pong;
