import { getBacks, flushBacks } from "@server/backs";
import { commandGroups } from "@server/commands/groups";
import { handleCommand } from "@server/commands/handler";
import { prefixes } from "@server/commands/prefixes";
import { kvGet, kvSet } from "@server/data/keyValueStore";
import { checkToken, tokenToID } from "@server/data/token";
import { TRPCError, initTRPC } from "@trpc/server";
import { Logger } from "@util/Logger";
import type { CreateBunContextOptions } from "trpc-bun-adapter";
import { z } from "zod";

const logger = new Logger("tRPC");

interface FishingContext {
    isAuthed: boolean;
    req: Request;
    token: string | null;
}

interface PrivateFishingContext extends FishingContext {
    token: string;
}

export const createContext = async (opts: CreateBunContextOptions) => {
    return {
        isAuthed: false,
        req: opts.req
    } as FishingContext;
};

export type Context = Awaited<ReturnType<typeof createContext>>;
const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const privateProcedure = publicProcedure.use(async opts => {
    const { ctx } = opts;
    const { req } = ctx;

    opts.ctx.token = req.headers.get("authorization");
    if (!opts.ctx.token) throw new TRPCError({ code: "UNAUTHORIZED" });
    opts.ctx.isAuthed = await checkToken(opts.ctx.token);

    if (!ctx.isAuthed) throw new TRPCError({ code: "UNAUTHORIZED" });

    return opts.next({
        ctx: opts.ctx as PrivateFishingContext
    });
});

export const appRouter = router({
    prefixes: publicProcedure.query(async opts => {
        return prefixes;
    }),

    commandList: publicProcedure.query(async opts => {
        let groups = [];

        for (const group of commandGroups) {
            let commands = group.commands.filter(cmd => cmd.visible);

            groups.push({
                id: group.id,
                displayName: group.displayName,
                commands
            });
        }

        return groups;
    }),

    command: privateProcedure
        .input(
            z.object({
                channel: z.string(),
                command: z.string(),
                prefix: z.string(),
                args: z.array(z.string()),
                user: z.object({
                    id: z.string(),
                    name: z.string(),
                    color: z.string()
                }),
                isDM: z.boolean().optional()
            })
        )
        .query(async opts => {
            const id = tokenToID(opts.ctx.token);
            const { channel, command, args, prefix, user, isDM } = opts.input;
            const out = await handleCommand(
                id,
                channel,
                command,
                args,
                prefix,
                user,
                isDM
            );

            try {
                return out;
            } catch (err) {
                logger.error(err);
                return undefined;
            }
        }),

    backs: privateProcedure.query(async opts => {
        const id = tokenToID(opts.ctx.token);

        const backs = getBacks<{}>(id);
        flushBacks(id);

        try {
            return backs;
        } catch (err) {
            logger.error(err);
            return undefined;
        }
    }),

    saveColor: privateProcedure
        .input(
            z.object({
                userId: z.string(),
                color: z.string()
            })
        )
        .query(async opts => {
            const { id, json } = await kvSet(`usercolor~${opts.input.userId}`, {
                color: opts.input.color
            });

            return {
                success: true,
                id,
                json
            };
        }),

    getUserColor: privateProcedure
        .input(
            z.object({
                userId: z.string()
            })
        )
        .query(async opts => {
            const color = await kvGet(`usercolor~${opts.input.userId}`);

            return {
                color
            };
        })
});

export type AppRouter = typeof appRouter;
