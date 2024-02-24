import Command from "@server/commands/Command";
import { commandGroups } from "..";
import { logger } from "@server/commands/handler";
import { CosmicColor } from "@util/CosmicColor";

export const color = new Command(
    "color",
    ["color"],
    "Get the name of a color",
    "color",
    "command.general.color",
    async ({ id, command, args, prefix, part, user }) => {
        let color = args[0];
        let out1 = `Friend ${part.name}: That color is`;

        if (!color) {
            color = part.color;
            out1 = `Friend ${part.name}, your color is`;
        }

        const c = new CosmicColor(color);
        return `${out1} ${c.getName().toLowerCase()}.`;
    }
);
