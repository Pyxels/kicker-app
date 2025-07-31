export const positions = [
  "blue_attacker",
  "black_attacker",
  "blue_keeper",
  "black_keeper",
];

export const matchFetchOptions = {
  expand: "team_black,team_blue",
  fields: `${["team_black", "team_blue"].map((t) => ["id", "name", "avatar"].map((f) => `expand.${t}.${f}`).join(",")).join(",")},team_black_score,team_blue_score,game_data`,
};

export interface MatchDto {
  /** initial team colors */
  expand: { team_black: UserDto[]; team_blue: UserDto[] };
  /** initial team colors */
  team_black_score: number;
  /** initial team colors */
  team_blue_score: number;
  game_data: {
    /** dynamic team colors */
    rounds: {
      blue_attacker: string;
      black_attacker: string;
      blue_keeper: string;
      black_keeper: string;
      blue_score?: number;
      black_score?: number;
      start?: string;
      end?: string;
    }[];
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
  player: string;
  team: "blue" | "black";
  role: "attacker" | "keeper";
  action: "goal";
}
