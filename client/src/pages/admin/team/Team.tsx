import { useEffect, useState } from "react";
import "./Team.css";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { MatchesTable } from "../../../components/matchesTable/matchesTable";
import { useTheme } from "../../../hooks/useTheme";
import { useYear } from "../../../hooks/useYear";
import { useSeason } from "../../../hooks/useSeason";
import type { MatchInputType, MatchType, TeamType } from "../../../types/type";

const initialMatchData: MatchInputType={
    opponentShort: "",
    date: "",
    venue: "",
    time: "19:30",
    number: 0
}

export function Team(){
    const location=useLocation();
    const navigate=useNavigate();
    const apiUrl=import.meta.env.MODE==="development"
        ? import.meta.env.VITE_APP_DEV_URL 
        : import.meta.env.VITE_APP_PROD_URL

    const [matchData, setMatchData]=useState<MatchInputType>(initialMatchData);
    const [showForm, setShowForm]=useState<boolean>(false);
    const [showOptions1, setShowOptions1]=useState<boolean>(false);
    const [showOptions2, setShowOptions2]=useState<boolean>(false);
    const [hover, setHover]=useState<string>("");

    const { year }=useYear();
    const { season, setSeason, fetchSeason }=useSeason();
    const { theme }=useTheme();

    const teams=location.state.teams;
    const teamId=location.state.teamId;
    const team=season?.teams.find(team=>team._id===teamId);
    
    useEffect(()=>{
        if(team && team.home.length===1){
            setMatchData(prev=>({
                ...prev,
                venue: team.home[0]
            }));
        }
    }, [team]);

    if(!season || !team){
        return;
    }

    const matches=season.matches.filter(match=>match.team.short===team.short || match.opponent.short===team.short);
    
    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>){
        setMatchData({
            ...matchData,
            [e.target.name]: e.target.value
        });
    };

    function handleOpponentSelection(opponent: string){
        setMatchData(prev=>({
            ...prev,
            opponentShort: opponent, 
        }));
    }

    function handleVenueSelection(home: string){
        setMatchData(prev=>({
            ...prev,
            venue: home, 
        }));
    }

    async function handleAddMatch(e: React.FormEvent<HTMLFormElement>){
        e.preventDefault();
        try{
            const response=await fetch(`${apiUrl}/addMatch`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...matchData, teamShort:team?.short, year: Number(year) }),
                credentials: "include"
            });
            const result=await response.json();
            if(response.ok){
                setShowForm(false);
                fetchSeason();
                toast.success(result.message);
            }
            else{
                toast.error(result.message);
            }
            setMatchData(initialMatchData)

        }
        catch(error){
            console.log(error);
        }
    }

    async function handleDeleteTeam(){
        try{
            const response=await fetch(`${apiUrl}/deleteTeam/${year}/${teamId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });
            const result=await response.json();
            if(response.ok){
                setSeason(result.season)
                navigate("/admin/point-table");
                toast.success(result.message);
            }
            else{
                toast.error(result.message);
            }
        }
        catch(error){
            console.log(error);
        }
    }

    const sortedMatches=matches.slice().sort((a: MatchType, b: MatchType)=>{
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
        <div className="admin-team">
            <div className="admin-team-header">
                <h1>{team.name}</h1>
                {!showForm &&
                    <div className="admin-team-buttons">
                        <button className="green-button" type="button" onClick={()=>setShowForm(prev=>!prev)} onMouseEnter={()=>setHover("add")} onMouseLeave={()=>setHover("")}>
                            <img src={theme==="dark" ? "/icons/plus-white.png" : hover==="add" ? "/icons/plus-white.png" : "/icons/plus-black.png"} alt="add" className="icon"/>
                            <span>add new match</span>
                        </button>
                        <button type="button" className="red-button" onClick={()=>handleDeleteTeam()} onMouseEnter={()=>setHover("trash")} onMouseLeave={()=>setHover("")}>
                            <img src={hover==="trash" ? "/icons/trash-white.png" : "/icons/trash-red.png"} alt="close" className="icon"/>
                            <span>delete team</span>
                        </button>
                    </div>
                }
            </div>
            {!showForm ? 
                <div className="admin-team-details">
                    <MatchesTable matches={sortedMatches} dest="/admin/matches" type="teamTable"/>
                </div>
            : (
                <form className="admin-team-match-add-form" onSubmit={handleAddMatch} method="POST">
                    <h2>add new Match</h2>
                    <div className="input-container">
                        <label htmlFor="team">team</label>
                        <input type="text" name="teamShort" id="team" value={team.short} readOnly/>
                    </div>
                    <div className="input-container">
                        <label htmlFor="opponent">opponent</label>
                        <div className="input selection" onClick={()=>setShowOptions1(prev=>!prev)}>
                            <p>{matchData.opponentShort!=="" ? matchData.opponentShort : "Choose Opponent"}</p>
                            <button type="button">
                                {showOptions1 ? 
                                    <img src={theme==="dark" ? "/icons/up-white.png" : "/icons/up-black.png"} alt="up" className="icon"/> 
                                : 
                                    <img src={theme==="dark" ? "/icons/down-white.png" : "/icons/down-black.png"} alt="down" className="icon"/>
                                }
                            </button>
                            {showOptions1 && 
                                <div className="select" onClick={()=>setShowOptions1(prev=>!prev)}>
                                    {teams.filter((opponent: TeamType)=>opponent.short!==team.short)
                                        .map((opponent: TeamType)=>(
                                            <div className="input" key={opponent._id} onClick={()=>(handleOpponentSelection(opponent.short), setShowOptions1(prev=>!prev))}>
                                                <p>{opponent.short}</p>
                                            </div>
                                        ))
                                    }
                                </div>
                            }
                        </div>
                    </div>
                    <div className="input-container">
                        <label htmlFor="venue">venue</label>
                        {team.home && team.home.length===1 ? (
                            <input className="input" name="venue" value={team.home[0]} readOnly/>
                        ) : (
                            <div className="input selection" onClick={()=>setShowOptions2(prev=>!prev)}>
                                <p>{matchData.venue!=="" ? matchData.venue : "Choose Venue"}</p>
                                <button type="button">
                                    {showOptions2 ? 
                                        <img src={theme==="dark" ? "/icons/up-white.png" : "/icons/up-black.png"} alt="up" className="icon"/> 
                                    : 
                                        <img src={theme==="dark" ? "/icons/down-white.png" : "/icons/down-black.png"} alt="down" className="icon"/>
                                    }
                                </button>
                                {showOptions2 && 
                                    <div className="select" onClick={()=>setShowOptions2(prev=>!prev)}>
                                        {team.home.map((home, index)=>( 
                                            <div className="input" key={index} onClick={()=>(handleVenueSelection(home), setShowOptions2(prev=>!prev))}>        
                                                <p>{home}</p>    
                                            </div>
                                        ))}
                                    </div>
                                }
                            </div>
                        )}
                    </div>
                    <div className="input-container">
                        <label htmlFor="date">date</label>
                        <input type="date" name="date" id="date" value={matchData.date} onChange={handleInputChange}/>
                    </div>
                    <div className="input-container">
                        <label htmlFor="time">time</label>
                        <input type="time" name="time" id="time" value={matchData.time} onChange={handleInputChange}/>
                    </div>
                    <div className="input-container">
                        <label htmlFor="number">number</label>
                        <input type="number" name="number" id="number" value={matchData.number} onChange={handleInputChange}/>
                    </div>
                    <div className="admin-team-form-buttons">
                        <button className="black-button" type="button" onClick={()=>setShowForm(prev=>!prev)} onMouseEnter={()=>setHover("cross")} onMouseLeave={()=>setHover("")}>
                            <img src={theme==="dark" ? hover==="cross" ? "/icons/cross-black.png"  : "/icons/cross-white.png" : hover==="cross" ? "/icons/cross-white.png" : "/icons/cross-black.png"} alt="close" className="icon"/>
                            <span>close</span>
                        </button>
                        <button className="green-button" type="submit" onMouseEnter={()=>setHover("add1")} onMouseLeave={()=>setHover("")}>
                            <img src={theme==="dark" ? "/icons/plus-white.png" : hover==="add1" ? "/icons/plus-white.png" : "/icons/plus-black.png"} alt="add" className="icon"/>
                            <span>add new match</span>
                        </button>
                    </div>
                </form>
            )}
        </div>      
    )
}