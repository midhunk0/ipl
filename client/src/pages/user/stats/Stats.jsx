import React from "react";
import "./Stats.css";
import { useSeason } from "../../../context/seasonContext";

export function Stats(){
    const { season }=useSeason();

    return(
        <div className="stats">
            {season && season.stats ? (
                <div className="stats-details">
                    <div className="stats-container">
                        <h1>IPL {season.year} champions</h1>
                        <p>{season.stats.champion}</p>
                    </div>
                    <div className="stats-container">
                        <h1>runners up</h1>
                        <p>{season.stats.runnersUp}</p>
                    </div>
                    <div className="stats-same-container">
                        <div className="stats-container">
                            <h1>orange cap</h1>
                            <p>{season.stats.orangeCap.name}</p>
                        </div>
                        <div className="stats-container">
                            <h1>purple cap</h1>
                            <p>{season.stats.purpleCap.name}</p>
                        </div>
                    </div>
                    <div className="stats-same-container">
                        <div className="stats-container">
                            <h1>most 6s</h1>
                            <p>{season.stats.most6s.name}</p>
                        </div>
                        <div className="stats-container">
                            <h1>most 4s</h1>
                            <p>{season.stats.most4s.name}</p>
                        </div>
                    </div>
                    <div className="stats-same-container">
                        <div className="stats-container">
                            <h1>highest score</h1>
                            <p>{season.stats.highestScore.name}</p>
                        </div>                    
                        <div className="stats-container">
                            <h1>fairplay awards</h1>
                            <p>{season.stats.fairplayAward}</p>
                        </div>
                    </div>
                    <div className="stats-same-container">
                        <div className="stats-container">
                            <h1>emerging player</h1>
                            <p>{season.stats.emergingPlayer.name}</p>
                        </div>                    
                        <div className="stats-container">
                            <h1>most valuable player</h1>
                            <p>{season.stats.mostValuablePlayer.name}</p>
                        </div>
                    </div>
                </div>
            ) : (
                <p>No Season</p>
            )}
        </div>
    )
}