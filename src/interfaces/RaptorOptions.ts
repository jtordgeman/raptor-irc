export interface RaptorConnectionOptions {
    host: string;
    port: number;
    nick: string;
    user: string;
    pass?: string;
    realName?: string;
    ssl?: boolean;
    selfSigned?: boolean;
    reconnect?: boolean;
    reconnectDelay?: number;
    reconnectMaxRetries?: number;
    socketTimeout?: number;
    pingTimeout?: number;
}
