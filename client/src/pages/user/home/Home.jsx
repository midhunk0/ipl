// @ts-nocheck
import React, { useState } from "react";
import "./Home.css";
import { useSeason, useYear } from "../../../context/seasonContext";
import { PointTable } from "../../../components/pointTable/PointTable";
import { WinLoseTable } from "../../../components/winLoseTable/WinLoseTable";
import { useTheme } from "../../../context/themeContext";
import { useNavigate } from "react-router-dom";

export function Home(){
    const navigate=useNavigate();
    const currentYear=new Date().getFullYear();
    
    const [tableSwitch, setTableSwitch]=useState(true);
    const [hover, setHover]=useState("");

    const { year, setYear }=useYear();
    const { season }=useSeason();
    const { theme }=useTheme();
    if(!season){
        return (
            <div className="matches">
                <p>No Season</p>
            </div>
        );
    }

    const playoffs=season.playoffs;

    function getFormatedDate(date){
        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }).replace(/\//g, "-");   
    }

    return(
        <div className="home">
            <div className="home-header">
                <div className="home-header-heading">
                    <h1>IPL {year}</h1>
                    <div className="home-header-slider">
                        <button type="button" className="home-slider-up" onClick={()=>setYear(prev=>Math.min(currentYear, prev+1))} onMouseEnter={()=>setHover("up")} onMouseLeave={()=>setHover("")}>
                            <img src={theme==="dark" ? hover==="up" ? "/icons/up-black.png" : "/icons/up-white.png": hover==="up" ? "/icons/up-white.png" : "/icons/up-black.png"} alt="up" className="icon"/>
                        </button>
                        <button type="button" className="home-slider-down" onClick={()=>setYear(prev=>Math.max(2008, prev-1))} onMouseEnter={()=>setHover("down")} onMouseLeave={()=>setHover("")}>
                            <img src={theme==="dark" ? hover==="down" ? "/icons/down-black.png" : "/icons/down-white.png" : hover==="down" ? "/icons/down-white.png" : "/icons/down-black.png"} alt="down" className="icon"/>
                        </button>
                    </div>
                </div>
                <button className="home-table-switch" onClick={()=>setTableSwitch(prev=>!prev)}>switch table</button>
            </div>
            {tableSwitch ?
                <PointTable teamDest="/team" matchDest="/matches"/>
            : 
                <WinLoseTable teamDest="/team"/>
            }
            {playoffs && (
                <div className="home-playoffs">
                    <div className="home-q1">
                        <div className="home-playoff-team">
                            <img src={playoffs.qualifier1.team.short==="" ? theme==="light" ? "/logos/tbd-black.png" : "/logos/tbd-white.png" : `/logos/${playoffs.qualifier1.team.short}.png`} alt="q1-team" className="logo"/>
                            <h3>{playoffs.qualifier1.team.name || "TBD"}</h3>
                        </div>
                        <div className="home-q1-details" onClick={()=>navigate(`/matches/${season.playoffs.qualifier1._id}`)}>
                            <p>qualifier 1</p>
                            <p>{getFormatedDate(playoffs.qualifier1.date)}, {playoffs.qualifier1.time}</p>
                            <p>{playoffs.qualifier1.venue}</p>
                        </div>
                        <div className="home-playoff-team">
                            <img src={playoffs.qualifier1.opponent.short==="" ? theme==="light" ? "/logos/tbd-black.png" : "/logos/tbd-white.png" : `/logos/${playoffs.qualifier1.opponent.short}.png`} alt="q1-opponent" className="logo"/>
                            <h3>{playoffs.qualifier1.opponent.name || "TBD"}</h3>
                        </div>
                    </div>
                    <div className="home-el">
                        <div className="home-playoff-team">
                            <img src={playoffs.eliminator.team.short==="" ? theme==="light" ? "/logos/tbd-black.png" : "/logos/tbd-white.png" : `/logos/${playoffs.eliminator.team.short}.png`} alt="el-team" className="logo"/>
                            <h3>{playoffs.eliminator.team.name || "TBD"}</h3>
                        </div>
                        <div className="home-el-details" onClick={()=>navigate(`/matches/${season.playoffs.eliminator._id}`)}>
                            <p>eliminator</p>
                            <p>{getFormatedDate(playoffs.eliminator.date)}, {playoffs.eliminator.time}</p>
                            <p>{playoffs.eliminator.venue}</p>
                        </div>
                        <div className="home-playoff-team">
                            <img src={playoffs.eliminator.opponent.short==="" ? theme==="light" ? "/logos/tbd-black.png" : "/logos/tbd-white.png" : `/logos/${playoffs.eliminator.opponent.short}.png`} alt="el-opponent" className="logo"/>
                            <h3>{playoffs.eliminator.opponent.name || "TBD"}</h3>
                        </div>
                    </div>
                    <div className="home-q2">
                        <div className="home-playoff-team">
                            <img src={playoffs.qualifier2.team.short==="" ? theme==="light" ? "/logos/tbd-black.png" : "/logos/tbd-white.png" : `/logos/${playoffs.qualifier2.team.short}.png`} alt="q2-team" className="logo"/>
                            <h3>{playoffs.qualifier2.team.name || "TBD"}</h3>
                        </div>
                        <div className="home-q2-details" onClick={()=>navigate(`/matches/${season.playoffs.qualifier2._id}`)}>
                            <p>qualifier 2</p>
                            <p>{getFormatedDate(playoffs.qualifier2.date)}, {playoffs.qualifier2.time}</p>
                            <p>{playoffs.qualifier2.venue}</p>
                        </div>
                        <div className="home-playoff-team">
                            <img src={playoffs.qualifier2.opponent.short==="" ? theme==="light" ? "/logos/tbd-black.png" : "/logos/tbd-white.png" : `/logos/${playoffs.qualifier2.opponent.short}.png`} alt="q2-opponent" className="logo"/>
                            <h3>{playoffs.qualifier2.opponent.name || "TBD"}</h3>
                        </div>
                    </div>
                    <div className="home-final">
                        <div className="home-playoff-team">
                            <img src={playoffs.final.team.short==="" ? theme==="light" ? "/logos/tbd-black.png" : "/logos/tbd-white.png" : `/logos/${playoffs.final.team.short}.png`} alt="final-team" className="logo"/>
                            <h3>{playoffs.final.team.name || "TBD"}</h3>
                        </div>
                        <div className="home-q1-details" onClick={()=>navigate(`/matches/${season.playoffs.final._id}`)}>
                            <p>final</p>
                            <p>{getFormatedDate(playoffs.final.date)}, {playoffs.final.time}</p>
                            <p>{playoffs.final.venue}</p>
                        </div>
                        <div className="home-playoff-team">
                            <img src={playoffs.final.opponent.short==="" ? theme==="light" ? "/logos/tbd-black.png" : "/logos/tbd-white.png" : `/logos/${playoffs.final.opponent.short}.png`} alt="final-opponent" className="logo"/>
                            <h3>{playoffs.final.opponent.name || "TBD"}</h3>
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
    )
}