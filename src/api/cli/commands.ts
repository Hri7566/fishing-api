import type { ReadlineCommand } from "./ReadlineCommand";
import { deltoken } from "./commands/deltoken";
import { fruit } from "./commands/fruit";
import { gentoken } from "./commands/gentoken";
import { grow_fruit } from "./commands/grow_fruit";
import { help } from "./commands/help";
import { lstoken } from "./commands/lstoken";
import { say } from "./commands/say";
import { stop } from "./commands/stop";

export const readlineCommands: ReadlineCommand[] = [];

readlineCommands.push(help);
readlineCommands.push(gentoken);
readlineCommands.push(deltoken);
readlineCommands.push(lstoken);
readlineCommands.push(say);
readlineCommands.push(stop);
readlineCommands.push(fruit);
readlineCommands.push(grow_fruit);
