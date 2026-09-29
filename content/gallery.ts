/**
 * Local fallback for the photography section, and the source for `npm run seed`.
 * Manage photos in the Studio (/studio → Photography) once Sanity has content.
 */
import { fromStatic } from "./cv";
import type { L, RawGallery } from "./types";
import p01 from "./images/gallery/01.jpg";
import p02 from "./images/gallery/02.jpg";
import p03 from "./images/gallery/03.jpg";
import p04 from "./images/gallery/04.jpg";
import p05 from "./images/gallery/05.jpg";
import p06 from "./images/gallery/06.jpg";
import p07 from "./images/gallery/07.jpg";

const photo = (img: Parameters<typeof fromStatic>[0], title: L, alt: L) => ({ ...fromStatic(img, alt), title });

export const gallery: RawGallery = {
  title: { en: "Photography", es: "Fotografía" },
  intro: {
    en: "Trained in audiovisual design; still carries a camera.",
    es: "Se formó en diseño audiovisual; todavía lleva una cámara encima.",
  },
  photos: [
    photo(
      p05,
      { en: "Green wall, blue sky", es: "Pared verde, cielo azul" },
      {
        en: "A mint-green wall with three blue vertical slats, a blue rooftop, water tank and TV antenna against a deep blue sky.",
        es: "Una pared verde menta con tres listones azules verticales, un techo azul, un tanque de agua y una antena de TV contra un cielo azul profundo.",
      },
    ),
    photo(
      p02,
      { en: "Glass, red curtain", es: "Vaso, cortina roja" },
      {
        en: "A hand holding a small glass of water up to the light, a red curtain and a silhouetted figure behind it.",
        es: "Una mano sostiene un vaso pequeño de agua a contraluz, con una cortina roja y una silueta detrás.",
      },
    ),
    photo(
      p04,
      { en: "Old façade, late sun", es: "Fachada antigua, sol de la tarde" },
      {
        en: "Weathered old house façade with an ornate wooden door in warm late sunlight, power lines across a clear blue sky.",
        es: "Fachada de una casa antigua y desgastada con una puerta de madera ornamentada bajo el sol de la tarde, con cables cruzando un cielo despejado.",
      },
    ),
    photo(
      p01,
      { en: "Last light", es: "Última luz" },
      {
        en: "Sunset glowing through dark trees behind a set of brick steps, flowers on the grass in the foreground.",
        es: "El atardecer brilla entre árboles oscuros detrás de una escalera de ladrillo, con flores sobre el césped en primer plano.",
      },
    ),
    photo(
      p03,
      { en: "Shop window at night", es: "Vidriera de noche" },
      {
        en: "A mannequin in a yellow blazer and embroidered jeans in a shop window at night, beside a column of bright bulbs.",
        es: "Un maniquí con blazer amarillo y jeans bordados en una vidriera de noche, junto a una columna de lamparitas encendidas.",
      },
    ),
    photo(
      p07,
      { en: "Up the ladder", es: "En lo alto de la escalera" },
      {
        en: "Looking up at a man on a ladder reaching toward a tangle of wire under a metal frame, bright clouds behind.",
        es: "Vista desde abajo de un hombre en una escalera que alcanza un enredo de cables bajo una estructura de metal, con nubes luminosas detrás.",
      },
    ),
    photo(
      p06,
      { en: "Through the workshop glass", es: "A través del vidrio del taller" },
      {
        en: "A desk and monitor in the foreground, through the window a mechanic bends beside a car with its headlight glowing.",
        es: "Un escritorio y un monitor en primer plano; a través de la ventana, un mecánico se inclina junto a un auto con el faro encendido.",
      },
    ),
  ],
};
