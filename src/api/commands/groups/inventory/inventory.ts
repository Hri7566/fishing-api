import Command from "@server/commands/Command";
import { getInventory } from "@server/data/inventory";

export const inventory = new Command(
    "inventory",
    ["inventory", "inv", "i"],
    "Look at your inventory",
    "inventory",
    "command.inventory.inventory",
    async ({ id, command, args, prefix, part, user }) => {
        const inv = await getInventory(user.inventoryId);
        if (!inv) return;

        const items = inv.items as unknown as IItem[];

        return `Inventory: ${
            items
                .map(
                    item =>
                        `${item.emoji || ""}${item.name}${
                            item.count ? ` (x${item.count})` : ""
                        }`
                )
                .join(", ") || "(none)"
        }`;
    }
);
