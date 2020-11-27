import { Plugin, IPluginManager } from "../interfaces/Plugin";
import { MessageObject } from "../interfaces/Message";

class Welcome implements Plugin {
    constructor(public pluginManager: IPluginManager) {
        pluginManager.addPlugin("RPL_WELCOME", (data: MessageObject) =>
            this.onCommand(data)
        );
    }

    onCommand(data: MessageObject): void {
        this.pluginManager.emit("welcome", { payload: data.params[0] });
    }
}

export = Welcome;
