// @ts-nocheck
import React, { useState } from "react";
import "./Match.css";
import { Navigate, useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useSeason, useYear } from "../../../context/seasonContext";
import { MatchDetails } from "../../../components/matchDetails/matchDetails";

export function Match(){
    const { matchId }=useParams();
    const [matchData, setMatchData]=useState({
        teamShort: "",
        opponentShort: "",
        date: "",
        venue: "",
        time: "",
        number: 0
    });

    const [matchResult, setMatchResult]=useState({
        wonShort: "",
        wonBy: "",
        playerOfTheMatch: {
            name: "",
            for: ""
        },
        score: {
            team: {
                runs: "",
                wickets: "",
                overs: ""
            },
            opponent: {
                runs: "",
                wickets: "",
                overs: ""
            }
        },
        reason: ""
    });
    const [showOptions, setShowOptions]=useState(false);
    const [showOptions1, setShowOptions1]=useState(false);
    const [showOptions2, setShowOptions2]=useState(false);
    const [updateResult, setUpdateResult]=useState(true);
    const [showEditForm, setShowEditForm]=useState(false);
    const [team, setTeam]=useState({});
    const navigate=useNavigate();
    const { year }=useYear();
    const { season, setSeason, fetchSeason }=useSeason();
    if(!season){
        return;
    }
    const teams=season.teams;
    const matches=season.matches;
    
    const match=matches.find(match=>match._id===matchId);
    if(!match){
        return;
    }

    const apiUrl=import.meta.env.MODE==="development"
        ? import.meta.env.VITE_APP_DEV_URL 
        : import.meta.env.VITE_APP_PROD_URL
    
    async function handleAddResult(e){
        e.preventDefault();
        try{
            const response=await fetch(`${apiUrl}/addResult/${year}/${matchId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(matchResult),
                credentials: "include"
            });
            const result=await response.json();
            if(response.ok){
                setMatchResult({
                    wonBy: "",
                    wonShort: "",
                    playerOfTheMatch: {
                        name: "",
                        for: ""
                    },
                    score: {
                        team: {
                            runs: "",
                            wickets: "",
                            overs: ""
                        },
                        opponent: {
                            runs: "",
                            wickets: "",
                            overs: ""
                        }
                    },
                    reason: ""
                })
                fetchSeason();
                setUpdateResult(true);
                toast.success(result.message);
            }
            else{
                toast.error(result.message);
            }
        }
        catch(error){
            console.log(error.message);
        }
    }

    async function handleDeleteMatch(){
        try{
            const response=await fetch(`${apiUrl}/deleteMatch/${year}/${matchId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });
            const result=await response.json();
            if(response.ok){
                setSeason(result.season);
                navigate(-1);
                toast.success(result.message);
            }
            else{
                toast.error(result.message);
            }
        }
        catch(error){
            console.log(error.message);
        }
    }

    function handleWinnerSelection(wonShort){
        setMatchResult({
            ...matchResult, 
            wonShort: wonShort
        });
        setShowOptions(prev=>!prev)
    }

    function handleScoreChange(e){
        const { name, value }=e.target;
        const parts=value.split(/[/()]/).map(s=>s.trim());
        if (parts.length>=3){ 
            const [runs, wickets, overs]=parts;
            setMatchResult({
                ...matchResult,
                score: {
                    ...matchResult.score,
                    [name]: {
                        runs, 
                        wickets,
                        overs
                    }
                }
            });
        }
    }

    function handlePOTM(e){
        setMatchResult({
            ...matchResult,
            playerOfTheMatch: {
                ...matchResult.playerOfTheMatch,
                [e.target.name]: e.target.value
            }
        });
    }

    function updateMatchForm(){
        setMatchData({
            teamShort: match.team.short,
            opponentShort: match.opponent.short,
            venue: match.venue,
            date: match.date.split("T")[0],
            time: match.time
        })
        const team=season.teams.find(team=>team.short===match.team.short);
        setTeam(team)
    }

    function handleInputChange(e){
        setMatchData({
            ...matchData,
            [e.target.name]: e.target.value
        });
    };

    function handleOpponentSelection(opponentShort) {
        setMatchData(prev=>({
            ...prev,
            opponentShort, 
        }));
    }

    function handleVenueSelection(home) {
        setMatchData(prev=>({
            ...prev,
            venue: home, 
        }));
    }

    async function handleEditMatch(e){
        e.preventDefault();
        try{
            const response=await fetch(`${apiUrl}/editMatch/${year}/${matchId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(matchData),
                credentials: "include"
            });
            const result=await response.json();
            if(response.ok){
                fetchSeason();
                setShowEditForm(false);
                toast.success(result.message);
            }
            else{
                toast.error(result.message);
            }
        }
        catch(error){
            console.log(error.message);
        }
    }

    return(
        <div className="admin-match">
            <div className="admin-match-header">
                <h1>{match.team.short} v/s {match.opponent.short}</h1>
                {!showEditForm && updateResult &&
                    <div className="admin-match-buttons">
                        {!match.result.draw.reason && !match.result.won.short && 
                            <button className="green-button admin-match-add-button" onClick={()=>setUpdateResult(false)}>
                                <img src="/icons/plus-black.png" alt="add" className="icon"/>
                                <span>add result</span>
                            </button>
                        }
                        <button type="button" className="blue-button admin-match-edit-button" onClick={()=>(setShowEditForm(prev=>!prev), updateMatchForm())}>
                            <img src="/icons/edit-black.png" alt="edit" className="icon"/>
                            <span>edit match</span>
                        </button>
                        <button className="red-button admin-match-delete-button" type="button" onClick={()=>handleDeleteMatch()}>
                            <img src="/icons/trash-red.png" alt="delete" className="icon"/>
                            <span>delete match</span>
                        </button>
                    </div>
                }
            </div>
            {!showEditForm && updateResult ? 
                <div className="admin-match-result">
                    <MatchDetails match={match}/>
                </div> 
            : showEditForm ? 
                <form className="admin-match-form" onSubmit={handleEditMatch} method="POST">
                    <h2>edit match</h2>
                    <div className="input-container">
                        <label htmlFor="team">team</label>
                        <input type="text" name="teamShort" id="team" value={matchData.teamShort} readOnly/>
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
                                    {teams.filter(opponent=>opponent.short!==match.team.short)
                                        .map((opponent)=>(
                                            <div className="input" key={opponent._id} value={matchData.opponentShort} onClick={()=>(handleOpponentSelection(opponent.short), setShowOptions1(prev=>!prev))}>
                                                <p>{opponent.short}</p>
                                            </div>
                                        ))
                                    }
                                </div>
                            }
                        </div>
                    </div>
                    <div className="input-container">
                        <label htmlFor="venue">venue</label>z
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
                    </div>
                    <div className="input-container">
                        <label htmlFor="date">date</label>
                        <input type="date" name="date" id="date" value={matchData.date} onChange={handleInputChange}/>
                    </div>
                    <div className="input-container">
                        <label htmlFor="time">time</label>
                        <input type="time" name="time" id="time" value={matchData.time} onChange={handleInputChange}/>
                    </div>
                    <div className="admin-match-form-buttons">
                        <button className="black-button admin-match-close-button" type="button" onClick={()=>setShowEditForm(prev=>!prev)}>
                            <img src="/icons/cross-black.png" alt="close" className="icon"/>
                            <span>close</span>
                        </button>
                        <button className="blue-button admin-match-edit-button" type="submit">
                            <img src="/icons/edit-black.png" alt="add" className="icon"/>
                            <span>edit match</span>
                        </button>
                    </div>
                </form>
            : 
                <form className="admin-match-form" onSubmit={handleAddResult}>
                    <h2>add result</h2>
                    <div className="input-container">
                        <label htmlFor="won">won</label>
                        <div className="input selection" onClick={()=>setShowOptions(prev=>!prev)}>
                            <p>{matchResult.wonShort!=="" ? matchResult.wonShort : match.result.draw.status ? "Draw" : "Choose Winner"}</p>
                            <button type="button">
                                {showOptions ? 
                                    <img src="/icons/up-black.png" alt="close" className="icon"/> 
                                : 
                                    <img src="/icons/down-black.png" alt="open" className="icon"/>
                                }
                            </button>
                            {showOptions && 
                                <div className="select" onClick={()=>setShowOptions(prev=>!prev)}>
                                    <div className="input" value={match.team.short} onClick={()=>handleWinnerSelection(match.team.short)}>
                                        <p>{match.team.short}</p>
                                    </div>
                                    <div className="input" value={match.opponent.short} onClick={()=>handleWinnerSelection(match.opponent.short)}>
                                        <p>{match.opponent.short}</p>
                                    </div>
                                    <div className="input" value="Draw" onClick={()=>handleWinnerSelection("Draw")}>
                                        <p>draw</p>
                                    </div>
                                </div>
                            }
                        </div>
                    </div>
                    {matchResult.wonShort==="Draw" ? 
                        <div className="input-container">
                            <label htmlFor="reason">reason</label>
                            <input type="text" name="reason" id="reason" value={matchResult.reason} onChange={(e)=>setMatchResult({...matchResult, reason: e.target.value})}/>
                        </div>
                    : 
                        <>
                            <div className="input-container">
                                <label htmlFor="wonBy">won by</label>
                                <input type="text" name="wonBy" id="wonBy" value={matchResult.wonBy} onChange={(e)=>setMatchResult({...matchResult, wonBy: e.target.value})}/>
                            </div>
                            <div className="input-container">
                                <label htmlFor="teamScore">score by {match.team.short}</label>
                                <input type="text" name="team" id="teamScore" value={`${matchResult.score.team.runs}/${matchResult.score.team.wickets} (${matchResult.score.team.overs})`} onChange={handleScoreChange}/>
                            </div>
                            <div className="input-container">
                                <label htmlFor="opponentScore">score by {match.opponent.short}</label>
                                <input type="text" name="opponent" id="opponentScore" value={`${matchResult.score.opponent.runs}/${matchResult.score.opponent.wickets} (${matchResult.score.opponent.overs})`} onChange={handleScoreChange}/>
                            </div>
                            <div className="input-container">
                                <label htmlFor="potm">player of the match</label>
                                <input type="text" name="name" id="potm" value={matchResult.playerOfTheMatch.name} onChange={(e)=>handlePOTM(e)}/>
                            </div>
                            <div className="input-container">
                                <label htmlFor="potmFor">player of the match for</label>
                                <input type="text" name="for" id="potmFor" value={matchResult.playerOfTheMatch.for} onChange={(e)=>handlePOTM(e)}/>
                            </div>
                        </>
                    }
                    <div className="admin-match-form-buttons">
                        <button className="black-button admin-match-close-button" type="button" onClick={()=>setUpdateResult(prev=>!prev)}>
                            <img src="/icons/cross-black.png" alt="close" className="icon"/>
                            <span>close</span>
                        </button>
                        <button className="green-button admin-match-add-button" type="submit">
                            <img src="/icons/plus-black.png" alt="add" className="icon"/>
                            <span>add result</span>
                        </button>
                    </div>
                </form>
            }
        </div>
    )
}