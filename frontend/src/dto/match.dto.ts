export const matchFetchOptions = {
  expand: "team1,team2",
  fields: `${["team1", "team2"].map((t) => ["id", "name", "avatar"].map((f) => `expand.${t}.${f}`).join(",")).join(",")},id,team1,team2,team1_score,team2_score,rounds,start,end,created`,
};

export type TeamColor = "blue" | "black";
export type Role = "attacker" | "keeper";
export type Action = "goal";

export interface MatchDto {
  id: string;
  expand: { team1: UserDto[]; team2: UserDto[] };
  team1: string[];
  team2: string[];
  team1_score: number;
  team2_score: number;
  rounds: RoundDto[];
  start?: string;
  end?: string;
  created?: string;
  updated?: string;
}

export interface RoundDto {
  black: {
    attacker: string;
    keeper: string;
    score: number;
  };
  blue: {
    attacker: string;
    keeper: string;
    score: number;
  };
  start?: string;
  end?: string;
}

export interface UserDto {
  avatar: string;
  id: string;
  name: string;
}

export interface GoalDto {
  match: string;
  user: string;
  team: TeamColor;
  role: Role;
  action: Action;
}

export function isMatchOver(match: Partial<MatchDto> | null): boolean {
  if (!match) return false;

  let t1 = 0;
  let t2 = 0;
  return match.rounds.some((r, i) => {
    const t1Score = i % 2 === 0 ? r.blue.score : r.black.score;
    const t2Score = i % 2 === 0 ? r.black.score : r.blue.score;
    t1Score > t2Score ? t1++ : t2++;
    return t1 === 2 || t2 === 2;
  });
}
