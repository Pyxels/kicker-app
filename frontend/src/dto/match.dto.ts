export const matchFetchOptions = {
  expand: "team1,team2",
  fields: `${["team1", "team2"].map((t) => ["id", "name", "avatar"].map((f) => `expand.${t}.${f}`).join(",")).join(",")},team1,team2,team1_score,team2_score,rounds`,
};

export type TeamColor = "blue" | "black";
export type Role = "attacker" | "keeper";
export type Action = "goal";

export interface MatchDto {
  expand: { team1: UserDto[]; team2: UserDto[] };
  team1: string[];
  team2: string[];
  team1_score: number;
  team2_score: number;
  rounds: RoundDto[];
  start?: string;
  end?: string;
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
