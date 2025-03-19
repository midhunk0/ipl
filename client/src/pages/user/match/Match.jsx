// @ts-nocheck
import React from "react";
import "./Match.css";
import { useLocation } from "react-router-dom";
import { useSeason } from "../../../context/seasonContext";
import { MatchDetails } from "../../../components/matchDetails/matchDetails";

export function Match(){

    const location=useLocation();
    const { season }=useSeason();
    if(!season){
        return;
    }
    const matches=season.matches;
    const matchId=location.state?.matchId;
    
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