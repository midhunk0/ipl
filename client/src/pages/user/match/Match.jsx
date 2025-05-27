// @ts-nocheck
import React from "react";
import "./Match.css";
import { useParams } from "react-router-dom";
import { useSeason } from "../../../context/seasonContext";
import { MatchDetails } from "../../../components/matchDetails/matchDetails";

export function Match(){
    const { matchId }=useParams();
    const { season }=useSeason();
    
    if(!season){
        return;
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
    
    const match=matches.find(match=>match._id===matchId);
    if(!match){
        return;
    }

    return(
        <div className="match">
            <h1>{match.team.short || "TBD"} v/s {match.opponent.short || "TBD"}</h1>
            <div className="match-result">
                <MatchDetails match={match}/>
            </div>
        </div>
    )
}