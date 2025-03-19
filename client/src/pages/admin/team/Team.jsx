// @ts-nocheck
import React, { useState } from "react";
import "./Team.css";
import { useLocation, useNavigate } from "react-router-dom";
import { useSeason, useYear } from "../../../context/seasonContext";
import { MatchesTable } from "../../../components/matchesTable/matchesTable";
import { toast } from "react-toastify";

export function Team(){
    const [matchData, setMatchData]=useState({
        opponentShort: "",
        date: "",
        venue: "",
        time: "19:30"
    });
    const [showForm, setShowForm]=useState(false);
    const [showOptions1, setShowOptions1]=useState(false);
    const [showOptions2, setShowOptions2]=useState(false);

    const location=useLocation();
    const navigate=useNavigate();

    const { year }=useYear();
    const { season, setSeason, fetchSeason }=useSeason();
    if(!season){
        return;
    }
    const teams=location.state.teams;
    const teamId=location.state?.teamId;
    const team=season.teams.find(team=>team._id===teamId);
    if(!team){
        return;
    }
    const matches=season.matches.filter(match=>match.team.short===team.short || match.opponent.short===team.short);


    const apiUrl=import.meta.env.MODE==="development"
        ? import.meta.env.VITE_APP_DEV_URL 
        : import.meta.env.VITE_APP_PROD_URL
    
    function handleInputChange(e){
        setMatchData({
            ...matchData,
            [e.target.name]: e.target.value
        });
    };

    function handleOpponentSelection(opponent) {
        setMatchData(prev=>({
            ...prev,
            opponentShort: opponent, 
        }));
    }

    function handleVenueSelection(home) {
        setMatchData(prev=>({
            ...prev,
            venue: home, 
        }));
    }

    async function handleAddMatch(e){
        e.preventDefault();
        try{
            const response=await fetch(`${apiUrl}/addMatch`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...matchData, teamShort:team.short, year: Number(year) }),
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
            setMatchData({
                opponentShort: "",
                date: "",
                venue: "",
                time: "19:30"
            })

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
                navigate("/admin/season");
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

    return(
        <div className="team">
            <h1>{team.name}</h1>
            {!showForm ? 
                <div className="team-details">
                    <div className="team-buttons">
                        <button className="green-button team-match-add-button" type="button" onClick={()=>setShowForm(prev=>!prev)}>
                            <img src="/icons/add.png" alt="add" className="icon"/>
                            <span>Add new match</span>
                        </button>
                        <button type="button" className="red-button team-delete-button" onClick={()=>handleDeleteTeam()}>
                            <img src="/icons/delete.png" alt="close" className="icon"/>
                            <span>Delete team</span>
                        </button>
                    </div>
                    <MatchesTable matches={matches} dest="/admin/match"/>
                </div>
            : (
                <form className="team-match-add-form" onSubmit={handleAddMatch} method="POST">
                    <h2>Add new Match</h2>
                    <div className="input-container">
                        <label htmlFor="team">Team</label>
                        <input type="text" name="teamShort" id="team" value={team.short} readOnly/>
                    </div>
                    <div className="input-container">
                        <label htmlFor="opponent">Opponent</label>
                        <div className="input selection" onClick={()=>setShowOptions1(prev=>!prev)}>
                            <p>{matchData.opponentShort!=="" ? matchData.opponentShort : "Choose Opponent"}</p>
                            <button type="button">
                                {showOptions1 ? 
                                        <img src="/icons/up.png" alt="up" className="icon"/> 
                                    : 
                                        <img src="/icons/down.png" alt="down" className="icon"/>
                                }
                            </button>
                            {showOptions1 && 
                                <div className="select" onClick={()=>setShowOptions1(prev=>!prev)}>
                                    {teams.filter(opponent=>opponent.short!==team.short)
                                        .map((opponent)=>(
                                            <div className="input" key={opponent._id} value={opponent.short} onClick={()=>(handleOpponentSelection(opponent.short), setShowOptions1(prev=>!prev))}>
                                                <p>{opponent.short}</p>
                                            </div>
                                        ))
                                    }
                                </div>
                            }
                        </div>
                    </div>
                    <div className="input-container">
                        <label htmlFor="venue">Venue</label>
                        <div className="input selection" onClick={()=>setShowOptions2(prev=>!prev)}>
                            <p>{matchData.venue!=="" ? matchData.venue : "Choose Venue"}</p>
                            <button type="button">
                                {showOptions2 ? 
                                        <img src="/icons/up.png" alt="up" className="icon"/> 
                                    : 
                                        <img src="/icons/down.png" alt="down" className="icon"/>
                                }
                            </button>
                            {showOptions2 && 
                                <div className="select" onClick={()=>setShowOptions2(prev=>!prev)}>
                                    {team.home.map((home, index)=>( 
                                        <div className="input" key={index} value={home} onClick={()=>(handleVenueSelection(home), setShowOptions2(prev=>!prev))}>        
                                            <p>{home}</p>    
                                        </div>
                                    ))}
                                </div>
                            }
                        </div>
                    </div>
                    <div className="input-container">
                        <label htmlFor="date">Date</label>
                        <input type="date" name="date" id="date" value={matchData.date} onChange={handleInputChange}/>
                    </div>
                    <div className="input-container">
                        <label htmlFor="time">Time</label>
                        <input type="time" name="time" id="time" value={matchData.time} onChange={handleInputChange}/>
                    </div>
                    <div className="team-form-buttons">
                        <button className="blue-button team-form-close-button" type="button" onClick={()=>setShowForm(prev=>!prev)}><img src="/icons/close.png" alt="close" className="icon"/><span>Close</span></button>
                        <button className="green-button team-match-add-button" type="submit"><img src="/icons/add.png" alt="add" className="icon"/><span>Add new match</span></button>
                    </div>
                </form>
            )}
        </div>      
    )
}