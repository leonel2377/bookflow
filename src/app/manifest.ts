import type { MetadataRoute } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://stkmsoft.online";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: `${APP_URL}/`,
    name: "BOOKFLOW — Réservation beauté",
    short_name: "BOOKFLOW",
    description:
      "Trouvez un salon et réservez en ligne. Espace pro pour gérer votre planning.",
    start_url: `${APP_URL}/fr`,
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#faf9f7",
    theme_color: "#8b5a6b",
    lang: "fr",
    dir: "ltr",
    categories: ["business", "lifestyle"],
    prefer_related_applications: false,
    related_applications: [
      {
        platform: "play",
        url: "https://play.google.com/store/apps/details?id=online.stkmsoft.bookflow",
        id: "online.stkmsoft.bookflow",
      },
    ],
    icons: [
      { src: "/icons/icon-48.png", sizes: "48x48", type: "image/png", purpose: "any" },
      { src: "/icons/icon-72.png", sizes: "72x72", type: "image/png", purpose: "any" },
      { src: "/icons/icon-96.png", sizes: "96x96", type: "image/png", purpose: "any" },
      { src: "/icons/icon-144.png", sizes: "144x144", type: "image/png", purpose: "any" },
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-384.png", sizes: "384x384", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    screenshots: [
      {
        src: "/screenshots/mobile-home.png",
        sizes: "1080x1920",
        type: "image/png",
        form_factor: "narrow",
        label: "Accueil BOOKFLOW — réservez en un clic",
      },
      {
        src: "/screenshots/mobile-salons.png",
        sizes: "1080x1920",
        type: "image/png",
        form_factor: "narrow",
        label: "Trouver un salon près de chez vous",
      },
    ],
  };
}
