import { addEvent } from "@server/events";
import Command from "@server/commands/Command";

export const setcolor = new Command(
    "setcolor",
    ["setcolor"],
    "Set own user color",
    "setcolor <color>",
    "command.util.setcolor",
    async ({ id, command, args, prefix, part, user }) => {
        if (typeof args[0] !== "string") return "Please provide a color.";

        addEvent(id, {
            m: "color",
            id: part.id,
            color: args[0]
        });

        return "Attempting to set color.";
    },
    false
);
