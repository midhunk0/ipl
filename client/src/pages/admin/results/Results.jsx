import React from "react";
import "./Results.css";
import { useSeason, useYear } from "../../../context/seasonContext";
import { MatchesTable } from "../../../components/matchesTable/matchesTable";

export function Results(){
    const { year }=useYear();
    const { season }=useSeason();
    if(!season){
        return;
    }
    const matches=season.matches;
    const results=[...matches.filter(match=>match.result.won.short!=="" || match.result.draw.status)].reverse();

    return(
        <div className="admin-results">
            <h1>IPL {year} results</h1>
            <MatchesTable matches={results} dest="/admin/matches" type="resultTable"/>
        </div>
    )
}