import { $ } from "bun";

const urls = [
    "https://dodo.ac/np/images/thumb/c/cd/Angelfish_NH_Icon.png/64px-Angelfish_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/6/67/Arowana_NH_Icon.png/64px-Arowana_NH_Icon.png",
    "https://dodo.ac/np/images/e/e9/Barbel_Steed_NL_Icon.png",
    "https://dodo.ac/np/images/3/30/Bass_PG_Inv_Icon.png",
    "https://dodo.ac/np/images/thumb/4/4d/Bitterling_NH_Icon.png/64px-Bitterling_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/0/0c/Bluegill_NH_Icon.png/64px-Bluegill_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/5/5d/Carp_NH_Icon.png/64px-Carp_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/0/0d/Catfish_NH_Icon.png/64px-Catfish_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/8/80/Char_NH_Icon.png/64px-Char_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/d/db/Cherry_Salmon_NH_Icon.png/64px-Cherry_Salmon_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/4/45/Coelacanth_NH_Icon.png/64px-Coelacanth_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/f/f2/Crucian_Carp_NH_Icon.png/64px-Crucian_Carp_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/d/db/Dace_NH_Icon.png/64px-Dace_NH_Icon.png",
    "https://dodo.ac/np/images/b/bf/Eel_NL_Icon.png",
    "https://dodo.ac/np/images/thumb/e/ec/Freshwater_Goby_NH_Icon.png/64px-Freshwater_Goby_NH_Icon.png",
    "https://dodo.ac/np/images/7/78/Giant_Catfish_PG_Icon.png",
    "https://dodo.ac/np/images/thumb/5/50/Giant_Snakehead_NH_Icon.png/64px-Giant_Snakehead_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/7/71/Goldfish_NH_Icon.png/64px-Goldfish_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/3/38/Guppy_NH_Icon.png/64px-Guppy_NH_Icon.png",
    "https://dodo.ac/np/images/8/87/Herabuna_DnM%2B_Icon.png",
    "https://dodo.ac/np/images/thumb/2/2d/Koi_NH_Icon.png/64px-Koi_NH_Icon.png",
    "https://dodo.ac/np/images/0/0f/Large_Bass_PG_Icon.png",
    "https://dodo.ac/np/images/thumb/a/a5/Loach_NH_Icon.png/64px-Loach_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/e/e2/Pale_Chub_NH_Icon.png/64px-Pale_Chub_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/c/c6/Piranha_NH_Icon.png/64px-Piranha_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/0/0f/Pond_Smelt_NH_Icon.png/64px-Pond_Smelt_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/0/0d/Pop-Eyed_Goldfish_NH_Icon.png/64px-Pop-Eyed_Goldfish_NH_Icon.png",
    "https://dodo.ac/np/images/8/87/Rainbow_Trout_NL_Icon.png",
    "https://dodo.ac/np/images/thumb/c/ca/Salmon_NH_Icon.png/64px-Salmon_NH_Icon.png",
    "https://dodo.ac/np/images/a/ac/Small_Bass_PG_Field_Sprite.png",
    "https://dodo.ac/np/images/thumb/e/eb/Stringfish_NH_Icon.png/64px-Stringfish_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/6/6a/Sweetfish_NH_Icon.png/64px-Sweetfish_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/b/b1/Arapaima_NH_Icon.png/64px-Arapaima_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/d/d5/Barred_Knifejaw_NH_Icon.png/64px-Barred_Knifejaw_NH_Icon.png",
    "https://dodo.ac/np/images/0/0b/Brook_Trout_PG_Icon.png",
    "https://dodo.ac/np/images/thumb/9/96/Crawfish_NH_Icon.png/64px-Crawfish_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/2/2f/Frog_NH_Icon.png/64px-Frog_NH_Icon.png",
    "https://dodo.ac/np/images/f/fd/Jellyfish_CF_Icon.png",
    "https://dodo.ac/np/images/thumb/e/ea/Killifish_NH_Icon.png/64px-Killifish_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/c/c1/Red_Snapper_NH_Icon.png/64px-Red_Snapper_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/7/7f/Sea_Bass_NH_Icon.png/64px-Sea_Bass_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/2/2a/Blue_Marlin_NH_Icon.png/64px-Blue_Marlin_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/1/1f/Dab_NH_Icon.png/64px-Dab_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/a/a3/Horse_Mackerel_NH_Icon.png/64px-Horse_Mackerel_NH_Icon.png",
    "https://dodo.ac/np/images/d/d8/Octopus_CF_Icon.png",
    "https://dodo.ac/np/images/thumb/b/b3/Olive_Flounder_NH_Icon.png/64px-Olive_Flounder_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/e/ee/Puffer_Fish_NH_Icon.png/64px-Puffer_Fish_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/d/dc/Sea_Horse_NH_Icon.png/64px-Sea_Horse_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/b/bf/Squid_NH_Icon.png/64px-Squid_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/0/00/Black_Bass_NH_Icon.png/64px-Black_Bass_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/4/4f/Clown_Fish_NH_Icon.png/64px-Clown_Fish_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/f/fe/Dorado_NH_Icon.png/64px-Dorado_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/3/34/Football_Fish_NH_Icon.png/64px-Football_Fish_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/a/a2/Gar_NH_Icon.png/64px-Gar_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/2/20/Great_White_Shark_NH_Icon.png/64px-Great_White_Shark_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/e/ec/Hammerhead_Shark_NH_Icon.png/64px-Hammerhead_Shark_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/e/e1/King_Salmon_NH_Icon.png/64px-King_Salmon_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/e/eb/Ocean_Sunfish_NH_Icon.png/64px-Ocean_Sunfish_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/f/f7/Sea_Butterfly_NH_Icon.png/64px-Sea_Butterfly_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/4/4b/Tuna_NH_Icon.png/64px-Tuna_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/6/67/Yellow_Perch_NH_Icon.png/64px-Yellow_Perch_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/8/85/Zebra_Turkeyfish_NH_Icon.png/64px-Zebra_Turkeyfish_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/4/47/Butterfly_Fish_NH_Icon.png/64px-Butterfly_Fish_NH_Icon.png",
    "https://dodo.ac/np/images/a/aa/Lobster_CF_Icon.png",
    "https://dodo.ac/np/images/thumb/3/3e/Moray_Eel_NH_Icon.png/64px-Moray_Eel_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/3/30/Napoleonfish_NH_Icon.png/64px-Napoleonfish_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/4/42/Neon_Tetra_NH_Icon.png/64px-Neon_Tetra_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/9/9f/Pike_NH_Icon.png/64px-Pike_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/9/9b/Ray_NH_Icon.png/64px-Ray_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/c/cb/Surgeonfish_NH_Icon.png/64px-Surgeonfish_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/9/95/Blowfish_NH_Icon.png/64px-Blowfish_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/1/17/Giant_Trevally_NH_Icon.png/64px-Giant_Trevally_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/9/9d/Mitten_Crab_NH_Icon.png/64px-Mitten_Crab_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/0/0b/Nibble_Fish_NH_Icon.png/64px-Nibble_Fish_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/5/50/Oarfish_NH_Icon.png/64px-Oarfish_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/2/26/Ribbon_Eel_NH_Icon.png/64px-Ribbon_Eel_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/4/46/Saddled_Bichir_NH_Icon.png/64px-Saddled_Bichir_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/4/45/Saw_Shark_NH_Icon.png/64px-Saw_Shark_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/e/eb/Soft-Shelled_Turtle_NH_Icon.png/64px-Soft-Shelled_Turtle_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/b/bb/Tadpole_NH_Icon.png/64px-Tadpole_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/4/4f/Whale_Shark_NH_Icon.png/64px-Whale_Shark_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/7/7f/Anchovy_%28Fish%29_NH_Icon.png/64px-Anchovy_%28Fish%29_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/e/e0/Barreleye_NH_Icon.png/64px-Barreleye_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/0/0b/Betta_NH_Icon.png/64px-Betta_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/f/fc/Golden_Trout_NH_Icon.png/64px-Golden_Trout_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/d/d6/Mahi-Mahi_NH_Icon.png/64px-Mahi-Mahi_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/e/e7/Rainbowfish_NH_Icon.png/64px-Rainbowfish_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/3/35/Ranchu_Goldfish_NH_Icon.png/64px-Ranchu_Goldfish_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/b/b1/Snapping_Turtle_NH_Icon.png/64px-Snapping_Turtle_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/9/91/Sturgeon_NH_Icon.png/64px-Sturgeon_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/d/de/Suckerfish_NH_Icon.png/64px-Suckerfish_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/e/ef/Tilapia_NH_Icon.png/64px-Tilapia_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/0/04/Abalone_NH_Icon.png/64px-Abalone_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/a/a4/Acorn_Barnacle_NH_Icon.png/64px-Acorn_Barnacle_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/9/98/Chambered_Nautilus_NH_Icon.png/64px-Chambered_Nautilus_NH_Icon.png",
    "https://dodo.ac/np/images/a/af/Clam_NL_Icon.png",
    "https://dodo.ac/np/images/0/00/Ear_Shell_NL_Icon.png",
    "https://dodo.ac/np/images/thumb/0/07/Flatworm_NH_Icon.png/64px-Flatworm_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/0/00/Giant_Isopod_NH_Icon.png/64px-Giant_Isopod_NH_Icon.png",
    "https://dodo.ac/np/images/f/fd/Horsehair_Crab_NL_Icon.png",
    "https://dodo.ac/np/images/thumb/5/5b/Horseshoe_Crab_NH_Icon.png/64px-Horseshoe_Crab_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/a/a9/Lobster_NH_Icon.png/64px-Lobster_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/7/7d/Mantis_Shrimp_NH_Icon.png/64px-Mantis_Shrimp_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/5/58/Octopus_NH_Icon.png/64px-Octopus_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/4/4d/Oyster_NH_Icon.png/64px-Oyster_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/0/0a/Pearl_Oyster_NH_Icon.png/64px-Pearl_Oyster_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/9/9d/Red_King_Crab_NH_Icon.png/64px-Red_King_Crab_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/5/55/Scallop_NH_Icon.png/64px-Scallop_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/e/e9/Sea_Anemone_NH_Icon.png/64px-Sea_Anemone_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/9/9b/Sea_Cucumber_NH_Icon.png/64px-Sea_Cucumber_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/e/e7/Sea_Grapes_NH_Icon.png/64px-Sea_Grapes_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/5/54/Sea_Slug_NH_Icon.png/64px-Sea_Slug_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/6/6c/Sea_Star_NH_Icon.png/64px-Sea_Star_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/9/9c/Sea_Urchin_NH_Icon.png/64px-Sea_Urchin_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/8/8c/Seaweed_NH_Icon.png/64px-Seaweed_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/7/78/Snow_Crab_NH_Icon.png/64px-Snow_Crab_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/f/f3/Spider_Crab_NH_Icon.png/64px-Spider_Crab_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/8/8c/Spiny_Lobster_NH_Icon.png/64px-Spiny_Lobster_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/a/aa/Spotted_Garden_Eel_NH_Icon.png/64px-Spotted_Garden_Eel_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/d/d3/Sweet_Shrimp_NH_Icon.png/64px-Sweet_Shrimp_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/6/65/Tiger_Prawn_NH_Icon.png/64px-Tiger_Prawn_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/9/93/Turban_Shell_NH_Icon.png/64px-Turban_Shell_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/6/65/Dungeness_Crab_NH_Icon.png/64px-Dungeness_Crab_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/d/d0/Firefly_Squid_NH_Icon.png/64px-Firefly_Squid_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/6/60/Gazami_Crab_NH_Icon.png/64px-Gazami_Crab_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/c/ca/Gigas_Giant_Clam_NH_Icon.png/64px-Gigas_Giant_Clam_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/f/f9/Moon_Jellyfish_NH_Icon.png/64px-Moon_Jellyfish_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/6/6c/Mussel_NH_Icon.png/64px-Mussel_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/a/a9/Sea_Pig_NH_Icon.png/64px-Sea_Pig_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/6/61/Sea_Pineapple_NH_Icon.png/64px-Sea_Pineapple_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/0/05/Slate_Pencil_Urchin_NH_Icon.png/64px-Slate_Pencil_Urchin_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/a/ac/Umbrella_Octopus_NH_Icon.png/64px-Umbrella_Octopus_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/a/ac/Vampire_Squid_NH_Icon.png/64px-Vampire_Squid_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/6/6a/Venus%27_Flower_Basket_NH_Icon.png/64px-Venus%27_Flower_Basket_NH_Icon.png",
    "https://dodo.ac/np/images/thumb/5/5e/Whelk_NH_Icon.png/64px-Whelk_NH_Icon.png"
];

for (const url of urls) {
    await $`wget ${url} -P images/`;
}
