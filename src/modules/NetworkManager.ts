import type { EventEmitter } from 'node:events';
import net from 'node:net';
import tls from 'node:tls';
import Debug from 'debug';
import ircReplies from 'irc-replies' with { type: 'json' };
import type { MessageObject, MessagePrefix } from '../interfaces/Message.js';
import type { RaptorConnectionOptions } from '../interfaces/RaptorOptions.js';

const debug: Debug.Debugger = Debug('Raptor:Network');

const DEFAULT_SOCKET_TIMEOUT = 300_000; // 5 minutes

export class NetworkManager {
    private socket: tls.TLSSocket | net.Socket | null = null;
    private socketError = '';
    private readonly eventEmitter: EventEmitter;
    private replies: Record<string, string>;
    private intentionalDisconnect = false;

    constructor(eventEmitter: EventEmitter) {
        this.replies = ircReplies;
        this.eventEmitter = eventEmitter;
    }

    private handlePrefix(prefix: string): MessagePrefix {
        const result = {} as MessagePrefix;
        if (!prefix) {
            return result;
        }

        result.raw = prefix;

        const userIndication = prefix.indexOf('!');
        if (userIndication > 0) {
            result.isServer = false;
            result.nick = prefix.slice(0, userIndication);
            const hostIndication = prefix.indexOf('@', userIndication);
            if (hostIndication > 0) {
                result.user = prefix.slice(userIndication + 1, hostIndication);
                result.host = prefix.slice(hostIndication + 1);
            }
        } else {
            result.isServer = true;
            result.host = prefix;
        }

        return result;
    }

    private handleLine(line: string): MessageObject | null {
        debug(`Received line: ${line}`);
        let prefix = {} as MessagePrefix;
        let params: string[] = [];

        const messageArray: string[] = line.split(' ');
        if (messageArray.length >= 2) {
            if (messageArray[0].startsWith(':')) {
                prefix = this.handlePrefix(messageArray.splice(0, 1)[0].trim().substring(1));
            }
            const command = messageArray.splice(0, 1)[0].trim();
            const parsedCommand = this.replies[command] || command;
            const paramMessageIndex = messageArray.findIndex((m) => m.startsWith(':'));
            if (paramMessageIndex === -1) {
                // No trailing parameter — all remaining tokens are simple params
                params = messageArray;
            } else {
                params = messageArray.slice(0, paramMessageIndex);
                let payload = messageArray.slice(paramMessageIndex).join(' ');
                if (payload.startsWith(':')) {
                    payload = payload.substring(1);
                }
                params.push(payload);
            }
            return {
                prefix,
                command: parsedCommand,
                params,
            };
        }
        return null;
    }

    private onSocketConnected = (): void => {
        this.eventEmitter.emit('socketOpen');
    };

    private onSocketClose = (): void => {
        this.eventEmitter.emit('socketClose', {
            error: this.socketError,
            intentional: this.intentionalDisconnect,
        });
    };

    private onSocketError = (err: Error): void => {
        debug('Socket error: ', err);
        this.socketError = err.message;
    };

    private onSocketTimeout = (): void => {
        debug('Socket timeout');
        this.destroySocket();
        this.eventEmitter.emit('socketClose', {
            error: 'Socket timeout',
            intentional: false,
        });
    };

    private onSocketData = (data: Buffer): void => {
        data.toString()
            .split('\r\n')
            .filter((l: string) => l !== '')
            .forEach((l: string) => {
                const trimmed: string = l.trim();
                const messageObject = this.handleLine(trimmed);
                if (messageObject) {
                    this.eventEmitter.emit('rawMessage', messageObject);
                }
            });
    };

    private destroySocket = (): void => {
        if (!this.socket) {
            debug('No socket found');
            return;
        }
        this.socket.removeAllListeners();
        this.socket.destroy();
        this.socket = null;
    };

    connect(options: RaptorConnectionOptions): void {
        this.intentionalDisconnect = false;
        this.socketError = '';

        // Clean up any existing socket before reconnecting
        if (this.socket) {
            this.socket.removeAllListeners();
            this.socket.destroy();
            this.socket = null;
        }

        let socketConnectEvent = 'connect';
        if (options.ssl) {
            const creds = { rejectUnauthorized: !options.selfSigned };
            this.socket = tls.connect(options.port, options.host, creds);
            socketConnectEvent = 'secureConnect';
        } else {
            this.socket = net.connect(options.port, options.host);
        }
        this.socket.setEncoding('utf8');
        const socketTimeout = options.socketTimeout ?? DEFAULT_SOCKET_TIMEOUT;
        if (socketTimeout > 0) {
            this.socket.setTimeout(socketTimeout);
        }

        // register events
        this.socket.on(socketConnectEvent, this.onSocketConnected);
        this.socket.on('data', this.onSocketData);
        this.socket.on('close', this.onSocketClose);
        this.socket.on('error', this.onSocketError);
        this.socket.on('timeout', this.onSocketTimeout);
    }

    disconnect(): void {
        this.intentionalDisconnect = true;
        this.destroySocket();
    }

    forceClose(): void {
        this.destroySocket();
        this.eventEmitter.emit('socketClose', {
            error: this.socketError,
            intentional: false,
        });
    }

    write(line: string): void {
        if (!this.socket) {
            debug('Socket is not connected');
            return;
        }
        this.socket.write(`${line}\r\n`);
    }
}
