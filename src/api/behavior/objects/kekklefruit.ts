import { incrementFishingChance } from "@server/fish/fishers";
import { registerBehavior } from "..";

registerBehavior<"eat">("kekklefruit:eat", async context => {
    const test = await incrementFishingChance(context.user.id);

    return {
        success: true,
        state: {
            shouldRemove: true,
            and: "and got a temporary fishing boost."
        }
    };
});
