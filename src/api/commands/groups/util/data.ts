import Command from "@server/commands/Command";

export const data = new Command(
    "data",
    ["data"],
    "Data command",
    "data",
    "command.util.data",
    async () => {}
);
