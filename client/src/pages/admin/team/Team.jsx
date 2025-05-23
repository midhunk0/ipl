// @ts-nocheck
import React, { useEffect, useState } from "react";
import "./Team.css";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useSeason, useYear } from "../../../context/seasonContext";
import { MatchesTable } from "../../../components/matchesTable/matchesTable";

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
    const teams=location.state.teams;
    const teamId=location.state?.teamId;
    const team=season?.teams.find(team=>team._id===teamId);
    useEffect(() => {
        if (team?.home?.length === 1) {
            setMatchData(prev => ({
                ...prev,
                venue: team.home[0]
            }));
        }
    }, [team]);

    if(!season || !team){
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

    const sortedMatches=matches.slice().sort((a, b)=>{
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
                        <button className="green-button admin-team-match-add-button" type="button" onClick={()=>setShowForm(prev=>!prev)}>
                            <img src="/icons/plus-black.png" alt="add" className="icon"/>
                            <span>add new match</span>
                        </button>
                        <button type="button" className="red-button admin-team-delete-button" onClick={()=>handleDeleteTeam()}>
                            <img src="/icons/trash-red.png" alt="close" className="icon"/>
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
                                    <img src="/icons/up-black.png" alt="up" className="icon"/> 
                                : 
                                    <img src="/icons/down-black.png" alt="down" className="icon"/>
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
                        <label htmlFor="venue">venue</label>
                        {team.home && team.home.length===1 ? (
                            <input className="input" name="venue" value={team.home[0]} readOnly/>
                        ) : (
                            <div className="input selection" onClick={()=>setShowOptions2(prev=>!prev)}>
                                <p>{matchData.venue!=="" ? matchData.venue : "Choose Venue"}</p>
                                <button type="button">
                                    {showOptions2 ? 
                                        <img src="/icons/up-black.png" alt="up" className="icon"/> 
                                    : 
                                        <img src="/icons/down-black.png" alt="down" className="icon"/>
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
                    <div className="admin-team-form-buttons">
                        <button className="black-button admin-team-form-close-button" type="button" onClick={()=>setShowForm(prev=>!prev)}>
                            <img src="/icons/cross-black.png" alt="close" className="icon"/>
                            <span>close</span>
                        </button>
                        <button className="green-button admin-team-match-add-button" type="submit">
                            <img src="/icons/plus-black.png" alt="add" className="icon"/>
                            <span>add new match</span>
                        </button>
                    </div>
                </form>
            )}
        </div>      
    )
}