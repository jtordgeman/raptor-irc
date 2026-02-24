import { describe, expect, it, vi } from 'vitest';
import type { MessageObject } from '../interfaces/Message.js';
import type { IPluginManager } from '../interfaces/Plugin.js';
import Away from '../plugins/away.js';
import Join from '../plugins/join.js';
import Kick from '../plugins/kick.js';
import Mode from '../plugins/mode.js';
import Notice from '../plugins/notice.js';
import Part from '../plugins/part.js';
import Ping from '../plugins/ping.js';
import Pong from '../plugins/pong.js';
import PrivMsg from '../plugins/privmsg.js';
import Welcome from '../plugins/welcome.js';

function createMockPluginManager(): IPluginManager {
    return {
        setCommand: vi.fn(),
        write: vi.fn(),
    };
}

function makeMessage(command: string, prefix = {}, params: string[] = []): MessageObject {
    return {
        prefix: { raw: '', isServer: false, host: 'host.com', ...prefix },
        command,
        params,
    };
}

describe('Plugins', () => {
    describe('Ping', () => {
        it('registers PING command', () => {
            const pm = createMockPluginManager();
            new Ping(pm);
            expect(pm.setCommand).toHaveBeenCalledWith('PING', expect.any(Object));
        });

        it('returns ping event and sends PONG', () => {
            const pm = createMockPluginManager();
            const ping = new Ping(pm);
            const result = ping.onCommand(makeMessage('PING', {}, ['server.net']));

            expect(result.eventName).toBe('ping');
            expect(result.payload).toBe('server.net');
            expect(pm.write).toHaveBeenCalledWith('PONG :server.net');
        });
    });

    describe('Pong', () => {
        it('registers PONG command', () => {
            const pm = createMockPluginManager();
            new Pong(pm);
            expect(pm.setCommand).toHaveBeenCalledWith('PONG', expect.any(Object));
        });

        it('returns pong event', () => {
            const pm = createMockPluginManager();
            const pong = new Pong(pm);
            const result = pong.onCommand(makeMessage('PONG', {}, ['server.net']));
            expect(result.eventName).toBe('pong');
        });
    });

    describe('PrivMsg', () => {
        it('registers PRIVMSG command', () => {
            const pm = createMockPluginManager();
            new PrivMsg(pm);
            expect(pm.setCommand).toHaveBeenCalledWith('PRIVMSG', expect.any(Object));
        });

        it('extracts from, target, and message', () => {
            const pm = createMockPluginManager();
            const plugin = new PrivMsg(pm);
            const result = plugin.onCommand(
                makeMessage('PRIVMSG', { nick: 'sender', host: 'host.com' }, ['#channel', 'hello world']),
            );
            expect(result.eventName).toBe('privmsg');
            const p = result.payload as any;
            expect(p.from).toBe('sender');
            expect(p.target).toBe('#channel');
            expect(p.message).toBe('hello world');
        });
    });

    describe('Welcome', () => {
        it('registers RPL_WELCOME command', () => {
            const pm = createMockPluginManager();
            new Welcome(pm);
            expect(pm.setCommand).toHaveBeenCalledWith('RPL_WELCOME', expect.any(Object));
        });

        it('returns welcome event', () => {
            const pm = createMockPluginManager();
            const plugin = new Welcome(pm);
            const result = plugin.onCommand(
                makeMessage('RPL_WELCOME', { isServer: true, host: 'server' }, ['Welcome to the network']),
            );
            expect(result.eventName).toBe('welcome');
        });
    });

    describe('Join', () => {
        it('registers JOIN command', () => {
            const pm = createMockPluginManager();
            new Join(pm);
            expect(pm.setCommand).toHaveBeenCalledWith('JOIN', expect.any(Object));
        });

        it('extracts nick and channel', () => {
            const pm = createMockPluginManager();
            const plugin = new Join(pm);
            const result = plugin.onCommand(makeMessage('JOIN', { nick: 'user1', host: 'host.com' }, ['#general']));
            expect(result.eventName).toBe('join');
            const p = result.payload as any;
            expect(p.nick).toBe('user1');
            expect(p.channel).toBe('#general');
        });
    });

    describe('Part', () => {
        it('registers PART command', () => {
            const pm = createMockPluginManager();
            new Part(pm);
            expect(pm.setCommand).toHaveBeenCalledWith('PART', expect.any(Object));
        });

        it('extracts nick and channel', () => {
            const pm = createMockPluginManager();
            const plugin = new Part(pm);
            const result = plugin.onCommand(makeMessage('PART', { nick: 'user1', host: 'host.com' }, ['#general']));
            expect(result.eventName).toBe('part');
            const p = result.payload as any;
            expect(p.nick).toBe('user1');
            expect(p.channel).toBe('#general');
        });
    });

    describe('Kick', () => {
        it('registers KICK command', () => {
            const pm = createMockPluginManager();
            new Kick(pm);
            expect(pm.setCommand).toHaveBeenCalledWith('KICK', expect.any(Object));
        });

        it('extracts channel, kicked user, and reason', () => {
            const pm = createMockPluginManager();
            const plugin = new Kick(pm);
            const result = plugin.onCommand(
                makeMessage('KICK', { nick: 'op', host: 'host.com' }, ['#channel', 'baduser', 'bad behavior']),
            );
            expect(result.eventName).toBe('kick');
            const p = result.payload as any;
            expect(p.nick).toBe('op');
            expect(p.channel).toBe('#channel');
            expect(p.kicked).toBe('baduser');
            expect(p.message).toBe('bad behavior');
        });
    });

    describe('Mode', () => {
        it('registers MODE command', () => {
            const pm = createMockPluginManager();
            new Mode(pm);
            expect(pm.setCommand).toHaveBeenCalledWith('MODE', expect.any(Object));
        });

        it('extracts mode changes', () => {
            const pm = createMockPluginManager();
            const plugin = new Mode(pm);
            const result = plugin.onCommand(
                makeMessage('MODE', { nick: 'op', host: 'host.com' }, ['#channel', '+o', 'nick']),
            );
            expect(result.eventName).toBe('mode');
            const p = result.payload as any;
            expect(p.channel).toBe('#channel');
            expect(p.flag).toBe('+o');
        });
    });

    describe('Notice', () => {
        it('registers NOTICE command', () => {
            const pm = createMockPluginManager();
            new Notice(pm);
            expect(pm.setCommand).toHaveBeenCalledWith('NOTICE', expect.any(Object));
        });

        it('extracts from, to, and message', () => {
            const pm = createMockPluginManager();
            const plugin = new Notice(pm);
            const result = plugin.onCommand(
                makeMessage('NOTICE', { nick: 'server', host: 'server.net' }, ['nick', 'you are now registered']),
            );
            expect(result.eventName).toBe('notice');
            const p = result.payload as any;
            expect(p.from).toBe('server');
            expect(p.message).toBe('you are now registered');
        });
    });

    describe('Away', () => {
        it('registers RPL_AWAY command', () => {
            const pm = createMockPluginManager();
            new Away(pm);
            expect(pm.setCommand).toHaveBeenCalledWith('RPL_AWAY', expect.any(Object));
        });

        it('extracts nick and away message', () => {
            const pm = createMockPluginManager();
            const plugin = new Away(pm);
            const result = plugin.onCommand(makeMessage('RPL_AWAY', {}, ['mynick', 'targetuser', 'Gone fishing']));
            expect(result.eventName).toBe('away');
            const p = result.payload as any;
            expect(p.nick).toBe('targetuser');
            expect(p.message).toBe('Gone fishing');
        });
    });
});
