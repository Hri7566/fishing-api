import Command from "@server/commands/Command";

export const memory = new Command(
    "memory",
    ["memory", "mem"],
    "View memory usage",
    "memory",
    "command.util.memory",
    async () => {
        const mem = process.memoryUsage();
        return `Memory: ${(mem.heapUsed / 1024 / 1024).toFixed(2)}m / ${(
            mem.heapTotal /
            1024 /
            1024
        ).toFixed(2)}m / ${(mem.rss / 1024 / 1024).toFixed(2)}m`;
    },
    false
);
