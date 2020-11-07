import { Plugin } from "../interfaces/Plugin";
import { EventEmitter } from "events";
import { MessageObject } from "../interfaces/Message";

class Away extends Plugin {
    constructor(eventEmitter: EventEmitter) {
        super(eventEmitter);
        this.eventEmitter.on("message", (data: MessageObject) => {
            if (data.command !== "RPL_AWAY") {
                return;
            }

            this.eventEmitter.emit("away", {
                nick: data.params[1],
                message: data.params[2],
            });
        });
    }
}

export = Away;
