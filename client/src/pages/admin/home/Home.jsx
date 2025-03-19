/* eslint-disable react-hooks/exhaustive-deps */
// @ts-nocheck
import React, { useEffect, useState } from "react";
import "./Home.css";
import { useNavigate } from "react-router-dom";
import { useYear } from "../../../context/seasonContext";
import { toast } from "react-toastify";

export function Home(){
    const currentYear=new Date().getFullYear();
    const { year, setYear }=useYear();
    const [seasons, setSeasons]=useState([]);

    const navigate=useNavigate();

    const apiUrl=import.meta.env.MODE==="development"
        ? import.meta.env.VITE_APP_DEV_URL 
        : import.meta.env.VITE_APP_PROD_URL

    async function handleAddNewSeason(e){
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

    async function handleDeleteSeason(year){
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

    return(
        <div className="home">
            <form className="home-add-season-form" onSubmit={handleAddNewSeason} method="POST">
                <input type="number" id="year" className="home-add-season-input" placeholder={currentYear} min="2008" max={currentYear} onChange={(e)=>setYear(e.target.value)}/>
                <button type="submit" className="green-button home-add-season-button">
                    <img src="/icons/add.png" alt="add" className="icon"/>
                    <span>Add New Season</span>
                </button>
            </form>
            <div className="home-seasons">
                {seasons.length>0 ? seasons.map((season, index)=>(
                    <div key={index} className="home-season" onClick={()=>(navigate("/admin/season"), setYear(season.year))}>
                        <h1>IPL {season.year}</h1>
                        <p>🥇 {season.champion}</p>
                        <p>🥈 {season.runnerUp}</p>
                        <button type="button" className="red-button home-season-delete-button" onClick={(e)=>{e.stopPropagation(); handleDeleteSeason(season.year)}}>
                            <img src="/icons/delete.png" alt="delete" className="icon"/>
                            <span>delete</span>
                        </button>
                    </div>
                )):<p>No seasons</p>}
            </div>
        </div>
    )
}