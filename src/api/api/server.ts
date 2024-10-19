import { createBunServeHandler } from "trpc-bun-adapter";
import { appRouter, createContext } from "./trpc";
import { Logger } from "@util/Logger";
import path from "path";

const logger = new Logger("Server");

export const server = Bun.serve(
    createBunServeHandler(
        {
            router: appRouter,
            createContext: createContext,
            req: new Request("https://github.com/Hri7566"),
            endpoint: "/"
        },
        {
            async fetch(req, server) {
                console.log(req);
                const url = new URL(req.url).pathname;

                const pathargs = url.split("/");

                if (pathargs[0] === "images") {
                    const file = path.join("./images/", url);
                    const data = Bun.file(file);
                    return new Response(data);
                } else {
                    return new Response();
                }
            }
        }
    )
);

logger.info("Started on port", (process.env.PORT as string) || 3000);

export default server;
