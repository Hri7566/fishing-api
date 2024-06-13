import { addBack } from "@server/backs";
import Command from "@server/commands/Command";
import { getInventory, updateInventory } from "@server/data/inventory";
import { addItem } from "@server/items";

export const burger = new Command(
    "burger",
    ["burger"],
    "Get a burger",
    "burger",
    "command.util.burger",
    async ({ id, command, args, prefix, part, user }) => {
        const burger = {
            id: "burger",
            name: "Burger",
            objtype: "item",
            emoji: "🍔"
        };

        const inv = await getInventory(user.inventoryId);
        if (!inv) return "something has gone *terribly* wrong";

        addItem(inv.items as unknown as IObject[], burger);
        await updateInventory(inv);

        return "you now have burger";
    },
    false
);
