import Command from "@server/commands/Command";
import { getInventory } from "@server/data/inventory";
import { locations } from "@server/fish/locations";

export const look = new Command(
    "look",
    ["look", "see"],
    "Look at your surroundings",
    "look",
    "command.fishing.look",
    async ({ id, command, args, prefix, part, user }) => {
        const inventory = await getInventory(user.inventoryId);
        if (!inventory) return;

        let loc = locations.find(loc => loc.id == inventory.location);
        if (!loc) loc = locations[0];

        const objList: string[] = [];

        for (const obj of loc.objects) {
            objList.push(
                `${obj.emoji || ""}${obj.name}${
                    obj.count ? (obj.count > 1 ? ` (x${obj.count})` : "") : ""
                }`
            );
        }

        const list = objList.join(", ");

        return `There's ${list ? list + ", about." : "not much around."}`;
    }
);
