import type { EventEmitter } from 'node:events';

export interface ChannelOptions {
    name: string;
    key?: string;
    fishKey?: string;
}

export interface ChannelInterface {
    name: string;
    emitter: EventEmitter;
    write(msg: string): void;
    join(): void;
    part(msg?: string): void;
    setmode(mode: string, params: string): void;
    unsetmode(mode: string, params: string): void;
    notice(msg: string): void;
    ban(user: string, message?: string): void;
    unban(user: string): void;
}
