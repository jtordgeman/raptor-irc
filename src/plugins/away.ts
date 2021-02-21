import { Plugin, IPluginManager, PluginResult } from '../interfaces/Plugin';
import { MessageObject } from '../interfaces/Message';

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

export = Away;
