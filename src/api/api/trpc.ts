import { handleCommand } from "@server/commands/handler";
import { prefixes } from "@server/commands/prefixes";
import { TRPCError, initTRPC } from "@trpc/server";
import { Logger } from "@util/Logger";
import { z } from "zod";

export interface Context {
    isAuthed: boolean;
}

const t = initTRPC.context<Context>().create();

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

const logger = new Logger("tRPC");

export const appRouter = router({
    prefixes: publicProcedure.query(async opts => {
        return prefixes;
    }),

    command: publicProcedure
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
        }),

    auth: publicProcedure.input(z.string()).query(async opts => {
        const token = opts.input;
    })
});

export type AppRouter = typeof appRouter;
