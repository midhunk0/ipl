import { useNavigate } from "react-router-dom";
import "./PlayoffMap.css";
import { useEffect, useState } from "react";
import { useTheme } from "../../hooks/useTheme";
import { useSeason } from "../../hooks/useSeason";
import type { MatchType, PlayoffsType, TeamNameType,  } from "../../types/type";

type props={
    dest: string;
}

export function PlayoffMap({ dest }: props){
    const navigate=useNavigate();
    const [, setWidth]=useState<number>(window.innerWidth);
    const [show, setShow]=useState<boolean>(window.innerWidth>720);

    useEffect(()=>{
        function handleResize(){
            const newWidth=window.innerWidth;
            setWidth(newWidth);
            setShow(newWidth>720);
        }
    
        window.addEventListener("resize", handleResize);
        return ()=>window.removeEventListener("resize", handleResize);
    }, []);

    const { theme }=useTheme();
    const { season }=useSeason();
    if(!season){
        return null;
    }

    const playoffs=season.playoffs;

    function getFormatedDate(date: Date | string){
        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }).replace(/\//g, "-");   
    }

    function getShortName(game: string){
        switch(game){
            case "qualifier1":
                return "Q1";
            case "eliminator":
                return "EL";
            case "qualifier2":
                return "Q2";
            case "final":
                return "FL";
            default:
                return "";
        }
    }

    function PlayoffTeam({ game, team } : { game: keyof PlayoffsType, team: "team" | "opponent" }){
        const match=playoffs[game] as MatchType;
        const currentTeam=match[team] as TeamNameType;
        
        return(
            <div className={
                `playoff-team ${match.result.won.short!=="" 
                    ? match.result.won.short===currentTeam.short ? "won" : "lost" 
                    : ""}`
                }
            >
                <img src={
                    currentTeam.short!=="" 
                        ? `/logos/${currentTeam.short}.png`
                        : theme==="light" ? "/logos/tbd-black.png" : "/logos/tbd-white.png" 
                    } 
                    alt={`${game}-team`}
                    className="logo"
                />
                <h3>{currentTeam.short || "TBD"}</h3>
            </div>
        )
    }

    function PlayoffGame({ game } : { game: keyof PlayoffsType }){
        const match=playoffs[game] as MatchType;

        return(
            <div className={`playoffs-${game}`}>
                <PlayoffTeam game={game} team="team"/>
                <div className={`playoffs-${game}-details`} onClick={()=>navigate(`${dest}/${match._id}`)}>
                    <p>{show ? game : getShortName(game)}</p>
                    <p>{getFormatedDate(match.date)}, {match.time}</p>
                    <p>{match.venue}</p>
                </div>
                <PlayoffTeam game={game} team="opponent"/>
            </div>
        )
    }

    function PlayoffLines(){
        return(
            <>
                <div className="playoff-line line-q1-final"/>
                <div className="playoff-line line1-q1-to-q2"/>
                <div className="playoff-line line2-q1-to-q2"/>
                <div className="playoff-line line3-q1-to-q2"/>
                <div className="playoff-line line1-q2-to-final"/>
                <div className="playoff-line line2-q2-to-final"/>
                <div className="playoff-line line3-q2-to-final"/>
                <div className="playoff-line line1-el-to-q2"/>
                <div className="playoff-line line2-el-to-q2"/>
                <div className="playoff-line line3-el-to-q2"/>
            </>
        )
    }

    return(
        <div className="playoffs">
            <PlayoffGame game="qualifier1"/>
            <PlayoffGame game="eliminator"/>
            <PlayoffGame game="qualifier2"/>
            <PlayoffGame game="final"/>
            <PlayoffLines/>
        </div>
    )
}