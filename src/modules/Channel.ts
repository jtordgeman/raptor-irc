import Debug from 'debug';
import { ChannelOptions, ChannelObject } from '../interfaces/Channel';
import { Raptor } from '../Raptor';
import { Blowfish } from './Blowfish';
import { EventEmitter } from 'events';
import { PrivMsgObj } from '../interfaces/Message';

const debug: Debug.Debugger = Debug('Raptor:Channel');

type Callback = (...args: any[]) => void;

export class Channel implements ChannelObject {
    name: string;
    blowfish?: Blowfish;
    eventEmitter: EventEmitter;
    constructor(private options: ChannelOptions, public raptor: Raptor) {
        this.eventEmitter = new EventEmitter();
        this.name = `#${options.name}`;
        if (options.fishKey) {
            this.blowfish = new Blowfish(options.fishKey);
        }
        this.raptor.on('privmsg', (data: PrivMsgObj) => {
            debug(`data is ${JSON.stringify(data)}`);
            if (data.target === this.name) {
                const text = this.blowfish ? this.blowfish.decrypt(data.message) : data.message;

                debug(`decrypted message: ${text}`);

                this.eventEmitter.emit('privmsg', Object.assign(data, { message: text }));
            }
        });
    }
    write(msg: string): void {
        debug('msg in write is', msg);
        const text = this.blowfish ? this.blowfish.encrypt(msg) : msg;
        debug('text is', text);
        this.raptor.write(`PRIVMSG ${this.name} :${text}`);
    }
    join(): void {
        this.raptor.write(`JOIN ${this.name} ${this.options.key}`);
    }
    part(msg?: string): void {
        this.raptor.write(`PART ${this.name} ${msg ? msg : ''}`);
    }
    setmode(mode: string): void {
        
    }
    notice(msg: string): void {}
    ban(user: string): void {}
    unban(user: string): void {}
    on(eventName: string, callback: Callback): void {
        this.eventEmitter.on(eventName, callback);
    }
}
