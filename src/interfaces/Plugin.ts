type Callback = (...args: any[]) => void;

export interface Plugin {
    pluginManager: IPluginManager;
}

export interface IPluginManager {
    addPlugin(command: string, callback: Callback): void;
    emit(eventName: string, payload: object): void;
}
