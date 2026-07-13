export interface CircuitMediaData {
  id: string;
  name: string;
  svgPath: string; // The SVG path string
  viewBox: string;
  country?: string;
  image?: string; // Legacy support
  heroImage?: string;
  trackOutline?: string;
  focalPosition?: string;
  visualAccent?: string;
  secondaryAccent?: string;
  fallback?: {
    svgPath: string;
    viewBox: string;
    country: string;
    visualAccent?: string;
    secondaryAccent?: string;
  };
}

export const CIRCUITS_MEDIA: Record<string, CircuitMediaData> = {
  albert_park: {
    id: "albert_park",
    name: "Albert Park Circuit",
    svgPath: "M 20,50 C 20,20 80,10 120,30 C 160,50 180,90 170,120 C 160,150 130,170 100,160 C 70,150 60,110 50,90 C 40,70 20,80 20,50 Z",
    viewBox: "0 0 200 200",
  },
  monaco: {
    id: "monaco",
    name: "Circuit de Monaco",
    svgPath: "M 30,50 C 50,20 120,20 140,40 C 160,60 170,90 145,110 C 120,130 110,95 90,105 C 70,115 75,140 60,150 C 40,160 25,120 30,90 C 35,60 10,80 30,50 Z",
    viewBox: "0 0 200 200",
  },
  silverstone: {
    id: "silverstone",
    name: "Silverstone Circuit",
    svgPath: "M 25,50 C 35,20 85,15 120,35 C 155,55 175,85 165,115 C 155,145 110,165 85,150 C 60,135 65,110 45,95 C 25,80 15,80 25,50 Z",
    viewBox: "0 0 200 200",
  },
  spa: {
    id: "spa",
    name: "Circuit de Spa-Francorchamps",
    svgPath: "M 30,40 C 60,20 130,15 160,35 C 190,55 170,105 150,115 C 130,125 115,100 95,115 C 75,130 85,170 60,165 C 35,160 25,130 35,95 C 45,60 10,60 30,40 Z",
    viewBox: "0 0 200 200",
  },
  monza: {
    id: "monza",
    name: "Autodromo Nazionale Monza",
    svgPath: "M 20,40 C 60,30 140,20 170,40 C 200,60 190,110 160,120 C 130,130 90,100 60,115 C 30,130 15,90 20,40 Z",
    viewBox: "0 0 200 150",
  },
  marina_bay: {
    id: "marina_bay",
    name: "Marina Bay Street Circuit",
    svgPath: "M 30,30 C 70,15 130,15 160,30 C 190,45 180,85 155,95 C 130,105 135,135 105,145 C 75,155 70,115 50,125 C 30,135 25,95 35,75 C 45,55 10,45 30,30 Z",
    viewBox: "0 0 200 200",
  },
  vegas: {
    id: "vegas",
    name: "Las Vegas Strip Circuit",
    svgPath: "M 20,30 L 160,30 C 180,30 190,60 170,70 L 130,90 C 120,95 125,120 105,120 L 45,120 C 25,120 20,90 40,80 L 20,30 Z",
    viewBox: "0 0 200 150",
  },
  yas_marina: {
    id: "yas_marina",
    name: "Yas Marina Circuit",
    svgPath: "M 40,30 C 80,20 130,30 160,50 C 190,70 175,115 145,125 C 115,135 110,100 80,115 C 50,130 55,160 35,150 C 15,140 25,100 35,75 C 45,50 15,40 40,30 Z",
    viewBox: "0 0 200 200",
  },
};

export function getCircuitFallback(id: string): CircuitMediaData {
  // Generates a beautiful geometric abstract loop procedurally if track not explicitly matched
  return {
    id,
    name: id.charAt(0).toUpperCase() + id.slice(1).replace("_", " "),
    svgPath: "M 30,40 C 60,20 130,25 160,45 C 190,65 170,115 140,125 C 110,135 90,105 70,120 C 50,135 30,100 30,70 C 30,40 Z",
    viewBox: "0 0 200 160",
    country: "International",
  };
}
