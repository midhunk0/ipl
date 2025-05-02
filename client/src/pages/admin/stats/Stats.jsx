// @ts-nocheck
import React, { useState } from "react";
import "./Stats.css";
import { useSeason, useYear } from "../../../context/seasonContext";
import { toast } from "react-toastify";
import { SeasonStats } from "../../../components/seasonStats/SeasonStats";

export function Stats(){
    const { year }=useYear();
    const [stats, setStats]=useState({
        champion: "",
        runnerUp: "",
        fairPlayAward: "",
        orangeCap: {
            name: "",
            runs: 0,
            team: ""
        },
        purpleCap: {
            name: "",
            wickets: 0,
            team: ""
        },
        most6s: {
            name: "",
            number: 0,
            team: ""
        },
        most4s: {
            name: "",
            number: 0,
            team: ""
        },
        highestScore: {
            name: "",
            runs: 0,
            team: ""
        },
        mostValuablePlayer: {
            name: "",
            team: ""
        },
        emergingPlayer: {
            name: "",
            team: ""
        }
    });

    const { season }=useSeason();
    if(!season){
        return;
    }
    const seasonStats=season.stats;

    const apiUrl=import.meta.env.MODE==="development"
        ? import.meta.env.VITE_APP_DEV_URL 
        : import.meta.env.VITE_APP_PROD_URL

    function handleInputChange(e){
        setStats({
            ...stats,
            [e.target.name]: e.target.value
        });
    };

    function handleInputOrangeCap(e){
        setStats({
            ...stats,
            orangeCap: {
                ...stats.orangeCap,
                [e.target.name]: e.target.value
            }
        });
    };

    function handleInputPurpleCap(e){
        setStats({
            ...stats,
            purpleCap: {
                ...stats.purpleCap,
                [e.target.name]: e.target.value
            }
        });
    };

    function handleInputMost6s(e){
        setStats({
            ...stats,
            most6s: {
                ...stats.most6s,
                [e.target.name]: e.target.value
            }
        });
    };

    function handleInputMost4s(e){
        setStats({
            ...stats,
            most4s: {
                ...stats.most4s,
                [e.target.name]: e.target.value
            }
        });
    };

    function handleInputHighestScore(e){
        setStats({
            ...stats,
            highestScore: {
                ...stats.highestScore,
                [e.target.name]: e.target.value
            }
        });
    };

    function handleInputMVP(e){
        setStats({
            ...stats,
            mostValuablePlayer: {
                ...stats.mostValuablePlayer,
                [e.target.name]: e.target.value
            }
        });
    };

    function handleInputEmergingPlayer(e){
        setStats({
            ...stats,
            emergingPlayer: {
                ...stats.emergingPlayer,
                [e.target.name]: e.target.value
            }
        });
    };

    async function handleAddStats(e){
        e.preventDefault();
        try{
            const response=await fetch(`${apiUrl}/addStats/${year}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(stats),
                credentials: "include"
            });
            const result=await response.json();
            if(response.ok){
                setStats({
                    champion: "",
                    runnerUp: "",
                    fairPlayAward: "",
                    orangeCap: {
                        name: "",
                        runs: 0,
                        team: ""
                    },
                    purpleCap: {
                        name: "",
                        wickets: 0,
                        team: ""
                    },
                    most6s: {
                        name: "",
                        number: 0,
                        team: ""
                    },
                    most4s: {
                        name: "",
                        number: 0,
                        team: ""
                    },
                    highestScore: {
                        name: "",
                        runs: 0,
                        team: ""
                    },
                    mostValuablePlayer: {
                        name: "",
                        team: ""
                    },
                    emergingPlayer: {
                        name: "",
                        team: ""
                    }
                })
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
        <div className="admin-stats">
            <h1>IPL {year} season stats</h1>
            {seasonStats && seasonStats.champion!=="" ? (
                <SeasonStats/>
            ):(
                <form className="admin-stats-form" method="post" onSubmit={handleAddStats}>
                    <div className="input-container">
                        <h3>champion</h3>
                        <input type="text" name="champion" id="champion" value={stats.champion} onChange={handleInputChange}/>
                    </div>

                    <div className="input-container">
                        <h3>runner up</h3>
                        <input type="text" name="runnerUp" id="runnerUp" value={stats.runnerUp} onChange={handleInputChange}/>
                    </div>
                    
                    <div className="input-container">
                        <h3>fair play award</h3>
                        <input type="text" name="fairPlayAward" id="fairPlay" value={stats.fairPlayAward} onChange={handleInputChange}/>
                    </div>
                    
                    <div className="input-container">
                        <h3>orange cap</h3>
                        <div className="admin-stats-expand">
                            <div className="input-container">
                                <label htmlFor="orangeCapName">name</label>
                                <input type="text" name="name" id="orangeCapName" value={stats.orangeCap.name} onChange={handleInputOrangeCap}/>
                            </div>
                            <div className="input-container">
                                <label htmlFor="orangeCapRuns">runs</label>
                                <input type="text" name="runs" id="orangeCapRuns" value={stats.orangeCap.runs} onChange={handleInputOrangeCap}/>
                            </div>
                            <div className="input-container">
                                <label htmlFor="orangeCapTeam">team</label>
                                <input type="text" name="team" id="orangeCapTeam" value={stats.orangeCap.team} onChange={handleInputOrangeCap}/>
                            </div>
                        </div>
                    </div>
                    
                    <div className="input-container">
                        <h3>purple cap</h3>
                        <div className="admin-stats-expand">
                            <div className="input-container">
                                <label htmlFor="purpleCapName">name</label>
                                <input type="text" name="name" id="purpleCapName" value={stats.purpleCap.name} onChange={handleInputPurpleCap}/>
                            </div>
                            <div className="input-container">
                                <label htmlFor="purpleCapRuns">wickets</label>
                                <input type="text" name="wickets" id="purpleCapRuns" value={stats.purpleCap.wickets} onChange={handleInputPurpleCap}/>
                            </div>
                            <div className="input-container">
                                <label htmlFor="purpleCapTeam">team</label>
                                <input type="text" name="team" id="purpleCapTeam" value={stats.purpleCap.team} onChange={handleInputPurpleCap}/>
                            </div>
                        </div>
                    </div>

                    <div className="input-container">
                        <h3>most 6s</h3>
                        <div className="admin-stats-expand">
                            <div className="input-container">
                                <label htmlFor="most6sName">name</label>
                                <input type="text" name="name" id="most6sName" value={stats.most6s.name} onChange={handleInputMost6s}/>
                            </div>
                            <div className="input-container">
                                <label htmlFor="most6s">number</label>
                                <input type="text" name="number" id="most6s" value={stats.most6s.number} onChange={handleInputMost6s}/>
                            </div>
                            <div className="input-container">
                                <label htmlFor="most6sTeam">team</label>
                                <input type="text" name="team" id="most6sTeam" value={stats.most6s.team} onChange={handleInputMost6s}/>
                            </div>  
                        </div>
                    </div>

                    <div className="input-container">
                        <h3>most 4s</h3>
                        <div className="admin-stats-expand">
                            <div className="input-container">
                                <label htmlFor="most4sName">name</label>
                                <input type="text" name="name" id="most4sName" value={stats.most4s.name} onChange={handleInputMost4s}/>
                            </div>
                            <div className="input-container">
                                <label htmlFor="most4s">number</label>
                                <input type="text" name="number" id="most4s" value={stats.most4s.number} onChange={handleInputMost4s}/>
                            </div>
                            <div className="input-container">
                                <label htmlFor="most4sTeam">team</label>
                                <input type="text" name="team" id="most4sTeam" value={stats.most4s.team} onChange={handleInputMost4s}/>
                            </div>
                        </div>
                    </div>

                    <div className="input-container">
                        <h3>highest score</h3>
                        <div className="admin-stats-expand">
                            <div className="input-container">
                                <label htmlFor="highestScoreName">name</label>
                                <input type="text" name="name" id="highestScoreName" value={stats.highestScore.name} onChange={handleInputHighestScore}/>
                            </div>
                            <div className="input-container">
                                <label htmlFor="highestScore">runs</label>
                                <input type="text" name="runs" id="highestScore" value={stats.highestScore.runs} onChange={handleInputHighestScore}/>
                            </div>
                            <div className="input-container">
                                <label htmlFor="highestScoreTeam">team</label>
                                <input type="text" name="team" id="highestScoreTeam" value={stats.highestScore.team} onChange={handleInputHighestScore}/>
                            </div>
                        </div>
                    </div>

                    <div className="input-container">
                        <h3>most valuable player</h3>
                        <div className="admin-stats-expand">
                            <div className="input-container">
                                <label htmlFor="MVPName">name</label>
                                <input type="text" name="name" id="MVPName" value={stats.mostValuablePlayer.name} onChange={handleInputMVP}/>
                            </div>
                            <div className="input-container">
                                <label htmlFor="MVOTeam">team</label>
                                <input type="text" name="team" id="MVPTeam" value={stats.mostValuablePlayer.team} onChange={handleInputMVP}/>
                            </div>
                        </div>
                    </div>

                    <div className="input-container">
                        <h3>emerging player</h3>
                        <div className="admin-stats-expand">
                            <div className="input-container">
                                <label htmlFor="emergingPlayerName">name</label>
                                <input type="text" name="name" id="emergingPlayerName" value={stats.emergingPlayer.name} onChange={handleInputEmergingPlayer}/>
                            </div>
                            <div className="input-container">
                                <label htmlFor="emergingPlayerTeam">team</label>
                                <input type="text" name="team" id="emergingPlayerTeam" value={stats.emergingPlayer.team} onChange={handleInputEmergingPlayer}/>
                            </div>
                        </div>
                    </div>

                    <div className="admin-stats-buttons">
                        <button className="black-button admin-stats-form-clear-button" type="button">
                            <img src="/icons/cross-black.png" alt="close" className="icon"/>
                            <span>clear</span>
                        </button>
                        <button className="green-button admin-stats-add-button" type="submit">
                            <img src="/icons/plus-black.png" alt="add" className="icon"/>
                            <span>add stats</span>
                        </button>
                    </div>
                </form>
            )}
        </div>
    )
}