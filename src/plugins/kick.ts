//Raptor:Network Received line: :abuse_!~abuse@176.230.7.244 KICK #badbotsfuntime Raptorr22 :there you go +9s

import { Plugin, IPluginManager, PluginResult } from "../interfaces/Plugin";
import { MessageObject } from "../interfaces/Message";

class Kick implements Plugin {
    constructor(public pluginManager: IPluginManager) {
        pluginManager.setCommand("KICK", this);
    }

    onCommand(data: MessageObject): PluginResult {
        const payload = {
            nick: data.prefix.nick,
            hostname: data.prefix.host,
            channel: data.params[0],
            kicked: data.params[1],
            message: data.params[2],
        };

        return {
            eventName: "kick",
            payload,
        };
    }
}

export = Kick;
