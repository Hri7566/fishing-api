import Command from "@server/commands/Command";

export const myid = new Command(
    "myid",
    ["myid", "myuuid"],
    "Get your own user ID",
    "myid",
    "command.general.myid",
    async ({ id, command, args, prefix, part, user }) => {
        return `Your ID: \`${part.id}\``;
    },
    false
);
