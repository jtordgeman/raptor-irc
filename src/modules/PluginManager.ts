import { Plugin } from "../interfaces/Plugin";
import requireDir from "require-dir";
import { EventEmitter } from "events";
import Debug from "debug";

const pluginObjects = requireDir("../plugins");

interface Plugins {
    [key: string]: Plugin;
}

export class PluginManager {
    plugins = {} as Plugins;
    constructor(
        private eventEmitter: EventEmitter,
        private debug: Debug.Debugger
    ) {
        Object.entries(pluginObjects).forEach(
            ([name, plugin]) =>
                (this.plugins[name] = new plugin(this.eventEmitter))
        );
    }
}
