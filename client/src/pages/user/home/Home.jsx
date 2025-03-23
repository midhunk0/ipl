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
            <input type="number" id="year" className="home-year-input" placeholder={currentYear.toString()} min="2008" max={currentYear} onChange={(e)=>setYear(Number(e.target.value))}/>
            <h1>IPL {year}</h1>
            <PointTable teamDest="/team" matchDest="/match"/>
        </div>
    )
}