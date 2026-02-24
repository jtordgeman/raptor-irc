import type { MessageObject } from '../interfaces/Message.js';
import type { IPluginManager, Plugin, PluginResult } from '../interfaces/Plugin.js';

class Part implements Plugin {
    constructor(public pluginManager: IPluginManager) {
        pluginManager.setCommand('PART', this);
    }

    onCommand(data: MessageObject): PluginResult {
        const payload = {
            nick: data.prefix.nick,
            hostname: data.prefix.host,
            channel: data.params[0],
        };

        return {
            eventName: 'part',
            payload,
        };
    }
}

export default Part;
