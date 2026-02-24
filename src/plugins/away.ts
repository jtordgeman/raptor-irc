import type { MessageObject } from '../interfaces/Message.js';
import type { IPluginManager, Plugin, PluginResult } from '../interfaces/Plugin.js';

class Away implements Plugin {
    constructor(public pluginManager: IPluginManager) {
        pluginManager.setCommand('RPL_AWAY', this);
    }

    onCommand(data: MessageObject): PluginResult {
        const payload = {
            nick: data.params[1],
            message: data.params[2],
        };
        return {
            eventName: 'away',
            payload,
        };
    }
}

export default Away;
