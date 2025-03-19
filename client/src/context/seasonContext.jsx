/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-refresh/only-export-components */
// @ts-nocheck
import { createContext, useContext, useEffect, useState } from "react";

const YearContext=createContext();
const SeasonContext=createContext();

export function YearProvider({ children }){
    const currentYear=new Date().getFullYear();
    const [year, setYear]=useState(currentYear);

    return(
        <YearContext.Provider value={{ year, setYear }}>
            {children}
        </YearContext.Provider>
    )
}

export function useYear(){
    return useContext(YearContext);
}

export function SeasonProvider({ children }){
    const { year }=useYear();
    const [season, setSeason]=useState(null);

    const apiUrl = import.meta.env.MODE === "development"
        ? import.meta.env.VITE_APP_DEV_URL
        : import.meta.env.VITE_APP_PROD_URL;

    async function fetchSeason(){
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
                setSeason(null)
            }
        }
        catch(error){
            console.log(error);
        }
    };

    useEffect(()=>{
        fetchSeason();
    }, [apiUrl, year]);

    return(
        <SeasonContext.Provider value={{ season, fetchSeason, setSeason }}>
            {children}
        </SeasonContext.Provider>
    )
}

export function useSeason(){
    return useContext(SeasonContext);
}