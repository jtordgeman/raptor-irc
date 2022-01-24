import Debug from 'debug';
import { EventEmitter } from 'stream';
import { ChannelOptions, ChannelInterface } from '../interfaces/Channel';
import { Raptor } from '../Raptor';
import { Callback } from '../types/Callback';
import { Blowfish } from './Blowfish';

const debug: Debug.Debugger = Debug('Raptor:Channel');

export class Channel implements ChannelInterface {
    name: string;
    blowfish?: Blowfish;
    emitter: EventEmitter;
    constructor(private options: ChannelOptions, public raptor: Raptor) {
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
        const text = this.blowfish ? this.blowfish.encrypt(msg) : msg;
        this.raptor.write(`PRIVMSG ${this.name} :${text}`);
    }
    join(): void {
        this.raptor.write(`JOIN ${this.name} ${this.options.key}`);
    }
    part(msg?: string): void {
        this.raptor.write(`PART ${this.name} ${msg ? msg : ''}`);
    }
    setmode(mode: string, params: string): void {
        this.raptor.write(`MODE ${this.name} +${mode} ${params}`);
    }
    unsetmode(mode: string, params: string): void {
        this.raptor.write(`MODE ${this.name} -${mode} ${params}`);
    }
    notice(msg: string): void {
        this.raptor.write(`NOTICE ${this.name} ${msg}`);
    }
    ban(user: string, message?: string): void {
        this.raptor.write(`MODE ${this.name} +b ${user} ${message}`);
    }
    unban(user: string): void {
        this.raptor.write(`MODE ${this.name} -b ${user}`);
    }
    setEmitter(emitter: EventEmitter): void {
        this.emitter = emitter;
    }
}
