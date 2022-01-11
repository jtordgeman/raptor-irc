import { RaptorConnectionOptions } from './interfaces/RaptorOptions';
import { NetworkManager } from './modules/NetworkManager';
import { PluginManager } from './modules/PluginManager';
import { EventEmitter } from 'events';
import { ChannelOptions } from './interfaces/Channel';
import { Channel } from './modules/Channel';
import Debug from 'debug';
import { PrivMsgObj } from './interfaces/Message';
import { Callback } from './types/Callback';
const debug: Debug.Debugger = Debug('Raptor');

export class Raptor {
    private networkManager: NetworkManager;
    private pluginManager: PluginManager;
    private eeMessage: EventEmitter;
    private eeChannel: EventEmitter;
    private channels: Channel[];

    //private messageEventManager: EventEmitter;
    constructor(private options: RaptorConnectionOptions) {
        debug('Raptor initializing');
        this.eeMessage = new EventEmitter();
        this.eeChannel = new EventEmitter();
        this.networkManager = new NetworkManager(this.eeMessage);
        this.pluginManager = new PluginManager(this);
        this.channels = [];

        // register to events
        this.eeMessage.on('socketOpen', () => this.registerWithServer());
        this.eeMessage.on('privmsg', (privMsgObj: PrivMsgObj) => this.onPrivMsg(privMsgObj));
    }

    onPrivMsg(privMsgObj: PrivMsgObj) :void {
        const channel = this.channels.find((c) => c.name === privMsgObj.target);
        if (channel && channel.blowfish) {
            const text = channel.blowfish.decrypt(privMsgObj.message);
            Object.assign(privMsgObj, { message: text });
        }

        this.eeChannel.emit('privmsg', privMsgObj);
    }

    on(eventName: string, callback: Callback): void {
        this.eeMessage.on(eventName, callback);
    }

    onChannel(eventName: string, callback: Callback): void {
        this.eeChannel.on(eventName, callback);
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
        this.eeMessage.emit(eventName, payload);
    }
    channel(options: ChannelOptions): Channel {
        const channel = new Channel(options, this);
        this.channels.push(channel);
        return channel;
    }
}
