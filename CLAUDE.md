# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Raptor-IRC is a TypeScript IRC bot framework. It's an event-driven, plugin-based library for building IRC bots with optional Blowfish message encryption and automatic reconnection support.

## Commands

- `npm run build` — Clean `dist/` and compile TypeScript
- `npm run dev` — Start dev server with tsx watch
- `npm run lint` — Lint and autofix with Biome
- `npm run format` — Format with Biome
- `npm run test` — Run all tests with Vitest
- `npm run test:watch` — Run tests in watch mode

## Architecture

### Message Flow

```
Network → NetworkManager (parses IRC protocol, resolves numeric replies)
  → Raptor (emits 'rawMessage')
    → PluginManager (routes by command name)
      → Plugin.onCommand() → returns {eventName, payload}
        → Raptor.emit() → global listeners + channel-specific listeners
```

### Reconnection Flow

```
socketClose (unintentional) → exponential backoff timer
  → connect() → socketOpen → registerWithServer()
    → welcome → auto-rejoin all tracked channels
```

Ping watchdog: if no server PING within `pingTimeout`, force-disconnects to trigger reconnect.

### Core Modules (`src/modules/`)

- **NetworkManager** — TCP/TLS socket connection, IRC protocol parsing, message prefix extraction (nick/user/host). Uses `irc-replies` to map numeric codes. Manages socket timeouts and cleanup.
- **PluginManager** — Auto-loads plugins from `src/plugins/` via dynamic `import()`. Routes incoming IRC commands to matching plugin by command name. Wraps plugin calls in try/catch.
- **Channel** — Represents an IRC channel. Has its own EventEmitter (separate from Raptor's). Auto-encrypts/decrypts messages when `fishKey` is provided via Blowfish.
- **Blowfish** — Wraps `raptor-blowfish` for encrypt/decrypt. Note: requires `--openssl-legacy-provider` on Node 20+ for the bf-ecb cipher.

### Plugin System

Plugins live in `src/plugins/`. Each plugin implements the `Plugin` interface:
- Constructor receives `IPluginManager` and calls `pluginManager.setCommand(commandName, this)` to register
- `onCommand(data: MessageObject)` processes the IRC command and returns `PluginResult` (`{eventName, payload}`)
- Plugins are auto-discovered at startup via `bot.init()` — just add a new file to `src/plugins/`
- Plugins use `export default ClassName` (ESM)

### Key Interfaces (`src/interfaces/`)

- `RaptorConnectionOptions` — host, port, nick, user, pass, SSL, reconnect options, timeouts
- `Plugin` / `IPluginManager` / `PluginResult` — plugin contract
- `MessageObject` / `MessagePrefix` / `PrivMsgObj` — parsed IRC message types
- `ChannelOptions` / `ChannelInterface` — channel configuration (name, key, fishKey)

### Debug Logging

Uses the `debug` package with namespaces: `Raptor`, `Raptor:Network`, `Raptor:Fish`, `Raptor:Channel`, `Raptor:PluginManager`.

## Code Style

- Biome: 120 char width, trailing commas, single quotes, 4-space indent
- Strict TypeScript (ES2020 target, NodeNext modules)
- ESM with `node:` protocol for Node.js builtins
- `type` imports for interfaces/types
