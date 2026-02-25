import { EventEmitter } from 'node:events';
import { describe, expect, it, vi } from 'vitest';
import { NetworkManager } from '../modules/NetworkManager.js';

// Access private methods for testing via any cast
function getManager() {
    const emitter = new EventEmitter();
    const nm = new NetworkManager(emitter);
    return { nm: nm as any, emitter };
}

describe('NetworkManager', () => {
    describe('handlePrefix', () => {
        it('parses user prefix (nick!user@host)', () => {
            const { nm } = getManager();
            const result = nm.handlePrefix('nick!user@host.com');
            expect(result.raw).toBe('nick!user@host.com');
            expect(result.isServer).toBe(false);
            expect(result.nick).toBe('nick');
            expect(result.user).toBe('user');
            expect(result.host).toBe('host.com');
        });

        it('parses server prefix (no !)', () => {
            const { nm } = getManager();
            const result = nm.handlePrefix('irc.server.net');
            expect(result.raw).toBe('irc.server.net');
            expect(result.isServer).toBe(true);
            expect(result.host).toBe('irc.server.net');
            expect(result.nick).toBeUndefined();
        });

        it('returns empty object for empty prefix', () => {
            const { nm } = getManager();
            const result = nm.handlePrefix('');
            expect(result).toEqual({});
        });
    });

    describe('handleLine', () => {
        it('parses PRIVMSG', () => {
            const { nm } = getManager();
            const result = nm.handleLine(':nick!user@host PRIVMSG #channel :hello world');
            expect(result).not.toBeNull();
            expect(result?.command).toBe('PRIVMSG');
            expect(result?.prefix.nick).toBe('nick');
            expect(result?.params[0]).toBe('#channel');
            expect(result?.params[1]).toBe('hello world');
        });

        it('parses JOIN', () => {
            const { nm } = getManager();
            const result = nm.handleLine(':nick!user@host JOIN :#channel');
            expect(result).not.toBeNull();
            expect(result?.command).toBe('JOIN');
        });

        it('parses server numeric replies', () => {
            const { nm } = getManager();
            const result = nm.handleLine(':server.net 001 nick :Welcome to the network');
            expect(result).not.toBeNull();
            expect(result?.command).toBe('RPL_WELCOME');
        });

        it('parses PING from server', () => {
            const { nm } = getManager();
            const result = nm.handleLine('PING :server.net');
            expect(result).not.toBeNull();
            expect(result?.command).toBe('PING');
            expect(result?.params[0]).toBe('server.net');
        });

        it('returns null for lines with fewer than 2 parts', () => {
            const { nm } = getManager();
            expect(nm.handleLine('SINGLE')).toBeNull();
        });

        it('returns null for empty line', () => {
            const { nm } = getManager();
            expect(nm.handleLine('')).toBeNull();
        });

        it('parses KICK with reason', () => {
            const { nm } = getManager();
            const result = nm.handleLine(':op!user@host KICK #channel nick :bad behavior');
            expect(result).not.toBeNull();
            expect(result?.command).toBe('KICK');
            expect(result?.params[0]).toBe('#channel');
            expect(result?.params[1]).toBe('nick');
            expect(result?.params[2]).toBe('bad behavior');
        });

        it('parses MODE with no trailing parameter', () => {
            const { nm } = getManager();
            const result = nm.handleLine(':op!user@host MODE #channel +o nick');
            expect(result).not.toBeNull();
            expect(result?.command).toBe('MODE');
            expect(result?.params[0]).toBe('#channel');
            expect(result?.params[1]).toBe('+o');
            expect(result?.params[2]).toBe('nick');
        });
    });

    describe('onSocketData', () => {
        it('splits multi-line data and emits rawMessage for each', () => {
            const { nm, emitter } = getManager();
            const messages: any[] = [];
            emitter.on('rawMessage', (msg: any) => messages.push(msg));

            const data = Buffer.from('PING :server1\r\nPING :server2\r\n');
            nm.onSocketData(data);

            expect(messages).toHaveLength(2);
            expect(messages[0].command).toBe('PING');
            expect(messages[1].command).toBe('PING');
        });

        it('skips empty lines in buffer', () => {
            const { nm, emitter } = getManager();
            const messages: any[] = [];
            emitter.on('rawMessage', (msg: any) => messages.push(msg));

            const data = Buffer.from('PING :server\r\n\r\n');
            nm.onSocketData(data);

            expect(messages).toHaveLength(1);
        });
    });

    describe('forceClose', () => {
        it('destroys socket and emits socketClose with intentional=false', () => {
            const { nm, emitter } = getManager();
            let closeInfo: any = null;
            emitter.on('socketClose', (info: any) => {
                closeInfo = info;
            });

            nm.socket = {
                removeAllListeners: vi.fn(),
                destroy: vi.fn(),
            };

            nm.forceClose();

            expect(nm.socket).toBeNull();
            expect(closeInfo).toEqual({ error: '', intentional: false });
        });
    });

    describe('onSocketTimeout', () => {
        it('destroys socket and emits socketClose with intentional=false', () => {
            const { nm, emitter } = getManager();
            let closeInfo: any = null;
            emitter.on('socketClose', (info: any) => {
                closeInfo = info;
            });

            nm.socket = {
                removeAllListeners: vi.fn(),
                destroy: vi.fn(),
            };

            nm.onSocketTimeout();

            expect(nm.socket).toBeNull();
            expect(closeInfo).toEqual({ error: 'Socket timeout', intentional: false });
        });
    });

    describe('socket lifecycle', () => {
        it('sets intentionalDisconnect flag and destroys socket on disconnect()', () => {
            const { nm } = getManager();

            // Create a mock socket
            const destroySpy = vi.fn();
            nm.socket = {
                removeAllListeners: vi.fn(),
                destroy: destroySpy,
            };

            nm.disconnect();

            expect(nm.socket).toBeNull();
            expect(destroySpy).toHaveBeenCalled();
            expect(nm.intentionalDisconnect).toBe(true);
        });

        it('write does nothing when socket is null', () => {
            const { nm } = getManager();
            nm.socket = null;
            // Should not throw
            nm.write('TEST');
        });
    });
});
