/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import "./Season.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useTheme } from "../../../hooks/useTheme";
import { useYear } from "../../../hooks/useYear";
import type { SeasonType } from "../../../types/type";

export function Season(){
    const navigate=useNavigate();
    const currentYear=new Date().getFullYear();

    const apiUrl=import.meta.env.MODE==="development"
        ? import.meta.env.VITE_APP_DEV_URL 
        : import.meta.env.VITE_APP_PROD_URL
    
    const [seasons, setSeasons]=useState<SeasonType[]>([]);
    const [hover, setHover]=useState<string>("");

    const { theme }=useTheme();
    const { year, setYear }=useYear();

    async function handleAddNewSeason(e: React.FormEvent<HTMLFormElement>){
        e.preventDefault();
        try{
            const response=await fetch(`${apiUrl}/addSeason`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ year }),
                credentials: "include"
            });
            const result=await response.json();
            if(response.ok){
                handleFetchSeasons();
                toast.success(result.message);
            }
            else{
                toast.error(result.message);
            }
        }
        catch(error){
            console.log(error);
        }
    };

    async function handleFetchSeasons(){
        try{
            const response=await fetch(`${apiUrl}/fetchSeasons`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });
            const result=await response.json();
            if(response.ok){
                setSeasons(result.seasons);
            }
        }
        catch(error){
            console.log(error);
        }
    };

    useEffect(()=>{
        handleFetchSeasons();
    }, [apiUrl]);

    async function handleDeleteSeason(year: Date | number){
        try{
            const response=await fetch(`${apiUrl}/deleteSeason/${year}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });
            const result=await response.json();
            if(response.ok){
                setSeasons(prev=>
                    prev.filter(season=>season.year!==year)
                )
                toast.success(result.message);
            }
            else{
                toast.error(result.message);
            }
        }
        catch(error){
            console.log(error);
        }
    }

    async function handleLogout(){
        try{
            const response=await fetch(`${apiUrl}/logoutAdmin`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });
            const result=await response.json();
            if(response.ok){
                navigate("/login");
            }
            console.log(result);
        }
        catch(error){
            console.log(error);
        }
    }

    console.log(seasons)

    return(
        <div className="season-page">
            <form className="season-add-form" onSubmit={handleAddNewSeason} method="POST">
                <input type="number" id="year" className="season-add-input" placeholder={currentYear.toString()} min="2008" max={currentYear} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setYear(Number(e.target.value))}/>
                <button type="submit" className="green-button" onMouseEnter={()=>setHover("add")} onMouseLeave={()=>setHover("")}>
                    <img src={theme==="dark" ? "/icons/plus-white.png" : hover==="add" ? "/icons/plus-white.png" : "/icons/plus-black.png"} alt="add" className="icon"/>
                    <span>add new season</span>
                </button>
            </form>
            <div className="seasons">
                {seasons.length>0 ? seasons.map((season, index)=>(
                    <div key={index} className="season" onClick={()=>(navigate("/admin/point-table"), setYear(season.year))}>
                        <h1>IPL {season.year}</h1>
                        <p>🥇 {season.champion || "Season ongoing"}</p>
                        <p>🥈 {season.runnerUp || "Season ongoing"}</p>
                        <button type="button" className="red-button season-delete-button" onClick={(e)=>{e.stopPropagation(); handleDeleteSeason(season.year)}} onMouseEnter={()=>setHover(`trash-${index}`)} onMouseLeave={()=>setHover("")}>
                            <img src={hover===`trash-${index}` ? "/icons/trash-white.png" : "/icons/trash-red.png"} alt="delete" className="icon"/>
                            <span>delete</span>
                        </button>
                    </div>
                )):<p>No seasons</p>}
            </div>
            <button className="red-button season-logout" onClick={handleLogout} onMouseEnter={()=>setHover("logout")} onMouseLeave={()=>setHover("")}>
                <img src={hover==="logout" ? "/icons/logout-white.png" : "/icons/logout-red.png"} alt="logout" className="icon"/>
                <span>logout</span>
            </button>
        </div>
    )
}