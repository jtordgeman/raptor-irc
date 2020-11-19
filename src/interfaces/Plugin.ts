import Debug from "debug";
import { EventEmitter } from "events";

export abstract class Plugin {
    constructor(public eventEmitter: EventEmitter) {}
}
