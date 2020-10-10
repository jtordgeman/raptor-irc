import { EventEmitter } from "events";
import tls from "tls";
import net from "net";
import { RaptorConnectionOptions } from "../interfaces/RaptorOptions";
import ircReplies from "irc-replies";

export class SocketManager extends EventEmitter {
    socket: tls.TLSSocket | net.Socket | null = null;
    socketConnectEvent: string = "connect";
    socketError: string = "";
    private replies: { [key: string]: string };
    constructor() {
        super();
        this.replies = ircReplies;
    }

    private onSocketConnected = (): void => {
        this.emit("socketOpen");
    };

    private onSocketClose = (): void => {
        this.emit("socketClose", this.socketError);
    };

    private onSocketError = (err: Error): void => {
        this.socketError = err.message;
    };

    private onSocketTimeout = (): void => {
        console.log("timeout");
        this.closeSocket();
    };

    private onSocketData = (data: Buffer): void => {
        data.toString()
            .split("\r\n")
            .filter((l: string) => l !== "")
            .forEach((l: string) => {
                const trimmed: string = l.trim();
                const messageArray: string[] = trimmed.split(" ");
                let prefix: string = "";
                let command: string = "";
                let params: string = "";

                if (messageArray[0].startsWith(":")) {
                    prefix = messageArray.splice(0, 1)[0].trim();
                }

                command = messageArray.splice(0, 1)[0].trim();
                const parsedCommand = this.replies[command] || command;
                params = messageArray.join(" ").trim();
                this.emit("message", {
                    prefix,
                    command: parsedCommand,
                    params,
                });
            });
    };

    private closeSocket = (): void => {
        if (!this.socket) {
            console.log("No socket found");
            return;
        }
        this.socket.end();
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
            console.log("Socket is not connected");
            return;
        }
        this.socket.write(`${line}\r\n`);
    }
}
