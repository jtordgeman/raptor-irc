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

            //this.eventEmitter.emit("notice", {
            //    nick: data.prefix.split("!")[0],
            //    message: data.params.join(" ")
            //});
        });
    }
}

export = Notice;
