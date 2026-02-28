# Raptor-IRC 🦕

> A tiny and fast IRC bots framework written in TypeScript

## Features

- **Plugin-based architecture** — built-in handlers for all common IRC commands, easy to extend with custom plugins
- **Auto-reconnect** — exponential backoff reconnection with automatic channel rejoin after netsplits or disconnects
- **Blowfish encryption** — optional per-channel message encryption using FiSH/Blowfish
- **Typed events** — full TypeScript support with typed interfaces for all IRC message types
- **ESM native** — modern ES modules with `NodeNext` module resolution
- **Ping watchdog** — detects silent disconnects when the server stops sending PINGs
- **Lightweight** — minimal dependencies, small footprint

## Installation

```bash
npm install raptor-irc
```

Requires Node.js >= 20.0.0.

## Quick Start

```typescript
import { Raptor } from 'raptor-irc';

const bot = new Raptor({
    host: 'irc.libera.chat',
    port: 6667,
    nick: 'mybot',
    user: 'mybot',
});

// Load built-in plugins (ping, privmsg, join, etc.)
await bot.init();

bot.on('welcome', () => {
    console.log('Connected!');
    const channel = bot.channel({ name: 'general' });
    channel.join();
});

bot.on('privmsg', (msg) => {
    console.log(`${msg.from}: ${msg.message}`);
});

bot.on('reconnecting', (info) => {
    console.log(`Reconnecting (attempt ${info.attempt})...`);
});

bot.connect();
```

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `host` | `string` | *required* | IRC server hostname |
| `port` | `number` | *required* | IRC server port |
| `nick` | `string` | *required* | Bot nickname |
| `user` | `string` | *required* | Bot username (ident) |
| `pass` | `string` | — | Server password |
| `realName` | `string` | nick | Real name field |
| `ssl` | `boolean` | `false` | Use TLS connection |
| `selfSigned` | `boolean` | `false` | Allow self-signed TLS certificates |
| `reconnect` | `boolean` | `true` | Auto-reconnect on disconnect |
| `reconnectDelay` | `number` | `5000` | Base delay in ms before reconnecting |
| `reconnectMaxRetries` | `number` | `10` | Max reconnection attempts before giving up |
| `socketTimeout` | `number` | `300000` | Socket timeout in ms (5 minutes); set to `0` to disable |
| `pingTimeout` | `number` | `240000` | Disconnect if no server PING in this time (ms); set to `0` to disable |

## Channels

```typescript
// Join a channel
const ch = bot.channel({ name: 'general' });
ch.join();

// Join with a key
const secret = bot.channel({ name: 'secret', key: 'password123' });
secret.join();

// Blowfish-encrypted channel
const encrypted = bot.channel({ name: 'private', fishKey: 'my-encryption-key' });
encrypted.join();

// Channel methods
ch.write('Hello everyone!');        // Send message (auto-encrypts if fishKey set)
ch.notice('Server notice');         // Send NOTICE
ch.part('Goodbye!');                // Leave channel
ch.setmode('o', 'nick');            // +o nick
ch.unsetmode('o', 'nick');          // -o nick
ch.ban('*!*@bad.host');             // Ban
ch.unban('*!*@bad.host');           // Unban
```

### Channel-specific events

```typescript
// Listen to events on a specific channel
ch.on('privmsg', (msg) => {
    // Messages are automatically decrypted if fishKey is configured
    console.log(`[${ch.name}] ${msg.from}: ${msg.message}`);
});
```

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `welcome` | `string` | Server welcome message (bot registered) |
| `privmsg` | `{ from, hostname, target, message }` | Private/channel message |
| `join` | `{ nick, hostname, channel }` | User joined a channel |
| `part` | `{ nick, hostname, channel }` | User left a channel |
| `kick` | `{ nick, hostname, channel, kicked, message }` | User was kicked |
| `mode` | `{ nick, hostname, channel, flag, payload }` | Mode change |
| `notice` | `{ from, hostname, to, message }` | NOTICE message |
| `away` | `{ nick, message }` | User away status |
| `ping` | `string` | Server PING received (PONG sent automatically) |
| `pong` | `string` | PONG response |
| `message` | `{ raw, parsed }` | Every IRC message (raw + plugin-parsed) |
| `socketOpen` | — | TCP connection established |
| `socketClose` | `{ error, intentional }` | Connection closed |
| `reconnecting` | `{ attempt, delay }` | Reconnection attempt starting |
| `reconnected` | — | Successfully reconnected |
| `reconnectFailed` | — | All reconnection attempts exhausted |

## Reconnection

Auto-reconnect is enabled by default. When the connection drops:

1. Waits `reconnectDelay` ms (default 5s)
2. Attempts to reconnect
3. On failure, doubles the delay (exponential backoff, capped at 60s)
4. After `reconnectMaxRetries` (default 10) failures, emits `reconnectFailed` and stops
5. On successful reconnect, re-registers with the server and auto-rejoins all channels

A ping watchdog also runs: if no PING is received from the server within `pingTimeout` (default `240000` ms / 4 minutes), the connection is force-closed to trigger reconnection. This catches silent disconnects during netsplits. Set `pingTimeout: 0` to disable the watchdog entirely.

To disable auto-reconnect:

```typescript
const bot = new Raptor({ ...options, reconnect: false });
```

## Writing Plugins

Plugins are auto-loaded from `src/plugins/`. Each plugin handles one IRC command:

```typescript
import type { MessageObject } from '../interfaces/Message.js';
import type { IPluginManager, Plugin, PluginResult } from '../interfaces/Plugin.js';

class MyPlugin implements Plugin {
    constructor(public pluginManager: IPluginManager) {
        pluginManager.setCommand('INVITE', this);
    }

    onCommand(data: MessageObject): PluginResult {
        return {
            eventName: 'invite',
            payload: {
                from: data.prefix.nick,
                channel: data.params[1],
            },
        };
    }
}

export default MyPlugin;
```

Drop the file in `src/plugins/` and it will be auto-discovered on `bot.init()`.

## Development

```bash
npm run dev          # Start dev server with tsx watch
npm run build        # Compile TypeScript to dist/
npm run lint         # Lint with Biome
npm run format       # Format with Biome
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
```

## License

MIT
