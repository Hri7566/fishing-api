import { getBacks, flushBacks } from "@server/backs";
import { handleCommand } from "@server/commands/handler";
import { prefixes } from "@server/commands/prefixes";
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

            return out;
        }),

    backs: privateProcedure.query(async opts => {
        const id = tokenToID(opts.ctx.token);

        const backs = getBacks<{}>(id);
        flushBacks(id);

        return backs;
    })
});

export type AppRouter = typeof appRouter;
