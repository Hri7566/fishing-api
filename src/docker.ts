const service = process.env.SERVICE as "server" | "mpp" | "discord";

switch (service) {
    case "server":
        await import("./api");
        break;
    case "discord":
        await import("./discord");
        break;
    case "mpp":
        await import("./mppnet");
        break;
}
