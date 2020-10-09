import { EventEmitter } from "events";
import tls from "tls";
import net from "net";
import { RaptorConnectionOptions } from "../interfaces/RaptorOptions";

enum ConnectionState {
    Disconnected = "Disconnected",
    Connected = "Connected",
}

export class SocketManager extends EventEmitter {
    socket: tls.TLSSocket | net.Socket | null = null;
    socketConnectEvent: string = "connect";
    socketState: ConnectionState = ConnectionState.Disconnected;
    socketError: string = "";
    constructor(private options: RaptorConnectionOptions) {
        super();
    }

    private onSocketConnected = (): void => {
        console.log("connected!");
        this.socketState = ConnectionState.Connected;
        this.emit("socketOpen");
    };

    private onSocketClose = (): void => {
        this.socketState = ConnectionState.Disconnected;
        this.emit("socketClose", this.socketError);
    };

    private onSocketError = (err: Error): void => {
        this.socketError = err.message;
    };

    private onSocketTimeout = (): void => {
        console.log("timeout");
        this.closeSocket();
    };

    private onSocketData = (data:Buffer): void => {
        console.log(`data is ${data}`);
    };

    private closeSocket = (): void => {
        if (!this.socket) {
            console.log("No socket found");
            return;
        }
        this.socket.end();
    };

    connect(): void {
        if (this.options.ssl) {
            const creds = { rejectUnauthorized: !this.options.selfSigned };
            this.socket = tls.connect(
                this.options.port,
                this.options.host,
                creds
            );
            this.socketConnectEvent = "secureConnect";
        } else {
            this.socket = net.connect(this.options.port, this.options.host);
        }
        this.socket.setEncoding("utf8");
        // register events
        this.socket.on(this.socketConnectEvent, this.onSocketConnected);
        this.socket.on("data", this.onSocketData);
        this.socket.on("close", this.onSocketClose);
        this.socket.on("error", this.onSocketError);
        this.socket.on("timeout", this.onSocketTimeout);
    }
}
