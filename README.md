# fishing-api

This is a rewrite of Brandon Lockaby's fishing bot for Multiplayer Piano.

This project is a complete overhaul over the original script.

This project was created using `bun init` in bun v1.0.25. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

## Deployment

Setup the `.env` file like other projects, then:

```bash
bunx prisma db push
bun install
bun run src/index.ts
```
