import { RaptorConnectionOptions } from "./interfaces/RaptorOptions";
import { MessageObject } from "./interfaces/Message";
import { NetworkManager } from "./modules/NetworkManager";
import { PluginManager } from "./modules/PluginManager";
import { EventManager } from "./modules/EventManager";

export class Raptor {
    private networkManager: NetworkManager;
    private pluginManager: PluginManager;
    private eventManager: EventManager;
    constructor(private options: RaptorConnectionOptions) {
        this.eventManager = new EventManager();
        this.pluginManager = new PluginManager(this.eventManager);
        this.networkManager = new NetworkManager(this.eventManager);
    }

    get on() {
        console.log("reached on!");
        return this.eventManager.on;
    }

    private registerWithServer = (): void => {
        console.log("reached registerWithServer");
        if (this.options.pass) {
            this.networkManager.write(`PASS ${this.options.pass}`);
        }
        this.networkManager.write(`NICK ${this.options.nick}`);
        this.networkManager.write(
            `USER ${this.options.user} 0 * :${
                this.options.realName || this.options.nick
            }`
        );
    };

    connect(): void {
        this.networkManager.connect(this.options);

        // register events
        this.eventManager.on("socketOpen", this.registerWithServer);
        //this.eventManager.on("welcome", () => console.log("got welcome"));
        //this.eventManager.on("message", (d) => console.log(d));
    }
}
