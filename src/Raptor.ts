import tls from "tls";
import net from "net";
import { EventEmitter } from "events";
import {
    RaptorOptions,
    RaptorConnectionOptions,
} from "./interfaces/RaptorOptions";
import { Parser } from "./modules/Parser";
import { SocketManager} from "./modules/SocketManager";

export class Raptor extends EventEmitter {
    socket: tls.TLSSocket | net.Socket | null = null;
    socketManager: SocketManager | null = null;
    //parser: Parser;
    constructor(public options: RaptorOptions) {
        super();
        //this.parser = new Parser();
    }
    connect(options: RaptorConnectionOptions) {
        this.socketManager = new SocketManager(options);
        this.socketManager.connect();
        //if (options.ssl) {
        //    const creds = { rejectUnauthorized: !options.selfSigned };
        //    this.socket = tls.connect(options.port, options.host, creds);
        //} else {
        //    this.socket = net.connect(options.port, options.host);
        //}
        //this.socket.setEncoding("utf8");
        // register events
        //this.socket.on("data", (d) => {
        //    console.log(typeof d);
        //    console.log(`d is: ${d}`);
        //});
        //this.socket.pipe(this.parser);
    }
}
