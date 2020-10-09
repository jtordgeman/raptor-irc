export interface RaptorOptions {
    debug?:boolean;
}

export interface RaptorConnectionOptions {
    host: string;
    port: number;
    nick: string;
    user?: string;
    ssl?: boolean;
    selfSigned?: boolean;
}
