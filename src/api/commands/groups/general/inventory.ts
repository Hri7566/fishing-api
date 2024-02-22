import Command from "@server/commands/Command";
import { getInventory } from "@server/data/inventory";

export const inventory = new Command(
    "inventory",
    ["inventory", "inv"],
    "Look at your inventory",
    "data",
    "command.util.inventory",
    async ({ id, command, args, prefix, part, user }) => {
        const inventory = await getInventory(user.inventoryId);
        if (!inventory) return;

        const items = inventory.items as unknown as IItem[];

        return `Inventory: ${items
            .map(
                item =>
                    `${item.emoji || ""}${item.name}${
                        item.count ? ` (x${item.count})` : ""
                    }`
            )
            .join(", ")}`;
    }
);
