import { RaptorConnectionOptions } from "./interfaces/RaptorOptions";
import { NetworkManager } from "./modules/NetworkManager";
import { PluginManager } from "./modules/PluginManager";
import { EventEmitter } from "events";

type Callback = (...args: any[]) => void;

export class Raptor {
    private networkManager: NetworkManager;
    private pluginManager: PluginManager;
    private eventManager: EventEmitter;
    constructor(private options: RaptorConnectionOptions) {
        this.eventManager = new EventEmitter();
        this.pluginManager = new PluginManager(this.eventManager);
        this.networkManager = new NetworkManager(this.eventManager);
    }

    on(eventName: string, callback: Callback): void {
        this.eventManager.on(eventName, callback);
    }

    private registerWithServer = (): void => {
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
    }

    write(line: string): void {
        this.networkManager.write(line);
    }
}
