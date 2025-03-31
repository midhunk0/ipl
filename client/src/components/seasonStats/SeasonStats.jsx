import React from "react";
import "./SeasonStats.css";
import { useSeason } from "../../context/seasonContext";

export function SeasonStats(){
    const { season }=useSeason();
    if(!season){
        return;
    }
    const seasonStats=season.stats;

    return(
        <div className="stats-items">
            <div className="stats-item stats-champions">
                <h2>champions</h2>
                <h2>{seasonStats.champion}</h2>
            </div>
            <div className="stats-item">
                <h2>runners up</h2>
                <h2>{seasonStats.runnerUp}</h2>
            </div>
            <div className="stats-item-container">
                <div className="stats-item">
                    <h2>orange cap</h2>
                    <h2>{seasonStats.orangeCap.name}</h2>
                    <h2>{seasonStats.orangeCap.runs===0 ? "" : seasonStats.orangeCap.runs}</h2>
                    <h2>{seasonStats.orangeCap.team}</h2>
                </div>
                <div className="stats-item">
                    <h2>purple cap</h2>
                    <h2>{seasonStats.purpleCap.name}</h2>
                    <h2>{seasonStats.purpleCap.wickets===0 ? "" : seasonStats.purpleCap.wickets}</h2>
                    <h2>{seasonStats.purpleCap.team}</h2>
                </div>
            </div>
            <div className="stats-item-container">
                <div className="stats-item">
                    <h2>most 6s</h2>
                    <h2>{seasonStats.most6s.name}</h2>
                    <h2>{seasonStats.most6s.number===0 ? "" : seasonStats.most6s.number}</h2>
                    <h2>{seasonStats.most6s.team}</h2>
                </div>
                <div className="stats-item">
                    <h2>most 4s</h2>
                    <h2>{seasonStats.most4s.name}</h2>
                    <h2>{seasonStats.most4s.number===0 ? "" : seasonStats.most4s.number}</h2>
                    <h2>{seasonStats.most4s.team}</h2>
                </div>
            </div>
            <div className="stats-item-container">
                <div className="stats-item">
                    <h2>fair play award</h2>
                    <h2>{seasonStats.fairPlayAward}</h2>
                </div>
                <div className="stats-item">
                    <h2>highest score</h2>
                    <h2>{seasonStats.highestScore.name}</h2>
                    <h2>{seasonStats.highestScore.runs===0 ? "" : seasonStats.highestScore.runs}</h2>
                    <h2>{seasonStats.highestScore.team}</h2>
                </div>
            </div>
            <div className="stats-item-container">
                <div className="stats-item">
                    <h2>most valuable player</h2>
                    <h2>{seasonStats.mostValuablePlayer.name}</h2>
                </div>
                <div className="stats-item">
                    <h2>emerging player</h2>
                    <h2>{seasonStats.emergingPlayer.name}</h2>
                </div>
            </div>
        </div>
    )
}