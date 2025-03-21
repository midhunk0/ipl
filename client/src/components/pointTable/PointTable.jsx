import React, { useEffect, useState } from "react";
import "./PointTable.css";
import { useSeason } from "../../context/seasonContext";
import { useNavigate } from "react-router-dom";

export function PointTable({dest}){
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
        return <p>No Season</p>;
    }

    return(
        <>
            {season.teams && season.teams.length>0 ? (
                <div className="pointTable">
                    <div className="pointTable-teams">
                        <div className="pointTable-heading">
                            <p className="pointTable-heading-position">No</p>
                            <p className={`pointTable-heading-name ${show ? "" : "short"}`}>Team</p>
                        </div>
                        {season.teams.map((team, index)=>(
                            <div className="pointTable-team" key={index}>
                                <p className="pointTable-team-position">{index+1}</p>
                                {show && (
                                    <div className="pointTable-team-logo">
                                        <img src={`/logos/${team.short}.png`} alt="logo" className="logo"/>
                                    </div>
                                )}
                                <p className={`pointTable-team-name ${show ? "" : "short"}`} onClick={()=>navigate(dest, { state: { teams: season.teams, teamId: team._id }})}>{show ? `${team.name}` : `${team.short}`}</p>
                            </div>
                        ))}
                    </div>
                    <div className="pointTable-team-results-container">
                        <div className="pointTable-heading">
                        {[...Array(14)].map((_, index)=>(
                            <p  key={index} className="pointTable-heading-result">{index+1}</p>
                        ))}
                        </div>
                        {season.teams.map((team, index)=>(
                            <div className="pointTable-team-results" key={index}>
                                {[...Array(14)].map((_, index)=>(
                                    <div key={index} className="pointTable-team-result">
                                        <div className="pointTable-team-point">
                                        {team.matches[index]?.result !== undefined ? (() => {
                                            switch(team.matches[index].result){
                                                case 2:
                                                    return <img src="/icons/win.png" alt="win" className="icon win"/>
                                                case 1:
                                                    return <img src="/icons/tie.png" alt="tie" className="icon tie"/>
                                                case 0:
                                                    return <img src="/icons/loss.png" alt="loss" className="icon loss"/>
                                                case -1:
                                                    return "-";
                                                default:
                                                    return "-";
                                            }
                                        })() : "-"}  
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                    <div className="pointTable-teams">
                        <div className="pointTable-heading">
                            <p className="pointTable-heading-points">Points</p>
                            <p className="pointTable-heading-nrr">NRR</p>
                        </div>
                        {season.teams.map((team, index)=>(
                            <div className="pointTable-team" key={index}>
                                <p className="pointTable-team-points">{team.points}</p>
                                <p className="pointTable-team-nrr">{team.netRunRate}</p>
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

