import React from "react";
import "./Results.css";
import { useSeason, useYear } from "../../../context/seasonContext";
import { MatchesTable } from "../../../components/matchesTable/matchesTable";

export function Results(){
    const { year }=useYear();
    const { season }=useSeason();
    
    if(!season){
        return (
            <div className="results">
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
    const results=[...matches.filter(match=>match?.result?.won?.short!=="" || match?.result?.draw?.status)].reverse();

    return(
        <div className="results">
            <h1>IPL {year} results</h1>
            <MatchesTable matches={results} dest="/matches" type="resultsTable"/>
        </div>
    )
}