import React, { useCallback, useEffect, useState } from "react";
import { SeasonContext } from "../contexts/SeasonContext";
import { useYear } from "../hooks/useYear";
import type { SeasonType } from "../types/type";

export function SeasonProvider({ children } : { children: React.ReactNode }){
    const { year }=useYear();
    const [season, setSeason]=useState<SeasonType | null>(null);

    const apiUrl=import.meta.env.MODE==="development"
        ? import.meta.env.VITE_APP_DEV_URL
        : import.meta.env.VITE_APP_PROD_URL;

    const fetchSeason=useCallback(async ()=>{
        if(!year) return;
        try{
            const response=await fetch(`${apiUrl}/fetchSeason/${year}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });
            const result=await response.json();
            if(response.ok){
                setSeason(result.season);
            }
            else{
                setSeason(null);
            }
        }
        catch(error){
            console.log(error);
        }
    }, [apiUrl, year]);

    useEffect(()=>{
        fetchSeason();
    }, [fetchSeason]);

    return(
        <SeasonContext.Provider value={{ season, fetchSeason, setSeason }}>
            {children}
        </SeasonContext.Provider>
    )
}

