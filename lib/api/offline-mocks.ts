export const OFFLINE_MOCKS: Record<string, unknown> = {
  "current/driverStandings.json": {
    MRData: {
      StandingsTable: {
        StandingsLists: [
          {
            DriverStandings: [
              { position: "1", points: "255", wins: "7", Driver: { driverId: "max_verstappen", permanentNumber: "1", code: "VER", givenName: "Max", familyName: "Verstappen", nationality: "Dutch", dateOfBirth: "1997-09-30" }, Constructors: [{ name: "Red Bull" }] },
              { position: "2", points: "195", wins: "2", Driver: { driverId: "norris", permanentNumber: "4", code: "NOR", givenName: "Lando", familyName: "Norris", nationality: "British", dateOfBirth: "1999-11-13" }, Constructors: [{ name: "McLaren" }] },
              { position: "3", points: "170", wins: "1", Driver: { driverId: "leclerc", permanentNumber: "16", code: "LEC", givenName: "Charles", familyName: "Leclerc", nationality: "Monégasque", dateOfBirth: "1997-10-16" }, Constructors: [{ name: "Ferrari" }] },
              { position: "4", points: "150", wins: "1", Driver: { driverId: "piastri", permanentNumber: "81", code: "PIA", givenName: "Oscar", familyName: "Piastri", nationality: "Australian", dateOfBirth: "2001-04-06" }, Constructors: [{ name: "McLaren" }] },
              { position: "5", points: "140", wins: "1", Driver: { driverId: "sainz", permanentNumber: "55", code: "SAI", givenName: "Carlos", familyName: "Sainz", nationality: "Spanish", dateOfBirth: "1994-09-01" }, Constructors: [{ name: "Ferrari" }] },
              { position: "6", points: "116", wins: "1", Driver: { driverId: "hamilton", permanentNumber: "44", code: "HAM", givenName: "Lewis", familyName: "Hamilton", nationality: "British", dateOfBirth: "1985-01-07" }, Constructors: [{ name: "Mercedes" }] },
              { position: "7", points: "112", wins: "1", Driver: { driverId: "russell", permanentNumber: "63", code: "RUS", givenName: "George", familyName: "Russell", nationality: "British", dateOfBirth: "1998-02-15" }, Constructors: [{ name: "Mercedes" }] },
              { position: "8", points: "110", wins: "0", Driver: { driverId: "perez", permanentNumber: "11", code: "PER", givenName: "Sergio", familyName: "Perez", nationality: "Mexican", dateOfBirth: "1990-01-26" }, Constructors: [{ name: "Red Bull" }] }
            ]
          }
        ]
      }
    }
  },
  "current/constructorStandings.json": {
    MRData: {
      StandingsTable: {
        StandingsLists: [
          {
            ConstructorStandings: [
              { position: "1", points: "345", Constructor: { constructorId: "mclaren", name: "McLaren" } },
              { position: "2", points: "320", Constructor: { constructorId: "red_bull", name: "Red Bull" } },
              { position: "3", points: "310", Constructor: { constructorId: "ferrari", name: "Ferrari" } },
              { position: "4", points: "228", Constructor: { constructorId: "mercedes", name: "Mercedes" } },
              { position: "5", points: "68", Constructor: { constructorId: "aston_martin", name: "Aston Martin" } }
            ]
          }
        ]
      }
    }
  },
  "current.json": {
    MRData: {
      RaceTable: {
        Races: [
          {
            round: "10",
            raceName: "British Grand Prix",
            date: "2026-07-05",
            time: "14:00:00Z",
            Circuit: {
              circuitId: "silverstone",
              circuitName: "Silverstone Circuit",
              Location: { locality: "Silverstone", country: "UK", lat: "52.0786", long: "-1.0169" }
            },
            FirstPractice: { date: "2026-07-03", time: "11:30:00Z" },
            SecondPractice: { date: "2026-07-03", time: "15:00:00Z" },
            ThirdPractice: { date: "2026-07-04", time: "10:30:00Z" },
            Qualifying: { date: "2026-07-04", time: "14:00:00Z" }
          },
          {
            round: "11",
            raceName: "Hungarian Grand Prix",
            date: "2026-07-19",
            time: "13:00:00Z",
            Circuit: {
              circuitId: "hungaroring",
              circuitName: "Hungaroring",
              Location: { locality: "Budapest", country: "Hungary", lat: "47.5789", long: "19.2486" }
            },
            FirstPractice: { date: "2026-07-17", time: "11:30:00Z" },
            SecondPractice: { date: "2026-07-17", time: "15:00:00Z" },
            ThirdPractice: { date: "2026-07-18", time: "10:30:00Z" },
            Qualifying: { date: "2026-07-18", time: "14:00:00Z" }
          }
        ]
      }
    }
  },
  "current/last/results.json": {
    MRData: {
      RaceTable: {
        Races: [
          {
            round: "9",
            raceName: "Austrian Grand Prix",
            date: "2026-06-28",
            Results: [
              { number: "63", position: "1", positionText: "1", points: "25", Driver: { driverId: "russell", code: "RUS", givenName: "George", familyName: "Russell" }, Constructor: { name: "Mercedes" }, status: "Finished", Time: { time: "1:24:22.561" } },
              { number: "81", position: "2", positionText: "2", points: "18", Driver: { driverId: "piastri", code: "PIA", givenName: "Oscar", familyName: "Piastri" }, Constructor: { name: "McLaren" }, status: "Finished", Time: { time: "+1.906" } },
              { number: "55", position: "3", positionText: "3", points: "15", Driver: { driverId: "sainz", code: "SAI", givenName: "Carlos", familyName: "Sainz" }, Constructor: { name: "Ferrari" }, status: "Finished", Time: { time: "+4.533" } },
              { number: "44", position: "4", positionText: "4", points: "12", Driver: { driverId: "hamilton", code: "HAM", givenName: "Lewis", familyName: "Hamilton" }, Constructor: { name: "Mercedes" }, status: "Finished", Time: { time: "+23.142" } },
              { number: "1", position: "5", positionText: "5", points: "11", Driver: { driverId: "max_verstappen", code: "VER", givenName: "Max", familyName: "Verstappen" }, Constructor: { name: "Red Bull" }, status: "Finished", Time: { time: "+37.253" }, FastestLap: { rank: "1", Time: { time: "1:07.694" } } }
            ]
          }
        ]
      }
    }
  }
};

export function getOfflineMockForPath(path: string): unknown {
  if (OFFLINE_MOCKS[path]) return OFFLINE_MOCKS[path];

  // Procedural mock generators for dynamic detail endpoints to avoid compile breaks:
  if (path.includes("results.json")) {
    return {
      MRData: {
        RaceTable: {
          Races: [
            {
              round: "9",
              raceName: "Austrian Grand Prix",
              Results: [
                { position: "1", positionText: "1", status: "Finished", points: "25" },
                { position: "2", positionText: "2", status: "Finished", points: "18" },
                { position: "3", positionText: "3", status: "Finished", points: "15" }
              ]
            }
          ]
        }
      }
    };
  }

  if (path.includes("qualifying.json")) {
    return {
      MRData: {
        RaceTable: {
          Races: [
            {
              round: "9",
              raceName: "Austrian Grand Prix",
              QualifyingResults: [
                { position: "1", Q1: "1:05.421", Q2: "1:05.112", Q3: "1:04.992" },
                { position: "2", Q1: "1:05.612", Q2: "1:05.340", Q3: "1:05.105" }
              ]
            }
          ]
        }
      }
    };
  }

  if (path.includes("sprint.json")) {
    return {
      MRData: {
        RaceTable: {
          Races: []
        }
      }
    };
  }

  if (path.startsWith("drivers/")) {
    // Single driver profile details fallback
    const driverId = path.split("/")[1].split(".")[0];
    return {
      MRData: {
        DriverTable: {
          Drivers: [
            {
              driverId,
              permanentNumber: "99",
              code: driverId.slice(0,3).toUpperCase(),
              givenName: "Driver",
              familyName: driverId.charAt(0).toUpperCase() + driverId.slice(1),
              nationality: "International",
              dateOfBirth: "1995-01-01"
            }
          ]
        }
      }
    };
  }

  if (path.startsWith("circuits/")) {
    const circuitId = path.split("/")[1].split(".")[0];
    return {
      MRData: {
        CircuitTable: {
          Circuits: [
            {
              circuitId,
              circuitName: circuitId.charAt(0).toUpperCase() + circuitId.slice(1).replace("_", " ") + " Circuit",
              Location: { locality: "Circuit Locality", country: "International", lat: "0.0", long: "0.0" }
            }
          ]
        }
      }
    };
  }

  // Generic fallback if completely unmatched
  return { MRData: { RaceTable: { Races: [] }, StandingsTable: { StandingsLists: [] } } };
}
