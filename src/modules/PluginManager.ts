import { Plugin } from "../interfaces/Plugin";
import requireDir from "require-dir";
import { EventManager } from "./EventManager";
const pluginObjects = requireDir("../plugins");

interface Plugins {
    [key: string]: Plugin;
}

export class PluginManager {
    plugins = {} as Plugins;
    constructor(private eventManager: EventManager) {
        Object.entries(pluginObjects).forEach(
            ([name, plugin]) =>
                (this.plugins[name] = new plugin(this.eventManager))
        );
    }
}
