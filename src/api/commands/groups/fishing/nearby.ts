import Command from "@server/commands/Command";
import { logger } from "@server/commands/handler";
import { getInventory, updateInventory } from "@server/data/inventory";
import { locations } from "@server/fish/locations";

export const nearby = new Command(
    "nearby",
    ["nearby", "noorby", "n"],
    "Look at nearby locations",
    "nearby",
    "command.fishing.nearby",
    async ({ id, command, args, prefix, part, user }) => {
        const inventory = await getInventory(user.inventoryId);
        if (!inventory) return;

        let loc = locations.find(loc => loc.id == inventory.location);
        if (!loc) loc = locations[0];

        // logger.debug(loc.nearby);

        const nearbyList: string[] = [];

        for (const nearID of loc.nearby) {
            const near = locations.find(loc => loc.id == nearID);
            if (!near) continue;
            nearbyList.push(near.name);
        }

        return `Nearby places: ${nearbyList.join(", ") || "(none)"}`;
    }
);
