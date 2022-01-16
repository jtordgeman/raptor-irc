import Debug from 'debug';
import { Fish } from 'raptor-blowfish';
import { Cipher } from 'raptor-blowfish/lib/cipher';
import { Decipher } from 'raptor-blowfish/lib/decipher';

const debug: Debug.Debugger = Debug('Raptor:Fish');

export class Blowfish {
    private enc: Cipher;
    private dec: Decipher;

    constructor(key: string) {
        debug(`Blowfish initializing with key: ${key}`);
        this.enc = Fish.createCipher(key);
        this.dec = Fish.createDecipher(key);
    }

    decrypt(msg: string): string {
        return this.dec.decrypt(msg);
    }

    encrypt(msg: string): string {
        return this.enc.encrypt(msg);
    }
}
