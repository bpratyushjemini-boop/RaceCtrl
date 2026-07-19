export interface ChampionshipMeta {
  id: string;
  name: string;
  category: "Open Wheel" | "Endurance" | "Stock Car" | "Motorcycle" | "Rally" | "GT";
  baseRegion: string;
  rules: string;
  pointsSystem: string;
  history: string;
}

export interface MotorsportDriverStanding {
  position: number;
  name: string;
  team: string;
  points: number;
  wins: number;
}

export interface MotorsportTeamStanding {
  position: number;
  name: string;
  points: number;
  wins: number;
}

export interface MotorsportCalendarRound {
  round: number;
  raceName: string;
  circuitName: string;
  location: string;
  country: string;
  date: string;
}

export const CHAMPIONSHIPS: ChampionshipMeta[] = [
  { id: "f1", name: "Formula 1", category: "Open Wheel", baseRegion: "Global", rules: "Hybrid turbo 1.6L V6 engines, active aerodynamics, DRS.", pointsSystem: "25-18-15-12-10-8-6-4-2-1 + 1 for Fastest Lap.", history: "Inaugurated in 1950. The pinnacle of single-seater circuit motor racing." },
  { id: "f2", name: "Formula 2", category: "Open Wheel", baseRegion: "Europe", rules: "Spec Dallara chassis, Mecachrome 3.4L V6 turbo, zero power steering.", pointsSystem: "Feature Race: 25 to 1. Sprint Race: 10 to 1.", history: "Primary feeder series to F1, producing future grid champions." },
  { id: "f3", name: "Formula 3", category: "Open Wheel", baseRegion: "Europe", rules: "Spec Mecachrome 3.4L naturally aspirated engines, identical chassis.", pointsSystem: "Feature: 25 to 1. Sprint: 10 to 1.", history: "Crucial junior tier testing drivers on F1 support weekends." },
  { id: "fe", name: "Formula E", category: "Open Wheel", baseRegion: "Global", rules: "Gen3 electric racers, Attack Mode power boosts, high-regen braking.", pointsSystem: "Standard 25 to 1 scale + 3 for Pole + 1 for Fastest Lap.", history: "Launched in 2014, showcasing electric powertrains on street tracks." },
  { id: "wec", name: "FIA WEC", category: "Endurance", baseRegion: "Global", rules: "Hypercar hybrids, GT3 LM, balance of performance metrics (BoP).", pointsSystem: "Scaled by duration: 6h races = 25 pts, 24h Le Mans = 50 pts.", history: "Home to the legendary 24 Hours of Le Mans since 2012." },
  { id: "indycar", name: "IndyCar Series", category: "Open Wheel", baseRegion: "USA", rules: "Dallara DW12, twin-turbo V6, Push-to-Pass overtake assistance.", pointsSystem: "50-40-35-32-30... + points for leading laps.", history: "America's premier open-wheel racing series dating back to 1911." },
  { id: "motogp", name: "MotoGP", category: "Motorcycle", baseRegion: "Global", rules: "1000cc prototype bikes, active ride-height devices, aero wings.", pointsSystem: "25-20-16-13-11-10... Sprint: 12 to 1.", history: "The oldest established motorsport world championship (1949)." },
  { id: "imsa", name: "IMSA WeatherTech", category: "Endurance", baseRegion: "USA", rules: "GTP Hybrids, LMP2 class, GTD Pro classes, multi-class racing.", pointsSystem: "350-320-300-280-260 points scaling system.", history: "North America's top sports car endurance series." },
  { id: "nascar", name: "NASCAR Cup Series", category: "Stock Car", baseRegion: "USA", rules: "Next-Gen spec chassis, pushrod V8 engines, stage racing structures.", pointsSystem: "40 points down to 1 + stage playoff points.", history: "America's largest stock-car racing body founded in 1948." },
  { id: "wrc", name: "World Rally Championship", category: "Rally", baseRegion: "Global", rules: "Rally1 hybrid configurations, gravel, ice, tarmac stages.", pointsSystem: "18-15-13-10... + Sunday stage points.", history: "World's ultimate rallying test traversing rugged terrains since 1973." },
  { id: "dakar", name: "Dakar Rally", category: "Rally", baseRegion: "Global", rules: "Multi-class rally raid (Cars, Bikes, Trucks), desert navigation.", pointsSystem: "Points awarded on individual stage finish classifications.", history: "Famous annual endurance desert rally raid started in 1978." },
  { id: "super_formula", name: "Super Formula", category: "Open Wheel", baseRegion: "Japan", rules: "Dallara SF23, turbocharged inline-4, OTS overtake buttons.", pointsSystem: "20-15-12-10-8-6-4-3-2-1 scaling.", history: "Japan's top formula series, boasting extreme cornering G-forces." },
  { id: "super_gt", name: "Super GT", category: "GT", baseRegion: "Japan", rules: "GT500 class (650hp spec chassis), GT300 class, success ballast weight.", pointsSystem: "20-15-12-10-8-6-5-4-3-2-1 + weight penalty.", history: "Japan's immensely popular sports car series running since 1993." },
  { id: "gtwc", name: "GT World Challenge", category: "GT", baseRegion: "Global", rules: "Production GT3 vehicles, strict driver speed categorizations.", pointsSystem: "Standard 25 to 1 points grid scaling.", history: "Global GT3 customer racing championship series." }
];

export const MOCK_STANDINGS: Record<string, { drivers: MotorsportDriverStanding[]; teams: MotorsportTeamStanding[] }> = {
  f1: {
    drivers: [
      { position: 1, name: "Max Verstappen", team: "Red Bull", points: 255, wins: 7 },
      { position: 2, name: "Lando Norris", team: "McLaren", points: 198, wins: 2 },
      { position: 3, name: "Charles Leclerc", team: "Ferrari", points: 177, wins: 2 }
    ],
    teams: [
      { position: 1, name: "Red Bull", points: 382, wins: 7 },
      { position: 2, name: "McLaren", points: 343, wins: 2 },
      { position: 3, name: "Ferrari", points: 310, wins: 2 }
    ]
  },
  fe: {
    drivers: [
      { position: 1, name: "Pascal Wehrlein", team: "Porsche", points: 155, wins: 3 },
      { position: 2, name: "Nick Cassidy", team: "Jaguar", points: 144, wins: 2 },
      { position: 3, name: "Mitch Evans", team: "Jaguar", points: 132, wins: 2 }
    ],
    teams: [
      { position: 1, name: "Jaguar TCS Racing", points: 276, wins: 4 },
      { position: 2, name: "TAG Heuer Porsche", points: 228, wins: 3 },
      { position: 3, name: "DS Penske", points: 165, wins: 1 }
    ]
  },
  indycar: {
    drivers: [
      { position: 1, name: "Alex Palou", team: "Chip Ganassi Racing", points: 410, wins: 3 },
      { position: 2, name: "Will Power", team: "Team Penske", points: 375, wins: 2 },
      { position: 3, name: "Pato O'Ward", team: "Arrow McLaren", points: 350, wins: 2 }
    ],
    teams: [
      { position: 1, name: "Chip Ganassi Racing", points: 580, wins: 4 },
      { position: 2, name: "Team Penske", points: 540, wins: 4 },
      { position: 3, name: "Arrow McLaren", points: 490, wins: 2 }
    ]
  },
  motogp: {
    drivers: [
      { position: 1, name: "Francesco Bagnaia", team: "Ducati Lenovo", points: 222, wins: 6 },
      { position: 2, name: "Jorge Martin", team: "Prima Pramac", points: 212, wins: 3 },
      { position: 3, name: "Marc Marquez", team: "Gresini Racing", points: 166, wins: 1 }
    ],
    teams: [
      { position: 1, name: "Ducati Lenovo Team", points: 388, wins: 7 },
      { position: 2, name: "Prima Pramac Racing", points: 320, wins: 3 },
      { position: 3, name: "Gresini Racing", points: 280, wins: 1 }
    ]
  },
  wec: {
    drivers: [
      { position: 1, name: "Kevin Estre", team: "Porsche Penske", points: 118, wins: 2 },
      { position: 2, name: "Kamui Kobayashi", team: "Toyota Gazoo", points: 95, wins: 1 },
      { position: 3, name: "Antonio Fuoco", team: "Ferrari AF Corse", points: 92, wins: 1 }
    ],
    teams: [
      { position: 1, name: "Porsche Penske Motorsport", points: 118, wins: 2 },
      { position: 2, name: "Toyota Gazoo Racing", points: 96, wins: 1 },
      { position: 3, name: "Ferrari AF Corse", points: 92, wins: 1 }
    ]
  }
};

export const MOCK_CALENDARS: Record<string, MotorsportCalendarRound[]> = {
  f1: [
    { round: 1, raceName: "Bahrain Grand Prix", circuitName: "Sakhir", location: "Manama", country: "Bahrain", date: "2026-03-07" },
    { round: 2, raceName: "Monaco Grand Prix", circuitName: "Monte Carlo", location: "Monaco", country: "Monaco", date: "2026-05-24" }
  ],
  fe: [
    { round: 1, raceName: "Mexico City E-Prix", circuitName: "Hermanos Rodriguez", location: "Mexico City", country: "Mexico", date: "2026-01-10" },
    { round: 2, raceName: "Diriyah E-Prix", circuitName: "Riyadh Street Circuit", location: "Diriyah", country: "Saudi Arabia", date: "2026-02-14" }
  ],
  indycar: [
    { round: 1, raceName: "Grand Prix of St. Petersburg", circuitName: "St. Petersburg Street", location: "Florida", country: "USA", date: "2026-03-08" },
    { round: 2, raceName: "Indianapolis 500", circuitName: "Indianapolis Speedway", location: "Indiana", country: "USA", date: "2026-05-24" }
  ],
  motogp: [
    { round: 1, raceName: "Qatar Grand Prix", circuitName: "Lusail Circuit", location: "Doha", country: "Qatar", date: "2026-03-01" },
    { round: 2, raceName: "Italian Grand Prix", circuitName: "Mugello Circuit", location: "Florence", country: "Italy", date: "2026-05-31" }
  ],
  wec: [
    { round: 1, raceName: "Qatar 1812km", circuitName: "Lusail Circuit", location: "Lusail", country: "Qatar", date: "2026-03-02" },
    { round: 2, raceName: "24 Hours of Le Mans", circuitName: "Circuit de la Sarthe", location: "Le Mans", country: "France", date: "2026-06-13" }
  ]
};

export function getChampionshipMeta(id: string): ChampionshipMeta | undefined {
  return CHAMPIONSHIPS.find((c) => c.id === id);
}

export function getChampionshipStandings(id: string) {
  return MOCK_STANDINGS[id] || MOCK_STANDINGS.f1;
}

export function getChampionshipCalendar(id: string): MotorsportCalendarRound[] {
  return MOCK_CALENDARS[id] || MOCK_CALENDARS.f1;
}

export function getAllCalendarRounds(): (MotorsportCalendarRound & { seriesId: string; seriesName: string })[] {
  const all: (MotorsportCalendarRound & { seriesId: string; seriesName: string })[] = [];
  Object.entries(MOCK_CALENDARS).forEach(([seriesId, rounds]) => {
    const meta = CHAMPIONSHIPS.find((c) => c.id === seriesId);
    const seriesName = meta ? meta.name : seriesId.toUpperCase();
    rounds.forEach((r) => {
      all.push({
        ...r,
        seriesId,
        seriesName
      });
    });
  });
  // Sort chronologically
  return all.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}
