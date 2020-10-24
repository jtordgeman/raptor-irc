import { Plugin } from "../interfaces/Plugin";
import { Raptor } from "../Raptor";

class Welcome implements Plugin {
    constructor(private raptor: Raptor) {
        this.raptor.on("message", (data) => {
            if (data.command !== "RPL_WELCOME") {
                return;
            }

            this.raptor.emit('welcome', data.params[0]);
        });
    }
}

export = Welcome;
