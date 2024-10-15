import { registerBehavior } from "..";

registerBehavior<"yeet">("sand:yeet", async context => {
    return {
        success: true,
        state: {
            shouldRemove: false,
            text: `No, ${context.part.name}, don't yeet sand.`
        }
    };
});
