import { EventEmitter } from "events";

export abstract class Plugin {
    constructor(public eventEmitter: EventEmitter) {}
}
