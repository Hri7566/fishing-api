import { handleCommand } from "@server/commands/handler";
import { prefixes } from "@server/commands/prefixes";
import { checkToken } from "@server/data/token";
import { TRPCError, initTRPC } from "@trpc/server";
import { Logger } from "@util/Logger";
import type { CreateBunContextOptions } from "trpc-bun-adapter";
import { z } from "zod";

const logger = new Logger("tRPC");

export interface Context {
    isAuthed: boolean;
}

export const createContext = async (opts: CreateBunContextOptions) => {
    return {
        isAuthed: false
    } as Context;
};

const t = initTRPC.context<typeof createContext>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const privateProcedure = publicProcedure.use(async opts => {
    const { ctx } = opts;
    if (!ctx.isAuthed) throw new TRPCError({ code: "UNAUTHORIZED" });
    return opts.next({
        ctx: {
            isAuthed: true
        }
    });
});

export const appRouter = router({
    prefixes: publicProcedure.query(async opts => {
        return prefixes;
    }),

    auth: publicProcedure.input(z.string()).query(async opts => {
        logger.debug(opts);
        const token = opts.input;
        opts.ctx.isAuthed = await checkToken(token);
    }),

    command: privateProcedure
        .input(
            z.object({
                command: z.string(),
                prefix: z.string(),
                args: z.array(z.string()),
                user: z.object({
                    id: z.string(),
                    name: z.string(),
                    color: z.string()
                })
            })
        )
        .query(async opts => {
            const { command, args, prefix, user } = opts.input;
            const out = await handleCommand(command, args, prefix, user);

            return out;
        })
});

export type AppRouter = typeof appRouter;
