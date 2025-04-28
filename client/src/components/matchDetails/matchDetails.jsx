import React from "react";
import "./matchDetails.css";

export function MatchDetails({ match }){
    function getFormatedDate(date){
        const d=new Date(date);
        return `${d.getDate()} ${d.toLocaleString("en-IN", { month: "long" })} ${d.getFullYear()}`;   
    }

    return(
        <div className="matchDetails">
            <div className="matchDetails-venue">
                <p>{match.venue}</p>
                <div className="matchDetails-timings">
                    <p>{getFormatedDate(match.date)}</p>
                    <p>{match.time} pm ist</p>
                </div>
            </div>
            {match.result.won.name && 
                <div className="matchDetails-result">
                    <div className="matchDetails-team-scores">
                        <div className="matchDetails-team">
                            <img src={`/logos/${match.team.short}.png`} className="matchDetails-logo"/>
                            <p>{match.team.short}</p> 
                        </div>
                        <div className="matchDetails-scores">
                            <p>{match.result.score.team.runs}/{match.result.score.team.wickets}({match.result.score.team.overs})</p>
                            <p>v/s</p>
                            <p>{match.result.score.opponent.runs}/{match.result.score.opponent.wickets}({match.result.score.opponent.overs})</p>
                        </div>
                        <div className="matchDetails-opponent">
                            <img src={`/logos/${match.opponent.short}.png`} className="matchDetails-logo"/>
                            <p>{match.opponent.short}</p> 
                        </div>
                    </div>
                    <p>{match.result.won.short} won by {match.result.wonBy}</p>
                    <p>{match.result.playerOfTheMatch.name}, {match.result.playerOfTheMatch.for}</p>
                </div>
            }
            {match.result.draw.status &&
                <div className="matchDetails-draw">
                    <div className="matchDetails-team">
                        <img src={`/logos/${match.team.short}.png`} className="matchDetails-logo"/>
                        <p>{match.team.short}</p> 
                    </div>
                    <p>Match draw {match.result.draw.reason}</p>
                    <div className="matchDetails-opponent">
                        <img src={`/logos/${match.opponent.short}.png`} className="matchDetails-logo"/>
                        <p>{match.opponent.short}</p> 
                    </div>
                </div>
            }
        </div>
    )
}