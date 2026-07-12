import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RaceCtrl",
    short_name: "RaceCtrl",
    description: "A precision Formula 1 companion for race weekends, standings, timing, and personal driver tracking.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#080809",
    theme_color: "#080809",
    categories: ["sports", "utilities"],
    icons: [
      {
        src: "/icon?sizes=192x192",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon?sizes=512x512",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon?sizes=512x512&maskable=true",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
