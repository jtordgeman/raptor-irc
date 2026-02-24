import { describe, expect, it, vi } from 'vitest';
import { Channel } from '../modules/Channel.js';

function createMockRaptor() {
    return {
        write: vi.fn(),
        onChannel: vi.fn(),
    } as any;
}

describe('Channel', () => {
    describe('constructor', () => {
        it('prefixes name with #', () => {
            const ch = new Channel({ name: 'test' }, createMockRaptor());
            expect(ch.name).toBe('#test');
        });

        it('creates an EventEmitter', () => {
            const ch = new Channel({ name: 'test' }, createMockRaptor());
            expect(ch.emitter).toBeDefined();
        });

        it('initializes Blowfish when fishKey is provided', () => {
            const ch = new Channel({ name: 'test', fishKey: 'secretkey' }, createMockRaptor());
            expect(ch.blowfish).toBeDefined();
        });

        it('does not initialize Blowfish without fishKey', () => {
            const ch = new Channel({ name: 'test' }, createMockRaptor());
            expect(ch.blowfish).toBeUndefined();
        });
    });

    describe('write', () => {
        it('sends PRIVMSG without encryption', () => {
            const raptor = createMockRaptor();
            const ch = new Channel({ name: 'test' }, raptor);
            ch.write('hello');
            expect(raptor.write).toHaveBeenCalledWith('PRIVMSG #test :hello');
        });

        // raptor-blowfish uses legacy Blowfish cipher (bf-ecb) which requires
        // NODE_OPTIONS=--openssl-legacy-provider on Node 20+ with OpenSSL 3.x
        it('does not send message when encryption fails', () => {
            const raptor = createMockRaptor();
            const ch = new Channel({ name: 'test', fishKey: 'key123' }, raptor);
            ch.write('hello');

            // Without legacy OpenSSL provider, encryption throws and message should not be sent
            expect(raptor.write).not.toHaveBeenCalled();
        });
    });

    describe('join', () => {
        it('sends JOIN command', () => {
            const raptor = createMockRaptor();
            const ch = new Channel({ name: 'test' }, raptor);
            ch.join();
            expect(raptor.write).toHaveBeenCalledWith('JOIN #test');
        });

        it('sends JOIN with key when configured', () => {
            const raptor = createMockRaptor();
            const ch = new Channel({ name: 'test', key: 'secret' }, raptor);
            ch.join();
            expect(raptor.write).toHaveBeenCalledWith('JOIN #test secret');
        });
    });

    describe('part', () => {
        it('sends PART with message', () => {
            const raptor = createMockRaptor();
            const ch = new Channel({ name: 'test' }, raptor);
            ch.part('goodbye');
            expect(raptor.write).toHaveBeenCalledWith('PART #test :goodbye');
        });

        it('sends PART without message', () => {
            const raptor = createMockRaptor();
            const ch = new Channel({ name: 'test' }, raptor);
            ch.part();
            expect(raptor.write).toHaveBeenCalledWith('PART #test');
        });
    });

    describe('mode commands', () => {
        it('setmode sends +mode', () => {
            const raptor = createMockRaptor();
            const ch = new Channel({ name: 'test' }, raptor);
            ch.setmode('o', 'nick');
            expect(raptor.write).toHaveBeenCalledWith('MODE #test +o nick');
        });

        it('unsetmode sends -mode', () => {
            const raptor = createMockRaptor();
            const ch = new Channel({ name: 'test' }, raptor);
            ch.unsetmode('o', 'nick');
            expect(raptor.write).toHaveBeenCalledWith('MODE #test -o nick');
        });

        it('ban sends +b mode', () => {
            const raptor = createMockRaptor();
            const ch = new Channel({ name: 'test' }, raptor);
            ch.ban('*!*@bad.host');
            expect(raptor.write).toHaveBeenCalledWith('MODE #test +b *!*@bad.host');
        });

        it('unban sends -b mode', () => {
            const raptor = createMockRaptor();
            const ch = new Channel({ name: 'test' }, raptor);
            ch.unban('*!*@bad.host');
            expect(raptor.write).toHaveBeenCalledWith('MODE #test -b *!*@bad.host');
        });
    });

    describe('notice', () => {
        it('sends NOTICE command', () => {
            const raptor = createMockRaptor();
            const ch = new Channel({ name: 'test' }, raptor);
            ch.notice('hello');
            expect(raptor.write).toHaveBeenCalledWith('NOTICE #test :hello');
        });
    });

    describe('on', () => {
        it('delegates to raptor.onChannel', () => {
            const raptor = createMockRaptor();
            const ch = new Channel({ name: 'test' }, raptor);
            const cb = vi.fn();
            ch.on('privmsg', cb);
            expect(raptor.onChannel).toHaveBeenCalledWith('#test', 'privmsg', cb);
        });
    });
});
