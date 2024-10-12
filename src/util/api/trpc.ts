import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@server/api/trpc";

require("dotenv").config();
export function gettRPC(token: string) {
    const fishingURL = process.env.FISHING_API_URL as string;

    const firstLink = httpBatchLink({
        url: fishingURL,
        headers() {
            return {
                Authorization: token
            };
        }
    });

    const secondLink = httpBatchLink({
        url: "https://fishing.hri7566.info/api",
        headers() {
            return {
                Authorization: token
            };
        }
    });

    const links = firstLink ? [firstLink, secondLink] : [secondLink];
    return createTRPCClient<AppRouter>({ links });
}

export default gettRPC;
