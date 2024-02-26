import Command from "@server/commands/Command";
import { CosmicColor } from "@util/CosmicColor";

export const color = new Command(
    "color",
    ["color"],
    "Get the name of a color",
    "color [hex color]",
    "command.general.color",
    async ({ id, command, args, prefix, part, user }) => {
        let color = args[0];
        let out = `Friend ${part.name}: That color is`;

        if (!color) {
            color = part.color;
            out = `Friend ${part.name}, your color is`;
        }

        const c = new CosmicColor(color);
        return `${out} ${c.getName().toLowerCase()}.`;
    }
);
