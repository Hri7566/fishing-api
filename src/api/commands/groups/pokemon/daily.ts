import Command from "@server/commands/Command";
import { logger } from "@server/commands/handler";
import { claimDailyPokemon } from "@server/pokemon/daily";

export const daily = new Command(
    "daily",
    ["daily", "dailypokemon"],
    "Claim your daily Pokémon reward",
    "daily",
    "command.inventory.daily",
    async ({ id, command, args, prefix, part, user }) => {
        try {
            const message = await claimDailyPokemon(user.id);
            return message;
        } catch (err) {
            logger.error("Unable to perform daily claim:", err);
            return "Congratulations, you broke the bot. Your daily reward might not work now.";
        }
    },
    true
);
