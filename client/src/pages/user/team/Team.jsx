// @ts-nocheck
import React from "react";
import "./Team.css";
import { useLocation } from "react-router-dom";
import { useSeason } from "../../../context/seasonContext";
import { MatchesTable } from "../../../components/matchesTable/matchesTable";

export function Team(){
    const location=useLocation(); 
    const { season }=useSeason();
    if(!season){
        return;
    }
    const teamId=location.state?.teamId;
    const team=season.teams.find(team=>team._id===teamId);
    const matches=season.matches.filter(match=>match.team.short===team.short || match.opponent.short===team.short);
    const sortedMatches=matches.slice().sort((a, b)=>{
        const dateA=new Date(a.date);
        const dateB=new Date(b.date);
      
        const isACompleted=a.result.won.short!=="";
        const isBCompleted=b.result.won.short!=="";
      
        if(isACompleted && !isBCompleted) return 1;
        if(!isACompleted && isBCompleted) return -1;
      
        if(isACompleted && isBCompleted) {
            return dateB.getTime() - dateA.getTime(); 
        } 
        else{
            return dateA.getTime() - dateB.getTime(); 
        }
    });

    return(
        <div className="team">
            <h1>{team.name}</h1>
            <MatchesTable matches={sortedMatches} dest="/matches" type="teamTable"/>
        </div>      
    )
}