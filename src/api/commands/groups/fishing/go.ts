import Command from "@server/commands/Command";
import { getInventory, updateInventory } from "@server/data/inventory";
import { locations } from "@server/fish/locations";
import { nearby } from "./nearby";
import { getFishing, stopFishing } from "@server/fish/fishers";
import { reel } from "./reel";

export const go = new Command(
    "go",
    ["go"],
    "Go to another location",
    "go <location>",
    "command.fishing.go",
    async ({ id, command, args, prefix, part, user }) => {
        if (!args[0])
            return `Maybe you wanted to see what's ${prefix}${nearby.aliases[0]}?`;

        const inventory = await getInventory(user.inventoryId);
        if (!inventory) return;

        let loc = locations.find(loc => loc.id == inventory.location);
        if (!loc) loc = locations[0];

        let nextLoc: ILocation | undefined;

        for (const nearID of loc.nearby) {
            let near = locations.find(loc => loc.id == nearID);
            if (!near) continue;

            if (near.name.toLowerCase().includes(args[0].toLowerCase()))
                nextLoc = near;
        }

        if (!nextLoc)
            return `The place "${args[0]}" is not ${prefix}${nearby.aliases[0]}.`;

        inventory.location = nextLoc.id;
        await updateInventory(inventory);

        if (getFishing(id, user.id)) {
            stopFishing(id, user.id, false);
            return `You ${prefix}${reel.aliases[0]}ed your LURE in and went to ${nextLoc.name}.`;
        }

        return `You went to ${nextLoc.name}.`;
    }
);
