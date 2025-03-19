// @ts-nocheck
import React, { useState } from "react";
import "./Match.css";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useSeason, useYear } from "../../../context/seasonContext";
import { MatchDetails } from "../../../components/matchDetails/matchDetails";
import { toast } from "react-toastify";

export function Match(){
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
        }
    });
    const [showOptions, setShowOptions]=useState(false);
    const [updateResult, setUpdateResult]=useState(true);

    const location=useLocation();
    const navigate=useNavigate();
    const { year }=useYear();
    const { season, setSeason, fetchSeason }=useSeason();
    if(!season){
        return;
    }
    const matches=season.matches;
    const matchId=location.state?.matchId;
    
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
                method: "PUT",
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
                    }
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

    function updateForm(){
        setMatchResult({
            wonBy: match.result.wonBy,
            wonShort: match.result.won.short,
            playerOfTheMatch: {
                name: match.result.playerOfTheMatch.name,
                for: match.result.playerOfTheMatch.for
            },
            score: {
                team: {
                    runs: match.result.score.team.runs,
                    wickets: match.result.score.team.wickets,
                    overs: match.result.score.team.overs
                },
                opponent: {
                    runs: match.result.score.opponent.runs,
                    wickets: match.result.score.opponent.wickets,
                    overs: match.result.score.opponent.overs
                }
            }
        })
    }

    return(
        <div className="match">
            <h1>{match.team.name} v/s {match.opponent.name}</h1>
            {updateResult ? 
                <div className="match-result">
                    <MatchDetails match={match}/>
                    <div className="match-buttons">
                        {match.result.won.name ? 
                            <button className="blue-button match-update-button" onClick={()=>(setUpdateResult(false), updateForm())}>
                                <img src="/icons/update.png" alt="update" className="icon"/>
                                <span>Update Result</span>
                            </button>
                        : 
                            <button className="green-button match-add-button" onClick={()=>setUpdateResult(false)}>
                                <img src="/icons/add.png" alt="add" className="icon"/>
                                <span>Add Result</span>
                            </button>
                        }
                        <button className="red-button match-delete-button" type="button"  onClick={()=>handleDeleteMatch()}>
                            <img src="/icons/delete.png" alt="delete" className="icon"/>
                            <span>Delete match</span>
                        </button>
                    </div>
                </div>
            : 
                <form className="match-form" onSubmit={handleAddResult}>
                    <h2>Add Result</h2>
                    <div className="input-container">
                        <label htmlFor="won">Won</label>
                        <div className="input selection" onClick={()=>setShowOptions(prev=>!prev)}>
                            <p>{matchResult.wonShort!=="" ? matchResult.wonShort : "Choose Winner"}</p>
                            <button type="button">
                                {showOptions ? 
                                    <img src="/icons/up.png" alt="close" className="icon"/> 
                                : 
                                    <img src="/icons/down.png" alt="open" className="icon"/>
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
                                </div>
                            }
                        </div>
                    </div>
                    <div className="input-container">
                        <label htmlFor="wonBy">Won By</label>
                        <input type="text" name="wonBy" id="wonBy" value={matchResult.wonBy} onChange={(e)=>setMatchResult({...matchResult, wonBy: e.target.value})}/>
                    </div>
                    <div className="input-container">
                        <label htmlFor="teamScore">Score by {match.team.short}</label>
                        <input type="text" name="team" id="teamScore" value={`${matchResult.score.team.runs}/${matchResult.score.team.wickets} (${matchResult.score.team.overs})`} onChange={handleScoreChange}/>
                    </div>
                    <div className="input-container">
                        <label htmlFor="opponentScore">Score by {match.opponent.short}</label>
                        <input type="text" name="opponent" id="opponentScore" value={`${matchResult.score.opponent.runs}/${matchResult.score.opponent.wickets} (${matchResult.score.opponent.overs})`} onChange={handleScoreChange}/>
                    </div>
                    <div className="input-container">
                        <label htmlFor="potm">Player of the Match</label>
                        <input type="text" name="name" id="potm" value={matchResult.playerOfTheMatch.name} onChange={(e)=>handlePOTM(e)}/>
                    </div>
                    <div className="input-container">
                        <label htmlFor="potmFor">Player of the Match For</label>
                        <input type="text" name="for" id="potmFor" value={matchResult.playerOfTheMatch.for} onChange={(e)=>handlePOTM(e)}/>
                    </div>
                    <div className="match-form-buttons">
                        <button className="blue-button match-close-button" type="button" onClick={()=>setUpdateResult(prev=>!prev)}>
                            <img src="/icons/close.png" alt="close" className="icon"/>
                            <span>Close</span>
                        </button>
                        {match.result.won.name ? 
                            <button className="green-button match-update-button" type="submit">
                                <img src="/icons/update.png" alt="update" className="icon"/>
                                <span>Update Result</span>
                            </button>
                        : 
                            <button className="green-button match-add-button" type="submit">
                                <img src="/icons/add.png" alt="add" className="icon"/>
                                <span>Add Result</span>
                            </button>
                        }
                    </div>
                </form>
            }
        </div>
    )
}