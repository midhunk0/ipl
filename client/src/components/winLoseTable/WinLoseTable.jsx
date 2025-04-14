import React, { useEffect, useState } from "react";
import "./WinLoseTable.css";
import { useNavigate } from "react-router-dom";
import { useSeason } from "../../context/seasonContext";

export function WinLoseTable({ teamDest }){
    const navigate=useNavigate();
    const [width, setWidth]=useState(window.innerWidth);
    
    useEffect(()=>{
        function handleResize(){
            setWidth(window.innerWidth);
        }
    
        window.addEventListener("resize", handleResize);
        
        return ()=>window.removeEventListener("resize", handleResize);
    }, []);

    const { season }=useSeason();
    if(!season){
        return <p>No Season</p>
    }

    function countMatchPlayed(team){
        const matchPlayed=team.matches.filter(match=>match.point!==null);
        return matchPlayed.length;
    }

    function countWins(team){
        const wins=team.matches.filter(match=>match.point===2);
        return wins.length;
    }

    function countLoses(team){
        const loses=team.matches.filter(match=>match.point===0);
        return loses.length;
    }

    function countDraws(team){
        const draws=team.matches.filter(match=>match.point===1);
        return draws.length;
    }

    return(
        season.teams && season.teams.length>0 ? (
            <div className="winLoseTable">
                <div className="winLoseTable-teams">
                    <div className="winLoseTable-heading">
                        <p className="winLoseTable-heading-position">no</p>
                        <p className={`winLoseTable-heading-name ${width>720 ? "" : "short"}`}>team</p>
                        <p className="winLoseTable-heading-played">{width>720 ? "played" : "p"}</p>
                        <p className="winLoseTable-heading-wins">{width>720 ? "wins" : "w"}</p>
                        <p className="winLoseTable-heading-loses">{width>720 ? "loses" : "l"}</p>
                        <p className="winLoseTable-heading-draws">{width>720 ? "draws" : "d"}</p>
                        <p className="winLoseTable-heading-nrr">nrr</p>
                        <p className="winLoseTable-heading-point">{width>720 ? "points" : "PTS"}</p>
                    </div>
                    {season.teams.map((team, index)=>(
                        <div className="winLoseTable-team" key={index}>
                            <p className="winLoseTable-team-position">{index+1}</p>
                            <div className="winLoseTable-team-details" onClick={()=>navigate(teamDest, { state: { teams: season.teams, teamId: team._id }})}>
                                <img src={`/logos/${team.short}.png`} alt="logo" className="logo winLoseTable-team-logo"/>
                                <p className={`winLoseTable-team-name ${width>720 ? "" : "short"}`}>{width>720 ? `${team.name}` : `${team.short}`}</p>
                            </div>
                            <p className="winLoseTable-team-played">{countMatchPlayed(team)}</p>
                            <p className="winLoseTable-team-wins">{countWins(team)}</p>
                            <p className="winLoseTable-team-loses">{countLoses(team)}</p>
                            <p className="winLoseTable-team-draws">{countDraws(team)}</p>
                            <p className="winLoseTable-team-nrr">{team.netRunRate>0 ? `+${team.netRunRate.toFixed(3)}` : team.netRunRate.toFixed(3)}</p>
                            <p className="winLoseTable-team-point">{team.points}</p>
                        </div>
                    ))}
                </div>
            </div>
        ) : (
            <p>No Teams</p>
        )
    )
}