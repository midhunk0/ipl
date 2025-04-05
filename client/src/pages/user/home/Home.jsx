// @ts-nocheck
import React, { useState } from "react";
import "./Home.css";
import { useYear } from "../../../context/seasonContext";
import { PointTable } from "../../../components/pointTable/PointTable";
import { WinLoseTable } from "../../../components/winLoseTable/WinLoseTable";

export function Home(){
    const currentYear=new Date().getFullYear();
    const { year, setYear }=useYear();
    const [tableSwitch, setTableSwitch]=useState(true);

    return(
        <div className="home">
            <div className="home-header">
                <div className="home-header-heading">
                    <h1>IPL {year}</h1>
                    <div className="home-header-slider">
                        <button type="button" className="home-slider-up" onClick={()=>setYear(prev=>Math.min(currentYear, prev+1))}>
                            <img src="/icons/up-black.png" alt="up" className="icon"/>
                        </button>
                        <button type="button" className="home-slider-down" onClick={()=>setYear(prev=>Math.max(2008, prev-1))}>
                            <img src="/icons/down-black.png" alt="down" className="icon"/>
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
        </div>
    )
}