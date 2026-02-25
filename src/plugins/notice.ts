import type { MessageObject } from '../interfaces/Message.js';
import type { IPluginManager, Plugin, PluginResult } from '../interfaces/Plugin.js';

class Notice implements Plugin {
    constructor(public pluginManager: IPluginManager) {
        pluginManager.setCommand('NOTICE', this);
    }

    onCommand(data: MessageObject): PluginResult {
        const payload = {
            from: data.prefix.nick || data.prefix.host,
            hostname: data.prefix.host,
            to: data.params[0] || '',
            message: data.params[1] || '',
        };

        return {
            eventName: 'notice',
            payload,
        };
    }
}

export default Notice;
