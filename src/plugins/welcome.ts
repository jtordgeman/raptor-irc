import { Plugin } from "../interfaces/Plugin";
import { EventManager } from "../modules/EventManager";

class Welcome extends Plugin {
    constructor(eventManager: EventManager) {
        super(eventManager);
        this.eventManager.on("message", (data) => {
            console.log("data", data.command);
            if (data.command !== "RPL_WELCOME") {
                return;
            }

            this.eventManager.emit("welcome", data.params[0]);
        });
    }
}

export = Welcome;
