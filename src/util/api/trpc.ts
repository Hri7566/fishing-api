import { createTRPCClient, createWSClient, httpBatchLink, splitLink, wsLink } from "@trpc/client";
import type { AppRouter } from "@server/api/trpc";


require("dotenv").config();
export function gettRPC(token: string) {
    const fishingURL =
        process.env.FISHING_API_URL || "https://fishing.hri7566.info/api";
    const fishingWSURI = process.env.FISHING_API_WS_URI || "wss://fishing.hri7566.info/api"

    const client = createWSClient({
        url: fishingWSURI,
        connectionParams: { token }
    });

    return createTRPCClient<AppRouter>({
        links: [
            splitLink({
                condition: op => op.type === "subscription",
                true: wsLink({ client }),
                false: httpBatchLink({
                    url: fishingURL,
                    headers: {
                        Authorization: token
                    }
                })
            })
        ]
    });
}

export default gettRPC;
