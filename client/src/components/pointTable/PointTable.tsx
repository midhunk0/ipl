import { useEffect, useState } from "react";
import "./PointTable.css";
import { useNavigate } from "react-router-dom";
import { useSeason } from "../../hooks/useSeason";

type props={ 
    teamDest: string, 
    matchDest: string 
}

export function PointTable({ teamDest, matchDest }: props){
    const navigate=useNavigate();

    const [, setWidth]=useState<number>(window.innerWidth);
    const [show, setShow]=useState<boolean>(window.innerWidth>720);
    const [hover, setHover]=useState({ i: -1, j: -1 });

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

    const matchesPerTeam=season.teams.length>0 && season.teams[0].matches.length;

    return(
        <>
            {season.teams && season.teams.length>0 ? (
                <div className="pointTable">
                    <div className="pointTable-teams">
                        <div className="pointTable-heading">
                            <p className="pointTable-heading-position">no</p>
                            <p className={`pointTable-heading-name ${show ? "" : "short"}`}>team</p>
                        </div>
                        {season.teams.map((team, index)=>(
                            <div className="pointTable-team" key={index}>
                                <p className="pointTable-team-position">{index+1}</p>
                                <div className="pointTable-team-details" onClick={()=>navigate(teamDest, { state: { teams: season.teams, teamId: team._id }})}>
                                    <img src={`/logos/${team.short}.png`} alt="logo" className="logo pointTable-team-logo"/>
                                    <p className={`pointTable-team-name ${show ? "" : "short"}`}>{show ? `${team.name}` : `${team.short}`}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="pointTable-team-results-container">
                        <div className="pointTable-heading">
                        {[...Array(matchesPerTeam)].map((_, index)=>(
                            <p  key={index} className="pointTable-heading-result">{index+1}</p>
                        ))}
                        </div>
                        {season.teams.map((team, i)=>(
                            <div className="pointTable-team-results" key={i}>
                                {[...Array(matchesPerTeam)].map((_, j)=>(
                                    <div key={j} onMouseEnter={()=>setHover({i, j})} onMouseLeave={()=>setHover({ i: -1, j: -1 })} className={`pointTable-team-result ${team.matches[j]?.matchId ? "" : "no-match"}`} onClick={()=>{if(team.matches[j].matchId) navigate(`${matchDest}/${team.matches[j].matchId}`)}}>
                                        <div className="pointTable-team-point">
                                            {team.matches[j]?.point!==undefined ? (()=>{
                                                switch(team.matches[j].point){
                                                    case 2:
                                                        return <img src={hover.i===i && hover.j===j ? "/icons/check-white.png" : "/icons/check-green.png" }alt="win" className="icon win"/>
                                                    case 1:
                                                        return <img src={hover.i===i && hover.j===j ? "/icons/draw-white.png" : "/icons/draw-blue.png"} alt="tie" className="icon tie"/>
                                                    case 0:
                                                        return <img src={hover.i===i && hover.j===j ? "/icons/cross-white.png" : "/icons/cross-red.png"} alt="loss" className="icon loss"/>
                                                    default:
                                                        return "-";
                                                }
                                            })() : ""}  
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                    <div className="pointTable-teams">
                        <div className="pointTable-heading">
                            <p className="pointTable-heading-nrr">nrr</p>
                            <p className="pointTable-heading-points">points</p>
                        </div>
                        {season.teams.map((team, index)=>(
                            <div className="pointTable-team" key={index}>
                                <p className="pointTable-team-nrr">{team.netRunRate>0 ? `+${team.netRunRate.toFixed(3)}` : team.netRunRate.toFixed(3)}</p>
                                <p className="pointTable-team-points">{team.points}</p>
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

