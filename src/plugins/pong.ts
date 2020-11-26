import { Plugin, IPluginManager } from "../interfaces/Plugin";
import { MessageObject } from "../interfaces/Message";

class Pong implements Plugin {
    constructor(public pluginManager: IPluginManager) {
        pluginManager.addPlugin("PONG", this.onCommand);
    }

    onCommand = (data: MessageObject): void => {
        this.pluginManager.emit("pong", { payload: data.params[0] });
        data.handled = true;
    }
}

export = Pong;
