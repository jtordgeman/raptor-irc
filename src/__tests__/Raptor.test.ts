import type { EventEmitter } from 'node:events';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Raptor } from '../Raptor.js';

// Mock NetworkManager to avoid real socket connections
vi.mock('../modules/NetworkManager.js', () => {
    return {
        NetworkManager: class MockNetworkManager {
            eventEmitter: EventEmitter;
            socketError = '';
            connect = vi.fn();
            disconnect = vi.fn();
            forceClose = vi.fn().mockImplementation(function (this: any) {
                this.eventEmitter.emit('socketClose', {
                    error: this.socketError,
                    intentional: false,
                });
            });
            write = vi.fn();
            constructor(emitter: EventEmitter) {
                this.eventEmitter = emitter;
            }
        },
    };
});

// Mock PluginManager to avoid file system access
vi.mock('../modules/PluginManager.js', () => {
    return {
        PluginManager: class MockPluginManager {
            loadPlugins = vi.fn().mockResolvedValue(undefined);
            plugins = {};
            raptor: any;
            constructor(raptor: any) {
                this.raptor = raptor;
            }
        },
    };
});

function createRaptor(overrides = {}) {
    return new Raptor({
        host: 'irc.test.com',
        port: 6667,
        nick: 'testbot',
        user: 'testbot',
        ...overrides,
    });
}

describe('Raptor', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('registerWithServer', () => {
        it('sends NICK and USER on socketOpen', () => {
            const raptor = createRaptor();
            const writeSpy = vi.spyOn(raptor, 'write');

            // Simulate socketOpen
            (raptor as any).eeMessage.emit('socketOpen');

            expect(writeSpy).toHaveBeenCalledWith('NICK testbot');
            expect(writeSpy).toHaveBeenCalledWith('USER testbot 0 * :testbot');
        });

        it('sends PASS when configured', () => {
            const raptor = createRaptor({ pass: 'secret' });
            const writeSpy = vi.spyOn(raptor, 'write');

            (raptor as any).eeMessage.emit('socketOpen');

            expect(writeSpy).toHaveBeenCalledWith('PASS secret');
        });

        it('uses realName when provided', () => {
            const raptor = createRaptor({ realName: 'Test Bot' });
            const writeSpy = vi.spyOn(raptor, 'write');

            (raptor as any).eeMessage.emit('socketOpen');

            expect(writeSpy).toHaveBeenCalledWith('USER testbot 0 * :Test Bot');
        });
    });

    describe('channel management', () => {
        it('creates and tracks channels', () => {
            const raptor = createRaptor();
            const ch = raptor.channel({ name: 'test' });
            expect(ch.name).toBe('#test');
        });

        it('registers channel event listeners', () => {
            const raptor = createRaptor();
            const ch = raptor.channel({ name: 'test' });
            const callback = vi.fn();
            raptor.onChannel('#test', 'privmsg', callback);

            ch.emitter.emit('privmsg', { message: 'hi' });
            expect(callback).toHaveBeenCalledWith({ message: 'hi' });
        });
    });

    describe('event system', () => {
        it('on/emit works for custom events', () => {
            const raptor = createRaptor();
            const callback = vi.fn();
            raptor.on('customEvent', callback);
            raptor.emit('customEvent', { data: 'test' });
            expect(callback).toHaveBeenCalledWith({ data: 'test' });
        });
    });

    describe('reconnection', () => {
        it('schedules reconnect on unintentional socketClose', () => {
            const raptor = createRaptor();
            const connectSpy = vi.spyOn(raptor, 'connect');

            (raptor as any).eeMessage.emit('socketClose', { error: '', intentional: false });

            expect(connectSpy).not.toHaveBeenCalled(); // not immediate
            vi.advanceTimersByTime(5_000);
            expect(connectSpy).toHaveBeenCalledTimes(1);
        });

        it('does not reconnect on intentional disconnect', () => {
            const raptor = createRaptor();
            const connectSpy = vi.spyOn(raptor, 'connect');

            (raptor as any).eeMessage.emit('socketClose', { error: '', intentional: true });

            vi.advanceTimersByTime(60_000);
            expect(connectSpy).not.toHaveBeenCalled();
        });

        it('does not reconnect when reconnect is disabled', () => {
            const raptor = createRaptor({ reconnect: false });
            const connectSpy = vi.spyOn(raptor, 'connect');

            (raptor as any).eeMessage.emit('socketClose', { error: '', intentional: false });

            vi.advanceTimersByTime(60_000);
            expect(connectSpy).not.toHaveBeenCalled();
        });

        it('applies exponential backoff', () => {
            const raptor = createRaptor({ reconnectDelay: 1_000 });
            const reconnectingEvents: any[] = [];
            raptor.on('reconnecting', (info: any) => reconnectingEvents.push(info));

            // First disconnect
            (raptor as any).eeMessage.emit('socketClose', { error: '', intentional: false });
            expect(reconnectingEvents[0]).toEqual({ attempt: 1, delay: 1_000 });

            vi.advanceTimersByTime(1_000);

            // Simulate another disconnect (without successful reconnect)
            (raptor as any).eeMessage.emit('socketClose', { error: '', intentional: false });
            expect(reconnectingEvents[1]).toEqual({ attempt: 2, delay: 2_000 });
        });

        it('emits reconnectFailed after max retries', () => {
            const raptor = createRaptor({ reconnectMaxRetries: 2, reconnectDelay: 100 });
            const failedSpy = vi.fn();
            raptor.on('reconnectFailed', failedSpy);

            // Exhaust retries
            (raptor as any).eeMessage.emit('socketClose', { error: '', intentional: false });
            vi.advanceTimersByTime(100);
            (raptor as any).eeMessage.emit('socketClose', { error: '', intentional: false });
            vi.advanceTimersByTime(200);
            (raptor as any).eeMessage.emit('socketClose', { error: '', intentional: false });

            expect(failedSpy).toHaveBeenCalledTimes(1);
        });

        it('resets retry count on successful reconnect', () => {
            const raptor = createRaptor({ reconnectDelay: 100 });

            // Disconnect
            (raptor as any).eeMessage.emit('socketClose', { error: '', intentional: false });
            vi.advanceTimersByTime(100);

            // Successful reconnect
            (raptor as any).eeMessage.emit('socketOpen');

            expect((raptor as any).reconnectAttempts).toBe(0);
        });

        it('emits reconnected event on successful reconnect', () => {
            const raptor = createRaptor({ reconnectDelay: 100 });
            const reconnectedSpy = vi.fn();
            raptor.on('reconnected', reconnectedSpy);

            (raptor as any).eeMessage.emit('socketClose', { error: '', intentional: false });
            vi.advanceTimersByTime(100);
            (raptor as any).eeMessage.emit('socketOpen');

            expect(reconnectedSpy).toHaveBeenCalledTimes(1);
        });

        it('auto-rejoins channels after reconnect welcome', () => {
            const raptor = createRaptor({ reconnectDelay: 100 });
            const writeSpy = vi.spyOn(raptor, 'write');
            raptor.channel({ name: 'test' });

            // Disconnect and reconnect
            (raptor as any).eeMessage.emit('socketClose', { error: '', intentional: false });
            vi.advanceTimersByTime(100);
            (raptor as any).eeMessage.emit('socketOpen');

            // Clear previous write calls
            writeSpy.mockClear();

            // Welcome triggers channel rejoin
            (raptor as any).eeMessage.emit('welcome');

            expect(writeSpy).toHaveBeenCalledWith('JOIN #test');
        });

        it('does not auto-rejoin channels on first connect', () => {
            const raptor = createRaptor();
            const writeSpy = vi.spyOn(raptor, 'write');
            raptor.channel({ name: 'test' });

            // First connect — socketOpen then welcome
            (raptor as any).eeMessage.emit('socketOpen');
            writeSpy.mockClear();
            (raptor as any).eeMessage.emit('welcome');

            // Should NOT have sent JOIN (user handles first join themselves)
            expect(writeSpy).not.toHaveBeenCalledWith('JOIN #test');
        });
    });

    describe('ping watchdog', () => {
        it('forces disconnect and triggers reconnect when no PING received within timeout', () => {
            const raptor = createRaptor({ pingTimeout: 10_000, reconnectDelay: 1_000 });
            const connectSpy = vi.spyOn(raptor, 'connect');

            // Welcome starts the watchdog
            (raptor as any).eeMessage.emit('socketOpen');
            (raptor as any).eeMessage.emit('welcome');

            const nm = (raptor as any).networkManager;
            vi.advanceTimersByTime(10_000);

            expect(nm.forceClose).toHaveBeenCalled();
            expect(nm.disconnect).not.toHaveBeenCalled();

            // forceClose emits socketClose, which schedules reconnect
            vi.advanceTimersByTime(1_000);
            expect(connectSpy).toHaveBeenCalledTimes(1);
        });

        it('resets watchdog on ping event', () => {
            const raptor = createRaptor({ pingTimeout: 10_000 });

            (raptor as any).eeMessage.emit('socketOpen');
            (raptor as any).eeMessage.emit('welcome');

            // Advance 8 seconds, then ping resets
            vi.advanceTimersByTime(8_000);
            (raptor as any).eeMessage.emit('ping');

            // After 8 more seconds (total 16), still no timeout because ping reset it
            vi.advanceTimersByTime(8_000);
            const nm = (raptor as any).networkManager;
            expect(nm.forceClose).not.toHaveBeenCalled();
        });
    });

    describe('privmsg routing', () => {
        it('emits privmsg on channel emitter without blowfish', () => {
            const raptor = createRaptor();
            const ch = raptor.channel({ name: 'test' });
            const callback = vi.fn();
            ch.emitter.on('privmsg', callback);

            const privMsgObj = { target: '#test', message: 'hello', nick: 'someone' };
            (raptor as any).onPrivMsg(privMsgObj);

            expect(callback).toHaveBeenCalledWith(privMsgObj);
        });
    });

    describe('disconnect', () => {
        it('clears reconnect timer and ping watchdog', () => {
            const raptor = createRaptor({ reconnectDelay: 100 });

            // Start reconnect timer
            (raptor as any).eeMessage.emit('socketClose', { error: '', intentional: false });

            raptor.disconnect();

            expect((raptor as any).reconnectTimer).toBeNull();
            expect((raptor as any).pingWatchdog).toBeNull();
        });
    });
});
