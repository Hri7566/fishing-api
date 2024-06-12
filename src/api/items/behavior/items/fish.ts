import { addBack } from "@server/backs";
import { CosmicColor } from "@util/CosmicColor";

export const fish: IBehaviorDefinition = {
    id: "fish",
    bhv: {
        async eat(obj, props) {
            const r = Math.random();

            const fish = obj as IFish;

            console.log(fish)
            console.log(fish.rarity);

            // 50%
            if (r < 0.5) {
                const color = new CosmicColor(
                    Math.floor(Math.random() * 255),
                    Math.floor(Math.random() * 255),
                    Math.floor(Math.random() * 255)
                );

                addBack(props.id, {
                    m: "color",
                    id: props.part.id,
                    color: color.toHexa()
                });

                return {
                    success: true,
                    shouldRemove: true,
                    and: `and it made him/her turn ${color
                        .getName()
                        .toLowerCase()}.`
                };
            } else {
                return {
                    success: true,
                    shouldRemove: true
                }
            }
        }
    }
};
