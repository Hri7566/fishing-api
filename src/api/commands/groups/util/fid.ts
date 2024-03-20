import Command from "@server/commands/Command";

export const fid = new Command(
    "fid",
    ["fid"],
    "Get internal ID",
    "fid",
    "command.util.fid",
    async props => {
        return props.id;
    },
    false
);
