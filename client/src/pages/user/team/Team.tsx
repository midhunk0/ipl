import "./Team.css";
import { useLocation } from "react-router-dom";
import { MatchesTable } from "../../../components/matchesTable/matchesTable";
import { useSeason } from "../../../hooks/useSeason";

export function Team(){
    const location=useLocation(); 
    const { season }=useSeason();
    if(!season){
        return;
    }
    
    const teamId=location.state.teamId;
    const team=season.teams.find(team=>team._id===teamId);
    if(!team) return;
    const matches=season.matches.filter(match=>match.team.short===team.short || match.opponent.short===team.short);
    const sortedMatches=matches.slice().sort((a, b)=>{
        const dateA=new Date(a.date);
        const dateB=new Date(b.date);
      console.log(a);
        const isACompleted=a.result.won.short!=="" || a.result.draw?.status;
        const isBCompleted=b.result.won.short!=="" || b.result.draw?.status;
      
        if(isACompleted && !isBCompleted) return 1;
        if(!isACompleted && isBCompleted) return -1;
      
        if(isACompleted && isBCompleted) {
            return dateB.getTime() - dateA.getTime(); 
        } 
        else{
            return dateA.getTime() - dateB.getTime(); 
        }
    });

    return(
        <div className="team">
            <h1>{team.name}</h1>
            <MatchesTable matches={sortedMatches} dest="/matches" type="teamTable"/>
        </div>      
    )
}