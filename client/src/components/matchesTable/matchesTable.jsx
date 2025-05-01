// @ts-nocheck
import React, { useEffect, useState } from "react";
import "./matchesTable.css";
import { useNavigate } from "react-router-dom";

export function MatchesTable({matches, dest, type}){
    const navigate=useNavigate();
    const [width, setWidth]=useState(window.innerWidth);

    useEffect(()=>{
        function handleResize(){
            setWidth(window.innerWidth);
        }
        window.addEventListener("resize", handleResize);
        return ()=>window.removeEventListener("resize", handleResize);
    }, []);
    
    function getFormatedDate(date){
        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }).replace(/\//g, "-");   
    }

    return(
        matches && matches.length>0 ? (
            <div className="matchesTable">
                <div className="matchesTable-header">
                    <p className="matchesTable-heading-no">no</p>
                    <p className={`matchesTable-heading-teams ${width<720 || type!=="matchesTable"  ? "" : "big"}`}>match</p>
                    <p className="matchesTable-heading-date">date</p>
                    <p className="matchesTable-heading-time">time</p>
                    <p className="matchesTable-heading-venue">venue</p>
                    {type!=="matchesTable" && 
                    <>
                        <p className="matchesTable-heading-result">result</p>
                        <p className="matchesTable-heading-potm">potm</p>
                    </>
                    }
                </div>
                {matches.map((match, index)=>(
                    <div className="matchesTable-match" key={index}>
                        <p className="matchesTable-match-no">{match.number}</p>                        
                        <div className={`matchesTable-match-teams ${width<720 || type!=="matchesTable" ? "" : "big"}`} onClick={()=>navigate(`${dest}/${match._id}`)}>
                            <div className={`matchTable-match-team ${width<720 || type!=="matchesTable"  ? "" : "big"}`}>
                                <img src={match.team.short ? `/logos/${match.team.short}.png` : `/logos/tbd.png`} alt="logo"/>
                                {match.team.short ? <p>{width<720 || type!=="matchesTable"  ? match.team.short : match.team.name}</p> : <p>{width<720 ? "TBD" : "to be defined"}</p>}
                            </div>
                            <span>v/s</span> 
                            <div className={`matchTable-match-opponent ${width<720 || type!=="matchesTable"  ? "" : "big"}`}>
                                {match.opponent.short ? <p>{width<720 || type!=="matchesTable"  ? match.opponent.short : match.opponent.name}</p> : <p>{width<720 ? "TBD" : "to be defined"}</p>}
                                <img src={match.opponent.short ? `/logos/${match.opponent.short}.png` : `/logos/tbd.png`} alt="logo"/>
                            </div>
                        </div>
                        <p className="matchesTable-match-date">{getFormatedDate(match.date)}</p>
                        <p className="matchesTable-match-time">{match.time}</p>
                        <p className="matchesTable-match-venue">{match.venue.split(",")[1]?.trim()}</p>
                        {type!=="matchesTable" &&( match.result.won.short ? 
                            <>
                                <p className="matchesTable-match-result">{match.result.won.short} won by {match.result.wonBy}</p>
                                <p className="matchesTable-match-potm">{match.result.playerOfTheMatch.name} {match.result.playerOfTheMatch.for}</p>
                            </>
                        : 
                        match.result.draw.status ? 
                            <>
                                <p className="matchesTable-match-result">{match.result.draw.reason}</p>
                                <p className="matchesTable-match-potm">-</p>
                            </>
                        :                             
                            <>
                                <p className="matchesTable-match-result"></p>
                                <p className="matchesTable-match-potm"></p>
                            </>
                        )}
                    </div>    
                ))}
            </div>
        ):(
            <p>No Matches</p>
        )
    )
}