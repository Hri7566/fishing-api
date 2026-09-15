import { getBranch } from "@util/git";

// first prefix is considered the "main" prefix
// development versions will replace this with a dev prefix now
export let prefixes = ["/", "fish/", "fishing/", "f/", "fosh/", "foshong/"];

if ((await getBranch()) !== "main") {
    prefixes.splice(0, 1);
    prefixes = ["!fishdev ", ...prefixes.slice(1)];
}
