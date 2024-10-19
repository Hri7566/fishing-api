import Command from "@server/commands/Command";

export const info = new Command(
    "info",
    ["info"],
    "Show information about the bot",
    "info",
    "command.general.info",
    async ({ id, command, args, prefix, part, user }) => {
        return `🐟 Maintained by \`@hri7566\` (mppn @ead940199c7d9717e5149919) and developed with permission from Brandon`;
    },
    false
);
