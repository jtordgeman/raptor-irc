import { Plugin } from "../interfaces/Plugin";
import requireDir from "require-dir";
import { EventEmitter } from "events";

const pluginObjects = requireDir("../plugins");

interface Plugins {
    [key: string]: Plugin;
}

export class PluginManager {
    plugins = {} as Plugins;
    constructor(
        private eventEmitter: EventEmitter
    ) {
        Object.entries(pluginObjects).forEach(
            ([name, plugin]) =>
                (this.plugins[name] = new plugin(this.eventEmitter))
        );
    }
}
