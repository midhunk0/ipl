import { useState } from "react";
import "./Match.css";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { MatchDetails } from "../../../components/matchDetails/matchDetails";
import { useTheme } from "../../../hooks/useTheme";
import { useYear } from "../../../hooks/useYear";
import { useSeason } from "../../../hooks/useSeason";
import type { MatchInputType, ResultInputType, TeamType } from "../../../types/type";

const initialMatch={
    teamShort: "",
    opponentShort: "",
    date: "",
    venue: "",
    time: "",
    number: 0
}

const initialMatchResult={
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
}

export function Match(){
    const apiUrl=import.meta.env.MODE==="development"
        ? import.meta.env.VITE_APP_DEV_URL 
        : import.meta.env.VITE_APP_PROD_URL
    
    const { matchId }=useParams();
    const navigate=useNavigate();

    const [matchData, setMatchData]=useState<MatchInputType>(initialMatch);
    const [matchResult, setMatchResult]=useState<ResultInputType>(initialMatchResult);
    const [showOptions, setShowOptions]=useState(false);
    const [showOptions1, setShowOptions1]=useState(false);
    const [showOptions2, setShowOptions2]=useState(false);
    const [updateResult, setUpdateResult]=useState(true);
    const [showEditForm, setShowEditForm]=useState(false);
    const [team, setTeam]=useState<TeamType>();
    const [hover, setHover]=useState("");

    const { year }=useYear();
    const { theme }=useTheme();
    const { season, setSeason, fetchSeason }=useSeason();
    
    if(!season){
        return;
    }
    const teams=season.teams;
    const leagueMatches=season.matches;
    const playoffs=season.playoffs;

    const playoffMatches={
        qualifier1: playoffs.qualifier1,
        eliminator: playoffs.eliminator,
        qualifier2: playoffs.qualifier2,
        final: playoffs.final
    };

    const matches=[...leagueMatches, ...Object.values(playoffMatches)];    
    const match=matches.find(match=>match._id===matchId);
    if(!match){
        return;
    }
    
    async function handleAddResult(e: React.FormEvent<HTMLFormElement>){
        e.preventDefault();
        let url;
        switch(match?.type){
            case "league": url="addResult"; break;
            case "qualifier1": url="addQ1Result"; break;
            case "eliminator": url="addEliminatorResult"; break;
            case "qualifier2": url="addQ2Result"; break;
            case "final": url="addFinalResult"; break;
            default: url="addResult"; break;
        }

        try{
            const response=await fetch(`${apiUrl}/${url}/${year}/${url==="addResult" ? matchId : ""}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(matchResult),
                credentials: "include"
            });
            const result=await response.json();
            console.log(matchResult);
            if(response.ok){
                setMatchResult(initialMatchResult)
                fetchSeason();
                setUpdateResult(true);
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
            console.log(error);
        }
    }

    function handleScoreChange(e: React.ChangeEvent<HTMLInputElement>){
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

    function handlePOTM(e: React.ChangeEvent<HTMLInputElement>){
        setMatchResult({
            ...matchResult,
            playerOfTheMatch: {
                ...(matchResult.playerOfTheMatch || { name: "", for: "" }),
                [e.target.name]: e.target.value
            }
        });
    }

    function updateMatchForm(){
        if(!match) return;
        if(!season) return;
        setMatchData({
            teamShort: match.team.short,
            opponentShort: match.opponent.short,
            venue: match.venue,
            date: match.date.split("T")[0],
            time: match.time,
            number: match.number
        })
        const team=season.teams.find(team=>team.short===match.team.short);
        if(team)
        setTeam(team)
    }

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>){
        setMatchData({
            ...matchData,
            [e.target.name]: e.target.value
        });
    };

    function handleOpponentSelection(opponentShort: string) {
        setMatchData(prev=>({
            ...prev,
            opponentShort, 
        }));
    }

    function handleVenueSelection(home: string) {
        setMatchData(prev=>({
            ...prev,
            venue: home, 
        }));
    }

    async function handleEditMatch(e: React.FormEvent<HTMLFormElement>){
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
            console.log(error);
        }
    }
    

    function handleWinnerSelection(wonShort: string){
        setMatchResult({
            ...matchResult, 
            wonShort: wonShort,
        });
        setShowOptions(prev=>!prev)
    }

    return(
        <div className="admin-match">
            <div className="admin-match-header">
                <h1>{match.team.short || "TBD"} v/s {match.opponent.short || "TBD"}</h1>
                {!showEditForm && updateResult &&
                    <div className="admin-match-buttons">
                        {!match.result.draw?.reason && !match.result.won.short && 
                            <button className="green-button" onClick={()=>setUpdateResult(false)} onMouseEnter={()=>setHover("add")} onMouseLeave={()=>setHover("")}>
                                <img src={theme==="dark" ? "/icons/plus-white.png" : hover==="add" ? "/icons/plus-white.png" : "/icons/plus-black.png"} alt="add" className="icon"/>
                                <span>add result</span>
                            </button>
                        }
                        <button type="button" className="blue-button" onClick={()=>(setShowEditForm(prev=>!prev), updateMatchForm())} onMouseEnter={()=>setHover("edit")} onMouseLeave={()=>setHover("")}>
                            <img src={theme==="dark" ? "/icons/edit-white.png" : hover==="edit" ? "/icons/edit-white.png" : "/icons/edit-black.png"} alt="edit" className="icon"/>
                            <span>edit match</span>
                        </button>
                        <button type="button" className="red-button" onClick={()=>handleDeleteMatch()} onMouseEnter={()=>setHover("delete")} onMouseLeave={()=>setHover("")}>
                            <img src={hover==="delete" ? "/icons/trash-white.png" : "/icons/trash-red.png"} alt="delete" className="icon"/>
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
                                    <img src={theme==="dark" ? "/icons/up-white.png" : "/icons/up-black.png"} alt="up" className="icon"/> 
                                : 
                                    <img src={theme==="dark" ? "/icons/down-white.png" : "/icons/down-black.png"} alt="down" className="icon"/>
                                }
                            </button>
                            {showOptions1 && 
                                <div className="select" onClick={()=>setShowOptions1(prev=>!prev)}>
                                    {teams.filter(opponent=>opponent.short!==match.team.short)
                                        .map((opponent)=>(
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
                                    {team?.home.map((home, index)=>( 
                                        <div className="input" key={index} onClick={()=>(handleVenueSelection(home), setShowOptions2(prev=>!prev))}>        
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
                        <button type="button" className="black-button" onClick={()=>setShowEditForm(prev=>!prev)} onMouseEnter={()=>setHover("cross")} onMouseLeave={()=>setHover("")}>
                            <img src={theme==="dark" ? hover==="cross" ? "/icons/cross-black.png" : "/icons/cross-white.png" : hover==="cross" ? "/icons/cross-white.png" : "/icons/cross-black.png"} alt="close" className="icon"/>
                            <span>close</span>
                        </button>
                        <button type="submit" className="blue-button" onMouseEnter={()=>setHover("form-edit")} onMouseLeave={()=>setHover("")}>
                            <img src={theme==="dark" ? "/icons/edit-white.png" : hover==="form-edit" ? "/icons/edit-white.png" : "/icons/edit-black.png"} alt="edit" className="icon"/>
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
                            <p>{matchResult.wonShort!=="" ? matchResult.wonShort : match.result.draw?.status ? "Draw" : "Choose Winner"}</p>
                            <button type="button">
                                {showOptions ? 
                                    <img src={theme==="dark" ? "/icons/up-white.png" : "/icons/up-black.png"} alt="up" className="icon"/> 
                                : 
                                    <img src={theme==="dark" ? "/icons/down-white.png" : "/icons/down-black.png"} alt="down" className="icon"/>
                                }
                            </button>
                            {showOptions && 
                                <div className="select" onClick={()=>setShowOptions(prev=>!prev)}>
                                    <div className="input" onClick={()=>handleWinnerSelection(match.team.short)}>
                                        <p>{match.team.short}</p>
                                    </div>
                                    <div className="input" onClick={()=>handleWinnerSelection(match.opponent.short)}>
                                        <p>{match.opponent.short}</p>
                                    </div>
                                    <div className="input" onClick={()=>handleWinnerSelection("Draw")}>
                                        <p>Draw</p>
                                    </div>
                                </div>
                            }
                        </div>
                    </div>
                    {matchResult.wonShort==="Draw" ? 
                        <div className="input-container">
                            <label htmlFor="reason">reason</label>
                            <input type="text" name="reason" id="reason" value={matchResult.reason} onChange={(e)=>setMatchResult({...matchResult,  reason: e.target.value})}/>
                        </div>
                    : 
                        <>
                            <div className="input-container">
                                <label htmlFor="wonBy">won by</label>
                                <input type="text" name="wonBy" id="wonBy" value={matchResult.wonBy} onChange={(e)=>setMatchResult({...matchResult, wonBy: e.target.value})}/>
                            </div>
                            <div className="input-container">
                                <label htmlFor="teamScore">score by {match.team.short}</label>
                                <input type="text" name="team" id="teamScore" value={`${matchResult.score?.team?.runs}/${matchResult.score?.team?.wickets} (${matchResult.score?.team?.overs})`} onChange={handleScoreChange}/>
                            </div>
                            <div className="input-container">
                                <label htmlFor="opponentScore">score by {match.opponent.short}</label>
                                <input type="text" name="opponent" id="opponentScore" value={`${matchResult.score?.opponent?.runs}/${matchResult.score?.opponent?.wickets} (${matchResult.score?.opponent?.overs})`} onChange={handleScoreChange}/>
                            </div>
                            <div className="input-container">
                                <label htmlFor="potm">player of the match</label>
                                <input type="text" name="name" id="potm" value={matchResult.playerOfTheMatch?.name} onChange={handlePOTM}/>
                            </div>
                            <div className="input-container">
                                <label htmlFor="potmFor">player of the match for</label>
                                <input type="text" name="for" id="potmFor" value={matchResult.playerOfTheMatch?.for} onChange={handlePOTM}/>
                            </div>
                        </>
                    }
                    <div className="admin-match-form-buttons">
                        <button type="button" className="black-button" onClick={()=>setUpdateResult(prev=>!prev)} onMouseEnter={()=>setHover("cross")} onMouseLeave={()=>setHover("")}>
                            <img src={theme==="dark" ? hover==="cross" ? "/icons/cross-black.png" : "/icons/cross-white.png" : hover==="cross" ? "/icons/cross-white.png" : "/icons/cross-black.png"} alt="close" className="icon"/>
                            <span>close</span>
                        </button>
                        <button type="submit" className="green-button" onMouseEnter={()=>setHover("form-add")} onMouseLeave={()=>setHover("")}>
                            <img src={theme==="dark" ? "/icons/plus-white.png" : hover==="form-add" ? "/icons/plus-white.png" : "/icons/plus-black.png"} alt="add" className="icon"/>
                            <span>add result</span>
                        </button>
                    </div>
                </form>
            }
        </div>
    )
}