import { addBack } from "@server/backs";
import { CosmicColor } from "@util/CosmicColor";
import { registerBehavior } from "..";

registerBehavior<"eat">("fish:eat", async context => {
    const r = Math.random();

    // 50%
    if (r < 0.5) {
        const color = new CosmicColor(
            Math.floor(Math.random() * 255),
            Math.floor(Math.random() * 255),
            Math.floor(Math.random() * 255)
        );

        addBack(context.id, {
            m: "color",
            id: context.part.id,
            color: color.toHexa()
        });

        return {
            success: true,
            state: {
                shouldRemove: true,
                and: `and it made him/her turn ${color
                    .getName()
                    .toLowerCase()}.`
            }
        };
    } else {
        return {
            success: true,
            state: {
                shouldRemove: true
            }
        };
    }
});
