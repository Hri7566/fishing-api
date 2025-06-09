<img src="./fish_icon.png" width="64" alt="Crucian Carp" />

# fishing-api

This is a rewrite of Brandon's fishing bot for Multiplayer Piano.

This project is a complete overhaul compared to the original script.

This project was created using `bun init` in bun v1.0.25 (it's since been updated, but I won't change this text). [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

## Project structure

Although it may seem a little complicated and redundant for an MPP "bot", this repo technically contains a bunch of different projects. Each service (website) the bot will connect to will have its own client. Three of these clients are built in, namely MPP, Discord, and a command line client for local testing and admin connections.

Each service communicates with the main API with a different token. This API actually handles all of the bot commands, fishing, kekklefruit tree nonsense, and user data.

The original Fishing Bot script used LevelDB to store everything, but this project uses PostgreSQL.

## Setup Guide

### Requirements

- PostgreSQL Database
- Bot tokens for public services

### Setup

Copy the default `.env` file:

```bash
cp .env.template .env
```

Edit that file to match your environment. Keep in mind that a connection token is required for all fishing service clients. These clients are for connecting to the actual service (such as Discord or MPP) and bridges the connection to the backend API. This way, not only is the execution related to fishing itself focused in its own process instead of travelling between sending messages and processing fishing-related computations, it's also able to restart without causing down-time on other platforms. If one client goes down, the rest are still up. Also, this allows anyone to run their own client connected to the API (with use of tokens, of course, you'd have to ask someone like me for one of those).

The URI to connect to the backend can be supplied through the `FISHING_API_URL` environment variable. The default value used is `"https://fishing.hri7566.info/api"` for the production server.

Next, install the project's dependencies from npm (without using npm):

```bash
bun install
bunx prisma db push
```

### Deployment

For local development, run both the HTTP API and any clients for your services separately with these commands (or similar):

```bash
bun . # Main http server
bun src/mpp/index.ts # MPP bot
bun src/discord/index.ts # Discord bot
bun src/cli/index.ts # Command-line client (for debugging)
```
