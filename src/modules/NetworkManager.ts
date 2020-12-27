import tls from "tls";
import net from "net";
import { RaptorConnectionOptions } from "../interfaces/RaptorOptions";
import ircReplies from "irc-replies";
import { EventEmitter } from "events";
import Debug from "debug";
import { MessageObject, MessagePrefix } from "../interfaces/Message";

const debug: Debug.Debugger = Debug("Raptor:Network");

export class NetworkManager {
    socket: tls.TLSSocket | net.Socket | null = null;
    socketError: string = "";
    eventEmitter: EventEmitter;
    private replies: { [key: string]: string };
    constructor(eventEmitter: EventEmitter) {
        this.replies = ircReplies;
        this.eventEmitter = eventEmitter;
    }

    private handlePrefix(prefix: string): MessagePrefix {
        let result = <MessagePrefix>{};
        if (!prefix) {
            return result;
        }

        result.raw = prefix;

        const userIndication = prefix.indexOf("!");
        if (userIndication > 0) {
            result.isServer = false;
            result.nick = prefix.slice(0, userIndication);
            const hostIndication = prefix.indexOf("@", userIndication);
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
        let prefix = <MessagePrefix>{};
        let params: string[] = [];

        const messageArray: string[] = line.split(" ");
        if (messageArray.length >= 2) {
            if (messageArray[0].startsWith(":")) {
                prefix = this.handlePrefix(
                    messageArray.splice(0, 1)[0].trim().substring(1)
                );
            }
            const command = messageArray.splice(0, 1)[0].trim();
            const parsedCommand = this.replies[command] || command;
            const paramMessaageIndex = messageArray.findIndex((m) =>
                m.startsWith(":")
            );
            params = messageArray.slice(0, paramMessaageIndex);
            let payload = messageArray.splice(paramMessaageIndex).join(" ");
            if (payload.startsWith(":")) {
                payload = payload.substring(1);
            }
            params.push(payload);
            return {
                prefix,
                command: parsedCommand,
                params,
            };
        }
        return null;
    }

    private onSocketConnected = (): void => {
        this.eventEmitter.emit("socketOpen");
    };

    private onSocketClose = (): void => {
        this.eventEmitter.emit("socketClose", this.socketError);
    };

    private onSocketError = (err: Error): void => {
        this.socketError = err.message;
    };

    private onSocketTimeout = (): void => {
        debug("timeout");
        this.closeSocket();
    };

    private onSocketData = (data: Buffer): void => {
        data.toString()
            .split("\r\n")
            .filter((l: string) => l !== "")
            .forEach((l: string) => {
                const trimmed: string = l.trim();
                const messageObject = this.handleLine(trimmed);
                if (messageObject) {
                    this.eventEmitter.emit("rawMessage", messageObject);
                }
            });
    };

    private closeSocket = (): void => {
        if (!this.socket) {
            debug("No socket found");
            return;
        }
        this.socket.end();
        this.socket = null;
    };

    connect(options: RaptorConnectionOptions): void {
        let socketConnectEvent: string = "connect";
        if (options.ssl) {
            const creds = { rejectUnauthorized: !options.selfSigned };
            this.socket = tls.connect(options.port, options.host, creds);
            socketConnectEvent = "secureConnect";
        } else {
            this.socket = net.connect(options.port, options.host);
        }
        this.socket.setEncoding("utf8");
        // register events
        this.socket.on(socketConnectEvent, this.onSocketConnected);
        this.socket.on("data", this.onSocketData);
        this.socket.on("close", this.onSocketClose);
        this.socket.on("error", this.onSocketError);
        this.socket.on("timeout", this.onSocketTimeout);
    }

    write(line: string): void {
        if (!this.socket) {
            debug("Socket is not connected");
            return;
        }
        this.socket.write(`${line}\r\n`);
    }
}
