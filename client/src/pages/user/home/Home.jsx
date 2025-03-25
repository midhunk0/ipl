// @ts-nocheck
import React from "react";
import "./Home.css";
import { useYear } from "../../../context/seasonContext";
import { PointTable } from "../../../components/pointTable/PointTable";

export function Home(){
    const currentYear=new Date().getFullYear();
    const { year, setYear }=useYear();

    return(
        <div className="home">
            <div className="home-header">
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
            <PointTable teamDest="/team" matchDest="/match"/>
        </div>
    )
}