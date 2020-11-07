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

            console.log("n", data);

            //this.eventEmitter.emit("away", {
            //    nick: data.params[1],
            //    message: data.params[2],
            //});
        });
    }
}

export = Notice;
