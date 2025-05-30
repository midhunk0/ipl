import "./SeasonStats.css";
import { useSeason } from "../../context/seasonContext";
import { useYear } from "../../context/seasonContext";

export function SeasonStats(){
    const { year }=useYear();
    const { season }=useSeason();
    
    if(!season){
        return (
            <div className="stats-items">
                <p>No Season</p>
            </div>
        );
    }
    const seasonStats=season.stats;

    if(seasonStats.orangeCap.name===""){
        return(
            <div className="stats-items">
                <p>Season ongoing</p>
            </div>
        )
    }

    return(
        <div className="stats-items">
            <h1>IPL {year} season stats</h1>
            <div className="stats-item">
                <h4>champions</h4>
                <h2>{seasonStats.champion}</h2>
            </div>
            <div className="stats-item">
                <h4>runners up</h4>
                <h2>{seasonStats.runnerUp}</h2>
            </div>
            <div className="stats-item">
                <h4>fair play award</h4>
                <h2>{seasonStats.fairPlayAward}</h2>
            </div>
            <div className="stats-item-container">
                <div className="stats-item">
                    <h4>orange cap</h4>
                    <h2>{seasonStats.orangeCap.name}</h2>
                    <h4>{seasonStats.orangeCap.runs===0 ?  "" : `${seasonStats.orangeCap.runs } runs`}</h4>
                    <h4>{seasonStats.orangeCap.team}</h4>
                </div>
                <div className="stats-item">
                    <h4>purple cap</h4>
                    <h2>{seasonStats.purpleCap.name}</h2>
                    <h4>{seasonStats.purpleCap.wickets===0 ?  "" : `${seasonStats.purpleCap.wickets } wickets`}</h4>
                    <h4>{seasonStats.purpleCap.team}</h4>
                </div>
            </div>
            <div className="stats-item-container">
                <div className="stats-item">
                    <h4>most 6s</h4>
                    <h2>{seasonStats.most6s.name}</h2>
                    <h4>{seasonStats.most6s.number===0 ? "" : seasonStats.most6s.number}</h4>
                    <h4>{seasonStats.most6s.team}</h4>
                </div>
                <div className="stats-item">
                    <h4>most 4s</h4>
                    <h2>{seasonStats.most4s.name}</h2>
                    <h4>{seasonStats.most4s.number===0 ? "" : seasonStats.most4s.number}</h4>
                    <h4>{seasonStats.most4s.team}</h4>
                </div>
            </div>
            <div className="stats-item-container">
                <div className="stats-item">
                    <h4>most valuable player</h4>
                    <h2>{seasonStats.mostValuablePlayer.name}</h2>
                    <h4>{seasonStats.mostValuablePlayer.for}</h4>
                    <h4>{seasonStats.mostValuablePlayer.team}</h4>
                </div>
                <div className="stats-item">
                    <h4>emerging player</h4>
                    <h2>{seasonStats.emergingPlayer.name}</h2>
                    <h4>{seasonStats.emergingPlayer.for}</h4>
                    <h4>{seasonStats.emergingPlayer.team}</h4>
                </div>
            </div>
        </div>
    )
}