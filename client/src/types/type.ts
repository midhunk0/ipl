export interface TeamNameType{
    name: string;
    short: string;
}

export interface TeamResultType{
    runs: string;
    wickets: string;
    overs: string;
}

export interface ScoreType{
    team?: TeamResultType;
    opponent?: TeamResultType;
}

export interface ResultType{
    score?: ScoreType;
    won: TeamNameType;
    wonBy: string;
    playerOfTheMatch: {
        name: string;
        for: string;
    },
    draw?: {
        status: boolean;
        reason: string;
    }
}

export interface MatchType{
    _id?: string;
    team: TeamNameType;
    opponent: TeamNameType;
    venue: string;
    date: string;
    time: string;
    result: ResultType;
    number: number;
    type: "league" | "qualifier1" | "eliminator" | "qualifier2" | "final";
}

export interface PlayoffsType{
    qualifier1: MatchType;
    eliminator: MatchType;
    qualifier2: MatchType;
    final: MatchType;
    fourth: TeamNameType;
    third: TeamNameType;
    second: TeamNameType;
    first: TeamNameType;
}

export interface TeamMatchType{
    matchId: string;
    point: number;
    date: string;
    _id: string;
}

export interface TeamType{
    name: string;
    short: string;
    position: number;
    points: number;
    home: string[];
    matches: TeamMatchType[];
    totalRunsScored: number;
    totalBallsFaced: number;
    totalOversFaced: number;
    totalRunsConceded: number;
    totalBallsBowled: number;
    totalOversBowled: number;
    netRunRate: number;
    _id?: string;
}

export interface AwardType{
    name: string;
    team: string;
    runs?: string;
    wickets?: string;
    number?: string;
    for?: string;
}

export interface StatsType{
    champion: string;
    runnerUp: string;
    fairPlayAward: string;
    orangeCap: AwardType;
    purpleCap: AwardType;
    most6s: AwardType;
    most4s: AwardType;
    mostValuablePlayer: AwardType;
    emergingPlayer: AwardType;
}

export interface SeasonType{
    champion: string;
    runnerUp: string;
    year: number;
    teams: TeamType[];
    stats: StatsType;
    matches: MatchType[];
    playoffs: PlayoffsType;
}

// input types

export interface RegisterDataType{
    username: string;
    email: string;
    password: string;
}

export interface LoginDataType{
    credential: string;
    password: string;
}

export interface TeamInputType{
    name: string;
    short: string;
    home: string[];
}

export interface MatchInputType{
    teamShort?: string;
    opponentShort: string;
    date: string;
    venue: string;
    time: string;
    number: number;
}

export interface MatchDateInputType{
    date: string;
    time: string;
    venue: string;
}

export interface PlayoffsInputType{
    qualifier1: MatchDateInputType;
    eliminator: MatchDateInputType;
    qualifier2: MatchDateInputType;
    final: MatchDateInputType;
}

export interface ResultInputType{
    wonShort?: string;
    wonBy?: string;    
    reason?: string;
    playerOfTheMatch?: {
        name: string;
        for: string;
    }
    score?: ScoreType
}