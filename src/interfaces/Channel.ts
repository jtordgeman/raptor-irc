export interface ChannelOptions {
    name: string;
    key?: string;
    fishKey?: string;
}

export interface ChannelObject {
    name: string;
    write(msg: string): void;
    join(): void;
    part(msg?: string): void;
    setmode(mode: string): void;
    notice(msg: string): void;
    ban(user: string): void;
    unban(user: string): void;
}
