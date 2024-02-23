import Command from "@server/commands/Command";
import { getInventory } from "@server/data/inventory";

export const sack = new Command(
    "sack",
    ["sack", "caught"],
    "Look at your fish sack",
    "sack",
    "command.inventory.sack",
    async ({ id, command, args, prefix, part, user }) => {
        const inv = await getInventory(user.inventoryId);
        if (!inv) return;

        const fishSack = inv.fishSack as TFishSack;

        return `Contents of ${part.name}'s fish sack: ${
            fishSack
                .map(
                    (fish: IFish) =>
                        `${fish.emoji || ""}${fish.name}${
                            fish.count ? ` (x${fish.count})` : ""
                        }`
                )
                .join(", ") || "(none)"
        }`;
    }
);
