// @ts-nocheck
import React, { useState } from "react";
import "./Matches.css";
import { MatchesTable } from "../../../components/matchesTable/matchesTable";
import { useSeason, useYear } from "../../../context/seasonContext";
import { toast } from "react-toastify";

export function Matches(){
    const { year }=useYear();

    const apiUrl=import.meta.env.MODE==="development"
        ? import.meta.env.VITE_APP_DEV_URL 
        : import.meta.env.VITE_APP_PROD_URL
  
    const [showForm, setShowForm]=useState(false);
    const [matchData, setMatchData]=useState({
        teamShort: "",
        opponentShort: "",
        date: "",
        time: "19:30",
        venue: ""
    });
    const [showOptions, setShowOptions]=useState(false);
    const [showOptions1, setShowOptions1]=useState(false);
    const [showOptions2, setShowOptions2]=useState(false);
    const { season, fetchSeason }=useSeason();
    if(!season){
        return;
    }
    
    function handleInputChange(e){
        setMatchData({
            ...matchData,
            [e.target.name]: e.target.value
        });
    };
    
    function handleTeamSelection(team) {
        setMatchData(prev=>({
            ...prev,
            teamShort: team, 
        }));
        setShowOptions(prev=>!prev)
    }

    function handleOpponentSelection(opponent) {
        setMatchData(prev=>({
            ...prev,
            opponentShort: opponent, 
        }));
        setShowOptions1(prev=>!prev)
    }
    
    function handleVenueSelection(venue) {
        setMatchData(prev=>({
            ...prev,
            venue: venue, 
        }));
        setShowOptions2(prev=>!prev)
    }

    async function handleAddMatch(e){
        e.preventDefault();
        try{
            const response=await fetch(`${apiUrl}/addMatch`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...matchData,  year: Number(year) }),
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
                venue: "",
                date: "",
                time: "19:30"
            })

        }
        catch(error){
            console.log(error);
        }
    }    

    return(
        <div className="matches">
            <div className="matches-header">
                <h1>IPL {year} fixtures</h1>
                {!showForm &&
                    <div className="matches-details">
                        <button className="green-button matches-add-button" type="button" onClick={()=>setShowForm(prev=>!prev)}>
                            <img src="/icons/plus-black.png" alt="add" className="icon"/>
                            <span>add new match</span>
                        </button>
                    </div>
                }
            </div>
            {!showForm ? 
                <div className="matches-details">
                    <MatchesTable matches={season.matches} dest="/admin/matches"/>
                </div>
            :
                <form className="matches-add-form" onSubmit={handleAddMatch} method="POST">
                    <h2>add new match</h2>
                    <div className="input-container">
                        <label htmlFor="team">team</label>
                        <div className="input selection" onClick={()=>setShowOptions(prev=>!prev)}>
                            <p>{matchData.teamShort!=="" ? matchData.teamShort : "Choose Team"}</p>
                            <button type="button">
                                {showOptions ? 
                                    <img src="/icons/up-black.png" alt="up" className="icon"/> 
                                : 
                                    <img src="/icons/down-black.png" alt="down" className="icon"/>
                                }
                            </button>
                            {showOptions && 
                                <div className="select" onClick={()=>setShowOptions(prev=>!prev)}>
                                    {season.teams.map((team)=>(
                                        <div className="input" key={team._id} value={team.short} onClick={()=>handleTeamSelection(team.short)}>
                                            <p>{team.short}</p>
                                        </div>
                                    ))}
                                </div>
                            }      
                        </div>              
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
                                    {season.teams.filter(opponent=>opponent.short!==matchData.teamShort)
                                        .map((opponent)=>(
                                            <div className="input" key={opponent._id} value={opponent.short} onClick={()=>handleOpponentSelection(opponent.short)}>
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
                                    {season.teams.map((team)=>(
                                        team.home.map((home, index)=>(
                                            <div className="input" key={index} value={home} onClick={()=>handleVenueSelection(home)}>
                                                <p>{home}</p>
                                            </div>
                                        ))
                                    ))}
                                </div>
                            }
                        </div>
                    </div>
                    <div className="input-container">
                        <label htmlFor="date">date</label>
                        <input type="date" name="date" id="date" value={matchData.date} onChange={handleInputChange}/>
                    </div>
                    <div className="input-container">
                        <label htmlFor="time">time</label>
                        <input type="time" name="time" id="time" value={matchData.time} onChange={handleInputChange}/>
                    </div>
                    <div className="matches-form-buttons">
                        <button className="black-button matches-form-close-button" type="button" onClick={()=>setShowForm(prev=>!prev)}>
                            <img src="/icons/cross-black.png" alt="close" className="icon"/>
                            <span>close</span>
                        </button>
                        <button className="green-button matches-add-button" type="submit">
                            <img src="/icons/plus-black.png" alt="add" className="icon"/>
                            <span>add new match</span>
                        </button>
                    </div>
                </form>
            }
        </div>
    )
}