import type { MessageObject } from '../interfaces/Message.js';
import type { IPluginManager, Plugin, PluginResult } from '../interfaces/Plugin.js';

class Ping implements Plugin {
    constructor(public pluginManager: IPluginManager) {
        pluginManager.setCommand('PING', this);
    }

    onCommand(data: MessageObject): PluginResult {
        const payload = data.params[0];
        this.pluginManager.write(`PONG :${payload}`);

        return {
            eventName: 'ping',
            payload,
        };
    }
}

export default Ping;
