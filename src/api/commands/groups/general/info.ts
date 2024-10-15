import Command from "@server/commands/Command";

export const info = new Command(
    "info",
    ["info"],
    "Show information about the bot",
    "info",
    "command.general.info",
    async ({ id, command, args, prefix, part, user }) => {
        return `🌊 Made by Hri7566 | Original created by Brandon Lockaby`;
    },
    false
);
