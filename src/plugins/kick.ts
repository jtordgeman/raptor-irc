//Raptor:Network Received line: :abuse_!~abuse@176.230.7.244 KICK #badbotsfuntime Raptorr22 :there you go +9s

import { Plugin, IPluginManager, PluginResult } from "../interfaces/Plugin";
import { MessageObject } from "../interfaces/Message";
import Debug from "debug";

const debug: Debug.Debugger = Debug("Raptor:PluginManager");

class Kick implements Plugin {
    constructor(public pluginManager: IPluginManager) {
        pluginManager.setCommand("KICK", this);
    }

    onCommand(data: MessageObject): PluginResult {
        const [nick, hostname] = data.prefix.split("!");
        const [channel, kicked, message] = data.params;
        debug("kick", nick, hostname, channel, kicked, message);
    }
}

export = Kick;
