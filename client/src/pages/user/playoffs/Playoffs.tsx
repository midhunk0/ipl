import { PlayoffMap } from "../../../components/playoffMap/PlayoffMap";
import { useSeason } from "../../../hooks/useSeason";
import { useYear } from "../../../hooks/useYear";
import "./Playoffs.css";

export function Playoffs(){
    const { year }=useYear();
    const { season }=useSeason();
    
    if(!season){
        return (
            <div className="matches">
                <p>No Season</p>
            </div>
        );
    }

    return(
        <div className="playoff-container">
            <h1>IPL {year} playoffs</h1>
            <PlayoffMap dest="/matches"/>
        </div>
    )
}