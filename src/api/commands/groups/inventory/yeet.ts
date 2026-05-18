import BehaviorCommand from "@server/commands/BehaviorCommand";
import { getInventory, updateInventory } from "@server/data/inventory";
import { getUser } from "@server/data/user";
import { fishers } from "@server/fish/fishers";
import { locations } from "@server/fish/locations";
import { addItem, findItemByNameFuzzy, removeItem } from "@server/items";
import { formatFishSize } from "@util/format";
import { copy } from "@util/object";

export const yeet = new BehaviorCommand(
    "yeet",
    ["yeet", "yoot"],
    "Yeet literally anything you have (except non-fish animals)",
    "yeet <something>",
    "command.inventory.yeet",
    async ({ id, command, args, prefix, part, user }, self) => {
        const yeeting = args.join(" ");
        if (!yeeting) return `What do you want to ${prefix}yeet?`;

        const inventory = await getInventory(user.inventoryId);
        if (!inventory) return;

        let foundObject: IObject | undefined;
        let tryKekGen = false;
        let shouldRemove = false;

        foundObject =
            findItemByNameFuzzy(inventory.items, yeeting) ||
            findItemByNameFuzzy(inventory.fishSack, yeeting);

        if (!foundObject) return `You don't have "${yeeting}" to yeet.`;

        let bhvNamespace = foundObject.id;
        let output = `Friend ${part.name} tossed his/her ${foundObject.name}.`;

        if (foundObject.objtype === "fish") {
            bhvNamespace = "fish";
            tryKekGen = true;
        }

        const res = await self.behave<"yeet">(
            {
                part
            },
            bhvNamespace,
            async ctx => {
                if (!foundObject) return {
                    success: false,
                    err: "no found object?"
                };

                if (tryKekGen) {
                    // 15%
                    if (Math.random() < 0.15) {
                        const randomFisher =
                            Object.values(fishers)[
                            Math.floor(
                                Math.random() *
                                Object.values(fishers).length
                            )
                            ];

                        let person: Partial<{
                            color: string;
                            id: string;
                            name: string;
                            inventoryId: number;
                        }> | null;

                        if (!randomFisher) {
                            person = {
                                name: "Anonymous"
                            };
                        } else {
                            person = await getUser(randomFisher.userID);
                        }

                        let target: string;

                        if (!person || person?.id === part.id) {
                            target = "Anonymous";
                        } else {
                            target = person.name || "Anonymous";
                        }

                        const handsAdjective = [
                            " violent ",
                            " shaking ",
                            " angry ",
                            " two (2) ",
                            " unknown number of ",
                            " ",
                            " big ",
                            " small ",
                            " little ",
                            " giant ",
                            " scaly ",
                            " dry ",
                            " wet ",
                            " meaty ",
                            " grubby ",
                            " rough ",
                            " smooth ",
                            " big ol' ",
                            " little ol' ",
                            " smelly ",
                            " clammy ",
                            " soft "
                        ];

                        const pastTense = [
                            "slung",
                            "foisted",
                            "launched",
                            "yeeted",
                            "expelled",
                            "fired"
                        ];

                        const presentTense = [
                            "lazily",
                            "forcefully",
                            "haphazardly",
                            "angrily",
                            "playfully",
                            "lovingly"
                        ];

                        const ending = [
                            `in the direction of ${target}.`,
                            `at where ${target} happens to be.`,
                            `at ${target}.`,
                            `directly at ${target}'s location in this realm.`,
                            `at the general vicinity of ${target}.`
                        ];

                        const itemAdjective = [
                            "gooey",
                            "powdery",
                            "residual",
                            "smelly",
                            "appropriate",
                            foundObject.name,
                            `${foundObject.name}y`,
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

                        const ps = [
                            "It missed.",
                            `It grazed his/her cheek, leaving a small dab of ${foundObject.name}.`,
                            foundObject.objtype === "fish"
                                ? `Being that it was so ${formatFishSize(
                                    (foundObject as IFish).size
                                )}, I'm sure you can infer how comical the result is!`
                                : "Being that it was so voluminous, I'm sure you can infer how comical the result is!",
                            "It smacked right across his/her face.",
                            "It got hung in his/her shirt and he/she flung it out onto the ground and it was quite a silly scene.",
                            `It scooted across his/her head before rebounding off onto the ground nearby. The ${itemAdjective[
                            Math.floor(
                                Math.random() * itemAdjective.length
                            )
                            ]
                            } residue was left behind in ${target}'s hair.`
                        ];

                        return {
                            success: true,
                            state: {
                                shouldRemove: true,
                                text: `Friend ${part.name}'s ${handsAdjective[
                                    Math.floor(
                                        Math.random() *
                                        handsAdjective.length
                                    )
                                ]
                                    } hands grabbed his/her ${foundObject.name
                                    } and ${pastTense[
                                    Math.floor(
                                        Math.random() * pastTense.length
                                    )
                                    ]
                                    } it ${presentTense[
                                    Math.floor(
                                        Math.random() * presentTense.length
                                    )
                                    ]
                                    } ${ending[
                                    Math.floor(
                                        Math.random() * ending.length
                                    )
                                    ]
                                    } ${ps[Math.floor(Math.random() * ps.length)]}`.trim()
                            }
                        };
                    }

                    if (Math.random() < 0.15) {
                        const size =
                            foundObject.objtype === "fish"
                                ? formatFishSize((foundObject as IFish).size)
                                : "voluminous";

                        const fish = foundObject.name;
                        const name = part.name;

                        const loc = locations.find(
                            loc => loc.id === inventory.location
                        );
                        if (!loc)
                            return {
                                success: true,
                                state: {
                                    shouldRemove: true,
                                    text: `Friend ${part.name} carelessly hurled their ${foundObject.name} into the empty void, where it is lost forever.`
                                }
                            };

                        foundObject = copy(foundObject);
                        foundObject.count = 1;

                        addItem(
                            locations[locations.indexOf(loc)].objects,
                            foundObject
                        );

                        const kekNames = [
                            "kek of good fortune",
                            "lucky kek",
                            "kek",
                            "fortunate kek",
                            "the kekklefruit that was knocked from the tree",
                            "sandy kekklefruit",
                            "baby kekklefruit"
                        ];

                        addItem(locations[locations.indexOf(loc)].objects, {
                            id: "kekklefruit",
                            name: kekNames[
                                Math.floor(Math.random() * kekNames.length)
                            ],
                            objtype: "item",
                            emoji: "🍍"
                        });

                        // transcribed from the old code
                        const yeets = [
                            `The ${size} ${fish} thwapped into the kekklefruit tree sending debris flying. A kekklefruit was knocked to the ground.`,
                            "It's lying there next to the tree.",
                            "It got splattered on the tree.",
                            "Part of it is stuck to the tree, but it came to rest on the ground nearby.",
                            `A distressed-looking ${fish} is on the ground near the tree.`,
                            "It landed in the grass.",
                            "It's kinda scuffed up.",
                            `It's got tree on it. And ${name}prints.`,
                            `It's ${size}.`,
                            "It belongs to the tree now.",
                            "It's by the tree now.",
                            `It's a ${size} ${fish} previously owned by ${name} if you still want it after that.`
                        ];

                        return {
                            success: true,
                            state: {
                                shouldRemove: true,
                                text: yeets[
                                    Math.floor(Math.random() * yeets.length)
                                ]
                            }
                        };
                    }

                    if (Math.random() < 0.4) {
                        const yeets = [
                            `Tossed ${foundObject.name} into the water.`,
                            "It looks like somebody tossed it haphazardly into the shallow water. It is not swimming.",
                            "It's in the shallows trying to swim away...",
                            `${user.name} tossed this into the shallows where it rests today. I don't think it's moving.`,
                            `I think it's a ${foundObject.name}.  A very immobile one.`,
                            "It's resting at the edge of the water where you can /take it.",
                            "The chances of it hitting the tree were nigh, and it landed on the surface of the water, unconscious...",
                            `The ${foundObject.name} splashes in the water and everyone looks at ${user.name}'s face. It is floating nearby.`,
                            `${user.name} tossed the ${foundObject.name} high into the air and it majestically dives into the water, washing ashore.`,
                            `${user.name}'s ${foundObject.name} followed their carefully-calculated trajectory and skims across the surface, coming to a halt.`,
                            `${user.name} forgot to follow through and the ${foundObject.name} falls straight into the water, flipping upside down.${(() => {
                                foundObject = copy(foundObject) as IObject;
                                if (!foundObject.name.startsWith("upside-down")) foundObject.name = `upside-down ${foundObject.name}`;
                                return undefined;
                            })() || ""}`
                        ];

                        return {
                            success: true,
                            state: {
                                shouldRemove: true,
                                text: yeets[
                                    Math.floor(Math.random() * yeets.length)
                                ]
                            }
                        };
                    }
                }

                return {
                    success: true,
                    state: {
                        shouldRemove: true,
                        text: output
                    }
                };
            }
        );

        if (res.success === true) {
            const state =
                res.state as IBehaviorContextStateDefinitions["yeet"]["state"];
            shouldRemove = state.shouldRemove;
            output = state.text;
        }

        if (shouldRemove) {
            if (foundObject.objtype === "fish") {
                removeItem(inventory.fishSack, foundObject);
            } else if (foundObject.objtype === "item") {
                removeItem(inventory.items, foundObject);
            }

            await updateInventory(inventory);
        }

        await updateInventory(inventory);

        return output;
    }
);
