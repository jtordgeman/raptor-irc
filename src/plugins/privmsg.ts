import type { MessageObject } from '../interfaces/Message.js';
import type { IPluginManager, Plugin, PluginResult } from '../interfaces/Plugin.js';

class PrivMsg implements Plugin {
    constructor(public pluginManager: IPluginManager) {
        pluginManager.setCommand('PRIVMSG', this);
    }

    onCommand(data: MessageObject): PluginResult {
        const message = data.params[1] || '';
        if (message.startsWith('+OK')) {
            //TODO: add fish key on raptor and compare
        }
        const payload = {
            from: data.prefix.nick || data.prefix.host,
            hostname: data.prefix.host,
            target: data.params[0],
            message,
        };

        return {
            eventName: 'privmsg',
            payload,
        };
    }
}

export default PrivMsg;
