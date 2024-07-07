import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@server/api/trpc";

// const apiToken = process.env.FISHING_TOKEN as string;

export function gettRPC(token: string) {
    return createTRPCClient<AppRouter>({
        links: [
            /*httpBatchLink({
                url: "http://localhost:3000",
                headers() {
                    return {
                        Authorization: token
                    };
                }
            }),*/
            httpBatchLink({
                url: "https://fishing.hri7566.info/api",
                headers() {
                    return {
                        Authorization: token
                    };
                }
            })
        ]
    });
}

export default gettRPC;
