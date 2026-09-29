/**
 * Local fallback for the photography section, and the source for `npm run seed`.
 * Manage photos in the Studio (/studio → Photography) once Sanity has content.
 */
import { fromStatic } from "./cv";
import type { Gallery } from "./types";
import p01 from "./images/gallery/01.jpg";
import p02 from "./images/gallery/02.jpg";
import p03 from "./images/gallery/03.jpg";
import p04 from "./images/gallery/04.jpg";
import p05 from "./images/gallery/05.jpg";
import p06 from "./images/gallery/06.jpg";
import p07 from "./images/gallery/07.jpg";

const photo = (img: Parameters<typeof fromStatic>[0], title: string, alt: string) => ({ ...fromStatic(img, alt), title });

export const gallery: Gallery = {
  title: "Photography",
  intro: "Trained in audiovisual design; still carries a camera.",
  photos: [
    photo(p05, "Green wall, blue sky", "A mint-green wall with three blue vertical slats, a blue rooftop, water tank and TV antenna against a deep blue sky."),
    photo(p02, "Glass, red curtain", "A hand holding a small glass of water up to the light, a red curtain and a silhouetted figure behind it."),
    photo(p04, "Old façade, late sun", "Weathered old house façade with an ornate wooden door in warm late sunlight, power lines across a clear blue sky."),
    photo(p01, "Last light", "Sunset glowing through dark trees behind a set of brick steps, flowers on the grass in the foreground."),
    photo(p03, "Shop window at night", "A mannequin in a yellow blazer and embroidered jeans in a shop window at night, beside a column of bright bulbs."),
    photo(p07, "Up the ladder", "Looking up at a man on a ladder reaching toward a tangle of wire under a metal frame, bright clouds behind."),
    photo(p06, "Through the workshop glass", "A desk and monitor in the foreground, through the window a mechanic bends beside a car with its headlight glowing."),
  ],
};
