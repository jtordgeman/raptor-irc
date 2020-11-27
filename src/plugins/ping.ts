import { Plugin, IPluginManager } from "../interfaces/Plugin";
import { MessageObject } from "../interfaces/Message";

class Ping implements Plugin {
    constructor(public pluginManager: IPluginManager) {
        pluginManager.addPlugin("PING", (data: MessageObject) =>
            this.onCommand(data)
        );
    }

    onCommand(data: MessageObject): void {
        this.pluginManager.emit("ping", { payload: data.params[0] });
        data.handled = true;
    }
}

export = Ping;
