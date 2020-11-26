import { Plugin, IPluginManager } from "../interfaces/Plugin";
import { MessageObject } from "../interfaces/Message";

class Away implements Plugin {
    constructor(public pluginManager: IPluginManager) {
        pluginManager.addPlugin("RPL_AWAY", this.onCommand);
    }

    onCommand = (data: MessageObject): void => {
        const awayResponse = {
            nick: data.params[1],
            message: data.params[2],
        };
        this.pluginManager.emit("away", awayResponse);
        data.handled = true;
    }
}

export = Away;
