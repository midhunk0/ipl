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
  
    const [matchData, setMatchData]=useState({
        teamShort: "",
        opponentShort: "",
        date: "",
        time: "19:30",
        venue: "",
        number: 0
    });
    const [playoffData, setPlayoffData]=useState({
        qualifier1: {
            date: "",
            time: "19:30",
            venue: "",
        },
        eliminator: {
            date: "",
            time: "19:30",
            venue: "",
        },
        qualifier2: {
            date: "",
            time: "19:30",
            venue: "",
        },
        final: {
            date: "",
            time: "19:30",
            venue: "",
        }
    })
    const [fileInput, setFileInput]=useState(null);
    const [showOptions, setShowOptions]=useState(false);
    const [showOptions1, setShowOptions1]=useState(false);
    const [showOptions2, setShowOptions2]=useState(false);
    const [showOptions3, setShowOptions3]=useState(false);
    const [showOptions4, setShowOptions4]=useState(false);
    const [viewMode, setViewMode]=useState("");
    const { season, fetchSeason }=useSeason();
    if(!season){
        return;
    }

    const leagueMatches=season.matches;
    const playoffs=season.playoffs;

    const playoffMatches={
        qualifier1: playoffs.qualifier1,
        eliminator: playoffs.eliminator,
        qualifier2: playoffs.qualifier2,
        final: playoffs.final
    };

    const matches=[...leagueMatches, ...Object.values(playoffMatches)];
    const remainingMatches=[...matches.filter(match=>match?.result?.won?.short==="" && !match?.result?.draw?.status)];
    
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
                setViewMode("");
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

    async function handleAddMatches(e){
        e.preventDefault();
        if(!fileInput){
            toast.error("Please select a file");
            return;
        }
        try{
            const formData=new FormData();
            formData.append("file", fileInput);
            const response=await fetch(`${apiUrl}/addMatches/${year}`, {
                method: "POST",
                body: formData,
                credentials: "include"
            });
            const result=await response.json();
            if(response.ok){
                setViewMode("")
                fetchSeason();
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

    async function handleSetPlayoff(e){
        e.preventDefault();
        try{
            const response=await fetch(`${apiUrl}/setPlayoffSchedule/${year}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(playoffData),
                credentials: "include"
            });
            const result=await response.json();
            if(response.ok){
                setViewMode("")
                fetchSeason();
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

    async function handleSetPlayoffMatches(){
        try{
            const response=await fetch(`${apiUrl}/addQ1andEliminator/${year}`, {
                method: "POST",
                headers: { "Content-type": "application/json" },
                credentials: "include"
            });
            const result=await response.json();
            if(response.ok){
                fetchSeason();
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
        <div className="admin-matches">
            <div className="admin-matches-header">
                <h1>IPL {year} fixtures</h1>
                {viewMode==="" &&
                    <div className="admin-matches-buttons">
                        <button className="green-button admin-matches-add-button" type="button" onClick={()=>setViewMode("addMatch")}>
                            <img src="/icons/plus-black.png" alt="add" className="icon"/>
                            <span>add new match</span>
                        </button>
                        <button className="blue-button admin-matches-all-add-button" type="button" onClick={()=>setViewMode("addAll")}>
                            <img src="/icons/check-black.png" alt="add" className="icon"/>
                            <span>add all matches</span>
                        </button>
                        {season.playoffs.qualifier1.venue==="" ? 
                            <button type="button" className="green-button admin-matches-set-playoff-button" onClick={()=>setViewMode("playoff")}>
                                <img src="/icons/trophy-black.png" alt="add" className="icon"/>
                                <span>set playoff details</span>
                            </button>
                        : 
                            <button type="button" className="green-button admin-matches-set-playoff-matches-button" onClick={()=>handleSetPlayoffMatches()}>
                                <img src="/icons/trophy-black.png" alt="add" className="icon"/>
                                <span>set playoff matches</span>
                            </button>
                        }
                    </div>
                }
            </div>
            {viewMode==="addAll" && 
                <form className="admin-matches-upload-form" onSubmit={handleAddMatches} method="POST">
                    <input type="file" name="fileInput" className="input" onChange={(e)=>setFileInput(e.target.files[0])}/>
                    <div className="admin-matches-buttons">
                        <button className="black-button admin-matches-upload-close-button" type="button" onClick={()=>setViewMode("")}>
                            <img src="/icons/cross-black.png" alt="close" className="icon"/>
                            <span>close form</span>
                        </button>
                        <button className="green-button admin-matches-upload-button" type="submit">
                            <img src="/icons/check-black.png" alt="upload" className="icon"/>
                            <span>upload file</span>
                        </button>
                    </div>
                </form>
            }
            {viewMode==="" && 
                <div className="admin-matches-details">
                    <MatchesTable matches={remainingMatches} dest="/admin/matches" type="matchesTable"/>
                </div>
            }

            {viewMode==="playoff" && 
                <form className="admin-matches-set-playoff" onSubmit={handleSetPlayoff} method="POST">
                    <h2>set playoff details</h2>
                    <div className="input-container">
                        <h3>qualifier 1</h3>
                        <div className="input-container">
                            <label htmlFor="date">date</label>
                            <input type="date" name="date" id="date" value={playoffData.qualifier1.date} onChange={(e)=>setPlayoffData({...playoffData, qualifier1: { ...playoffData.qualifier1, date: e.target.value }})}/>
                        </div>
                        <div className="input-container">
                            <label htmlFor="time">time</label>
                            <input type="time" name="time" id="time" value={playoffData.qualifier1.time} onChange={(e)=>setPlayoffData({...playoffData, qualifier1: { ...playoffData.qualifier1, time: e.target.value }})}/>
                        </div>
                        <div className="input-container">
                            <label htmlFor="venue">venue</label>
                            <div className="input selection" onClick={()=>setShowOptions1(prev=>!prev)}>
                                <p>{playoffData.qualifier1.venue!=="" ? playoffData.qualifier1.venue : "Choose Venue"}</p>
                                <button type="button">
                                    {showOptions1 ? 
                                        <img src="/icons/up-black.png" alt="up" className="icon"/> 
                                    : 
                                        <img src="/icons/down-black.png" alt="down" className="icon"/>
                                    }
                                </button>
                                {showOptions1 && 
                                    <div className="select">
                                        {season.teams.map((team)=>(
                                            team.home.map((home, index)=>(
                                                <div className="input" key={index} value={home} onClick={(e)=>{ e.stopPropagation(); setPlayoffData({...playoffData, qualifier1: { ...playoffData.qualifier1, venue: home }}); setShowOptions1(false)}}>
                                                    <p>{home}</p>
                                                </div>
                                            ))
                                        ))}
                                    </div>
                                }
                            </div>
                        </div>

                        <h3>eliminator</h3>
                        <div className="input-container">
                            <label htmlFor="date">date</label>
                            <input type="date" name="date" id="date" value={playoffData.eliminator.date} onChange={(e)=>setPlayoffData({...playoffData, eliminator: { ...playoffData.eliminator, date: e.target.value }})}/>
                        </div>
                        <div className="input-container">
                            <label htmlFor="time">time</label>
                            <input type="time" name="time" id="time" value={playoffData.eliminator.time} onChange={(e)=>setPlayoffData({...playoffData, eliminator: { ...playoffData.eliminator, time: e.target.value }})}/>
                        </div>
                        <div className="input-container">
                            <label htmlFor="venue">venue</label>
                            <div className="input selection" onClick={()=>setShowOptions2(prev=>!prev)}>
                                <p>{playoffData.eliminator.venue!=="" ? playoffData.eliminator.venue : "Choose Venue"}</p>
                                <button type="button">
                                    {showOptions2 ? 
                                        <img src="/icons/up-black.png" alt="up" className="icon"/> 
                                    : 
                                        <img src="/icons/down-black.png" alt="down" className="icon"/>
                                    }
                                </button>
                                {showOptions2 && 
                                    <div className="select">
                                        {season.teams.map((team)=>(
                                            team.home.map((home, index)=>(
                                                <div className="input" key={index} value={home} onClick={(e)=>{ e.stopPropagation(); setPlayoffData({ ...playoffData, eliminator: { ...playoffData.eliminator, venue: home }}); setShowOptions2(false)}}>
                                                    <p>{home}</p>
                                                </div>
                                            ))
                                        ))}
                                    </div>
                                }
                            </div>
                        </div>

                        <h3>qualifier 2</h3>
                        <div className="input-container">
                            <label htmlFor="date">date</label>
                            <input type="date" name="date" id="date" value={playoffData.qualifier2.date} onChange={(e)=>setPlayoffData({...playoffData, qualifier2: { ...playoffData.qualifier2, date: e.target.value }})}/>
                        </div>
                        <div className="input-container">
                            <label htmlFor="time">time</label>
                            <input type="time" name="time" id="time" value={playoffData.qualifier2.time} onChange={(e)=>setPlayoffData({...playoffData, qualifier2: { ...playoffData.qualifier2, time: e.target.value }})}/>
                        </div>
                        <div className="input-container">
                            <label htmlFor="venue">venue</label>
                            <div className="input selection" onClick={()=>setShowOptions3(prev=>!prev)}>
                                <p>{playoffData.qualifier2.venue!=="" ? playoffData.qualifier2.venue : "Choose Venue"}</p>
                                <button type="button">
                                    {showOptions3 ? 
                                        <img src="/icons/up-black.png" alt="up" className="icon"/> 
                                    : 
                                        <img src="/icons/down-black.png" alt="down" className="icon"/>
                                    }
                                </button>
                                {showOptions3 && 
                                    <div className="select">
                                        {season.teams.map((team)=>(
                                            team.home.map((home, index)=>(
                                                <div className="input" key={index} value={home} onClick={(e)=>{ e.stopPropagation(); setPlayoffData({ ...playoffData, qualifier2: { ...playoffData.qualifier2, venue: home }}); setShowOptions3(false)}}>
                                                    <p>{home}</p>
                                                </div>
                                            ))
                                        ))}
                                    </div>
                                }
                            </div>
                        </div>

                        <h3>final</h3>
                        <div className="input-container">
                            <label htmlFor="date">date</label>
                            <input type="date" name="date" id="date" value={playoffData.final.date} onChange={(e)=>setPlayoffData({...playoffData, final: { ...playoffData.final, date: e.target.value }})}/>
                        </div>
                        <div className="input-container">
                            <label htmlFor="time">time</label>
                            <input type="time" name="time" id="time" value={playoffData.final.time} onChange={(e)=>setPlayoffData({...playoffData, final: { ...playoffData.final, time: e.target.value }})}/>
                        </div>
                        <div className="input-container">
                            <label htmlFor="venue">venue</label>
                            <div className="input selection" onClick={()=>setShowOptions4(prev=>!prev)}>
                                <p>{playoffData.final.venue!=="" ? playoffData.final.venue : "Choose Venue"}</p>
                                <button type="button">
                                    {showOptions4 ? 
                                        <img src="/icons/up-black.png" alt="up" className="icon"/> 
                                    : 
                                        <img src="/icons/down-black.png" alt="down" className="icon"/>
                                    }
                                </button>
                                {showOptions4 && 
                                    <div className="select">
                                        {season.teams.map((team)=>(
                                            team.home.map((home, index)=>(
                                                <div className="input" key={index} value={home} onClick={(e)=>{ e.stopPropagation(); setPlayoffData({ ...playoffData, final: { ...playoffData.final, venue: home }}); setShowOptions4(false)}}>
                                                    <p>{home}</p>
                                                </div>
                                            ))
                                        ))}
                                    </div>
                                }
                            </div>
                        </div>

                    </div>
                    <div className="admin-matches-playoff-buttons">
                        <button className="black-button admin-matches-playoff-close-button" type="button" onClick={()=>setViewMode("")}>
                            <img src="/icons/cross-black.png" alt="close" className="icon"/>
                            <span>close form</span>
                        </button>
                        <button className="green-button admin-matches-set-button" type="submit">
                            <img src="/icons/check-black.png" alt="upload" className="icon"/>
                            <span>set playoff details</span>
                        </button>
                    </div>
                </form>
            }

            {viewMode==="addMatch" &&
                <form className="admin-matches-add-form" onSubmit={handleAddMatch} method="POST">
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
                    <div className="input-container">
                        <label htmlFor="number">number</label>
                        <input type="number" name="number" id="number" value={matchData.number} onChange={handleInputChange}/>
                    </div>
                    <div className="admin-matches-form-buttons">
                        <button className="black-button admin-matches-form-close-button" type="button" onClick={()=>setViewMode("")}>
                            <img src="/icons/cross-black.png" alt="close" className="icon"/>
                            <span>close</span>
                        </button>
                        <button className="green-button admin-matches-add-button" type="submit">
                            <img src="/icons/plus-black.png" alt="add" className="icon"/>
                            <span>add new match</span>
                        </button>
                    </div>
                </form>
            }
        </div>
    )
}