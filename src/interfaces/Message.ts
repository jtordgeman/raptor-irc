export interface MessagePrefix {
    raw: string;
    isServer: boolean;
    host: string;
    nick?: string;
    user?: string;
}

export interface MessageObject {
    prefix: MessagePrefix;
    command: string;
    params: string[];
}

export interface PrivMsgObj {
    from: string;
    hostname: string;
    target: string;
    message: string;
}
