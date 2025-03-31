import React from "react";
import "./Stats.css";
import { SeasonStats } from "../../../components/seasonStats/SeasonStats";
import { useYear } from "../../../context/seasonContext";

export function Stats(){
    const { year }=useYear();

    return(
        <div className="stats">
            <h1>IPL {year} season stats</h1>
            <SeasonStats/>
        </div>
    )
}