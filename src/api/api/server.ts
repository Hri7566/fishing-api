import { createBunServeHandler } from "trpc-bun-adapter";
import { appRouter } from "./trpc";

export const server = Bun.serve(
    createBunServeHandler({
        router: appRouter
    })
);

export default server;
