import { initTRPC } from "@trpc/server";
import { z } from "zod";

const t = initTRPC.create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const appRouter = router({
    cast: publicProcedure.input(z.string()).query(async opts => {
        const { input } = opts;
        const response = `${input} cast their rod`;
        return { response };
    })
});

export type AppRouter = typeof appRouter;
