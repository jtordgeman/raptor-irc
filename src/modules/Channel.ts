import { EventEmitter } from 'node:events';
import Debug from 'debug';
import type { ChannelInterface, ChannelOptions } from '../interfaces/Channel.js';
import type { Raptor } from '../Raptor.js';
import type { Callback } from '../types/Callback.js';
import { Blowfish } from './Blowfish.js';

const debug: Debug.Debugger = Debug('Raptor:Channel');

export class Channel implements ChannelInterface {
    name: string;
    blowfish?: Blowfish;
    emitter: EventEmitter;
    constructor(
        private options: ChannelOptions,
        public raptor: Raptor,
    ) {
        this.name = `#${options.name}`;
        this.emitter = new EventEmitter();
        if (options.fishKey) {
            this.blowfish = new Blowfish(options.fishKey);
        }
    }

    on(eventName: string, callback: Callback): void {
        this.raptor.onChannel(this.name, eventName, callback);
    }

    write(msg: string): void {
        let text = msg;
        if (this.blowfish) {
            try {
                text = this.blowfish.encrypt(msg);
            } catch (err) {
                debug(`Encryption failed for ${this.name}, message not sent:`, err);
                return;
            }
        }
        this.raptor.write(`PRIVMSG ${this.name} :${text}`);
    }

    join(): void {
        this.raptor.write(`JOIN ${this.name}${this.options.key ? ` ${this.options.key}` : ''}`);
    }
    part(msg?: string): void {
        this.raptor.write(`PART ${this.name}${msg ? ` :${msg}` : ''}`);
    }

    setmode(mode: string, params: string): void {
        this.raptor.write(`MODE ${this.name} +${mode} ${params}`);
    }
    unsetmode(mode: string, params: string): void {
        this.raptor.write(`MODE ${this.name} -${mode} ${params}`);
    }
    notice(msg: string): void {
        this.raptor.write(`NOTICE ${this.name} :${msg}`);
    }
    ban(user: string, message?: string): void {
        this.raptor.write(`MODE ${this.name} +b ${user}${message ? ` ${message}` : ''}`);
    }
    unban(user: string): void {
        this.raptor.write(`MODE ${this.name} -b ${user}`);
    }
}
