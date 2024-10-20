import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@server/api/trpc";

require("dotenv").config();
export function gettRPC(token: string) {
    const fishingURL =
        process.env.FISHING_API_URL || "https://fishing.hri7566.info/api";

    return createTRPCClient<AppRouter>({
        links: [
            httpBatchLink({
                url: fishingURL,
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
