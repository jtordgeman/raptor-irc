import { Plugin, IPluginManager, PluginResult } from '../interfaces/Plugin';
import { MessageObject } from '../interfaces/Message';

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

export = Notice;
