import { addBack } from "@server/backs";
import { CosmicColor } from "@util/CosmicColor";

export const fish: IBehaviorDefinition = {
    id: "fish",
    bhv: {
        async eat(obj, props) {
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
        }
    }
};
