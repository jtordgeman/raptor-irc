import Debug from 'debug';
import { Fish } from 'raptor-blowfish';

const debug: Debug.Debugger = Debug('Raptor:Fish');

export class Blowfish {
    private enc: ReturnType<typeof Fish.createCipher>;
    private dec: ReturnType<typeof Fish.createDecipher>;

    constructor(key: string) {
        debug('Blowfish initializing');
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
