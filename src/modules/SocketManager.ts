import { EventEmitter } from "events";
import tls from "tls";
import net from "net";
import { RaptorConnectionOptions } from "../interfaces/RaptorOptions";

export class SocketManager extends EventEmitter {
    socket: tls.TLSSocket | net.Socket | null = null;
    socketConnectEvent: string = "connect";
    socketError: string = "";
    constructor() {
        super();
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
        console.log(`data is ${data}`);
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
