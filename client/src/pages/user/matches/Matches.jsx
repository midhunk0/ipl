import React from "react";
import "./Matches.css";
import { MatchesTable } from "../../../components/matchesTable/matchesTable";
import { useSeason, useYear } from "../../../context/seasonContext";

export function Matches(){
    const { year }=useYear();
    const { season }=useSeason();
    if(!season){
        return;
    }
    const matches=season.matches;
    const remainingMatches=[...matches.filter(match=>match.result.won.short==="" && !match.result.draw.status)];

    return(
        <div className="matches">
            {!season ? (
                <p>No Season</p>
            ): (
                <>
                    <h1>IPL {year} fixtures</h1>
                    <MatchesTable matches={remainingMatches} dest="/matches" type="matchesTable"/>
                </>
            )}
        </div>
    )
}