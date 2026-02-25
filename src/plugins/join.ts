import type { MessageObject } from '../interfaces/Message.js';
import type { IPluginManager, Plugin, PluginResult } from '../interfaces/Plugin.js';

class Join implements Plugin {
    constructor(public pluginManager: IPluginManager) {
        pluginManager.setCommand('JOIN', this);
    }

    onCommand(data: MessageObject): PluginResult {
        const payload = {
            nick: data.prefix.nick,
            hostname: data.prefix.host,
            channel: data.params[0],
        };

        return {
            eventName: 'join',
            payload,
        };
    }
}

export default Join;
