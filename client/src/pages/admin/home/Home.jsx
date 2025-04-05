// @ts-nocheck
import React, { useState } from "react";
import "./Home.css";
import { useSeason, useYear } from "../../../context/seasonContext";
import { PointTable } from "../../../components/pointTable/PointTable";
import { toast } from "react-toastify";
import { WinLoseTable } from "../../../components/winLoseTable/WinLoseTable";

export function Home(){
    const [teamData, setTeamData]=useState({
        name: "",
        short: "",
        home: [""]
    });
    const [showForm, setShowForm]=useState(false);
    const [tableSwitch, setTableSwitch]=useState(true);
    const { year }=useYear();
    const { season, fetchSeason }=useSeason();
    if(!season){
        return;
    }

    const apiUrl=import.meta.env.MODE==="development"
        ? import.meta.env.VITE_APP_DEV_URL 
        : import.meta.env.VITE_APP_PROD_URL

    function handleInputChange(e){
        setTeamData({
            ...teamData,
            [e.target.name]: e.target.value
        });
    };

    function handleHomeChange(index, home){
        const updatedHome=[...teamData.home];
        updatedHome[index]=home;
        setTeamData({
            ...teamData,
            home: updatedHome
        });
    }

    function handleHomeAdd(){
        setTeamData({
            ...teamData,
            home: [ ...teamData.home, "" ]
        })
    };

    function handleHomeRemove(index){
        setTeamData((prev)=>{
            const updatedHome=prev.home.filter((_, i)=>i!==index)
            return { ...prev, home: updatedHome};
        })
    }

    async function handleAddTeam(e){
        e.preventDefault();
        try{
            const response=await fetch(`${apiUrl}/addTeam`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...teamData, year }),
                credentials: "include"
            });
            const result=await response.json();
            if(response.ok){
                fetchSeason();
                setShowForm(false);
                setTeamData({
                    name: "",
                    short: "",
                    home: [""]
                })
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
            <div className="home-header">
                <h1>IPL {season.year}</h1>
                {!showForm && 
                    <div className="home-buttons">
                        <button className="green-button home-add-team-button" onClick={()=>setShowForm(prev=>!prev)}>
                            <img src="/icons/plus-black.png" alt="add" className="icon"/>
                            <span>add new team</span>
                        </button>
                        <button className="home-table-switch-button" onClick={()=>setTableSwitch(prev=>!prev)}>switch table</button>
                    </div>
                }
            </div>
            {!showForm ? (
                <div className="home-details">
                    {tableSwitch ? 
                        <PointTable teamDest="/admin/team" matchDest="/admin/matches"/>
                    : 
                        <WinLoseTable teamDest="/admin/team"/>
                    }
                </div>
            ) : (
                <form className="home-add-team-form" onSubmit={handleAddTeam} method="POST">
                    <h2>add new team</h2>
                    <div className="input-container">
                        <label htmlFor="name">name</label>
                        <input type="text" name="name" id="name" value={teamData.name} onChange={handleInputChange}/>
                    </div>
                    <div className="input-container">
                        <label htmlFor="short">short</label>
                        <input type="text" name="short" id="short" value={teamData.short} onChange={handleInputChange}/>
                    </div>
                    <div className="input-container">
                        <label htmlFor="home">home</label>
                        {teamData.home.map((home, index)=>(
                            <div key={index} className="home-input-wrapper">
                                <input type="text" value={home} id="home" onChange={(e)=>handleHomeChange(index, e.target.value)} />
                                {index==0 && (
                                    <button type="button" className="green-button home-add-home-button" onClick={handleHomeAdd}>
                                        <img src="/icons/plus-black.png" alt="add" className="icon"/>
                                    </button>
                                )}
                                {index>0 && (
                                    <button type="button" className="red-button home-remove-home-button" onClick={()=>handleHomeRemove(index)}>
                                        <img src="/icons/trash-red.png" alt="delete" className="icon"/>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="home-form-buttons">
                        <button className="black-button home-close-button" type="button" onClick={()=>setShowForm(prev=>!prev)}>
                            <img src="/icons/cross-black.png" alt="close" className="icon"/>
                            <span>close</span>
                        </button>
                        <button className="green-button home-add-team-button" type="submit">
                            <img src="/icons/plus-black.png" alt="add" className="icon"/>
                            <span>add new team</span>
                        </button>
                    </div>
                </form>
            )}
        </div>
    )
}