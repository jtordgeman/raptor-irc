import { Plugin } from "../interfaces/Plugin";
import { EventEmitter } from "events";
import { MessageObject } from "../interfaces/Message";

class Ping extends Plugin {
    constructor(eventEmitter: EventEmitter) {
        super(eventEmitter);
        this.eventEmitter.on("message", (data: MessageObject) => {
            if (data.command !== "PING" && data.command !== "PONG") {
                return;
            }

            console.log("p", data);

            if (data.command === "PONG") {
                this.eventEmitter.emit("pong", data.params[0]);
            }

            if (data.command === "PING") {
                this.eventEmitter.emit("ping", data.params[0]);
            }
        });
    }
}

export = Ping;
