import { incrementFishingChance } from "@server/fish/fishers";

export const kekklefruit: IBehaviorDefinition = {
    id: "kekklefruit",
    bhv: {
        async eat(obj, props) {
            const test = await incrementFishingChance(props.user.id);

            return {
                success: true,
                shouldRemove: true,
                and: "and got a temporary fishing boost."
            };
        }
    }
};
