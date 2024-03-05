import Command from "@server/commands/Command";

export const group = new Command(
    "group",
    ["group"],
    "Get user group",
    "group",
    "command.util.group",
    async props => {
        return JSON.stringify(props);
    },
    false
);
