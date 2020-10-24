import { Plugin } from "../interfaces/Plugin";
import { Raptor } from "../Raptor";
import requireDir from "require-dir";
const pluginObjects = requireDir("../plugins");

interface Plugins {
    [key: string]: Plugin;
}

export class PluginManager {
    plugins = {} as Plugins;
    constructor(private raptor: Raptor) {
        Object.entries(pluginObjects).forEach(
            ([name, plugin]) => (this.plugins[name] = new plugin(this.raptor))
        );
    }
}
