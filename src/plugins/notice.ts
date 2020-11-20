import { Plugin } from "../interfaces/Plugin";
import { EventEmitter } from "events";
import { MessageObject } from "../interfaces/Message";

class Notice extends Plugin {
    constructor(eventEmitter: EventEmitter) {
        super(eventEmitter);
        this.eventEmitter.on("message", (data: MessageObject) => {
            if (data.command !== "NOTICE") {
                return;
            }

            let [to, message] = ["", ""];
            if (data.params.length >= 2) {
                to = data.params[0];
                message = data.params[1];
            }

            this.eventEmitter.emit("notice", {
                from: data.prefix.split("!")[0],
                to,
                message,
            });
        });
    }
}

export = Notice;
