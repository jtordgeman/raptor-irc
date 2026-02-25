import { EventEmitter } from 'node:events';
import Debug from 'debug';
import type { ChannelOptions } from './interfaces/Channel.js';
import type { PrivMsgObj } from './interfaces/Message.js';
import type { RaptorConnectionOptions } from './interfaces/RaptorOptions.js';
import { Channel } from './modules/Channel.js';
import { NetworkManager } from './modules/NetworkManager.js';
import { PluginManager } from './modules/PluginManager.js';
import type { Callback } from './types/Callback.js';

const debug: Debug.Debugger = Debug('Raptor');

const DEFAULT_RECONNECT_DELAY = 5_000;
const DEFAULT_RECONNECT_MAX_RETRIES = 10;
const DEFAULT_PING_TIMEOUT = 240_000; // 4 minutes
const MAX_RECONNECT_DELAY = 60_000;

export class Raptor {
    private networkManager: NetworkManager;
    private pluginManager: PluginManager;
    private eeMessage: EventEmitter;
    private channels: Channel[];
    private reconnectAttempts = 0;
    private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    private pingWatchdog: ReturnType<typeof setTimeout> | null = null;
    private isReconnecting = false;

    constructor(private options: RaptorConnectionOptions) {
        debug('Raptor initializing');
        this.eeMessage = new EventEmitter();
        this.networkManager = new NetworkManager(this.eeMessage);
        this.pluginManager = new PluginManager(this);
        this.channels = [];

        // register to events
        this.eeMessage.on('socketOpen', () => this.onSocketOpen());
        this.eeMessage.on('socketClose', (info: { error: string; intentional: boolean }) => this.onSocketClose(info));
        this.eeMessage.on('privmsg', (privMsgObj: PrivMsgObj) => this.onPrivMsg(privMsgObj));
        this.eeMessage.on('ping', () => this.resetPingWatchdog());
        this.eeMessage.on('welcome', () => this.onWelcome());
    }

    async init(): Promise<void> {
        await this.pluginManager.loadPlugins();
    }

    private onSocketOpen(): void {
        this.registerWithServer();

        if (this.isReconnecting) {
            debug(`Reconnected after ${this.reconnectAttempts} attempt(s)`);
            this.eeMessage.emit('reconnected');
        }
        this.reconnectAttempts = 0;
    }

    private onWelcome(): void {
        if (this.isReconnecting && this.channels.length > 0) {
            this.channels.forEach((ch) => {
                debug(`Auto-rejoining channel ${ch.name}`);
                ch.join();
            });
        }
        this.isReconnecting = false;
        this.resetPingWatchdog();
    }

    private onSocketClose(info: { error: string; intentional: boolean }): void {
        this.clearPingWatchdog();

        if (info.intentional) {
            debug('Intentional disconnect, not reconnecting');
            return;
        }

        const reconnect = this.options.reconnect ?? true;
        if (!reconnect) {
            debug('Reconnect disabled');
            return;
        }

        const maxRetries = this.options.reconnectMaxRetries ?? DEFAULT_RECONNECT_MAX_RETRIES;
        if (this.reconnectAttempts >= maxRetries) {
            debug(`Max reconnect attempts (${maxRetries}) reached`);
            this.isReconnecting = false;
            this.eeMessage.emit('reconnectFailed');
            return;
        }

        this.scheduleReconnect();
    }

    private scheduleReconnect(): void {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
        }
        const baseDelay = this.options.reconnectDelay ?? DEFAULT_RECONNECT_DELAY;
        const delay = Math.min(baseDelay * 2 ** this.reconnectAttempts, MAX_RECONNECT_DELAY);
        this.reconnectAttempts++;
        this.isReconnecting = true;

        debug(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
        this.eeMessage.emit('reconnecting', { attempt: this.reconnectAttempts, delay });

        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this.connect();
        }, delay);
    }

    private resetPingWatchdog(): void {
        this.clearPingWatchdog();
        const timeout = this.options.pingTimeout ?? DEFAULT_PING_TIMEOUT;
        this.pingWatchdog = setTimeout(() => {
            debug('Ping watchdog timeout — no PING received, forcing disconnect');
            this.networkManager.forceClose();
        }, timeout);
    }

    private clearPingWatchdog(): void {
        if (this.pingWatchdog) {
            clearTimeout(this.pingWatchdog);
            this.pingWatchdog = null;
        }
    }

    onPrivMsg(privMsgObj: PrivMsgObj): void {
        const channel = this.channels.find((c) => c.name.toLowerCase() === privMsgObj.target.toLowerCase());
        if (channel) {
            if (channel.blowfish) {
                try {
                    const text = channel.blowfish.decrypt(privMsgObj.message);
                    Object.assign(privMsgObj, { message: text });
                } catch (err) {
                    debug('Decryption failed:', err);
                }
            }
            channel.emitter.emit('privmsg', privMsgObj);
        }
    }

    on(eventName: string, callback: Callback): void {
        this.eeMessage.on(eventName, callback);
    }

    onChannel(name: string, eventName: string, callback: Callback): void {
        const channel = this.channels.find((c) => c.name.toLowerCase() === name.toLowerCase());
        if (channel) {
            channel.emitter.on(eventName, callback);
        }
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

    disconnect(): void {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        this.clearPingWatchdog();
        this.isReconnecting = false;
        this.networkManager.disconnect();
    }

    write(line: string): void {
        this.networkManager.write(line);
    }

    emit(eventName: string, payload: unknown): void {
        this.eeMessage.emit(eventName, payload);
    }

    channel(options: ChannelOptions): Channel {
        const channel = new Channel(options, this);
        this.channels.push(channel);
        return channel;
    }
}
