import { addBack } from "@server/backs";
import Command from "@server/commands/Command";
import { logger } from "@server/commands/handler";
import { getInventory, updateInventory } from "@server/data/inventory";
import { getUser } from "@server/data/user";
import { getSizeString } from "@server/fish/fish";
import { fishers, getFishing } from "@server/fish/fishers";
import { CosmicColor } from "@util/CosmicColor";

export const yeet = new Command(
    "yeet",
    ["yeet", "yoot"],
    "Yeet literally anything you have (except non-fish animals)",
    "yeet <something>",
    "command.inventory.yeet",
    async ({ id, command, args, prefix, part, user }) => {
        const yeeting = args[0];
        if (!yeeting) return `What do you want to ${prefix}yeet?`;

        const inventory = await getInventory(user.inventoryId);
        if (!inventory) return;

        let foundObject: IObject | undefined;
        let tryKekGen = false;
        let i = 0;

        for (const item of inventory.items as unknown as IItem[]) {
            if (!item.name.toLowerCase().includes(yeeting.toLowerCase())) {
                i++;
                continue;
            }

            foundObject = item;

            let shouldRemove = false;

            if (typeof item.count !== "undefined") {
                if (item.count > 1) {
                    shouldRemove = false;
                    ((inventory.items as TInventoryItems)[i].count as number)--;
                } else {
                    shouldRemove = true;
                }
            } else {
                shouldRemove = true;
            }

            if (shouldRemove) (inventory.items as TInventoryItems).splice(i, 1);
            break;
        }

        i = 0;

        // no more yeeting animals
        // for (const pokemon of inventory.pokemon as TPokemonSack) {
        //     if (!pokemon.name.toLowerCase().includes(yeeting.toLowerCase())) {
        //         i++;
        //         continue;
        //     }

        //     foundObject = pokemon as unknown as IObject;

        //     let shouldRemove = false;

        //     if (typeof pokemon.count !== "undefined") {
        //         if (pokemon.count > 1) {
        //             shouldRemove = false;
        //             ((inventory.pokemon as TPokemonSack)[i].count as number)--;
        //         } else {
        //             shouldRemove = true;
        //         }
        //     } else {
        //         shouldRemove = true;
        //     }

        //     if (shouldRemove) (inventory.pokemon as TPokemonSack).splice(i, 1);
        //     break;
        // }

        i = 0;

        for (const fish of inventory.fishSack as TFishSack) {
            if (!fish.name.toLowerCase().includes(yeeting.toLowerCase())) {
                i++;
                continue;
            }

            foundObject = fish;

            let shouldRemove = false;

            if (typeof fish.count !== "undefined") {
                if (fish.count > 1) {
                    shouldRemove = false;
                    ((inventory.fishSack as TFishSack)[i].count as number)--;
                } else {
                    shouldRemove = true;
                }
            } else {
                shouldRemove = true;
            }

            if (shouldRemove) (inventory.fishSack as TFishSack).splice(i, 1);
            break;
        }

        if (!foundObject) return `You don't have "${yeeting}" to yeet.`;
        if (foundObject.objtype == "fish") {
            tryKekGen = true;
        }

        await updateInventory(inventory);

        // TODO Implement kekklefruit generation
        if (foundObject.id == "sand") {
            return `No, ${part.name}, don't yeet ${foundObject.name}.`;
        } else {
            if (Math.random() < 0.15) {
                const randomFisher =
                    Object.values(fishers)[
                        Math.floor(
                            Math.random() * Object.values(fishers).length
                        )
                    ];

                const person = await getUser(randomFisher.userID);

                let target: string;

                if (!person) {
                    target = "Anonymous";
                } else {
                    target = person.name;
                }

                let handsAdjective = [
                    " violent ",
                    " shaking ",
                    " angery ",
                    " two (2) ",
                    " unknown number of ",
                    " "
                ];

                let pastTense = [
                    "slung",
                    "foisted",
                    "launched",
                    "yeeted",
                    "expelled",
                    "fired"
                ];

                let presentTense = [
                    "lazily",
                    "forcefully",
                    "haphazardly",
                    "angrily",
                    "playfully",
                    "lovingly"
                ];

                let ending = [
                    `in the direction of ${target}.`,
                    `at where ${target} happens to be.`,
                    `at ${target}.`,
                    `directly at ${target}'s location in this realm.`,
                    `at the general vicinity of ${target}.`
                ];

                let itemAdjective = [
                    "gooey",
                    "powdery",
                    "residual",
                    "smelly",
                    "appropriate",
                    foundObject.name,
                    foundObject.name + "y",
                    "greasy",
                    "uncomfortable",
                    "delicious",
                    "wonderful",
                    "questionable",
                    "nice",
                    "gelatinous",
                    "shampoo",
                    "fatty",
                    "warm",
                    "hot",
                    "cold",
                    "dripping",
                    "fish",
                    "unknown"
                ];

                let ps = [
                    "It missed.",
                    "It grazed his/her cheek, leaving a small dab of " +
                        foundObject.name +
                        ".",
                    foundObject.objtype == "fish"
                        ? "Being that it was so " +
                          getSizeString((foundObject as IFish).size) +
                          ", I'm sure you can infer how comical the result is!"
                        : "Being that it was so voluminous, I'm sure you can infer how comical the result is!",
                    "It smacked right across his/her face.",
                    "It got hung in his/her shirt and he/she flung it out onto the ground and it was quite a silly scene.",
                    `It scooted across his/her head before rebounding off onto the ground nearby. The ${
                        itemAdjective[
                            Math.floor(Math.random() * itemAdjective.length)
                        ]
                    } residue was left behind in ${target}'s hair.`
                ];

                return `Friend ${part.name}'s${
                    handsAdjective[
                        Math.floor(Math.random() * handsAdjective.length)
                    ]
                }hands grabbed his/her ${foundObject.name} and ${
                    pastTense[Math.floor(Math.random() * pastTense.length)]
                } it ${
                    presentTense[
                        Math.floor(Math.random() * presentTense.length)
                    ]
                } ${ending[Math.floor(Math.random() * ending.length)]}`;
            }

            return `Friend ${part.name} tossed his/her ${foundObject.name}.`;
        }
    }
);
