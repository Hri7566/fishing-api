import { handleCommand } from "@server/commands/handler";
import { prefixes } from "@server/commands/prefixes";
import { checkToken } from "@server/data/token";
import { TRPCError, initTRPC } from "@trpc/server";
import { Logger } from "@util/Logger";
import type { CreateBunContextOptions } from "trpc-bun-adapter";
import { z } from "zod";

const logger = new Logger("tRPC");

export const createContext = async (opts: CreateBunContextOptions) => {
    return {
        isAuthed: false,
        req: opts.req
    };
};

export type Context = Awaited<ReturnType<typeof createContext>>;
const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const privateProcedure = publicProcedure.use(async opts => {
    const { ctx } = opts;
    const { req } = ctx;

    const token = req.headers.get("authorization");
    if (!token) throw new TRPCError({ code: "UNAUTHORIZED" });

    opts.ctx.isAuthed = await checkToken(token);

    if (!ctx.isAuthed) throw new TRPCError({ code: "UNAUTHORIZED" });

    return opts.next(opts);
});

export const appRouter = router({
    prefixes: publicProcedure.query(async opts => {
        return prefixes;
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
