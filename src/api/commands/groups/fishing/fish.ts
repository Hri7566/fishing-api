import Command from "@server/commands/Command";

export const fish = new Command(
    "fish",
    ["fish", "fosh", "cast"],
    "Send your LURE into a water for catching fish",
    "fish",
    "command.fishing.fish",
    async () => {
        return "There is no fishing yet, please come back later when I write the code for it";
    }
);
