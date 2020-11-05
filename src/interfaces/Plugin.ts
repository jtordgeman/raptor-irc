import { EventManager } from "../modules/EventManager";

export abstract class Plugin {
    constructor(public eventManager: EventManager) {}
}
