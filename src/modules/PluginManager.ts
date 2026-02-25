import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import Debug from 'debug';
import type { MessageObject } from '../interfaces/Message.js';
import type { IPluginManager, Plugin, PluginResult } from '../interfaces/Plugin.js';
import type { Raptor } from '../Raptor.js';

const debug: Debug.Debugger = Debug('Raptor:PluginManager');

export class PluginManager implements IPluginManager {
    plugins: Record<string, Plugin> = {};

    constructor(public raptor: Raptor) {
        this.raptor.on('rawMessage', (data: MessageObject) => {
            let pluginResult = {} as PluginResult;
            if (this.plugins[data.command]) {
                try {
                    pluginResult = this.plugins[data.command].onCommand(data);
                    this.raptor.emit(pluginResult.eventName, pluginResult.payload);
                } catch (err) {
                    debug(`Plugin error handling command ${data.command}:`, err);
                }
            }
            this.raptor.emit('message', {
                raw: data,
                parsed: pluginResult,
            });
        });
    }

    async loadPlugins(): Promise<void> {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const pluginsDir = path.join(__dirname, '..', 'plugins');
        const files = fs.readdirSync(pluginsDir).filter((f) => f.endsWith('.js') || f.endsWith('.ts'));

        for (const file of files) {
            const modulePath = path.join(pluginsDir, file);
            try {
                const mod = await import(pathToFileURL(modulePath).href);
                const PluginClass = mod.default;
                if (PluginClass) {
                    new PluginClass(this);
                }
            } catch (err) {
                debug(`Failed to load plugin ${file}:`, err);
            }
        }
        debug(`Loaded ${Object.keys(this.plugins).length} plugins`);
    }

    setCommand(command: string, plugin: Plugin): void {
        debug(`registering handler for command: ${command}`);
        this.plugins[command] = plugin;
    }

    write(line: string): void {
        this.raptor.write(line);
    }
}
