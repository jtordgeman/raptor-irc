import type { MessageObject } from '../interfaces/Message.js';
import type { IPluginManager, Plugin, PluginResult } from '../interfaces/Plugin.js';

class Pong implements Plugin {
    constructor(public pluginManager: IPluginManager) {
        pluginManager.setCommand('PONG', this);
    }

    onCommand(data: MessageObject): PluginResult {
        return {
            eventName: 'pong',
            payload: data.params[0],
        };
    }
}

export default Pong;
