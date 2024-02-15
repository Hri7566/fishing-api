import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@server/api/trpc";

export const trpc = createTRPCClient<AppRouter>({
    links: [
        httpBatchLink({
            url: "http://localhost:3000"
        }),
        httpBatchLink({
            url: "https://fishing.hri7566.info/api"
        })
    ]
});

export default trpc;
