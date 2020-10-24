import { EventEmitter } from "events";
import { RaptorConnectionOptions } from "./interfaces/RaptorOptions";
import { MessageObject } from "./interfaces/Message";
import { SocketManager } from "./modules/SocketManager";
import { PluginManager } from "./modules/PluginManager";

export class Raptor extends EventEmitter {
    private socketManager: SocketManager;
    private pluginManager: PluginManager;
    constructor(private options: RaptorConnectionOptions) {
        super();
        this.socketManager = new SocketManager();
        this.pluginManager = new PluginManager(this);
    }
    private registerWithServer = (): void => {
        if (this.options.pass) {
            this.socketManager.write(`PASS ${this.options.pass}`);
        }
        this.socketManager.write(`NICK ${this.options.nick}`);
        this.socketManager.write(
            `USER ${this.options.user} 0 * :${
                this.options.realName || this.options.nick
            }`
        );
    };

    private handleMessage = (message: MessageObject): void => {
        console.log(message.command);
        this.emit("message", message);
    };

    connect(): void {
        this.socketManager.connect(this.options);

        // register events
        this.socketManager.on("socketOpen", this.registerWithServer);
        this.socketManager.on("message", this.handleMessage);
    }
}
