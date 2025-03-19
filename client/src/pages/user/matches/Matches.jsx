import React from "react";
import "./Matches.css";
import { MatchesTable } from "../../../components/matchesTable/matchesTable";
import { useSeason, useYear } from "../../../context/seasonContext";

export function Matches(){
    const { year }=useYear();
    const { season }=useSeason();

    return(
        <div className="matches">
            {!season ? (
                <p>No Season</p>
            ): (
                <>
                    <h1>IPL {year} Matches</h1>
                    <MatchesTable matches={season.matches} dest="/match"/>
                </>
            )}
        </div>
    )
}