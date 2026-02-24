// EventEmitter callbacks accept varied argument types
// biome-ignore lint/suspicious/noExplicitAny: EventEmitter pattern requires flexible args
export type Callback = (...args: any[]) => void;
