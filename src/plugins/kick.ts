import type { MessageObject } from '../interfaces/Message.js';
import type { IPluginManager, Plugin, PluginResult } from '../interfaces/Plugin.js';

class Kick implements Plugin {
    constructor(public pluginManager: IPluginManager) {
        pluginManager.setCommand('KICK', this);
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
            eventName: 'kick',
            payload,
        };
    }
}

export default Kick;
