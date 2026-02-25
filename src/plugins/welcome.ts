import type { MessageObject } from '../interfaces/Message.js';
import type { IPluginManager, Plugin, PluginResult } from '../interfaces/Plugin.js';

class Welcome implements Plugin {
    constructor(public pluginManager: IPluginManager) {
        pluginManager.setCommand('RPL_WELCOME', this);
    }

    onCommand(data: MessageObject): PluginResult {
        return {
            eventName: 'welcome',
            payload: data.params[0],
        };
    }
}

export default Welcome;
