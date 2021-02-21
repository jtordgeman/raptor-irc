import { RaptorConnectionOptions } from './interfaces/RaptorOptions';
import { NetworkManager } from './modules/NetworkManager';
import { PluginManager } from './modules/PluginManager';
import { EventEmitter } from 'events';
import { ChannelOptions } from './interfaces/Channel';
import { Channel } from './modules/Channel';
import Debug from 'debug';
const debug: Debug.Debugger = Debug('Raptor');

type Callback = (...args: any[]) => void;

export class Raptor {
    private networkManager: NetworkManager;
    private pluginManager: PluginManager;
    private eventManager: EventEmitter;
    constructor(private options: RaptorConnectionOptions) {
        debug('Raptor initializing');
        this.eventManager = new EventEmitter();
        this.networkManager = new NetworkManager(this.eventManager);
        this.pluginManager = new PluginManager(this);

        // register to events
        this.eventManager.on('socketOpen', () => this.registerWithServer());
    }

    on(eventName: string, callback: Callback): void {
        this.eventManager.on(eventName, callback);
    }

    private registerWithServer(): void {
        if (this.options.pass) {
            this.write(`PASS ${this.options.pass}`);
        }
        this.write(`NICK ${this.options.nick}`);
        this.write(`USER ${this.options.user} 0 * :${this.options.realName || this.options.nick}`);
    }

    connect(): void {
        this.networkManager.connect(this.options);
    }

    write(line: string): void {
        this.networkManager.write(line);
    }
    emit(eventName: string, payload: any): void {
        this.eventManager.emit(eventName, payload);
    }
    channel(options: ChannelOptions): Channel {
        return new Channel(options, this);
    }
}
