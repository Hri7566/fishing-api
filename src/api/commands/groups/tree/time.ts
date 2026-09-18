import Command from "@server/commands/Command";

const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
];

export const time = new Command(
    "time",
    ["time", "timi", "tomo", "tumu", "tama", "teme"],
    "Get the current time.",
    "time",
    "command.tree.time",
    async ({ id, command, args, prefix, part, user, isDM }) => {
        const d = new Date();
        const time = d.toLocaleTimeString();
        const month = d.getMonth();

        return `BOINNG! BOINNG! The current time is: ${time} (${months[month]})`;
    }
);
