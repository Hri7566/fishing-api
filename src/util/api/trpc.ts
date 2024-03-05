import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@server/api/trpc";

const apiToken = process.env.FISHING_TOKEN as string;

export const trpc = createTRPCClient<AppRouter>({
    links: [
        // httpBatchLink({
        //     url: "http://localhost:3000",
        //     headers() {
        //         return {
        //             Authorization: apiToken
        //         };
        //     }
        // }),
        httpBatchLink({
            url: "https://fishing.hri7566.info/api",
            headers() {
                return {
                    Authorization: apiToken
                };
            }
        })
    ]
});

export default trpc;
