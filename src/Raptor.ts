import { RaptorConnectionOptions } from "./interfaces/RaptorOptions";
import { NetworkManager } from "./modules/NetworkManager";
import { PluginManager } from "./modules/PluginManager";
import { EventEmitter } from "events";
import Debug from "debug";

type Callback = (...args: any[]) => void;

export class Raptor {
    private networkManager: NetworkManager;
    private pluginManager: PluginManager;
    private eventManager: EventEmitter;
    private debug: Debug.Debugger;
    constructor(private options: RaptorConnectionOptions) {
        this.debug = Debug("Raptor");

        this.eventManager = new EventEmitter();
        this.pluginManager = new PluginManager(this.eventManager);
        this.networkManager = new NetworkManager(this.eventManager);

        // register to events
        this.registerWithServer = this.registerWithServer.bind(this);
        this.handlePing = this.handlePing.bind(this);
        this.eventManager.on("socketOpen", this.registerWithServer);
        this.eventManager.on("ping", this.handlePing);
    }

    on(eventName: string, callback: Callback): void {
        this.eventManager.on(eventName, callback);
    }

    private handlePing(data: string): void {
        this.debug("yay pong");
        this.write(`PONG :${data}`);
    }

    registerWithServer(): void {
        if (this.options.pass) {
            this.write(`PASS ${this.options.pass}`);
        }
        this.write(`NICK ${this.options.nick}`);
        this.write(
            `USER ${this.options.user} 0 * :${
                this.options.realName || this.options.nick
            }`
        );
    }

    connect(): void {
        this.networkManager.connect(this.options);
    }

    write(line: string): void {
        this.networkManager.write(line);
    }
}
