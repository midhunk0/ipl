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
    const matches=season.matches;
    
    const match=matches.find(match=>match._id===matchId);
    if(!match){
        return;
    }

    return(
        <div className="match">
            <h1 className="match-heading">{match.team.name} v/s {match.opponent.name}</h1>
            <div className="match-result">
                <MatchDetails match={match}/>
            </div>
        </div>
    )
}