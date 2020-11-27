import { Plugin, IPluginManager } from "../interfaces/Plugin";
import { MessageObject } from "../interfaces/Message";

class Notice implements Plugin {
    constructor(public pluginManager: IPluginManager) {
        pluginManager.addPlugin("NOTICE", (data: MessageObject) =>
            this.onCommand(data)
        );
    }

    onCommand(data: MessageObject) {
        const to = data.params[0] || "";
        const message = data.params[1] || "";

        this.pluginManager.emit("notice", {
            from: data.prefix.split("!")[0],
            to,
            message,
        });
        data.handled = true;
    }
}

export = Notice;
