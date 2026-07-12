// Map constructor name → team accent color. Kept narrow to the current grid.
export const TEAM_COLORS: Record<string, string> = {
  "McLaren": "#FF8000",
  "Ferrari": "#E8002D",
  "Red Bull": "#3671C6",
  "Mercedes": "#27F4D2",
  "Aston Martin": "#229971",
  "Alpine": "#FF87BC",
  "Haas F1 Team": "#B6BABD",
  "RB F1 Team": "#6692FF",
  "Williams": "#64C4FF",
  "Kick Sauber": "#52E252",
  "Sauber": "#52E252",
};

export function getTeamColor(team: string): string {
  if (!team) return "#8E8E93";
  for (const [key, color] of Object.entries(TEAM_COLORS)) {
    if (team.toLowerCase().includes(key.toLowerCase())) return color;
  }
  return "#8E8E93"; // fallback on-surface-variant
}
