import { createBunServeHandler } from "trpc-bun-adapter";
import { appRouter, createContext } from "./trpc";
import { Logger } from "@util/Logger";

const logger = new Logger("Server");

export const server = Bun.serve(
    createBunServeHandler({
        router: appRouter,
        createContext: createContext
    })
);

logger.info("Started on port", (process.env.PORT as string) || 3000);

export default server;
