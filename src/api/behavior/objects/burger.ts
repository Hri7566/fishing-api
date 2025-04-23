import { addBack } from "@server/backs";
import { CosmicColor } from "@util/CosmicColor";
import { registerBehavior } from "..";

registerBehavior<"eat">("burger:eat", async context => {
    const r = Math.random();

    // 2%
    if (r < 0.02) {
        const color = new CosmicColor("#E5B73B");

        addBack(context.id, {
            m: "color",
            id: context.part.id,
            color: color.toHexa()
        });

        return {
            success: true,
            state: {
                shouldRemove: true,
                and: `and it made him/her turn ${color
                    .getName()
                    .toLowerCase()}.`
            }
        };
    }

    return {
        success: true,
        state: {
            shouldRemove: true
        }
    };
});

registerBehavior<"yeet">("burger:yeet", async context => {
    const name = context.part.name;

    const tossed = [
        `Friend ${name} tossed the meaty burger. It skipped off the water like a pebble.`,
        `Friend ${name} yeeted the slimy burger into the stratosphere. It came around the other side of the planet and hit them in the head.`,
        "The hamburger gracefully soared through the air.",
        "In a majestic flight, the burger takes off like a plane and floats away into the horizon.",
        `A film crew and director watch ${name} toss a burger from afar. After a few months, the burger wins an Oscar.`,
        `Friend ${name} flings a Junior Baconator into the sky with enough force to create a second moon.`,
        "The burger launched like a rocket and reaches outer space. Suddenly, a ship full of Kerbonauts crashes into the patty, diverting it back to the planet.",
        `Friend ${name} tosses the burger. Suddenly, the burger is hit by a flying hot dog.`,
        "The burger sprouts wings and floats away.",
        `Friend ${name} tosses a burger ${
            Math.trunc(Math.random() * 1000) / 100
        } inches in front of themselves.`,
        `Friend ${name} winds up for a big throw and yeets the burger. After travelling the sky for a few seconds, it enters somebody else's car window.`,
        `Friend ${name} tosses the burger. The local weather station reports falling food.`,
        `The burger goes through a cloud shaped like ${name}'s head.`,
        "After a long 10 minutes, the burger comes down from the ceiling.",
        `Friend ${name} tosses the burger like a frisbee and it lands on a nearby roof.`,
        `Friend ${name} carelessly sends the burger into a passing seagull's mouth.`,
        `Friend ${name} managed to deliver a burger perfectly into the window of a house.`,
        "The burger hits the water and a shark fin suddenly appears.",
        `After ${name} hurls the burger, it lands onto a nearby grill.`,
        `Friend ${name} flings a burger patty into the atmosphere.`,
        `Friend ${name} throws a boomerang-shaped hamburger. It comes back and hits ${name} on the head.`,
        `Friend ${name} tosses the burger.`,
        `Friend ${name} tosses the burger into the air and it lands on their face.`,
        `Friend ${name} tosses the burger to the other side of a rainbow.`,
        `Friend ${name} yeets that meat.`,
        `Friend ${name} throws the burger so hard, it lands on the moon.`,
        `Friend ${name} committed burger discus throw.`
    ];

    return {
        success: true,
        state: {
            shouldRemove: true,
            text: tossed[Math.floor(Math.random() * tossed.length)]
        }
    };
});
