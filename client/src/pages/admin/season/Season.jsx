// @ts-nocheck
import React, { useState } from "react";
import "./Season.css";
import { useSeason, useYear } from "../../../context/seasonContext";
import { PointTable } from "../../../components/pointTable/PointTable";
import { toast } from "react-toastify";

export function Season(){
    const [teamData, setTeamData]=useState({
        name: "",
        short: "",
        home: [""]
    });
    const [showForm, setShowForm]=useState(false);
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
        <div className="season">
            <h1>IPL {season.year}</h1>
            {!showForm ? (
                <div className="season-details">
                    <PointTable dest="/admin/team"/>
                    <button className="green-button season-add-team-button" onClick={()=>setShowForm(prev=>!prev)}><img src="/icons/add.png" alt="add" className="icon"/><span>Add new team</span></button>
                </div>
            ) : (
                <form className="season-add-team-form" onSubmit={handleAddTeam} method="POST">
                    <h2>Add new team</h2>
                    <div className="input-container">
                        <label htmlFor="name">Name</label>
                        <input type="text" name="name" id="name" value={teamData.name} onChange={handleInputChange}/>
                    </div>
                    <div className="input-container">
                        <label htmlFor="short">Short</label>
                        <input type="text" name="short" id="short" value={teamData.short} onChange={handleInputChange}/>
                    </div>
                    <div className="input-container">
                        <label htmlFor="home">Home</label>
                        {teamData.home.map((home, index)=>(
                            <div key={index} className="season-home-input-wrapper">
                                <input type="text" value={home} id="home" onChange={(e)=>handleHomeChange(index, e.target.value)} />
                                {index==0 && (
                                    <button type="button" className="green-button season-add-home-button" onClick={handleHomeAdd}>
                                        <img src="/icons/add.png" alt="add" className="icon"/>
                                    </button>
                                )}
                                {index>0 && (
                                    <button type="button" className="red-button season-remove-home-button" onClick={()=>handleHomeRemove(index)}>
                                        <img src="/icons/delete.png" alt="delete" className="icon"/>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="season-form-buttons">
                        <button className="blue-button season-close-button" type="button" onClick={()=>setShowForm(prev=>!prev)}>
                            <img src="/icons/close.png" alt="close" className="icon"/>
                            <span>Close</span>
                        </button>
                        <button className="green-button season-add-team-button" type="submit">
                            <img src="/icons/add.png" alt="add" className="icon"/>
                            <span>Add New Team</span>
                        </button>
                    </div>
                </form>
            )}
        </div>
    )
}