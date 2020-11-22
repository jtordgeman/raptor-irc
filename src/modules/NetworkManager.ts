import tls from "tls";
import net from "net";
import { RaptorConnectionOptions } from "../interfaces/RaptorOptions";
import ircReplies from "irc-replies";
import { EventEmitter } from "events";
import Debug from "debug";

export class NetworkManager {
    socket: tls.TLSSocket | net.Socket | null = null;
    socketError: string = "";
    eventEmitter: EventEmitter;
    debug: Debug.Debugger;
    private replies: { [key: string]: string };
    constructor(eventEmitter: EventEmitter) {
        this.replies = ircReplies;
        this.eventEmitter = eventEmitter;
        this.debug = Debug("Raptor").extend("Network");
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
        this.debug("timeout");
        this.closeSocket();
    };

    private onSocketData = (data: Buffer): void => {
        data.toString()
            .split("\r\n")
            .filter((l: string) => l !== "")
            .forEach((l: string) => {
                this.debug(`l is: ${l}`);
                const trimmed: string = l.trim();
                const messageArray: string[] = trimmed.split(" ");
                if (messageArray.length >= 2) {
                    let prefix: string = "";
                    let command: string = "";
                    let params: string[] = [];

                    if (messageArray[0].startsWith(":")) {
                        prefix = messageArray
                            .splice(0, 1)[0]
                            .trim()
                            .substring(1);
                    }

                    command = messageArray.splice(0, 1)[0].trim();
                    const parsedCommand = this.replies[command] || command;
                    const paramMessaageIndex = messageArray.findIndex((m) =>
                        m.startsWith(":")
                    );
                    params = messageArray.slice(0, paramMessaageIndex);
                    params.push(
                        messageArray
                            .splice(paramMessaageIndex)
                            .join(" ")
                            .substring(1)
                    );

                    this.eventEmitter.emit("message", {
                        prefix,
                        command: parsedCommand,
                        params,
                    });
                }
            });
    };

    private closeSocket = (): void => {
        if (!this.socket) {
            this.debug("No socket found");
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
            this.debug("Socket is not connected");
            return;
        }
        this.socket.write(`${line}\r\n`);
    }
}
