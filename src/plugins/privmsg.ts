import { Plugin, IPluginManager, PluginResult } from '../interfaces/Plugin';
import { MessageObject } from '../interfaces/Message';

class PrivMsg implements Plugin {
    constructor(public pluginManager: IPluginManager) {
        pluginManager.setCommand('PRIVMSG', this);
    }

    onCommand(data: MessageObject): PluginResult {
        const message = data.params[1];
        if (message.startsWith('+OK')) {
            //TODO: add fish key on raptor and compare
        }
        const payload = {
            from: data.prefix.nick,
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

export = PrivMsg;
