import { describe, expect, it } from 'vitest';
import { Blowfish } from '../modules/Blowfish.js';

// NOTE: raptor-blowfish uses Node.js crypto with the legacy Blowfish cipher (bf-ecb).
// On Node 20+ with OpenSSL 3.x, this cipher is disabled by default.
// These tests will pass only if NODE_OPTIONS=--openssl-legacy-provider is set,
// or when raptor-blowfish is updated to use a modern cipher implementation.
describe('Blowfish', () => {
    const isLegacyCryptoAvailable = (() => {
        try {
            const bf = new Blowfish('testkey');
            bf.encrypt('test');
            return true;
        } catch {
            return false;
        }
    })();

    it.skipIf(!isLegacyCryptoAvailable)('encrypts and decrypts round-trip correctly', () => {
        const bf = new Blowfish('testkey123');
        const original = 'Hello, IRC!';
        const encrypted = bf.encrypt(original);
        expect(encrypted).not.toBe(original);

        const decrypted = bf.decrypt(encrypted);
        expect(decrypted).toBe(original);
    });

    it.skipIf(!isLegacyCryptoAvailable)('produces different ciphertext for different keys', () => {
        const bf1 = new Blowfish('key1');
        const bf2 = new Blowfish('key2');
        const msg = 'test message';

        const enc1 = bf1.encrypt(msg);
        const enc2 = bf2.encrypt(msg);
        expect(enc1).not.toBe(enc2);
    });
});
