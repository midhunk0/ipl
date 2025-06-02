import "./Matches.css";
import { MatchesTable } from "../../../components/matchesTable/matchesTable";
import { useYear } from "../../../hooks/useYear";
import { useSeason } from "../../../hooks/useSeason";

export function Matches(){
    const { year }=useYear();
    const { season }=useSeason();
    
    if(!season){
        return (
            <div className="matches">
                <p>No Season</p>
            </div>
        );
    }

    const leagueMatches=season.matches;
    const playoffs=season.playoffs;

    const playoffMatches={
        qualifier1: playoffs.qualifier1,
        eliminator: playoffs.eliminator,
        qualifier2: playoffs.qualifier2,
        final: playoffs.final
    };

    const matches=[...leagueMatches, ...Object.values(playoffMatches)];
    const remainingMatches=[...matches.filter(match=>match.result.won.short==="" && !match.result.draw?.status)];

    return(
        <div className="matches">
            <h1>IPL {year} fixtures</h1>
            <MatchesTable matches={remainingMatches} dest="/matches" type="matchesTable"/>
        </div>
    )
}