import { RaptorConnectionOptions } from "./interfaces/RaptorOptions";
import { NetworkManager } from "./modules/NetworkManager";
import { PluginManager } from "./modules/PluginManager";
import { EventEmitter } from "events";
import Debug from "debug";
const debug: Debug.Debugger = Debug("Raptor");

type Callback = (...args: any[]) => void;

export class Raptor {
    private networkManager: NetworkManager;
    private pluginManager: PluginManager;
    private eventManager: EventEmitter;
    constructor(private options: RaptorConnectionOptions) {
        this.eventManager = new EventEmitter();
        this.pluginManager = new PluginManager(this.eventManager);
        this.networkManager = new NetworkManager(this.eventManager);

        // register to events
        this.handlePing = this.handlePing.bind(this);
        this.eventManager.on("socketOpen", () => this.registerWithServer());
        this.eventManager.on("ping", (data: any) => this.handlePing(data));
    }

    on(eventName: string, callback: Callback): void {
        this.eventManager.on(eventName, callback);
    }

    private handlePing(data: any): void {
        this.write(`PONG :${data.payload}`);
    }

    private registerWithServer(): void {
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
