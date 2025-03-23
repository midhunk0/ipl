// @ts-nocheck
import React from "react";
import "./matchesTable.css";
import { useNavigate } from "react-router-dom";

export function MatchesTable({matches, dest}){
    const navigate=useNavigate();
    
    function getFormatedDate(date){
        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }).replace(/\//g, "-");   
    }

    return(
        <>
            {matches && matches.length>0 ? (
                <div className="matchesTable">
                    <div className="matchesTable-header">
                        <p className="matchesTable-heading-no">No</p>
                        <p className="matchesTable-heading-teams">Match</p>
                        <p className="matchesTable-heading-date">Date</p>
                        <p className="matchesTable-heading-time">Time</p>
                        <p className="matchesTable-heading-venue">Venue</p>
                        <p className="matchesTable-heading-result">Result</p>
                        <p className="matchesTable-heading-potm">POTM</p>
                    </div>
                    {matches.map((match, index)=>(
                        <div className="matchesTable-match" key={index}>
                            <p className="matchesTable-match-no">{index+1}</p>
                            <div className="matchesTable-match-teams" onClick={()=>navigate(dest, { state: { matchId: match._id } })}>
                                <div className="matchTable-match-team">
                                    <img src={`/logos/${match.team.short}.png`} alt="logo"/>
                                    <p>{match.team.short}</p> 
                                </div>
                                <span>v/s</span> 
                                <div className="matchTable-match-opponent">
                                    <p>{match.opponent.short}</p>
                                    <img src={`/logos/${match.opponent.short}.png`} alt="logo"/>
                                </div>
                            </div>
                            <p className="matchesTable-match-date">{getFormatedDate(match.date)}</p>
                            <p className="matchesTable-match-time">{match.time}</p>
                            <p className="matchesTable-match-venue">{match.venue.split(",")[1]?.trim()}</p>
                            {match.result.won.short ? 
                                <>
                                    <p className="matchesTable-match-result">{match.result.won.short} win by {match.result.wonBy}</p>
                                    <p className="matchesTable-match-potm">{match.result.playerOfTheMatch.name} {match.result.playerOfTheMatch.for}</p>
                                </>
                            : match.result.draw.status ? 
                                <>
                                    <p className="matchesTable-match-result">{match.result.draw.reason}</p>
                                    <p className="matchesTable-match-potm">-</p>
                                </>
                            :                             
                                <>
                                    <p className="matchesTable-match-result"></p>
                                    <p className="matchesTable-match-potm"></p>
                                </>
                            }
                        </div>                            
                    ))}
                </div>
            ):(
                <p>No Matches</p>
            )}
        </>
    )
}