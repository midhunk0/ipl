// @ts-nocheck
import React, { useEffect, useState } from "react";
import "./Home.css";
import { useSeason, useYear } from "../../../context/seasonContext";
import { PointTable } from "../../../components/pointTable/PointTable";
import { toast } from "react-toastify";
import { WinLoseTable } from "../../../components/winLoseTable/WinLoseTable";
import { useTheme } from "../../../context/themeContext";
import { useNavigate } from "react-router-dom";

export function Home(){
    const navigate=useNavigate();
    const apiUrl=import.meta.env.MODE==="development"
        ? import.meta.env.VITE_APP_DEV_URL 
        : import.meta.env.VITE_APP_PROD_URL

    const [teamData, setTeamData]=useState({
        name: "",
        short: "",
        home: [""]
    });
    const [showForm, setShowForm]=useState(false);
    const [tableSwitch, setTableSwitch]=useState(true);
    const [hover, setHover]=useState("");
    const [_, setWidth]=useState(window.innerWidth);
    const [show, setShow]=useState(window.innerWidth>720);

    useEffect(()=>{
        function handleResize(){
            const newWidth=window.innerWidth;
            setWidth(newWidth);
            setShow(newWidth>720);
        }
    
        window.addEventListener("resize", handleResize);
        return ()=>window.removeEventListener("resize", handleResize);
    }, []);

    const { theme }=useTheme();
    const { year }=useYear();
    const { season, fetchSeason }=useSeason();
    if(!season){
        return;
    }
    const playoffs=season.playoffs;

    function handleInputChange(e){
        setTeamData({
            ...teamData,
            [e.target.name]: e.target.value
        });
    };

    function handleHomeChange(index, home){
        const updatedHome=[...teamData.home];
        updatedHome[index]=home;
        setTeamData({
            ...teamData,
            home: updatedHome
        });
    }

    function handleHomeAdd(){
        setTeamData({
            ...teamData,
            home: [ ...teamData.home, "" ]
        })
    };

    function handleHomeRemove(index){
        setTeamData((prev)=>{
            const updatedHome=prev.home.filter((_, i)=>i!==index)
            return { ...prev, home: updatedHome};
        })
    }

    async function handleAddTeam(e){
        e.preventDefault();
        try{
            const response=await fetch(`${apiUrl}/addTeam`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...teamData, year }),
                credentials: "include"
            });
            const result=await response.json();
            if(response.ok){
                fetchSeason();
                setShowForm(false);
                setTeamData({
                    name: "",
                    short: "",
                    home: [""]
                })
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

    function getFormatedDate(date){
        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }).replace(/\//g, "-");   
    }

    return(
        <div className="admin-home">
            <div className="admin-home-header">
                <h1>IPL {season.year}</h1>
                {!showForm && 
                    <div className="admin-home-buttons">
                        <button className="green-button" onClick={()=>setShowForm(prev=>!prev)} onMouseEnter={()=>setHover("add")} onMouseLeave={()=>setHover("")}>
                            <img src={theme==="dark" ? "/icons/plus-white.png" : hover==="add" ? "/icons/plus-white.png" : "/icons/plus-black.png"} alt="add" className="icon"/>
                            <span>add new team</span>
                        </button>
                        <button className="black-button" onClick={()=>setTableSwitch(prev=>!prev)}>switch table</button>
                    </div>
                }
            </div>
            {!showForm ? (
                <div className="admin-home-details">
                    {tableSwitch ? 
                        <PointTable teamDest="/admin/team" matchDest="/admin/matches"/>
                    : 
                        <WinLoseTable teamDest="/admin/team"/>
                    }
                    {playoffs && (
                        <div className="admin-home-playoffs">
                            <div className="admin-home-q1">
                                <div className={`admin-home-playoff-team ${playoffs.qualifier1.result.won.short!=="" ? playoffs.qualifier1.result.won.short===playoffs.qualifier1.team.short ? "won" : "lost" : ""}`}>
                                    <img src={playoffs.qualifier1.team.short==="" ? theme==="light" ? "/logos/tbd-black.png" : "/logos/tbd-white.png" : `/logos/${playoffs.qualifier1.team.short}.png`} alt="q1-team" className="logo"/>
                                    <h3>{playoffs.qualifier1.team.short || "TBD"}</h3>
                                </div>
                                <div className="admin-home-q1-details" onClick={()=>navigate(`/admin/matches/${season.playoffs.qualifier1._id}`)}>
                                    <p>{show ? "qualifier 1" : "Q1"}</p>
                                    <p>{getFormatedDate(playoffs.qualifier1.date)}, {playoffs.qualifier1.time}</p>
                                    <p>{playoffs.qualifier1.venue}</p>
                                </div>
                                <div className={`admin-home-playoff-team ${playoffs.qualifier1.result.won.short!=="" ? playoffs.qualifier1.result.won.short===playoffs.qualifier1.opponent.short ? "won" : "lost" : ""}`}>
                                    <img src={playoffs.qualifier1.opponent.short==="" ? theme==="light" ? "/logos/tbd-black.png" : "/logos/tbd-white.png" : `/logos/${playoffs.qualifier1.opponent.short}.png`} alt="q1-opponent" className="logo"/>
                                    <h3>{playoffs.qualifier1.opponent.short || "TBD"}</h3>
                                </div>
                            </div>
                            <div className="admin-home-el">
                                <div className={`admin-home-playoff-team ${playoffs.eliminator.result.won.short!=="" ? playoffs.eliminator.result.won.short===playoffs.eliminator.team.short ? "won" : "lost" : ""}`}>
                                    <img src={playoffs.eliminator.team.short==="" ? theme==="light" ? "/logos/tbd-black.png" : "/logos/tbd-white.png" : `/logos/${playoffs.eliminator.team.short}.png`} alt="el-team" className="logo"/>
                                    <h3>{playoffs.eliminator.team.short || "TBD"}</h3>
                                </div>
                                <div className="admin-home-el-details" onClick={()=>navigate(`/admin/matches/${season.playoffs.eliminator._id}`)}>
                                    <p>{show ? "eliminator" : "EL"}</p>
                                    <p>{getFormatedDate(playoffs.eliminator.date)}, {playoffs.eliminator.time}</p>
                                    <p>{playoffs.eliminator.venue}</p>
                                </div>
                                <div className={`admin-home-playoff-team ${playoffs.eliminator.result.won.short!=="" ? playoffs.eliminator.result.won.short===playoffs.eliminator.opponent.short ? "won" : "lost" : ""}`}>
                                    <img src={playoffs.eliminator.opponent.short==="" ? theme==="light" ? "/logos/tbd-black.png" : "/logos/tbd-white.png" : `/logos/${playoffs.eliminator.opponent.short}.png`} alt="el-opponent" className="logo"/>
                                    <h3>{playoffs.eliminator.opponent.short || "TBD"}</h3>
                                </div>
                            </div>
                            <div className="admin-home-q2">
                                <div className={`admin-home-playoff-team ${playoffs.qualifier2.result.won.short!=="" ? playoffs.qualifier2.result.won.short===playoffs.qualifier2.team.short ? "won" : "lost" : ""}`}>
                                    <img src={playoffs.qualifier2.team.short==="" ? theme==="light" ? "/logos/tbd-black.png" : "/logos/tbd-white.png" : `/logos/${playoffs.qualifier2.team.short}.png`} alt="q2-team" className="logo"/>
                                    <h3>{playoffs.qualifier2.team.short || "TBD"}</h3>
                                </div>
                                <div className="admin-home-q2-details" onClick={()=>navigate(`/admin/matches/${season.playoffs.qualifier2._id}`)}>
                                    <p>{show ? "qualifier 2" : "Q2"}</p>
                                    <p>{getFormatedDate(playoffs.qualifier2.date)}, {playoffs.qualifier2.time}</p>
                                    <p>{playoffs.qualifier2.venue}</p>
                                </div>
                                <div className={`admin-home-playoff-team ${playoffs.qualifier2.result.won.short!=="" ? playoffs.qualifier2.result.won.short===playoffs.qualifier2.opponent.short ? "won" : "lost" : ""}`}>
                                    <img src={playoffs.qualifier2.opponent.short==="" ? theme==="light" ? "/logos/tbd-black.png" : "/logos/tbd-white.png" : `/logos/${playoffs.qualifier2.opponent.short}.png`} alt="q2-opponent" className="logo"/>
                                    <h3>{playoffs.qualifier2.opponent.short || "TBD"}</h3>
                                </div>
                            </div>
                            <div className="admin-home-final">
                                <div className={`admin-home-playoff-team ${playoffs.final.result.won.short!=="" ? playoffs.final.result.won.short===playoffs.final.team.short ? "won" : "lost" : ""}`}>
                                    <img src={playoffs.final.team.short==="" ? theme==="light" ? "/logos/tbd-black.png" : "/logos/tbd-white.png" : `/logos/${playoffs.final.team.short}.png`} alt="final-team" className="logo"/>
                                    <h3>{playoffs.final.team.short || "TBD"}</h3>
                                </div>
                                <div className="admin-home-final-details" onClick={()=>navigate(`/admin/matches/${season.playoffs.final._id}`)}>
                                    <p>final</p>
                                    <p>{getFormatedDate(playoffs.final.date)}, {playoffs.final.time}</p>
                                    <p>{playoffs.final.venue}</p>
                                </div>
                                <div className={`admin-home-playoff-team ${playoffs.final.result.won.short!=="" ? playoffs.final.result.won.short===playoffs.final.opponent.short ? "won" : "lost" : ""}`}>
                                    <img src={playoffs.final.opponent.short==="" ? theme==="light" ? "/logos/tbd-black.png" : "/logos/tbd-white.png" : `/logos/${playoffs.final.opponent.short}.png`} alt="final-opponent" className="logo"/>
                                    <h3>{playoffs.final.opponent.short || "TBD"}</h3>
                                </div>
                            </div>
                            <div className="playoff-line line-q1-final"></div>
                            <div className="playoff-line line1-q1-to-q2"></div>
                            <div className="playoff-line line2-q1-to-q2"></div>
                            <div className="playoff-line line3-q1-to-q2"></div>
                            <div className="playoff-line line1-q2-to-final"></div>
                            <div className="playoff-line line2-q2-to-final"></div>
                            <div className="playoff-line line3-q2-to-final"></div>
                            <div className="playoff-line line1-el-to-q2"></div>
                            <div className="playoff-line line2-el-to-q2"></div>
                            <div className="playoff-line line3-el-to-q2"></div>
                        </div>
                    )}
                </div>
            ) : (
                <form className="admin-home-add-team-form" onSubmit={handleAddTeam} method="POST">
                    <h2>add new team</h2>
                    <div className="input-container">
                        <label htmlFor="name">name</label>
                        <input type="text" name="name" id="name" value={teamData.name} onChange={handleInputChange}/>
                    </div>
                    <div className="input-container">
                        <label htmlFor="short">short</label>
                        <input type="text" name="short" id="short" value={teamData.short} onChange={handleInputChange}/>
                    </div>
                    <div className="input-container">
                        <label htmlFor="home">home</label>
                        {teamData.home.map((home, index)=>(
                            <div key={index} className="admin-home-input-wrapper">
                                <input type="text" value={home} id="home" onChange={(e)=>handleHomeChange(index, e.target.value)} />
                                {index==0 && (
                                    <button type="button" className="green-button" onClick={handleHomeAdd} onMouseEnter={()=>setHover("add1")} onMouseLeave={()=>setHover("")}>
                                        <img src={theme==="dark" ? "/icons/plus-white.png" : hover==="add1" ? "/icons/plus-white.png" : "/icons/plus-black.png"} alt="add" className="icon"/>
                                    </button>
                                )}
                                {index>0 && (
                                    <button type="button" className="red-button" onClick={()=>handleHomeRemove(index)} onMouseEnter={()=>setHover("remove")} onMouseLeave={()=>setHover("")}>
                                        <img src={hover==="remove" ? "/icons/trash-white.png" : "/icons/trash-red.png"} alt="delete" className="icon"/>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="admin-home-form-buttons">
                        <button className="black-button" type="button" onClick={()=>setShowForm(prev=>!prev)} onMouseEnter={()=>setHover("close")} onMouseLeave={()=>setHover("")}>
                            <img src={theme==="dark" ? hover==="close" ? "/icons/cross-black.png" : "/icons/cross-white.png" : hover==="close" ? "/icons/cross-white.png" : "/icons/cross-black.png"} alt="close" className="icon"/>
                            <span>close</span>
                        </button>
                        <button className="green-button" type="submit" onMouseEnter={()=>setHover("add2")} onMouseLeave={()=>setHover("")}>
                            <img src={theme==="dark" ? "/icons/plus-white.png" : hover==="add2" ? "/icons/plus-white.png" : "/icons/plus-black.png"} alt="add" className="icon"/>
                            <span>add new team</span>
                        </button>
                    </div>
                </form>
            )}
        </div>
    )
}