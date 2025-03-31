import React, { useEffect, useState } from "react";
import "./WinLoseTable.css";
import { useNavigate } from "react-router-dom";
import { useSeason } from "../../context/seasonContext";

export function WinLoseTable({ teamDest }){
    const navigate=useNavigate();
    const [_, setWidth]=useState(window.innerWidth);
    const [show, setShow]=useState(window.innerWidth>720);
    
    useEffect(()=>{
        function handleResize(){
            const newWidth=window.innerWidth;
            setWidth(newWidth);
            setShow(newWidth>720);
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
        <>
            {season.teams && season.teams.length>0 ? (
                <div className="winLoseTable">
                    <div className="winLoseTable-teams">
                        <div className="winLoseTable-heading">
                            <p className="winLoseTable-heading-position">no</p>
                            <p className={`winLoseTable-heading-name ${show ? "" : "short"}`}>team</p>
                            <p className="winLoseTable-heading-played">played</p>
                            <p className="winLoseTable-heading-wins">wins</p>
                            <p className="winLoseTable-heading-loses">loses</p>
                            <p className="winLoseTable-heading-draws">draws</p>
                            <p className="winLoseTable-heading-nrr">nrr</p>
                            <p className="winLoseTable-heading-point">points</p>
                        </div>
                        {season.teams.map((team, index)=>(
                            <div className="winLoseTable-team" key={index}>
                                <p className="winLoseTable-team-position">{index+1}</p>
                                <div className="winLoseTable-team-details" onClick={()=>navigate(teamDest, { state: { teams: season.teams, teamId: team._id }})}>
                                    <img src={`/logos/${team.short}.png`} alt="logo" className="logo winLoseTable-team-logo"/>
                                    <p className={`winLoseTable-team-name ${show ? "" : "short"}`}>{show ? `${team.name}` : `${team.short}`}</p>
                                </div>
                                <p className="winLoseTable-team-played">{countMatchPlayed(team)}</p>
                                <p className="winLoseTable-team-wins">{countWins(team)}</p>
                                <p className="winLoseTable-team-loses">{countLoses(team)}</p>
                                <p className="winLoseTable-team-draws">{countDraws(team)}</p>
                                <p className="winLoseTable-team-nrr">{team.netRunRate>0 ? `+${team.netRunRate}` : team.netRunRate}</p>
                                <p className="winLoseTable-team-point">{team.points}</p>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <p>No Teams</p>
            )}  
        </>
    )
}